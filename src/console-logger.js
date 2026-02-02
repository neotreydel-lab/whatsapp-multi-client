// 🎨 WAEngine Console Logger - Schöne animierte Console ohne Spam
export class ConsoleLogger {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.silent = options.silent || false;
        this.useColors = options.colors !== false;
        this.currentProgressBars = new Map();
    }

    // ===== BANNER =====
    showBanner() {
        if (this.silent) return;
        
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 WAEngine v1.7.4                       ║
║              Advanced WhatsApp Bot Framework                 ║
╚══════════════════════════════════════════════════════════════╝`);
    }

    // ===== ANIMIERTE PROGRESS BAR =====
    createProgressBar(id, label, total = 100) {
        const bar = {
            id,
            label,
            current: 0,
            total,
            width: 40,
            interval: null,
            isComplete: false
        };
        
        this.currentProgressBars.set(id, bar);
        return bar;
    }

    updateProgressBar(id, value, newLabel = null) {
        const bar = this.currentProgressBars.get(id);
        if (!bar || bar.isComplete) return;

        bar.current = Math.min(value, bar.total);
        if (newLabel) bar.label = newLabel;

        const percentage = Math.round((bar.current / bar.total) * 100);
        const filled = Math.round((bar.current / bar.total) * bar.width);
        const progressChars = '█'.repeat(filled);
        const emptyChars = ' '.repeat(bar.width - filled);
        
        const line = `\r${bar.label} [${progressChars}${emptyChars}] ${percentage}%`;
        process.stdout.write(line);
    }

    completeProgressBar(id, message = '✅') {
        const bar = this.currentProgressBars.get(id);
        if (!bar) return;

        bar.isComplete = true;
        this.updateProgressBar(id, bar.total);
        process.stdout.write(` ${message}\n`);
        this.currentProgressBars.delete(id);
    }

    // ===== ANIMIERTE SETUP SEQUENCE =====
    async animateSetup() {
        if (this.silent) return;

        // SCHNELLE VERSION - Keine Verzögerungen für QR-Code!
        const setupBar = this.createProgressBar('setup', '🔧 Initialisierung');
        
        // Alles parallel ohne Delays
        this.updateProgressBar('setup', 100, '🔧 System bereit');
        this.completeProgressBar('setup');
        
        // Zusammenfassung
        this.showSystemSummary();
    }

    showSystemSummary() {
        if (this.silent) return;
        
        console.log(`
✅ System bereit
   ├─ Storage: ./waengine-data
   ├─ Devices: 2/2 konfiguriert
   ├─ Plugins: 8 verfügbar
   └─ Prefix: "!"`);
    }

    // ===== QR-CODE ANIMATION =====
    async animateQRGeneration(deviceName = 'bot1', deviceNumber = 1, totalDevices = 2) {
        if (this.silent) return;

        // SCHNELLE VERSION - Keine Verzögerungen für QR-Code!
        const qrBar = this.createProgressBar('qr', '📱 QR-Code wird generiert...');
        
        // Alles parallel ohne Delays
        this.updateProgressBar('qr', 100, '📱 QR-Code bereit');
        this.completeProgressBar('qr');
        
        // QR-Code Box sofort anzeigen
        this.showQRBox(deviceName, deviceNumber, totalDevices);
    }

    showQRBox(deviceName, deviceNumber, totalDevices) {
        if (this.silent) return;
        
        console.log(`
┌─────────────────────────────────────────┐
│  📱 WAEngine QR-Code                    │
│  Device ${deviceNumber}/${totalDevices}: ${deviceName}                        │
├─────────────────────────────────────────┤
│                                         │
│  [QR-Code wird im Browser angezeigt]    │
│                                         │
├─────────────────────────────────────────┤
│  🌐 Browser: Edge geöffnet              │
│  ⏳ Warte auf QR-Scan...                │
└─────────────────────────────────────────┘`);
    }

    // ===== CONNECTION ANIMATION =====
    async animateConnection(deviceName, isAuthenticated = true) {
        if (this.silent) return;

        const connBar = this.createProgressBar('conn', 'Verbindung');
        
        this.updateProgressBar('conn', 15, 'Verbindung [QR gescannt]');
        await this.delay(800);
        
        this.updateProgressBar('conn', 45, 'Verbindung [Authentifizierung]');
        await this.delay(1000);
        
        this.updateProgressBar('conn', 75, 'Verbindung [Synchronisation]');
        await this.delay(600);
        
        this.updateProgressBar('conn', 100, 'Verbindung [Abgeschlossen]');
        await this.delay(300);
        this.completeProgressBar('conn', '🎉');
        
        this.showDeviceConnected(deviceName, isAuthenticated);
    }

    showDeviceConnected(deviceName, isAuthenticated = true) {
        if (this.silent) return;
        
        if (!isAuthenticated) {
            console.log(`
⚠️ Device '${deviceName}' socket verbunden aber NICHT authentifiziert
   ├─ Status: Warte auf QR-Scan
   ├─ Bereit für: QR-Code Authentifizierung
   └─ Load Balancing: Inaktiv`);
            return;
        }
        
        console.log(`
✅ Device '${deviceName}' erfolgreich authentifiziert
   ├─ Status: Online & Authentifiziert
   ├─ Bereit für Nachrichten
   └─ Load Balancing: Aktiv`);
    }

    // ===== PAUSE ZWISCHEN DEVICES =====
    async showDevicePause(seconds = 3) {
        if (this.silent) return;
        
        console.log(`\n⏸️  Pause vor nächstem Device... (${seconds}s)`);
        
        for (let i = seconds; i > 0; i--) {
            process.stdout.write(`\r⏳ Weiter in ${i} Sekunden...`);
            await this.delay(1000);
        }
        process.stdout.write('\r✅ Bereit für nächstes Device!\n\n');
    }

    // ===== FINALE ZUSAMMENFASSUNG =====
    showFinalSummary(connectedDevices, isAuthenticated = true) {
        if (this.silent) return;
        
        if (!isAuthenticated) {
            console.log(`
⏳ Multi-Device Setup in Bearbeitung...

🔌 Socket-Verbindungen hergestellt`);
            
            connectedDevices.forEach((device, index) => {
                const isLast = index === connectedDevices.length - 1;
                const prefix = isLast ? '└─' : '├─';
                console.log(`   ${prefix} ${device}: Socket offen (warte auf Auth)`);
            });
            
            console.log(`
📱 Bereit für QR-Code Scan...
   ├─ Scanne QR-Code in WhatsApp
   ├─ Authentifizierung läuft
   └─ Status: ⏳ Warte auf Benutzer

💬 Nach QR-Scan: Bot wird aktiviert...`);
            return;
        }
        
        console.log(`
🎉 Multi-Device Setup abgeschlossen!

✅ Alle Devices authentifiziert`);
        
        connectedDevices.forEach((device, index) => {
            const isLast = index === connectedDevices.length - 1;
            const prefix = isLast ? '└─' : '├─';
            console.log(`   ${prefix} ${device}: Online & Authentifiziert`);
        });
        
        console.log(`
🚀 WAEngine ist bereit!
   ├─ Prefix: "!"
   ├─ Commands: 12 verfügbar
   ├─ Plugins: 8 geladen
   └─ Status: 🟢 Online & Authentifiziert

💬 Bot wartet auf Nachrichten...`);
    }

    // ===== SIMPLE LOGS =====
    info(message) {
        if (this.silent) return;
        console.log(`ℹ️  ${message}`);
    }

    success(message) {
        if (this.silent) return;
        console.log(`✅ ${message}`);
    }

    warning(message) {
        if (this.silent) return;
        console.log(`⚠️  ${message}`);
    }

    error(message) {
        if (this.silent) return;
        console.log(`❌ ${message}`);
    }

    // ===== HELPER =====
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== CLEAR CONSOLE =====
    clear() {
        if (this.silent) return;
        console.clear();
    }
}

// Export für einfache Nutzung
export const logger = new ConsoleLogger();