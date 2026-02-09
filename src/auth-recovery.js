// 🔐 ULTRA-ROBUSTES AUTH RECOVERY SYSTEM
// Automatische Wiederherstellung bei Auth-Problemen

import fs from 'fs';
import path from 'path';

export class AuthRecovery {
    constructor(sessionManager, options = {}) {
        this.sessionManager = sessionManager;
        this.options = {
            maxBackups: options.maxBackups || 5,
            autoBackupInterval: options.autoBackupInterval || 3600000, // 1 hour
            corruptionDetection: options.corruptionDetection !== false,
            autoRepair: options.autoRepair !== false,
            ...options
        };
        
        this.backupTimer = null;
        this.backupHistory = [];
    }
    
    // Start automatic backup system
    startAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        
        this.backupTimer = setInterval(async () => {
            await this.createSmartBackup();
        }, this.options.autoBackupInterval);
        
        console.log(`💾 Auto-backup started (every ${this.options.autoBackupInterval / 60000} minutes)`);
    }
    
    // Stop automatic backup
    stopAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = null;
        }
    }
    
    // Create smart backup (only if session is valid)
    async createSmartBackup() {
        try {
            const validation = await this.sessionManager.validateSession();
            
            if (!validation.valid) {
                console.log('⚠️ Skipping backup - session invalid');
                return false;
            }
            
            const backupPath = await this.sessionManager.backupSession();
            
            if (backupPath) {
                this.backupHistory.push({
                    path: backupPath,
                    timestamp: Date.now(),
                    userId: validation.userId
                });
                
                // Cleanup old backups
                await this.cleanupOldBackups();
                
                console.log(`💾 Smart backup created: ${backupPath}`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Smart backup failed:', error.message);
            return false;
        }
    }
    
    // Cleanup old backups
    async cleanupOldBackups() {
        if (this.backupHistory.length <= this.options.maxBackups) {
            return;
        }
        
        // Sort by timestamp (oldest first)
        this.backupHistory.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest backups
        const toRemove = this.backupHistory.splice(0, this.backupHistory.length - this.options.maxBackups);
        
        for (const backup of toRemove) {
            try {
                if (fs.existsSync(backup.path)) {
                    fs.rmSync(backup.path, { recursive: true, force: true });
                    console.log(`🗑️ Removed old backup: ${backup.path}`);
                }
            } catch (error) {
                console.log(`⚠️ Failed to remove backup: ${backup.path}`);
            }
        }
    }
    
    // Detect session corruption
    async detectCorruption() {
        const issues = [];
        
        try {
            const authDir = this.sessionManager.authDir;
            
            if (!fs.existsSync(authDir)) {
                issues.push({ type: 'missing_auth_dir', severity: 'critical' });
                return issues;
            }
            
            // Check creds.json
            const credsPath = path.join(authDir, 'creds.json');
            if (!fs.existsSync(credsPath)) {
                issues.push({ type: 'missing_creds', severity: 'critical' });
            } else {
                try {
                    const content = fs.readFileSync(credsPath, 'utf8');
                    
                    // Check file size
                    if (content.length < 10) {
                        issues.push({ type: 'empty_creds', severity: 'critical' });
                    }
                    
                    // Check JSON validity
                    try {
                        const creds = JSON.parse(content);
                        
                        // Check required fields
                        if (!creds.me?.id) {
                            issues.push({ type: 'invalid_creds_structure', severity: 'high' });
                        }
                    } catch (jsonError) {
                        issues.push({ type: 'corrupted_json', severity: 'critical', error: jsonError.message });
                    }
                } catch (readError) {
                    issues.push({ type: 'unreadable_creds', severity: 'critical', error: readError.message });
                }
            }
            
            // Check for incomplete writes (temp files)
            const files = fs.readdirSync(authDir);
            const tempFiles = files.filter(f => f.endsWith('.tmp') || f.endsWith('.temp'));
            
            if (tempFiles.length > 0) {
                issues.push({ type: 'temp_files_found', severity: 'medium', files: tempFiles });
            }
            
            // Check file permissions
            try {
                fs.accessSync(authDir, fs.constants.R_OK | fs.constants.W_OK);
            } catch (permError) {
                issues.push({ type: 'permission_error', severity: 'high', error: permError.message });
            }
            
        } catch (error) {
            issues.push({ type: 'detection_error', severity: 'high', error: error.message });
        }
        
        return issues;
    }
    
    // Auto-repair session
    async autoRepair() {
        console.log('🔧 Starting auto-repair...');
        
        const issues = await this.detectCorruption();
        
        if (issues.length === 0) {
            console.log('✅ No issues detected');
            return { repaired: false, reason: 'no_issues' };
        }
        
        console.log(`⚠️ Found ${issues.length} issues:`, issues.map(i => i.type).join(', '));
        
        // Try to recover from backup first
        const criticalIssues = issues.filter(i => i.severity === 'critical');
        
        if (criticalIssues.length > 0) {
            console.log('🔄 Critical issues found - attempting backup recovery...');
            
            const recovered = await this.recoverFromBestBackup();
            
            if (recovered) {
                return { repaired: true, method: 'backup_recovery', issues };
            }
        }
        
        // If no backup recovery, try session repair
        console.log('🔧 Attempting session repair...');
        
        const repairResult = await this.sessionManager.autoRepairSession();
        
        return {
            repaired: repairResult.repaired,
            method: 'session_repair',
            issues,
            repairResult
        };
    }
    
    // Recover from best available backup
    async recoverFromBestBackup() {
        // Sort backups by timestamp (newest first)
        const sortedBackups = [...this.backupHistory].sort((a, b) => b.timestamp - a.timestamp);
        
        for (const backup of sortedBackups) {
            try {
                console.log(`🔄 Trying backup: ${backup.path}`);
                
                // Validate backup before restoring
                const backupCredsPath = path.join(backup.path, 'creds.json');
                
                if (!fs.existsSync(backupCredsPath)) {
                    console.log('⚠️ Backup missing creds.json');
                    continue;
                }
                
                const backupContent = fs.readFileSync(backupCredsPath, 'utf8');
                const backupCreds = JSON.parse(backupContent);
                
                if (!backupCreds.me?.id) {
                    console.log('⚠️ Backup has invalid structure');
                    continue;
                }
                
                // Backup is valid - restore it
                console.log('✅ Valid backup found - restoring...');
                
                const authDir = this.sessionManager.authDir;
                const backupFiles = fs.readdirSync(backup.path);
                
                for (const file of backupFiles) {
                    const srcPath = path.join(backup.path, file);
                    const destPath = path.join(authDir, file);
                    
                    try {
                        fs.copyFileSync(srcPath, destPath);
                    } catch (copyError) {
                        console.log(`⚠️ Failed to copy ${file}`);
                    }
                }
                
                console.log(`✅ Restored from backup: ${backup.path}`);
                return true;
                
            } catch (error) {
                console.log(`⚠️ Backup ${backup.path} failed:`, error.message);
                continue;
            }
        }
        
        console.log('❌ No valid backups found');
        return false;
    }
    
    // Get recovery statistics
    getStats() {
        return {
            backupCount: this.backupHistory.length,
            oldestBackup: this.backupHistory[0]?.timestamp,
            newestBackup: this.backupHistory[this.backupHistory.length - 1]?.timestamp,
            autoBackupEnabled: !!this.backupTimer,
            backupInterval: this.options.autoBackupInterval
        };
    }
    
    // Cleanup
    cleanup() {
        this.stopAutoBackup();
    }
}
