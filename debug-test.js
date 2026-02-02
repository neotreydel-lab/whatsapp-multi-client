// Einfacher Debug Test für Baileys 7.0.0
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";

async function debugTest() {
    console.log("🔍 Debug Test startet...");
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth');
        console.log("✅ Auth state geladen");
        
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true, // QR im Terminal
            logger: pino({ level: 'debug' }), // Debug Logs
            browser: ["DebugTest", "1.0.0", ""]
        });
        
        console.log("✅ Socket erstellt");

        // Connection Events
        sock.ev.on('connection.update', (update) => {
            console.log("🔄 Connection Update:", update);
            
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log("📱 QR Code empfangen - scanne mit WhatsApp!");
            }
            
            if (connection === 'close') {
                console.log("🔴 Verbindung geschlossen:", lastDisconnect?.error);
            } else if (connection === 'open') {
                console.log("🎉 ERFOLGREICH VERBUNDEN!");
            }
        });

        // Credentials
        sock.ev.on('creds.update', () => {
            console.log("🔑 Credentials updated");
            saveCreds();
        });
        
        // Messages
        sock.ev.on('messages.upsert', ({ messages, type }) => {
            console.log(`📥 Messages upsert - Type: ${type}, Count: ${messages.length}`);
            
            messages.forEach((msg, index) => {
                console.log(`📨 Message ${index + 1}:`, {
                    id: msg.key.id,
                    from: msg.key.remoteJid,
                    fromMe: msg.key.fromMe,
                    hasMessage: !!msg.message,
                    messageKeys: msg.message ? Object.keys(msg.message) : []
                });
                
                if (!msg.message || msg.key.fromMe) {
                    console.log("⏭️ Skipping message");
                    return;
                }
                
                const text = msg.message.conversation || 
                           msg.message.extendedTextMessage?.text || 
                           null;
                
                console.log(`💬 Text: "${text}"`);
                
                // Test reply
                if (text === 'ping') {
                    console.log("🏓 Sending pong...");
                    sock.sendMessage(msg.key.remoteJid, { text: 'Pong! 🏓' })
                        .then(() => console.log("✅ Reply sent"))
                        .catch(err => console.error("❌ Reply failed:", err));
                }
            });
        });
        
        console.log("🎯 Event handlers registriert");
        console.log("📱 Scanne den QR Code mit WhatsApp und sende 'ping'");
        
    } catch (error) {
        console.error("❌ Fehler:", error);
    }
}

debugTest();