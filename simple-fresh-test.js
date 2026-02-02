// Einfacher Test für neue Benutzer ohne Browser
import { WhatsAppClient } from "./src/index.js";
import fs from 'fs';

async function simpleFreshTest() {
    console.log("🧪 Simple Fresh Test - Terminal QR nur...");
    
    // Lösche alte Auth-Daten
    const testAuthDir = "./simple-fresh-auth";
    if (fs.existsSync(testAuthDir)) {
        fs.rmSync(testAuthDir, { recursive: true, force: true });
        console.log("🗑️ Auth-Daten gelöscht");
    }
    
    const client = new WhatsAppClient({
        authDir: testAuthDir,
        logLevel: "silent",
        browser: ["SimpleFresh", "1.0.3", ""],
        printQR: true // Terminal QR - einfacher für Test
    });

    client.setPrefix("!");

    // Einfacher Test Command
    client.addCommand('ping', async (msg) => {
        console.log("🏓 PING EMPFANGEN! Das funktioniert!");
        await msg.reply('🏓 Pong! Fresh User Test erfolgreich!');
    });

    // Event Handlers
    client.on('connected', () => {
        console.log("✅ VERBUNDEN! Event-Handler sind aktiv!");
    });

    client.on('message', async (msg) => {
        console.log(`📨 MESSAGE EMPFANGEN: "${msg.text}" von ${msg.from}`);
        
        if (msg.text === 'test') {
            console.log("🤖 Antworte auf 'test'...");
            await msg.reply('✅ WAEngine empfängt Nachrichten korrekt!');
        }
    });

    client.on('command', async (msg) => {
        console.log(`⚡ COMMAND EMPFANGEN: !${msg.command}`);
    });

    try {
        console.log("🔄 Verbinde...");
        await client.connect();
        
        console.log("\n🎯 Simple Fresh Test bereit!");
        console.log("📱 Scanne QR-Code im Terminal und sende:");
        console.log("   - 'test' → Test-Antwort");
        console.log("   - '!ping' → Ping Command");
        
    } catch (error) {
        console.error("❌ Fehler:", error);
    }
}

simpleFreshTest();