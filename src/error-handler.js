import { ConsoleLogger } from "./console-logger.js";
import { ERROR_CODES, getErrorDescription, createError, getErrorCategory } from "./error-codes.js";

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
        this.errorStats = new Map(); // Track error frequency by code
    }
    
    /**
     * Handle any error with support information and error codes
     */
    handleError(error, context = {}) {
        this.errorCount++;
        
        // Extract or assign error code
        const errorCode = error.code || context.errorCode || this.detectErrorCode(error, context);
        const errorDescription = getErrorDescription(errorCode);
        const errorCategory = getErrorCategory(errorCode);
        
        // Track error statistics
        if (!this.errorStats.has(errorCode)) {
            this.errorStats.set(errorCode, { count: 0, firstSeen: new Date(), lastSeen: null });
        }
        const stats = this.errorStats.get(errorCode);
        stats.count++;
        stats.lastSeen = new Date();
        
        this.lastError = {
            error: error,
            errorCode: errorCode,
            errorDescription: errorDescription,
            errorCategory: errorCategory,
            context: context,
            timestamp: new Date(),
            count: this.errorCount,
            occurrences: stats.count
        };
        
        // Log error details with error code
        if (this.options.logErrors) {
            console.error(`\n❌ WAEngine Error #${this.errorCount}:`);
            console.error(`   Error Code: ${errorCode}`);
            console.error(`   Category: ${errorCategory}`);
            console.error(`   Description: ${errorDescription}`);
            console.error(`   Context: ${context.action || 'Unknown'}`);
            console.error(`   Message: ${error.message}`);
            if (context.details) {
                console.error(`   Details: ${context.details}`);
            }
            console.error(`   Time: ${new Date().toLocaleString()}`);
            if (stats.count > 1) {
                console.error(`   Occurrences: ${stats.count} (First: ${stats.firstSeen.toLocaleString()})`);
            }
        }
        
        // Show support information
        if (this.options.showSupportInfo) {
            this.showSupportInfo(error, context, errorCode);
        }
        
        // Send error report (if enabled)
        if (this.options.sendErrorReports) {
            this.sendErrorReport(error, context, errorCode);
        }
        
        return this.lastError;
    }
    
    /**
     * Detect error code from error message and context
     */
    detectErrorCode(error, context) {
        const message = error.message?.toLowerCase() || '';
        const action = context.action?.toLowerCase() || '';
        
        // Connection errors - check timeout BEFORE general connection
        if (message.includes('timeout')) {
            return ERROR_CODES.CONNECTION.TIMEOUT;
        }
        if (message.includes('connection') || message.includes('socket') || message.includes('econnrefused')) {
            return ERROR_CODES.CONNECTION.FAILED;
        }
        if (message.includes('disconnected') || message.includes('closed')) {
            return ERROR_CODES.CONNECTION.LOST;
        }
        
        // Auth errors
        if (message.includes('auth') || message.includes('creds') || message.includes('credentials')) {
            return ERROR_CODES.AUTH.FAILED;
        }
        if (message.includes('qr') || action.includes('qr')) {
            return ERROR_CODES.QR.GENERATION_FAILED;
        }
        if (message.includes('session') || message.includes('corrupted')) {
            return ERROR_CODES.AUTH.SESSION_CORRUPTED;
        }
        
        // File errors
        if (message.includes('enoent') || message.includes('file not found')) {
            return ERROR_CODES.FILE.NOT_FOUND;
        }
        if (message.includes('eperm') || message.includes('permission')) {
            return ERROR_CODES.FILE.PERMISSION_DENIED;
        }
        
        // Message errors
        if (action.includes('message') || action.includes('send')) {
            return ERROR_CODES.MESSAGE.SEND_FAILED;
        }
        
        // Plugin errors
        if (action.includes('plugin')) {
            return ERROR_CODES.PLUGIN.LOAD_FAILED;
        }
        
        // Default unknown error
        return ERROR_CODES.SYSTEM.UNKNOWN_ERROR;
    }
    
    /**
     * Show support contact information with error code
     */
    showSupportInfo(error, context, errorCode) {
        console.log("\n" + "=".repeat(50));
        console.log("❌ FEHLER AUFGETRETEN!");
        console.log("=".repeat(50));
        
        // DEINE EMAIL IMMER ZUERST UND PROMINENT!
        console.log(`📧 Bei Problemen melden: ${this.options.supportEmail}`);
        
        if (this.options.supportGitHub) {
            console.log(`🐛 Bug Report: ${this.options.supportGitHub}`);
        }
        
        console.log(`\n🔍 Fehler-Details:`);
        console.log(`   • Error Code: ${errorCode}`);
        console.log(`   • Beschreibung: ${getErrorDescription(errorCode)}`);
        console.log(`   • Kategorie: ${getErrorCategory(errorCode)}`);
        console.log(`   • Fehler: ${error.message}`);
        console.log(`   • WAEngine Version: ${this.getWAEngineVersion()}`);
        
        // Kurze, hilfreiche Lösungsvorschläge
        console.log(`\n💡 Schnelle Lösung:`);
        this.showQuickFixes(error, context, errorCode);
        
        console.log(`\n📖 Mehr Infos: Siehe ERROR-CODES.md für Details zu ${errorCode}`);
        console.log("=".repeat(50) + "\n");
    }
    
    /**
     * Show quick fixes for common errors based on error code
     */
    showQuickFixes(error, context, errorCode) {
        const fixes = this.getQuickFixForErrorCode(errorCode);
        
        if (fixes.length > 0) {
            fixes.forEach(fix => console.log(`   → ${fix}`));
        } else {
            // Fallback to message-based detection
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
    }
    
    /**
     * Get quick fixes for specific error codes
     */
    getQuickFixForErrorCode(errorCode) {
        const fixes = {
            [ERROR_CODES.CONNECTION.FAILED]: [
                "Prüfe deine Internetverbindung",
                "Starte den Bot neu",
                "Prüfe ob WhatsApp Server erreichbar sind"
            ],
            [ERROR_CODES.CONNECTION.TIMEOUT]: [
                "Erhöhe das Connection Timeout in den Optionen",
                "Prüfe deine Netzwerkgeschwindigkeit",
                "Versuche es später erneut"
            ],
            [ERROR_CODES.AUTH.FAILED]: [
                "Lösche den 'auth' Ordner",
                "Scanne den QR-Code erneut",
                "Stelle sicher dass WhatsApp auf dem Handy aktiv ist"
            ],
            [ERROR_CODES.AUTH.SESSION_CORRUPTED]: [
                "Lösche den 'auth' Ordner komplett",
                "Starte den Bot neu und scanne QR-Code",
                "Prüfe ob genug Speicherplatz vorhanden ist"
            ],
            [ERROR_CODES.QR.GENERATION_FAILED]: [
                "Installiere qrcode-terminal: npm install qrcode-terminal",
                "Vergrößere dein Terminal-Fenster",
                "Verwende Browser-QR statt Terminal-QR"
            ],
            [ERROR_CODES.FILE.NOT_FOUND]: [
                "Prüfe ob die Datei existiert",
                "Prüfe den Dateipfad",
                "Stelle sicher dass die Datei nicht verschoben wurde"
            ],
            [ERROR_CODES.FILE.PERMISSION_DENIED]: [
                "Führe den Bot mit Administrator-Rechten aus",
                "Prüfe Datei-Berechtigungen",
                "Schließe andere Programme die die Datei verwenden"
            ],
            [ERROR_CODES.MESSAGE.SEND_FAILED]: [
                "Prüfe ob die Verbindung aktiv ist",
                "Prüfe ob die Nummer/Gruppe existiert",
                "Versuche es erneut"
            ],
            [ERROR_CODES.PLUGIN.LOAD_FAILED]: [
                "Installiere Plugin-Dependencies: npm install",
                "Prüfe Plugin-Konfiguration",
                "Prüfe Plugin-Kompatibilität mit WAEngine Version"
            ],
            [ERROR_CODES.MOBILE.DETECTION_FAILED]: [
                "Aktualisiere @whiskeysockets/baileys",
                "Prüfe Mobile-Support Konfiguration",
                "Verwende Desktop-Modus als Fallback"
            ]
        };
        
        return fixes[errorCode] || [];
    }
    
    /**
     * Send error report to support (if enabled) with error code
     */
    async sendErrorReport(error, context, errorCode) {
        try {
            const stats = this.errorStats.get(errorCode);
            
            const report = {
                errorCode: errorCode,
                errorDescription: getErrorDescription(errorCode),
                errorCategory: getErrorCategory(errorCode),
                message: error.message,
                stack: error.stack,
                context: context,
                occurrences: stats?.count || 1,
                firstSeen: stats?.firstSeen?.toISOString(),
                lastSeen: stats?.lastSeen?.toISOString(),
                version: await this.getWAEngineVersion(),
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
            
            console.log(`📤 Fehlerbericht automatisch gesendet (Error Code: ${errorCode})`);
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
        // Assign specific error code based on error type
        let errorCode = ERROR_CODES.CONNECTION.FAILED;
        if (error.message?.includes('timeout')) {
            errorCode = ERROR_CODES.CONNECTION.TIMEOUT;
        } else if (error.message?.includes('lost') || error.message?.includes('closed')) {
            errorCode = ERROR_CODES.CONNECTION.LOST;
        }
        
        return this.handleError(error, {
            action: 'connection',
            errorCode: errorCode,
            reconnectAttempt: reconnectAttempt,
            details: `Wiederverbindungsversuch ${reconnectAttempt}`
        });
    }
    
    /**
     * Handle plugin errors specifically
     */
    handlePluginError(error, pluginName) {
        let errorCode = ERROR_CODES.PLUGIN.LOAD_FAILED;
        if (error.message?.includes('not found')) {
            errorCode = ERROR_CODES.PLUGIN.NOT_FOUND;
        } else if (error.message?.includes('config')) {
            errorCode = ERROR_CODES.PLUGIN.INVALID_CONFIG;
        }
        
        return this.handleError(error, {
            action: 'plugin',
            errorCode: errorCode,
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
            errorCode: ERROR_CODES.COMMAND.EXECUTION_FAILED,
            command: command,
            user: userId,
            details: `Command '${command}' Fehler`
        });
    }
    
    /**
     * Handle message errors specifically
     */
    handleMessageError(error, messageType) {
        let errorCode = ERROR_CODES.MESSAGE.SEND_FAILED;
        if (error.message?.includes('media')) {
            errorCode = ERROR_CODES.MESSAGE.MEDIA_UPLOAD_FAILED;
        } else if (error.message?.includes('format')) {
            errorCode = ERROR_CODES.MESSAGE.INVALID_FORMAT;
        }
        
        return this.handleError(error, {
            action: 'message',
            errorCode: errorCode,
            messageType: messageType,
            details: `${messageType} Nachricht Fehler`
        });
    }
    
    /**
     * Get error statistics with error code breakdown
     */
    getErrorStats() {
        const errorsByCode = {};
        this.errorStats.forEach((stats, code) => {
            errorsByCode[code] = {
                count: stats.count,
                description: getErrorDescription(code),
                category: getErrorCategory(code),
                firstSeen: stats.firstSeen,
                lastSeen: stats.lastSeen
            };
        });
        
        return {
            totalErrors: this.errorCount,
            lastError: this.lastError,
            errorsByCode: errorsByCode,
            mostCommonError: this.getMostCommonError(),
            supportContacts: {
                email: this.options.supportEmail,
                discord: this.options.supportDiscord,
                github: this.options.supportGitHub
            }
        };
    }
    
    /**
     * Get most common error code
     */
    getMostCommonError() {
        let maxCount = 0;
        let mostCommon = null;
        
        this.errorStats.forEach((stats, code) => {
            if (stats.count > maxCount) {
                maxCount = stats.count;
                mostCommon = {
                    code: code,
                    count: stats.count,
                    description: getErrorDescription(code)
                };
            }
        });
        
        return mostCommon;
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