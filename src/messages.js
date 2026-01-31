import { getSocket } from "./core.js";

export async function messages(callback) {
    console.log("📡 Warte auf WhatsApp-Verbindung...");
    
    try {
        const sock = await getSocket();
        console.log("🎧 Message-Listener wird aktiviert...");

        // WICHTIG: Event-Listener NACH der Verbindung registrieren
        sock.ev.on("messages.upsert", ({ messages, type }) => {
            console.log(`\n🚨 MESSAGE EVENT EMPFANGEN!`);
            console.log(`📊 Type: ${type}`);
            console.log(`📈 Anzahl Messages: ${messages.length}`);
            console.log(`📋 Raw Data:`, JSON.stringify({ messages, type }, null, 2));
            
            if (type !== "notify") {
                console.log(`⏭️ Ignoriere Message-Type: ${type} (nur 'notify' wird verarbeitet)`);
                return;
            }

            for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];
                console.log(`\n📨 Verarbeite Message ${i + 1}/${messages.length}:`);
                console.log(`🔑 Key:`, msg.key);
                console.log(`💬 Message:`, msg.message);
                
                if (!msg.message) {
                    console.log("⚠️ Message ohne Content - wird ignoriert");
                    continue;
                }

                // Eigene Nachrichten ignorieren
                if (msg.key.fromMe) {
                    console.log("📤 Eigene Nachricht - wird ignoriert");
                    continue;
                }

                const text =
                    msg.message.conversation ||
                    msg.message.extendedTextMessage?.text ||
                    msg.message.imageMessage?.caption ||
                    msg.message.videoMessage?.caption ||
                    msg.message.documentMessage?.caption ||
                    "[Media ohne Text]";

                const from = msg.key.remoteJid;
                const isGroup = from?.includes("@g.us");
                
                console.log(`\n🎯 NACHRICHT GEFUNDEN:`);
                console.log(`   📱 Von: ${from}`);
                console.log(`   🏷️ Typ: ${isGroup ? 'Gruppe' : 'Privat'}`);
                console.log(`   💬 Text: "${text}"`);
                console.log(`   ⏰ Zeit: ${new Date(msg.messageTimestamp * 1000).toLocaleString()}`);

                // Callback aufrufen
                try {
                    callback({
                        text,
                        from,
                        isGroup,
                        timestamp: msg.messageTimestamp,
                        id: msg.key.id,
                        raw: msg
                    });
                    console.log("✅ Callback erfolgreich ausgeführt");
                } catch (callbackError) {
                    console.error("❌ Fehler im Callback:", callbackError);
                }
            }
        });

        console.log("✅ Message-Listener erfolgreich aktiviert!");
        console.log("📱 Sende jetzt eine Nachricht an den Bot...");

    } catch (error) {
        console.error("❌ Fehler beim Setup der Message-Listener:", error);
        throw error;
    }
}
