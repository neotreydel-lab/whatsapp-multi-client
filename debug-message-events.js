import { WhatsAppClient } from "./src/client.js";

console.log("🔍 Message Event Debugger");
console.log("=" .repeat(60));
console.log("Dieses Script zeigt ALLE Message-Events die ankommen");
console.log("=" .repeat(60));

const client = new WhatsAppClient({
    printQR: true,
    logLevel: "silent" // Weniger Noise
});

// RAW Socket Events direkt abfangen
let messageEventCount = 0;
let messageTypeStats = {};

client.on('connected', () => {
    console.log("\n✅ Bot verbunden!");
    console.log("📊 Statistiken werden gesammelt...\n");
    
    // Direkter Zugriff auf Socket Events
    const originalOn = client.socket.ev.on.bind(client.socket.ev);
    
    // Wrap messages.upsert Event
    client.socket.ev.on("messages.upsert", ({ messages, type }) => {
        messageEventCount++;
        
        // Type-Statistik
        messageTypeStats[type] = (messageTypeStats[type] || 0) + 1;
        
        console.log(`\n📥 Event #${messageEventCount}`);
        console.log(`   Type: ${type}`);
        console.log(`   Messages: ${messages.length}`);
        
        messages.forEach((msg, i) => {
            const messageType = Object.keys(msg.message || {})[0];
            const from = msg.key.remoteJid;
            const fromMe = msg.key.fromMe;
            
            console.log(`   Message ${i + 1}:`);
            console.log(`      From: ${from}`);
            console.log(`      FromMe: ${fromMe}`);
            console.log(`      Type: ${messageType}`);
            
            // Text extrahieren wenn möglich
            let text = null;
            if (msg.message?.conversation) {
                text = msg.message.conversation;
            } else if (msg.message?.extendedTextMessage?.text) {
                text = msg.message.extendedTextMessage.text;
            }
            
            if (text) {
                console.log(`      Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
            }
        });
        
        // Statistik anzeigen
        console.log(`\n📊 Statistik:`);
        console.log(`   Total Events: ${messageEventCount}`);
        console.log(`   Types:`, messageTypeStats);
    });
});

// Standard Message Handler
client.on('message', (msg) => {
    console.log(`\n✅ PROCESSED MESSAGE:`);
    console.log(`   From: ${msg.from}`);
    console.log(`   Text: ${msg.text || '[No Text]'}`);
    console.log(`   Type: ${msg.type}`);
});

// Verbinden
await client.connect();

console.log("\n⏳ Warte auf Messages...");
console.log("💡 Sende Nachrichten an den Bot!");
console.log("🔍 Alle Events werden hier angezeigt\n");

// Statistik alle 30 Sekunden
setInterval(() => {
    if (messageEventCount > 0) {
        console.log(`\n📊 30s Statistik:`);
        console.log(`   Events: ${messageEventCount}`);
        console.log(`   Types:`, messageTypeStats);
    }
}, 30000);
