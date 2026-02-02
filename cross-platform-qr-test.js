// 🌍 Cross-Platform QR Test - Funktioniert auf ALLEN Geräten!
import { WhatsAppClient } from "./src/index.js";
import fs from 'fs';
import os from 'os';

console.log("🌍 Cross-Platform QR Test - Universell Kompatibel!");
console.log("=".repeat(60));

// System-Info anzeigen
const platform = os.platform();
const arch = os.arch();
const release = os.release();
const nodeVersion = process.version;

console.log(`🖥️ Plattform: ${platform} (${arch})`);
console.log(`📦 Node.js: ${nodeVersion}`);
console.log(`🔧 OS Release: ${release}`);
console.log("=".repeat(60));

async function crossPlatformTest() {
    // Lösche alte Auth-Daten für frischen Test
    const testAuthDir = "./cross-platform-auth";
    if (fs.existsSync(testAuthDir)) {
        fs.rmSync(testAuthDir, { recursive: true, force: true });
        console.log("🗑️ Alte Auth-Daten gelöscht");
    }
    
    const client = new WhatsAppClient({
        authDir: testAuthDir,
        logLevel: "silent",
        browser: ["CrossPlatform", "1.0.0", ""],
        printQR: false, // Browser QR (mit Terminal Fallback)
        
        // Robuste Verbindung für alle Plattformen
        maxReconnectAttempts: 100,
        reconnectInterval: 2000,
        exponentialBackoff: true,
        heartbeatInterval: 15000,
        connectionTimeout: 180000,
        keepAlive: true
    });

    client.setPrefix("!");

    // Test Commands
    client.addCommand('platform', async (msg) => {
        const info = `🌍 **Cross-Platform Info:**\n\n` +
                    `🖥️ Plattform: ${platform}\n` +
                    `🏗️ Architektur: ${arch}\n` +
                    `📦 Node.js: ${nodeVersion}\n` +
                    `🔧 OS: ${release}\n\n` +
                    `✅ WAEngine läuft perfekt!`;
        
        await msg.reply(info);
    });

    client.addCommand('test', async (msg) => {
        await msg.reply(`✅ Cross-Platform Test erfolgreich!\n🌍 Läuft auf: ${platform}`);
    });

    client.addCommand('qr', async (msg) => {
        await msg.reply('📱 QR-System funktioniert universell:\n' +
                       '✅ Terminal QR (immer verfügbar)\n' +
                       '✅ Browser QR (wenn möglich)\n' +
                       '✅ HTTP Server Fallback\n' +
                       '✅ Alle Plattformen unterstützt');
    });

    // Event Handlers
    client.on('connected', () => {
        console.log("✅ Cross-Platform Verbindung erfolgreich!");
        console.log(`🌍 Läuft auf: ${platform} (${arch})`);
        console.log("📱 Sende Testnachrichten:");
        console.log("   - !platform → System-Info");
        console.log("   - !test → Test-Bestätigung");
        console.log("   - !qr → QR-System Info");
    });

    client.on('message', async (msg) => {
        if (msg.text === 'hello') {
            await msg.reply(`👋 Hallo! WAEngine läuft perfekt auf ${platform}! 🎉`);
        }
        
        if (msg.text === 'system') {
            await msg.reply(`🖥️ **System-Info:**\n` +
                           `Plattform: ${platform}\n` +
                           `Architektur: ${arch}\n` +
                           `Node.js: ${nodeVersion}`);
        }
    });

    client.on('disconnected', (data) => {
        console.log("🔴 Verbindung getrennt:", data.reason);
        console.log("🔄 Robuste Wiederverbindung wird versucht...");
    });

    try {
        console.log("🚀 Starte Cross-Platform Verbindung...");
        console.log("📱 QR-Code wird in mehreren Formaten angezeigt:");
        console.log("   1. ✅ Terminal QR (immer verfügbar)");
        console.log("   2. 🌐 Browser QR (wenn möglich)");
        console.log("   3. 📡 HTTP Server (Fallback)");
        console.log("");
        
        await client.connect();
        
        console.log("🎯 Cross-Platform Test bereit!");
        console.log("⚠️ Scanne einen der QR-Codes und teste!");
        
    } catch (error) {
        console.error("❌ Cross-Platform Test Fehler:", error);
        
        // Plattform-spezifische Hilfe
        console.log("\n🔍 PLATTFORM-SPEZIFISCHE HILFE:");
        
        switch (platform) {
            case 'win32':
                console.log("🪟 Windows:");
                console.log("   - Prüfe Windows Defender/Antivirus");
                console.log("   - Installiere Microsoft Edge oder Chrome");
                console.log("   - Prüfe Firewall-Einstellungen");
                break;
                
            case 'darwin':
                console.log("🍎 macOS:");
                console.log("   - Erlaube Terminal Netzwerk-Zugriff");
                console.log("   - Installiere Chrome oder verwende Safari");
                console.log("   - Prüfe Gatekeeper-Einstellungen");
                break;
                
            case 'linux':
                console.log("🐧 Linux:");
                console.log("   - Installiere xdg-utils: sudo apt install xdg-utils");
                console.log("   - Installiere Browser: sudo apt install chromium-browser");
                console.log("   - Prüfe Display-Variable: echo $DISPLAY");
                break;
                
            default:
                console.log(`❓ Unbekannte Plattform: ${platform}`);
                console.log("   - Terminal QR sollte immer funktionieren");
                console.log("   - Versuche manuell Browser zu öffnen");
        }
        
        console.log("\n📱 TERMINAL QR ist immer verfügbar!");
        console.log("   Scanne den QR-Code im Terminal oben ⬆️");
    }
}

// Graceful shutdown für alle Plattformen
process.on('SIGINT', async () => {
    console.log('\n👋 Beende Cross-Platform Test...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n👋 Beende Cross-Platform Test (SIGTERM)...');
    process.exit(0);
});

// Windows-spezifische Signale
if (platform === 'win32') {
    process.on('SIGBREAK', async () => {
        console.log('\n👋 Beende Cross-Platform Test (SIGBREAK)...');
        process.exit(0);
    });
}

crossPlatformTest();