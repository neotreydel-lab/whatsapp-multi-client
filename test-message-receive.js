import { WhatsAppClient } from "./src/client.js";

console.log("🧪 Message Receive Test - Debugging");
console.log("=" .repeat(50));

const client = new WhatsAppClient({
    printQR: true,
    logLevel: "info" // Mehr Logs für Debugging
});

// Alle Message Events loggen
client.on('message', (msg) => {
    console.log("\n✅ MESSAGE EMPFANGEN!");
    console.log(`📱 Von: ${msg.from}`);
    console.log(`💬 Text: ${msg.text || '[Kein Text]'}`);
    console.log(`📊 Type: ${msg.type}`);
    console.log(`⏰ Timestamp: ${new Date(msg.timestamp * 1000).toLocaleString()}`);
    console.log(`👥 Gruppe: ${msg.isGroup ? 'Ja' : 'Nein'}`);
    
    // Auto-Reply zum Testen
    if (msg.text && msg.text.toLowerCase().includes('test')) {
        msg.reply('✅ Test erfolgreich! Ich empfange Nachrichten! 🎉');
    }
});

// Connection Events
client.on('connected', () => {
    console.log("\n🎉 Bot verbunden!");
    console.log("📨 Sende jetzt eine Nachricht mit 'test' zum Testen!");
});

// Verbinden
await client.connect();

console.log("\n⏳ Warte auf Nachrichten...");
console.log("💡 Sende eine Nachricht an den Bot um zu testen!");
