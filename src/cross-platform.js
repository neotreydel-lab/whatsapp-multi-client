import { getStorage } from "./storage.js";
import crypto from 'crypto';

export class CrossPlatformIntegration {
    constructor(client) {
        this.client = client;
        this.storage = getStorage();
        this.platforms = new Map();
        this.webhooks = new Map();
        this.apiEndpoints = new Map();
        this.syncQueue = [];
        
        this.initializePlatforms();
    }
    
    // ===== PLATFORM INITIALIZATION =====
    
    initializePlatforms() {
        // Supported platforms
        this.supportedPlatforms = [
            'telegram', 'discord', 'slack', 'teams', 'facebook', 
            'instagram', 'twitter', 'email', 'sms', 'web'
        ];
        
        // Load existing platform configurations
        this.loadPlatformConfigs();
    }
    
    loadPlatformConfigs() {
        const configs = this.storage.read.from("crossplatform").get("platforms") || {};
        
        Object.entries(configs).forEach(([platform, config]) => {
            this.platforms.set(platform, {
                ...config,
                status: 'disconnected',
                lastSync: null
            });
        });
    }
    
    // ===== PLATFORM MANAGEMENT =====
    
    /**
     * Add platform integration
     */
    async addPlatform(platform, config) {
        if (!this.supportedPlatforms.includes(platform)) {
            throw new Error(`Platform ${platform} not supported`);
        }
        
        const platformConfig = {
            platform,
            ...config,
            status: 'connected',
            addedAt: Date.now(),
            lastSync: null
        };
        
        this.platforms.set(platform, platformConfig);
        this.storage.write.in("crossplatform").set(`platforms.${platform}`, platformConfig);
        
        // Initialize platform-specific handlers
        await this.initializePlatformHandlers(platform, config);
        
        return platformConfig;
    }
    
    /**
     * Remove platform integration
     */
    async removePlatform(platform) {
        this.platforms.delete(platform);
        this.storage.delete.from("crossplatform").key(`platforms.${platform}`);
        
        // Clean up webhooks and endpoints
        this.webhooks.delete(platform);
        this.apiEndpoints.delete(platform);
        
        return true;
    }
    
    /**
     * Get platform status
     */
    getPlatformStatus(platform) {
        return this.platforms.get(platform) || null;
    }
    
    /**
     * List all platforms
     */
    listPlatforms() {
        return Array.from(this.platforms.entries()).map(([name, config]) => ({
            name,
            status: config.status,
            lastSync: config.lastSync,
            addedAt: config.addedAt
        }));
    }
    
    // ===== MESSAGE SYNCHRONIZATION =====
    
    /**
     * Sync message to all platforms
     */
    async syncMessage(message, options = {}) {
        const activePlatforms = Array.from(this.platforms.entries())
            .filter(([, config]) => config.status === 'connected');
        
        const syncPromises = activePlatforms.map(([platform, config]) => 
            this.syncToPlatform(platform, message, options)
        );
        
        const results = await Promise.allSettled(syncPromises);
        
        // Log sync results
        results.forEach((result, index) => {
            const [platform] = activePlatforms[index];
            if (result.status === 'fulfilled') {
                this.updateLastSync(platform);
            } else {
                console.error(`❌ Sync to ${platform} failed:`, result.reason);
            }
        });
        
        return results;
    }
    
    /**
     * Sync to specific platform
     */
    async syncToPlatform(platform, message, options) {
        const config = this.platforms.get(platform);
        if (!config) throw new Error(`Platform ${platform} not configured`);
        
        switch (platform) {
            case 'telegram':
                return await this.syncToTelegram(message, config, options);
            case 'discord':
                return await this.syncToDiscord(message, config, options);
            case 'slack':
                return await this.syncToSlack(message, config, options);
            case 'email':
                return await this.syncToEmail(message, config, options);
            case 'web':
                return await this.syncToWeb(message, config, options);
            default:
                return await this.syncViaWebhook(platform, message, config, options);
        }
    }
    
    // ===== PLATFORM-SPECIFIC SYNC METHODS =====
    
