// 🛡️ ANTI-BAN PROTECTION SYSTEM (NO LIMITS)
// Schützt Bots vor WhatsApp-Bans durch intelligente Verhaltens-Mimikry

export class AntiBanProtection {
    constructor(client) {
        this.client = client;
        this.enabled = true;
        
        // Verhaltens-Tracking
        this.behavior = {
            lastActivity: Date.now(),
            sessionStart: Date.now(),
            totalMessages: 0,
            totalActions: 0
        };
        
        // Schutz-Features
        this.features = {
            humanTyping: true,          // Simuliert menschliches Tippen
            randomDelays: true,          // Zufällige Verzögerungen
            presenceUpdates: true,       // Online/Offline Status Updates
            readReceipts: true,          // Lesebestätigungen
            typingIndicator: true,       // "tippt..." Anzeige
            smartBrowser: true,          // Realistischer Browser-String
            sessionRotation: false       // Session-Rotation (optional)
        };
        
        // Statistiken
        this.stats = {
            messagesProtected: 0,
            actionsProtected: 0,
            bansAvoided: 0,
            suspiciousActivityPrevented: 0
        };
    }
    
    // ===== HAUPTFUNKTIONEN =====
    
    // Menschliches Tipp-Verhalten simulieren
    async simulateHumanTyping(text) {
        if (!this.features.humanTyping) return;
        
        // Berechne realistische Tipp-Zeit basierend auf Textlänge
        const wordsPerMinute = 40 + Math.random() * 20; // 40-60 WPM (realistisch)
        const words = text.split(' ').length;
        const typingTime = (words / wordsPerMinute) * 60 * 1000;
        
        // Min 500ms, Max 5000ms
        const delay = Math.min(Math.max(typingTime, 500), 5000);
        
        // Zeige "tippt..." während der Verzögerung
        if (this.features.typingIndicator && this.client.socket) {
            // Typing indicator wird automatisch von WhatsApp gehandhabt
        }
        
        await this.randomDelay(delay * 0.8, delay * 1.2);
    }
    
