// Sauberer Test ohne Debug-Spam
import { WhatsAppClient } from "./src/index.js";

async function cleanTest() {
    console.log("🚀 WAEngine Clean Test...");
    
    const client = new WhatsAppClient({
        authDir: "./auth",
        logLevel: "silent", // Kein Baileys-Spam
        browser: ["CleanTest", "1.0.4", ""],
        printQR: true // Terminal QR
    });

    client.setPrefix("!");

    // Commands
    client.addCommand('ping', async (msg) => {
        await msg.reply('🏓 Pong!');
    });

    client.addCommand('test', async (msg) => {
        await msg.reply('✅ WAEngine v1.0.4 funktioniert sauber!');
    });

    // Events
    client.on('connected', () => {
        console.log("✅ Verbunden! Sende Nachrichten zum Testen...");
    });

    client.on('message', async (msg) => {
        // Nur bei echten Nachrichten antworten
        if (msg.text === 'hallo') {
            await msg.reply('Hallo zurück! 👋');
        }
        
        if (msg.text === 'clean') {
            await msg.reply('🧹 Saubere Ausgabe ohne Debug-Spam!');
        }
    });

    client.on('command', async (msg) => {
        // Minimales Command-Logging
        console.log(`⚡ ${msg.command}`);
    });

    try {
        await client.connect();
        console.log("🎯 Clean Test bereit!");
        
    } catch (error) {
        console.error("❌ Fehler:", error);
    }
}

cleanTest();