    async syncToTelegram(message, config, options) {
        const telegramMessage = this.formatForTelegram(message);
        
        const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.chatId,
                text: telegramMessage.text,
                parse_mode: 'Markdown'
            })
        });
        
        return await response.json();
    }
    
    async syncToDiscord(message, config, options) {
        const discordMessage = this.formatForDiscord(message);
        
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: discordMessage.text,
                username: config.username || 'WAEngine Bot'
            })
        });
        
        return response.ok;
    }
    
    async syncToSlack(message, config, options) {
        const slackMessage = this.formatForSlack(message);
        
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: slackMessage.text,
                channel: config.channel,
                username: config.username || 'WAEngine Bot'
            })
        });
        
        return response.ok;
    }
    
    async syncToEmail(message, config, options) {
        // Simplified email sync (would need proper email service integration)
        const emailData = {
            to: config.recipients,
            subject: `WhatsApp Message from ${message.sender}`,
            body: this.formatForEmail(message),
            timestamp: Date.now()
        };
        
        // Store for email service to process
        this.storage.write.in("crossplatform").push("emailQueue", emailData);
        
        return { queued: true, emailData };
    }
    
    async syncToWeb(message, config, options) {
        const webMessage = this.formatForWeb(message);
        
        // Store for web dashboard
        this.storage.write.in("crossplatform").push(`web.${config.dashboardId}.messages`, {
            ...webMessage,
            timestamp: Date.now()
        });
        
        // Emit to websocket if configured
        if (config.websocketUrl) {
            // Would emit to websocket here
        }
        
        return { stored: true, webMessage };
    }
    
    async syncViaWebhook(platform, message, config, options) {
        if (!config.webhookUrl) {
            throw new Error(`No webhook URL configured for ${platform}`);
        }
        
        const formattedMessage = this.formatForGeneric(message);
        
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'WAEngine-CrossPlatform/1.0'
            },
            body: JSON.stringify({
                platform: 'whatsapp',
                message: formattedMessage,
                timestamp: Date.now()
            })
        });
        
        return await response.json();
    }
    
    // ===== MESSAGE FORMATTING =====
    
    formatForTelegram(message) {
        return {
            text: `*WhatsApp Message*\n\n` +
                  `From: ${message.sender}\n` +
                  `Message: ${message.text}\n` +
                  `Time: ${new Date().toLocaleString()}`
        };
    }
    
    formatForDiscord(message) {
        return {
            text: `**WhatsApp Message**\n\n` +
                  `**From:** ${message.sender}\n` +
                  `**Message:** ${message.text}\n` +
                  `**Time:** ${new Date().toLocaleString()}`
        };
    }
    
    formatForSlack(message) {
        return {
            text: `*WhatsApp Message*\n\n` +
                  `*From:* ${message.sender}\n` +
                  `*Message:* ${message.text}\n` +
                  `*Time:* ${new Date().toLocaleString()}`
        };
    }
    
    formatForEmail(message) {
        return `
            <h2>WhatsApp Message</h2>
            <p><strong>From:</strong> ${message.sender}</p>
            <p><strong>Message:</strong> ${message.text}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Chat:</strong> ${message.isGroup ? 'Group' : 'Private'}</p>
        `;
    }
    
    formatForWeb(message) {
        return {
            id: `msg_${Date.now()}`,
            sender: message.sender,
            text: message.text,
            isGroup: message.isGroup,
            chatId: message.chatId,
            timestamp: Date.now(),
            platform: 'whatsapp'
        };
    }
    
    formatForGeneric(message) {
        return {
            sender: message.sender,
            text: message.text,
            isGroup: message.isGroup,
            chatId: message.chatId,
            timestamp: Date.now(),
            type: message.type || 'text'
        };
    }
    
    // ===== WEBHOOK MANAGEMENT =====
    
    /**
     * Register webhook for platform
     */
    registerWebhook(platform, url, secret = null) {
        this.webhooks.set(platform, {
            url,
            secret,
            registeredAt: Date.now()
        });
        
        this.storage.write.in("crossplatform").set(`webhooks.${platform}`, {
            url,
            secret,
            registeredAt: Date.now()
        });
        
        return true;
    }
    
    /**
     * Handle incoming webhook
     */
    async handleWebhook(platform, data, signature = null) {
        const webhook = this.webhooks.get(platform);
        if (!webhook) {
            throw new Error(`No webhook registered for ${platform}`);
        }
        
        // Verify signature if secret is set
        if (webhook.secret && signature) {
            const isValid = this.verifyWebhookSignature(data, signature, webhook.secret);
            if (!isValid) {
                throw new Error('Invalid webhook signature');
            }
        }
        
        // Process webhook data
        const processedMessage = this.processWebhookData(platform, data);
        
        // Emit to WhatsApp if configured
        if (processedMessage && this.client) {
            await this.forwardToWhatsApp(processedMessage);
        }
        
        return processedMessage;
    }
    
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(data, signature, secret) {
        // Simplified signature verification
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(data))
            .digest('hex');
        
        return signature === expectedSignature;
    }
    
    /**
     * Process webhook data
     */
    processWebhookData(platform, data) {
        // Platform-specific data processing
        switch (platform) {
            case 'telegram':
                return this.processTelegramWebhook(data);
            case 'discord':
                return this.processDiscordWebhook(data);
            case 'slack':
                return this.processSlackWebhook(data);
            default:
                return this.processGenericWebhook(data);
        }
    }
    
    processTelegramWebhook(data) {
        if (data.message) {
            return {
                platform: 'telegram',
                sender: data.message.from.username || data.message.from.first_name,
                text: data.message.text,
                timestamp: data.message.date * 1000,
                originalData: data
            };
        }
        return null;
    }
    
    processDiscordWebhook(data) {
        return {
            platform: 'discord',
            sender: data.author?.username || 'Unknown',
            text: data.content,
            timestamp: Date.now(),
            originalData: data
        };
    }
    
    processSlackWebhook(data) {
        return {
            platform: 'slack',
            sender: data.user_name || 'Unknown',
            text: data.text,
            timestamp: Date.now(),
            originalData: data
        };
    }
    
    processGenericWebhook(data) {
        return {
            platform: 'generic',
            sender: data.sender || 'Unknown',
            text: data.message || data.text || '',
            timestamp: data.timestamp || Date.now(),
            originalData: data
        };
    }
    
    // ===== WHATSAPP FORWARDING =====
    
    /**
     * Forward message to WhatsApp
     */
    async forwardToWhatsApp(message) {
        const config = this.storage.read.from("crossplatform").get("whatsappForwarding");
        if (!config || !config.enabled) return;
        
        const targetChat = config.targetChat;
        if (!targetChat) return;
        
        const forwardText = `📱 **${message.platform.toUpperCase()} Message**\n\n` +
                           `👤 From: ${message.sender}\n` +
                           `💬 Message: ${message.text}\n` +
                           `🕐 Time: ${new Date(message.timestamp).toLocaleString()}`;
        
        await this.client.socket.sendMessage(targetChat, { text: forwardText });
    }
    
    // ===== UTILITY METHODS =====
    
    updateLastSync(platform) {
        const config = this.platforms.get(platform);
        if (config) {
            config.lastSync = Date.now();
            this.platforms.set(platform, config);
            this.storage.write.in("crossplatform").set(`platforms.${platform}.lastSync`, config.lastSync);
        }
    }
    
    /**
     * Get cross-platform statistics
     */
    getCrossPlatformStats() {
        const platforms = this.listPlatforms();
        const webhooks = Array.from(this.webhooks.keys());
        const emailQueue = this.storage.read.from("crossplatform").get("emailQueue") || [];
        
        return {
            platforms: {
                total: platforms.length,
                connected: platforms.filter(p => p.status === 'connected').length,
                list: platforms
            },
            webhooks: {
                total: webhooks.length,
                list: webhooks
            },
            sync: {
                queueSize: this.syncQueue.length,
                emailQueue: emailQueue.length,
                lastSync: Math.max(...platforms.map(p => p.lastSync || 0))
            }
        };
    }
    
    /**
     * Test platform connection
     */
    async testPlatformConnection(platform) {
        const config = this.platforms.get(platform);
        if (!config) {
            throw new Error(`Platform ${platform} not configured`);
        }
        
        try {
            const testMessage = {
                sender: 'WAEngine Test',
                text: 'Connection test message',
                isGroup: false,
                chatId: 'test'
            };
            
            await this.syncToPlatform(platform, testMessage, { test: true });
            
            config.status = 'connected';
            this.platforms.set(platform, config);
            
            return { success: true, platform, status: 'connected' };
        } catch (error) {
            config.status = 'error';
            this.platforms.set(platform, config);
            
            return { success: false, platform, status: 'error', error: error.message };
        }
    }
    
    /**
     * Export cross-platform data
     */
    exportData() {
        return {
            platforms: Object.fromEntries(this.platforms),
            webhooks: Object.fromEntries(this.webhooks),
            stats: this.getCrossPlatformStats()
        };
    }
}