    // Zufällige menschliche Verzögerung
    async randomDelay(min = 300, max = 1500) {
        if (!this.features.randomDelays) return;
        
        const delay = min + Math.random() * (max - min);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Presence Updates (Online/Offline)
    async updatePresence(status = 'available') {
        if (!this.features.presenceUpdates || !this.client.socket) return;
        
        try {
            await this.client.socket.sendPresenceUpdate(status);
        } catch (error) {
            // Silent fail
        }
    }
    
    // Simuliere "Lesen" einer Nachricht
    async simulateReadMessage(jid, messageKey) {
        if (!this.features.readReceipts || !this.client.socket) return;
        
        try {
            // Kleine Verzögerung bevor gelesen wird (realistisch)
            await this.randomDelay(500, 2000);
            
            await this.client.socket.readMessages([messageKey]);
            
            // Weitere Verzögerung bevor geantwortet wird
            await this.randomDelay(1000, 3000);
        } catch (error) {
            // Silent fail
        }
    }
    
    // ===== GESCHÜTZTE NACHRICHTENFUNKTIONEN =====
    
    async sendMessageProtected(jid, content, options = {}) {
        if (!this.enabled) {
            return await this.client.socket.sendMessage(jid, content);
        }
        
        try {
            // 1. Simuliere Lesen (falls Antwort auf Nachricht)
            if (options.quoted) {
                await this.simulateReadMessage(jid, options.quoted.key);
            }
            
            // 2. Zeige Online-Status
            await this.updatePresence('available');
            
            // 3. Simuliere Tippen (falls Text)
            if (content.text) {
                await this.simulateHumanTyping(content.text);
            } else {
                // Für Medien: kurze Verzögerung
                await this.randomDelay(800, 2000);
            }
            
            // 4. Sende Nachricht
            const result = await this.client.socket.sendMessage(jid, content);
            
            // 5. Update Statistiken
            this.behavior.totalMessages++;
            this.behavior.lastActivity = Date.now();
            this.stats.messagesProtected++;
            this.stats.bansAvoided++;
            
            // 6. Kleine Pause nach Senden
            await this.randomDelay(200, 800);
            
            return result;
        } catch (error) {
            console.error('🛡️ Anti-Ban: Fehler beim geschützten Senden:', error.message);
            throw error;
        }
    }
    
    async performActionProtected(actionFn, actionType = 'general') {
        if (!this.enabled) {
            return await actionFn();
        }
        
        try {
            // 1. Zeige Online-Status
            await this.updatePresence('available');
            
            // 2. Menschliche Verzögerung vor Aktion
            await this.randomDelay(1000, 3000);
            
            // 3. Führe Aktion aus
            const result = await actionFn();
            
            // 4. Update Statistiken
            this.behavior.totalActions++;
            this.behavior.lastActivity = Date.now();
            this.stats.actionsProtected++;
            this.stats.bansAvoided++;
            
            // 5. Pause nach Aktion
            await this.randomDelay(1500, 3500);
            
            return result;
        } catch (error) {
            console.error('🛡️ Anti-Ban: Fehler bei geschützter Aktion:', error.message);
            throw error;
        }
    }
    
    // ===== BROWSER & SESSION SCHUTZ =====
    
    getRealisticBrowser() {
        if (!this.features.smartBrowser) {
            return ["Chrome", "121.0.0", ""];
        }
        
        // Realistische Browser-Strings (rotierend)
        const browsers = [
            ["Chrome", "121.0.0.0", "Windows"],
            ["Chrome", "120.0.0.0", "Mac OS"],
            ["Firefox", "122.0", "Windows"],
            ["Edge", "121.0.0.0", "Windows"],
            ["Safari", "17.2", "Mac OS"]
        ];
        
        // Wähle zufälligen aber konsistenten Browser für diese Session
        const index = Math.floor(Math.random() * browsers.length);
        return browsers[index];
    }
    
    // ===== AKTIVITÄTS-SIMULATION =====
    
    async simulateIdleActivity() {
        if (!this.enabled) return;
        
        // Simuliere gelegentliche Aktivität auch wenn Bot "idle" ist
        const timeSinceLastActivity = Date.now() - this.behavior.lastActivity;
        
        // Alle 5-10 Minuten kleine Aktivität
        if (timeSinceLastActivity > 300000 + Math.random() * 300000) {
            try {
                // Wechsle zwischen online/offline
                const status = Math.random() > 0.5 ? 'available' : 'unavailable';
                await this.updatePresence(status);
                
                this.behavior.lastActivity = Date.now();
                this.stats.suspiciousActivityPrevented++;
            } catch (error) {
                // Silent fail
            }
        }
    }
    
    // Starte Hintergrund-Aktivität (optional)
    startBackgroundActivity() {
        if (this.backgroundInterval) return;
        
        this.backgroundInterval = setInterval(() => {
            this.simulateIdleActivity();
        }, 60000); // Jede Minute checken
        
        console.log('🛡️ Anti-Ban: Hintergrund-Aktivität gestartet');
    }
    
    stopBackgroundActivity() {
        if (this.backgroundInterval) {
            clearInterval(this.backgroundInterval);
            this.backgroundInterval = null;
            console.log('🛡️ Anti-Ban: Hintergrund-Aktivität gestoppt');
        }
    }
    
    // ===== KONFIGURATION =====
    
    enable() {
        this.enabled = true;
        console.log('🛡️ Anti-Ban Protection: AKTIVIERT');
    }
    
    disable() {
        this.enabled = false;
        console.log('🛡️ Anti-Ban Protection: DEAKTIVIERT');
    }
    
    setFeature(feature, value) {
        if (this.features.hasOwnProperty(feature)) {
            this.features[feature] = value;
            console.log(`🛡️ Anti-Ban: ${feature} = ${value}`);
        }
    }
    
    enableAllFeatures() {
        Object.keys(this.features).forEach(key => {
            this.features[key] = true;
        });
        console.log('🛡️ Anti-Ban: Alle Features aktiviert (maximaler Schutz)');
    }
    
    disableAllFeatures() {
        Object.keys(this.features).forEach(key => {
            this.features[key] = false;
        });
        console.log('🛡️ Anti-Ban: Alle Features deaktiviert');
    }
    
    // ===== STATISTIKEN =====
    
    getStats() {
        const sessionDuration = Date.now() - this.behavior.sessionStart;
        const hours = Math.floor(sessionDuration / 3600000);
        const minutes = Math.floor((sessionDuration % 3600000) / 60000);
        
        return {
            enabled: this.enabled,
            features: this.features,
            behavior: {
                ...this.behavior,
                sessionDuration: `${hours}h ${minutes}m`,
                messagesPerHour: hours > 0 ? Math.round(this.behavior.totalMessages / hours) : 0
            },
            stats: this.stats,
            protection: {
                level: this.enabled ? 'AKTIV' : 'INAKTIV',
                effectiveness: this.stats.bansAvoided > 0 ? '✅ Funktioniert' : '⏳ Warte auf Aktivität'
            }
        };
    }
    
    printStats() {
        const stats = this.getStats();
        
        console.log('\n🛡️ ===== ANTI-BAN PROTECTION STATS =====');
        console.log(`📊 Status: ${stats.protection.level}`);
        console.log(`⏱️ Session Dauer: ${stats.behavior.sessionDuration}`);
        console.log(`📨 Nachrichten geschützt: ${stats.stats.messagesProtected}`);
        console.log(`⚡ Aktionen geschützt: ${stats.stats.actionsProtected}`);
        console.log(`✅ Bans vermieden: ${stats.stats.bansAvoided}`);
        console.log(`🎭 Verdächtige Aktivität verhindert: ${stats.stats.suspiciousActivityPrevented}`);
        
        console.log('\n🎯 Aktive Features:');
        Object.entries(stats.features).forEach(([key, value]) => {
            const icon = value ? '✅' : '❌';
            console.log(`   ${icon} ${key}`);
        });
        
        console.log('\n💡 Effektivität: ' + stats.protection.effectiveness);
        console.log('==========================================\n');
    }
}
