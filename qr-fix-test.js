// 🔧 QR Fix Test - ES Module Kompatibilität
import { WhatsAppClient } from "./src/index.js";
import fs from 'fs';

console.log("🔧 QR Fix Test - ES Module Kompatibilität");

async function qrFixTest() {
    // Lösche alte Auth-Daten für frischen Test
    const testAuthDir = "./qr-fix-auth";
    if (fs.existsSync(testAuthDir)) {
        fs.rmSync(testAuthDir, { recursive: true, force: true });
        console.log("🗑️ Alte Auth-Daten gelöscht");
    }
    
    const client = new WhatsAppClient({
        authDir: testAuthDir,
        logLevel: "silent",
        browser: ["QRFix", "1.0.0", ""],
        printQR: false, // Browser QR (mit Terminal Fallback)
    });

    client.setPrefix("!");

    client.addCommand('test', async (msg) => {
        await msg.reply('✅ QR Fix funktioniert!');
    });

    client.on('connected', () => {
        console.log("✅ QR Fix Test erfolgreich verbunden!");
        console.log("📱 Sende 'test' oder '!test' zum Testen");
    });

    client.on('message', async (msg) => {
        if (msg.text === 'hello') {
            await msg.reply('👋 QR System funktioniert jetzt perfekt!');
        }
    });

    try {
        console.log("🚀 Starte QR Fix Test...");
        console.log("📱 QR-Code sollte jetzt ohne Fehler angezeigt werden!");
        
        await client.connect();
        
    } catch (error) {
        console.error("❌ QR Fix Test Fehler:", error);
    }
}

qrFixTest();