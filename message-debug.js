// Message Debug Tool - Überwacht alle eingehenden Events
import { WhatsAppClient } from "./src/index.js";

async function messageDebugTool() {
    console.log("🔍 Message Debug Tool startet...");
    
    const client = new WhatsAppClient({
        authDir: "./auth",
        logLevel: "debug", // Vollständige Debug-Ausgabe
        browser: ["MessageDebug", "1.0.2", ""]
    });

    // Alle möglichen Events überwachen
    const events = [
        'messages.upsert',
        'messages.update', 
        'message-receipt.update',
        'chats.upsert',
        'chats.update',
        'presence.update',
        'contacts.upsert',
        'contacts.update',
        'group-participants.update',
        'groups.upsert',
        'blocklist.set',
        'blocklist.update'
    ];

    client.on('connected', () => {
        console.log("✅ Debug Tool verbunden - überwache alle Events...");
        
        // Direkte Baileys Events überwachen
        events.forEach(eventName => {
            client.socket.ev.on(eventName, (data) => {
                console.log(`\n🔍 BAILEYS EVENT: ${eventName}`);
                console.log("📊 Data:", JSON.stringify(data, null, 2));
            });
        });
    });

    // WAEngine Events
    client.on('message', (msg) => {
        console.log("\n📨 WAENGINE MESSAGE EVENT:");
        console.log("🆔 ID:", msg.id);
        console.log("📱 From:", msg.from);
        console.log("💬 Text:", msg.text);
        console.log("🏷️ Type:", msg.type);
        console.log("👥 IsGroup:", msg.isGroup);
        console.log("⏰ Timestamp:", new Date(msg.timestamp * 1000).toLocaleString());
    });

    try {
        await client.connect();
        console.log("🎯 Debug Tool bereit! Sende Nachrichten zum Testen...");
        
    } catch (error) {
        console.error("❌ Debug Tool Fehler:", error);
    }
}

messageDebugTool();