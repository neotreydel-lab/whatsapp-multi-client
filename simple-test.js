import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";

async function simpleTest() {
    console.log("🧪 Simple Baileys Test...");
    
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ["SimpleTest", "1.0.0", ""]
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        console.log(`🔄 Connection: ${connection}`);
        
        if (qr) {
            console.log("📱 QR Code received!");
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔴 Connection closed. Reconnect?', shouldReconnect);
        } else if (connection === 'open') {
            console.log('✅ Connected successfully!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('messages.upsert', ({ messages, type }) => {
        console.log(`📥 Messages received - Type: ${type}, Count: ${messages.length}`);
        
        messages.forEach(msg => {
            if (!msg.message || msg.key.fromMe) return;
            
            const text = msg.message.conversation || 
                        msg.message.extendedTextMessage?.text || 
                        null;
            
            console.log(`💬 Message: "${text}" from ${msg.key.remoteJid}`);
            
            // Simple reply test
            if (text === 'test') {
                sock.sendMessage(msg.key.remoteJid, { text: 'Test successful! 🎉' });
            }
        });
    });
}

simpleTest().catch(console.error);