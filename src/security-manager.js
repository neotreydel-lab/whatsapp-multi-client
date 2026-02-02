import { getStorage } from "./storage.js";
import crypto from "crypto";

export class SecurityManager {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.rateLimits = new Map();
        this.blockedUsers = new Set();
        this.suspiciousActivity = new Map();
        this.encryptionKeys = new Map();
        this.auditLog = [];
        
        this.initializeSecurity();
    }
    
    // ===== INITIALIZATION =====
    
    initializeSecurity() {
        this.loadSecurityConfig();
        this.startSecurityMonitoring();
    }
    
    loadSecurityConfig() {
        const config = this.storage.read.from("security").get("config") || {};
        
        this.config = {
            rateLimitEnabled: config.rateLimitEnabled !== false,
            maxMessagesPerMinute: config.maxMessagesPerMinute || 10,
            maxMessagesPerHour: config.maxMessagesPerHour || 100,
            spamDetectionEnabled: config.spamDetectionEnabled !== false,
            encryptionEnabled: config.encryptionEnabled || false,
            auditLogEnabled: config.auditLogEnabled !== false,
            suspiciousActivityThreshold: config.suspiciousActivityThreshold || 5,
            autoBlockEnabled: config.autoBlockEnabled || false,
            ...config
        };
        
        // Load blocked users
        const blocked = this.storage.read.from("security").get("blockedUsers") || [];
        blocked.forEach(userId => this.blockedUsers.add(userId));
    }
    
    startSecurityMonitoring() {
        // Clean up old rate limit data every minute
        setInterval(() => {
            this.cleanupRateLimits();
        }, 60000);
        
        // Clean up suspicious activity data every hour
        setInterval(() => {
            this.cleanupSuspiciousActivity();
        }, 3600000);
    }
    
    // ===== RATE LIMITING =====
    
    /**
     * Check if user is rate limited
     */
    checkRateLimit(userId) {
        if (!this.config.rateLimitEnabled) return { allowed: true };
        
        const now = Date.now();
        const userLimits = this.rateLimits.get(userId) || { messages: [], lastReset: now };
        
        // Clean old messages (older than 1 hour)
        userLimits.messages = userLimits.messages.filter(timestamp => 
            now - timestamp < 3600000
        );
        
        // Check per-minute limit
        const recentMessages = userLimits.messages.filter(timestamp => 
            now - timestamp < 60000
        );
        
        if (recentMessages.length >= this.config.maxMessagesPerMinute) {
            this.logSecurityEvent('rate_limit_exceeded', userId, {
                type: 'per_minute',
                count: recentMessages.length,
                limit: this.config.maxMessagesPerMinute
            });
            
            return { 
                allowed: false, 
                reason: 'rate_limit_per_minute',
                resetIn: 60000 - (now - Math.min(...recentMessages))
            };
        }
        
        // Check per-hour limit
        if (userLimits.messages.length >= this.config.maxMessagesPerHour) {
            this.logSecurityEvent('rate_limit_exceeded', userId, {
                type: 'per_hour',
                count: userLimits.messages.length,
                limit: this.config.maxMessagesPerHour
            });
            
            return { 
                allowed: false, 
                reason: 'rate_limit_per_hour',
                resetIn: 3600000 - (now - Math.min(...userLimits.messages))
            };
        }
        
        // Add current message
        userLimits.messages.push(now);
        this.rateLimits.set(userId, userLimits);
        
        return { allowed: true };
    }
    
    /**
     * Set custom rate limit for user
     */
    setUserRateLimit(userId, messagesPerMinute, messagesPerHour) {
        this.storage.write.in("security").set(`customRateLimits.${userId}`, {
            messagesPerMinute,
            messagesPerHour,
            setAt: Date.now()
        });
    }
    
    /**
     * Remove rate limit for user
     */
    removeUserRateLimit(userId) {
        this.rateLimits.delete(userId);
        this.storage.delete.from("security").key(`customRateLimits.${userId}`);
    }
    
    // ===== SPAM DETECTION =====
    
    /**
     * Analyze message for spam
     */
    analyzeSpam(message) {
        if (!this.config.spamDetectionEnabled) return { isSpam: false };
        
        const text = message.text || '';
        let spamScore = 0;
        const reasons = [];
        
        // Check for excessive caps
        const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        if (capsRatio > 0.7 && text.length > 10) {
            spamScore += 2;
            reasons.push('excessive_caps');
        }
        
        // Check for excessive punctuation
        const punctuationRatio = (text.match(/[!?.,;:]/g) || []).length / text.length;
        if (punctuationRatio > 0.3) {
            spamScore += 1;
            reasons.push('excessive_punctuation');
        }
        
        // Check for repeated characters
        if (/(.)\1{4,}/.test(text)) {
            spamScore += 2;
            reasons.push('repeated_characters');
        }
        
        // Check for common spam words
        const spamWords = [
            'gewinn', 'gratis', 'kostenlos', 'sofort', 'jetzt', 'schnell',
            'geld', 'verdienen', 'reich', 'millionär', 'bitcoin', 'crypto',
            'klick', 'link', 'website', 'angebot', 'rabatt', 'prozent'
        ];
        
        const foundSpamWords = spamWords.filter(word => 
            text.toLowerCase().includes(word)
        );
        
        if (foundSpamWords.length > 2) {
            spamScore += foundSpamWords.length;
            reasons.push('spam_keywords');
        }
        
        // Check for URLs
        const urlCount = (text.match(/https?:\/\/[^\s]+/g) || []).length;
        if (urlCount > 1) {
            spamScore += urlCount;
            reasons.push('multiple_urls');
        }
        
        // Check message frequency
        const recentMessages = this.rateLimits.get(message.from)?.messages || [];
        const recentCount = recentMessages.filter(timestamp => 
            Date.now() - timestamp < 300000 // 5 minutes
        ).length;
        
        if (recentCount > 5) {
            spamScore += Math.floor(recentCount / 5);
            reasons.push('high_frequency');
        }
        
        const isSpam = spamScore >= 5;
        
        if (isSpam) {
            this.logSecurityEvent('spam_detected', message.from, {
                score: spamScore,
                reasons,
                text: text.substring(0, 100)
            });
        }
        
        return {
            isSpam,
            score: spamScore,
            reasons,
            confidence: Math.min(spamScore / 10, 1)
        };
    }
    
    // ===== USER BLOCKING =====
    
    /**
     * Block user
     */
    blockUser(userId, reason = 'manual', duration = null) {
        this.blockedUsers.add(userId);
        
        const blockData = {
            userId,
            reason,
            blockedAt: Date.now(),
            duration,
            expiresAt: duration ? Date.now() + duration : null
        };
        
        this.storage.write.in("security").set(`blocks.${userId}`, blockData);
        this.storage.write.in("security").push("blockedUsers", userId);
        
        this.logSecurityEvent('user_blocked', userId, { reason, duration });
        
        return blockData;
    }
    
    /**
     * Unblock user
     */
    unblockUser(userId) {
        this.blockedUsers.delete(userId);
        this.storage.delete.from("security").key(`blocks.${userId}`);
        
        // Remove from blocked users list
        const blockedList = this.storage.read.from("security").get("blockedUsers") || [];
        const updatedList = blockedList.filter(id => id !== userId);
        this.storage.write.in("security").set("blockedUsers", updatedList);
        
        this.logSecurityEvent('user_unblocked', userId);
        
        return true;
    }
    
    /**
     * Check if user is blocked
     */
    isUserBlocked(userId) {
        if (!this.blockedUsers.has(userId)) return false;
        
        // Check if temporary block has expired
        const blockData = this.storage.read.from("security").get(`blocks.${userId}`);
        if (blockData && blockData.expiresAt && Date.now() > blockData.expiresAt) {
            this.unblockUser(userId);
            return false;
        }
        
        return true;
    }
    
    /**
     * Auto-block user based on suspicious activity
     */
    checkAutoBlock(userId) {
        if (!this.config.autoBlockEnabled) return false;
        
        const activity = this.suspiciousActivity.get(userId) || { count: 0, events: [] };
        
        if (activity.count >= this.config.suspiciousActivityThreshold) {
            this.blockUser(userId, 'auto_block_suspicious_activity', 24 * 60 * 60 * 1000); // 24 hours
            return true;
        }
        
        return false;
    }
    
    // ===== SUSPICIOUS ACTIVITY TRACKING =====
    
    /**
     * Track suspicious activity
     */
    trackSuspiciousActivity(userId, type, data = {}) {
        const activity = this.suspiciousActivity.get(userId) || { count: 0, events: [] };
        
        activity.count++;
        activity.events.push({
            type,
            data,
            timestamp: Date.now()
        });
        
        // Keep only last 50 events
        if (activity.events.length > 50) {
            activity.events.shift();
        }
        
        this.suspiciousActivity.set(userId, activity);
        
        this.logSecurityEvent('suspicious_activity', userId, { type, data });
        
        // Check for auto-block
        this.checkAutoBlock(userId);
        
        return activity;
    }
    
    /**
     * Get user's suspicious activity
     */
    getUserSuspiciousActivity(userId) {
        return this.suspiciousActivity.get(userId) || { count: 0, events: [] };
    }
    
    // ===== MESSAGE ENCRYPTION =====
    
    /**
     * Encrypt message with secure AES-256-GCM
     */
    encryptMessage(message, userId) {
        if (!this.config.encryptionEnabled) return message;
        
        try {
            const key = this.getOrCreateEncryptionKey(userId);
            const keyBuffer = Buffer.from(key, 'hex');
            
            // Generate random IV (12 bytes for GCM)
            const iv = crypto.randomBytes(12);
            
            // Create cipher with GCM mode for authenticated encryption
            const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
            
            let encrypted = cipher.update(message, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            // Get authentication tag
            const authTag = cipher.getAuthTag();
            
            // Combine IV + authTag + encrypted data
            const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
            
            return result;
        } catch (error) {
            console.error('❌ Encryption error:', error.message);
            return message; // Fallback to unencrypted
        }
    }
    
    /**
     * Decrypt message with secure AES-256-GCM
     */
    decryptMessage(encryptedMessage, userId) {
        if (!this.config.encryptionEnabled) return encryptedMessage;
        
        try {
            const key = this.getOrCreateEncryptionKey(userId);
            const keyBuffer = Buffer.from(key, 'hex');
            
            // Split IV:authTag:encrypted
            const parts = encryptedMessage.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted message format');
            }
            
            const iv = Buffer.from(parts[0], 'hex');
            const authTag = Buffer.from(parts[1], 'hex');
            const encrypted = parts[2];
            
            // Create decipher
            const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('❌ Decryption error:', error.message);
            return encryptedMessage; // Fallback to encrypted
        }
    }
    
    /**
     * Get or create encryption key for user
     */
    getOrCreateEncryptionKey(userId) {
        if (this.encryptionKeys.has(userId)) {
            return this.encryptionKeys.get(userId);
        }
        
        const key = crypto.randomBytes(32).toString('hex');
        this.encryptionKeys.set(userId, key);
        
        // Store encrypted key
        const masterKey = this.getMasterKey();
        const encryptedKey = this.encryptWithMasterKey(key, masterKey);
        this.storage.write.in("security").set(`encryptionKeys.${userId}`, encryptedKey);
        
        return key;
    }
    
    /**
     * Get master encryption key
     */
    getMasterKey() {
        let masterKey = this.storage.read.from("security").get("masterKey");
        
        if (!masterKey) {
            masterKey = crypto.randomBytes(32).toString('hex');
            this.storage.write.in("security").set("masterKey", masterKey);
        }
        
        return masterKey;
    }
    
    /**
     * Encrypt with master key using secure AES-256-GCM
     */
    encryptWithMasterKey(data, masterKey) {
        try {
            const keyBuffer = Buffer.from(masterKey, 'hex');
            const iv = crypto.randomBytes(12); // 12 bytes for GCM
            
            const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
            
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            // Return IV:authTag:encrypted
            return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
        } catch (error) {
            console.error('❌ Master key encryption error:', error.message);
            throw error;
        }
    }
    
    /**
     * Decrypt with master key using secure AES-256-GCM
     */
    decryptWithMasterKey(encryptedData, masterKey) {
        try {
            const keyBuffer = Buffer.from(masterKey, 'hex');
            
            const parts = encryptedData.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted data format');
            }
            
            const iv = Buffer.from(parts[0], 'hex');
            const authTag = Buffer.from(parts[1], 'hex');
            const encrypted = parts[2];
            
            const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('❌ Master key decryption error:', error.message);
            throw error;
        }
    }
    
    // ===== AUDIT LOGGING =====
    
    /**
     * Log security event
     */
    logSecurityEvent(type, userId, data = {}) {
        if (!this.config.auditLogEnabled) return;
        
        const event = {
            id: crypto.randomUUID(),
            type,
            userId,
            data,
            timestamp: Date.now(),
            ip: data.ip || 'unknown'
        };
        
        this.auditLog.push(event);
        
        // Keep only last 1000 events in memory
        if (this.auditLog.length > 1000) {
            this.auditLog.shift();
        }
        
        // Store in persistent storage
        this.storage.write.in("security").push("auditLog", event);
        
        // Emit security event
        this.client.emit('security_event', event);
        
        return event;
    }
    
    /**
     * Get audit log
     */
    getAuditLog(limit = 100, type = null) {
        let logs = this.storage.read.from("security").get("auditLog") || [];
        
        if (type) {
            logs = logs.filter(log => log.type === type);
        }
        
        return logs.slice(-limit);
    }
    
    /**
     * Get security events for user
     */
    getUserSecurityEvents(userId, limit = 50) {
        const logs = this.storage.read.from("security").get("auditLog") || [];
        return logs
            .filter(log => log.userId === userId)
            .slice(-limit);
    }
    
    // ===== SECURITY ANALYSIS =====
    
    /**
     * Analyze message security
     */
    analyzeMessageSecurity(message) {
        const analysis = {
            userId: message.from,
            timestamp: Date.now(),
            checks: {}
        };
        
        // Rate limit check
        analysis.checks.rateLimit = this.checkRateLimit(message.from);
        
        // Spam check
        analysis.checks.spam = this.analyzeSpam(message);
        
        // Block check
        analysis.checks.blocked = this.isUserBlocked(message.from);
        
        // Suspicious activity check
        analysis.checks.suspiciousActivity = this.getUserSuspiciousActivity(message.from);
        
        // Overall risk score
        let riskScore = 0;
        
        if (!analysis.checks.rateLimit.allowed) riskScore += 3;
        if (analysis.checks.spam.isSpam) riskScore += analysis.checks.spam.score;
        if (analysis.checks.blocked) riskScore += 10;
        if (analysis.checks.suspiciousActivity.count > 0) riskScore += analysis.checks.suspiciousActivity.count;
        
        analysis.riskScore = riskScore;
        analysis.riskLevel = this.getRiskLevel(riskScore);
        analysis.shouldBlock = riskScore >= 10;
        
        return analysis;
    }
    
    /**
     * Get risk level from score
     */
    getRiskLevel(score) {
        if (score >= 10) return 'high';
        if (score >= 5) return 'medium';
        if (score >= 2) return 'low';
        return 'minimal';
    }
    
    // ===== CLEANUP METHODS =====
    
    cleanupRateLimits() {
        const now = Date.now();
        
        for (const [userId, limits] of this.rateLimits.entries()) {
            limits.messages = limits.messages.filter(timestamp => 
                now - timestamp < 3600000 // Keep last hour
            );
            
            if (limits.messages.length === 0) {
                this.rateLimits.delete(userId);
            }
        }
    }
    
    cleanupSuspiciousActivity() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        for (const [userId, activity] of this.suspiciousActivity.entries()) {
            activity.events = activity.events.filter(event => 
                now - event.timestamp < maxAge
            );
            
            activity.count = activity.events.length;
            
            if (activity.count === 0) {
                this.suspiciousActivity.delete(userId);
            }
        }
    }
    
    // ===== STATISTICS =====
    
    /**
     * Get security statistics
     */
    getSecurityStats() {
        const auditLog = this.storage.read.from("security").get("auditLog") || [];
        const blockedUsers = this.storage.read.from("security").get("blockedUsers") || [];
        
        const last24h = Date.now() - (24 * 60 * 60 * 1000);
        const recentEvents = auditLog.filter(event => event.timestamp > last24h);
        
        return {
            blockedUsers: {
                total: blockedUsers.length,
                active: Array.from(this.blockedUsers).length
            },
            rateLimits: {
                activeUsers: this.rateLimits.size,
                totalChecks: auditLog.filter(e => e.type === 'rate_limit_exceeded').length
            },
            spam: {
                detected: auditLog.filter(e => e.type === 'spam_detected').length,
                last24h: recentEvents.filter(e => e.type === 'spam_detected').length
            },
            suspiciousActivity: {
                activeUsers: this.suspiciousActivity.size,
                totalEvents: auditLog.filter(e => e.type === 'suspicious_activity').length
            },
            auditLog: {
                totalEvents: auditLog.length,
                last24h: recentEvents.length,
                eventTypes: this.getEventTypeDistribution(recentEvents)
            }
        };
    }
    
    /**
     * Get event type distribution
     */
    getEventTypeDistribution(events) {
        const distribution = {};
        
        events.forEach(event => {
            distribution[event.type] = (distribution[event.type] || 0) + 1;
        });
        
        return distribution;
    }
    
    /**
     * Export security data
     */
    exportSecurityData() {
        return {
            config: this.config,
            blockedUsers: Array.from(this.blockedUsers),
            auditLog: this.getAuditLog(1000),
            stats: this.getSecurityStats()
        };
    }
}