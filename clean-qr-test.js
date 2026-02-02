// 🧹 Clean QR Test - Kein Terminal Spam!
import { WhatsAppClient } from "./src/index.js";
import fs from 'fs';

console.log("🧹 Clean QR Test - Sauberes Terminal ohne Spam!");

async function cleanQRTest() {
    // Lösche alte Auth-Daten
    const testAuthDir = "./clean-qr-auth";
    if (fs.existsSync(testAuthDir)) {
        fs.rmSync(testAuthDir, { recursive: true, force: true });
        console.log("🗑️ Alte Auth-Daten gelöscht");
    }
    
    console.log("\n🎯 Verschiedene QR-Modi verfügbar:");
    console.log("1. 🧹 Clean Mode (Standard) - Minimaler Terminal Output");
    console.log("2. 📱 Terminal Only - Nur Terminal QR, kein Browser");
    console.log("3. 🌐 Browser Only - Nur Browser QR, kein Terminal");
    console.log("4. 🔇 Silent Mode - Nur Browser, komplett stumm");
    
    // ===== MODE 1: CLEAN MODE (Standard) =====
    console.log("\n🧹 Starte Clean Mode...");
    
    const client = new WhatsAppClient({
        authDir: testAuthDir,
        logLevel: "silent",
        browser: ["CleanQR", "1.0.0", ""],
        
        // CLEAN QR SETTINGS
        printQR: false,                    // Browser QR bevorzugt
        qrSpamPrevention: true,           // Anti-Spam aktiviert
        qrDisplayInterval: 30000,         // 30s zwischen Terminal QR
        qrMaxDisplays: 3,                 // Max 3 Terminal QR
        clearTerminalOnQR: true,          // Terminal bei QR leeren
    });

    client.setPrefix("!");

    client.addCommand('qr', async (msg) => {
        await msg.reply('📱 QR-System läuft sauber ohne Spam!\n' +
                       '✅ Browser QR bevorzugt\n' +
                       '✅ Terminal QR nur bei Bedarf\n' +
                       '✅ Anti-Spam aktiviert');
    });

    client.addCommand('clean', async (msg) => {
        await msg.reply('🧹 Clean Mode aktiv:\n' +
                       '• Minimaler Terminal Output\n' +
                       '• QR nur alle 30 Sekunden\n' +
                       '• Browser QR bevorzugt\n' +
                       '• Kein Spam!');
    });

    client.on('connected', () => {
        console.log("✅ Clean QR Test erfolgreich verbunden!");
        console.log("🧹 Terminal bleibt sauber - kein QR Spam!");
        console.log("📱 Teste: 'qr' oder '!clean'");
    });

    client.on('message', async (msg) => {
        if (msg.text === 'hello') {
            await msg.reply('👋 Hallo! QR-System läuft jetzt spam-frei!');
        }
    });

    try {
        console.log("🚀 Starte Clean QR Verbindung...");
        console.log("💡 QR-Code wird intelligent angezeigt:");
        console.log("   • Browser QR (bevorzugt)");
        console.log("   • Terminal QR nur bei Bedarf");
        console.log("   • Anti-Spam aktiviert");
        console.log("");
        
        await client.connect();
        
    } catch (error) {
        console.error("❌ Clean QR Test Fehler:", error);
    }
}

// ===== VERSCHIEDENE QR-MODI =====

async function terminalOnlyMode() {
    console.log("\n📱 Terminal Only Mode - Nur Terminal QR");
    
    const client = new WhatsAppClient({
        authDir: "./terminal-only-auth",
        printQR: true,                    // Nur Terminal QR
        clearTerminalOnQR: true,          // Saubere Anzeige
        logLevel: "silent"
    });
    
    await client.connect();
}

async function browserOnlyMode() {
    console.log("\n🌐 Browser Only Mode - Nur Browser QR");
    
    const client = new WhatsAppClient({
        authDir: "./browser-only-auth",
        printQR: false,                   // Nur Browser QR
        qrSpamPrevention: true,          // Kein Terminal Spam
        logLevel: "silent"
    });
    
    await client.connect();
}

async function silentMode() {
    console.log("\n🔇 Silent Mode - Komplett stumm");
    
    const client = new WhatsAppClient({
        authDir: "./silent-auth",
        printQR: false,                   // Nur Browser
        logLevel: "silent",               // Keine Logs
        qrSpamPrevention: true,          // Kein Spam
        clearTerminalOnQR: false         // Terminal nicht leeren
    });
    
    // Komplett stumm - keine Console Logs
    const originalLog = console.log;
    console.log = () => {}; // Stumm schalten
    
    await client.connect();
    
    // Nach Verbindung wieder aktivieren
    setTimeout(() => {
        console.log = originalLog;
        console.log("✅ Silent Mode verbunden - war komplett stumm!");
    }, 5000);
}

// ===== INTERAKTIVE AUSWAHL =====

async function interactiveQRTest() {
    console.log("\n🎮 Interaktive QR-Modi Auswahl:");
    console.log("Welchen Modus möchtest du testen?");
    console.log("");
    console.log("1 - 🧹 Clean Mode (empfohlen)");
    console.log("2 - 📱 Terminal Only");
    console.log("3 - 🌐 Browser Only");
    console.log("4 - 🔇 Silent Mode");
    console.log("");
    console.log("Starte automatisch Clean Mode in 3 Sekunden...");
    
    // Auto-start Clean Mode nach 3 Sekunden
    setTimeout(() => {
        cleanQRTest();
    }, 3000);
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Beende Clean QR Test...');
    process.exit(0);
});

// Starte interaktiven Test
interactiveQRTest();