// Test für neue Benutzer - simuliert frische Installation
import { WhatsAppClient } from "./src/index.js";
import fs from 'fs';
import path from 'path';

async function freshUserTest() {
    console.log("🧪 Fresh User Test - Simuliere neue Installation...");
    
    // Lösche alte Auth-Daten um frischen Start zu simulieren
    const testAuthDir = "./fresh-test-auth";
    if (fs.existsSync(testAuthDir)) {
        fs.rmSync(testAuthDir, { recursive: true, force: true });
        console.log("🗑️ Alte Auth-Daten gelöscht");
    }
    
    const client = new WhatsAppClient({
        authDir: testAuthDir,
        logLevel: "silent", // Weniger Baileys-Spam, aber WAEngine-Debug
        browser: ["FreshTest", "1.0.3", ""],
        printQR: false // Browser QR
    });

    // Prefix setzen
    client.setPrefix("!");

    // Test Commands
    client.addCommand('ping', async (msg) => {
        console.log("🏓 Ping Command empfangen!");
        await msg.reply('🏓 Pong! Fresh user test erfolgreich!');
    });

    client.addCommand('test', async (msg) => {
        console.log("🧪 Test Command empfangen!");
        await msg.reply('✅ WAEngine funktioniert für neue Benutzer!');
    });

    // Event Handlers mit Debug-Info
    client.on('connected', () => {
        console.log("✅ Fresh User erfolgreich verbunden!");
        console.log("📱 Sende jetzt eine Nachricht an den Bot...");
    });

    client.on('message', async (msg) => {
        console.log("\n🔍 MESSAGE DEBUG INFO:");
        console.log("📱 Von:", msg.from);
        console.log("💬 Text:", msg.text);
        console.log("🏷️ Typ:", msg.type);
        console.log("👥 Gruppe:", msg.isGroup);
        console.log("⏰ Timestamp:", new Date(msg.timestamp * 1000).toLocaleString());
        console.log("🔍 Raw Keys:", Object.keys(msg.raw.message || {}));
        
        // Auto-Antwort für Test
        if (msg.text === 'hallo') {
            console.log("🤖 Antworte auf 'hallo'...");
            try {
                await msg.reply('Hallo! Ich bin WAEngine und empfange deine Nachrichten! 🎉');
                console.log("✅ Antwort gesendet!");
            } catch (error) {
                console.error("❌ Fehler beim Antworten:", error);
            }
        }
    });

    client.on('command', async (msg) => {
        console.log(`⚡ Command empfangen: !${msg.command}`);
    });

    client.on('disconnected', (data) => {
        console.log("🔴 Verbindung getrennt:", data.reason);
    });

    try {
        console.log("🔄 Starte Fresh User Verbindung...");
        await client.connect();
        
        console.log("\n🎯 Fresh User Test bereit!");
        console.log("📋 Test-Nachrichten:");
        console.log("   - 'hallo' → Auto-Antwort");
        console.log("   - '!ping' → Pong Command");
        console.log("   - '!test' → Test Command");
        console.log("\n⚠️ WICHTIG: Scanne den QR-Code und sende eine Testnachricht!");
        
    } catch (error) {
        console.error("❌ Fresh User Test Fehler:", error);
        
        // Detaillierte Fehleranalyse
        if (error.message.includes('Connection Failure')) {
            console.log("\n🔍 CONNECTION FAILURE ANALYSE:");
            console.log("1. Prüfe Internetverbindung");
            console.log("2. Prüfe ob WhatsApp Web funktioniert");
            console.log("3. Versuche anderen Browser für QR-Code");
            console.log("4. Prüfe Firewall/Antivirus Einstellungen");
        }
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Beende Fresh User Test...');
    process.exit(0);
});

freshUserTest();