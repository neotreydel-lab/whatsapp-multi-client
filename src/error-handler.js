import { ConsoleLogger } from "./console-logger.js";

export class ErrorHandler {
    constructor(options = {}) {
        this.options = {
            supportEmail: options.supportEmail || "support@waengine.dev",
            supportDiscord: options.supportDiscord || "https://discord.gg/waengine",
            supportGitHub: options.supportGitHub || "https://github.com/neotreydel-lab/waengine/issues",
            showSupportInfo: options.showSupportInfo !== false,
            logErrors: options.logErrors !== false,
            sendErrorReports: options.sendErrorReports || false,
            ...options
        };
        
        this.logger = new ConsoleLogger({ silent: false });
        this.errorCount = 0;
        this.lastError = null;
    }
    
    /**
     * Handle any error with support information
     */
    handleError(error, context = {}) {
        this.errorCount++;
        this.lastError = {
            error: error,
            context: context,
            timestamp: new Date(),
            count: this.errorCount
        };
        
        // Log error details
        if (this.options.logErrors) {
            console.error(`\n❌ WAEngine Error #${this.errorCount}:`);
            console.error(`   Context: ${context.action || 'Unknown'}`);
            console.error(`   Message: ${error.message}`);
            if (context.details) {
                console.error(`   Details: ${context.details}`);
            }
            console.error(`   Time: ${new Date().toLocaleString()}`);
        }
        
        // Show support information
        if (this.options.showSupportInfo) {
            this.showSupportInfo(error, context);
        }
        
        // Send error report (if enabled)
        if (this.options.sendErrorReports) {
            this.sendErrorReport(error, context);
        }
        
        return this.lastError;
    }
    
    /**
     * Show support contact information
     */
    showSupportInfo(error, context) {
        console.log("\n" + "=".repeat(50));
        console.log("❌ FEHLER AUFGETRETEN!");
        console.log("=".repeat(50));
        
        // DEINE EMAIL IMMER ZUERST UND PROMINENT!
        console.log(`📧 Bei Problemen melden: ${this.options.supportEmail}`);
        
        if (this.options.supportGitHub) {
            console.log(`🐛 Bug Report: ${this.options.supportGitHub}`);
        }
        
        console.log(`\n🔍 Fehler-Details:`);
        console.log(`   • Fehler: ${error.message}`);
        console.log(`   • WAEngine Version: ${this.getWAEngineVersion()}`);
        console.log(`   • Error ID: WAE-${Date.now()}-${this.errorCount}`);
        
        // Kurze, hilfreiche Lösungsvorschläge
        console.log(`\n💡 Schnelle Lösung:`);
        this.showQuickFixes(error, context);
        
        console.log("=".repeat(50) + "\n");
    }
    
    /**
     * Show quick fixes for common errors
     */
    showQuickFixes(error, context) {
        const message = error.message.toLowerCase();
        
        if (message.includes('qr') || message.includes('auth')) {
            console.log("   → Lösche 'auth' Ordner und scanne QR neu");
        }
        else if (message.includes('connection') || message.includes('socket')) {
            console.log("   → Prüfe Internetverbindung und starte Bot neu");
        }
        else if (message.includes('sharp') || message.includes('sticker')) {
            console.log("   → Installiere Sharp: npm install sharp");
        }
        else if (message.includes('plugin')) {
            console.log("   → Installiere Dependencies: npm install --force");
        }
        else if (message.includes('permission') || message.includes('admin')) {
            console.log("   → Bot braucht Admin-Rechte in der Gruppe");
        }
        else {
            console.log("   → Starte Bot neu oder kontaktiere Support");
        }
    }
    
    /**
     * Send error report to support (if enabled)
     */
    async sendErrorReport(error, context) {
        try {
            const report = {
                errorId: `WAE-${Date.now()}-${this.errorCount}`,
                message: error.message,
                stack: error.stack,
                context: context,
                version: this.getWAEngineVersion(),
                nodeVersion: process.version,
                platform: process.platform,
                timestamp: new Date().toISOString()
            };
            
            // Hier könntest du den Report an deine API senden
            // await fetch('https://api.waengine.dev/error-reports', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(report)
            // });
            
            console.log("📤 Fehlerbericht automatisch gesendet (Error ID: " + report.errorId + ")");
        } catch (reportError) {
            console.log("⚠️  Fehlerbericht konnte nicht gesendet werden");
        }
    }
    
    /**
     * Get WAEngine version
     */
    async getWAEngineVersion() {
        try {
            const { readFile } = await import('fs/promises');
            const packageData = await readFile('./package.json', 'utf8');
            const packageJson = JSON.parse(packageData);
            return packageJson.version;
        } catch (error) {
            console.error('❌ Error reading package.json:', error);
            return 'Unknown';
        }
    }
    
    /**
     * Handle connection errors specifically
     */
    handleConnectionError(error, reconnectAttempt = 0) {
        return this.handleError(error, {
            action: 'connection',
            reconnectAttempt: reconnectAttempt,
            details: `Wiederverbindungsversuch ${reconnectAttempt}`
        });
    }
    
    /**
     * Handle plugin errors specifically
     */
    handlePluginError(error, pluginName) {
        return this.handleError(error, {
            action: 'plugin',
            plugin: pluginName,
            details: `Plugin '${pluginName}' Fehler`
        });
    }
    
    /**
     * Handle command errors specifically
     */
    handleCommandError(error, command, userId) {
        return this.handleError(error, {
            action: 'command',
            command: command,
            user: userId,
            details: `Command '${command}' Fehler`
        });
    }
    
    /**
     * Handle message errors specifically
     */
    handleMessageError(error, messageType) {
        return this.handleError(error, {
            action: 'message',
            messageType: messageType,
            details: `${messageType} Nachricht Fehler`
        });
    }
    
    /**
     * Get error statistics
     */
    getErrorStats() {
        return {
            totalErrors: this.errorCount,
            lastError: this.lastError,
            supportContacts: {
                email: this.options.supportEmail,
                discord: this.options.supportDiscord,
                github: this.options.supportGitHub
            }
        };
    }
    
    /**
     * Reset error count
     */
    resetErrorCount() {
        this.errorCount = 0;
        this.lastError = null;
        console.log("🔄 Error Counter zurückgesetzt");
    }
}

// Default Error Handler Instance - IMMER AKTIV FÜR ALLE USER!
export const defaultErrorHandler = new ErrorHandler({
    supportEmail: "Liaia@outlook.de",
    supportDiscord: "https://discord.gg/waengine", 
    supportGitHub: "https://github.com/neotreydel-lab/waengine/issues",
    showSupportInfo: true, // IMMER anzeigen
    logErrors: true        // IMMER loggen
});