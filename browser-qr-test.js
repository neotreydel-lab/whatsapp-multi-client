// Test für Browser QR-Code
import { WhatsAppClient } from "./src/index.js";
import fs from 'fs';

async function browserQRTest() {
    console.log("🌐 Browser QR Test...");
    
    // Lösche alte Auth-Daten
    const testAuthDir = "./browser-qr-auth";
    if (fs.existsSync(testAuthDir)) {
        fs.rmSync(testAuthDir, { recursive: true, force: true });
        console.log("🗑️ Auth-Daten gelöscht");
    }
    
    const client = new WhatsAppClient({
        authDir: testAuthDir,
        logLevel: "silent",
        browser: ["BrowserQR", "1.0.3", ""],
        printQR: false // Browser QR
    });

    client.setPrefix("!");

    client.addCommand('ping', async (msg) => {
        console.log("🏓 PING im Browser QR Test!");
        await msg.reply('🏓 Pong! Browser QR funktioniert!');
    });

    client.on('connected', () => {
        console.log("✅ Browser QR Test erfolgreich verbunden!");
    });

    client.on('message', async (msg) => {
        console.log(`📨 Browser QR Message: "${msg.text}"`);
        
        if (msg.text === 'browser') {
            await msg.reply('✅ Browser QR-Code funktioniert perfekt!');
        }
    });

    try {
        console.log("🔄 Starte Browser QR Test...");
        await client.connect();
        
        console.log("🎯 Browser QR Test bereit!");
        console.log("🌐 Scanne QR-Code im Browser!");
        
    } catch (error) {
        console.error("❌ Browser QR Fehler:", error);
    }
}

browserQRTest();