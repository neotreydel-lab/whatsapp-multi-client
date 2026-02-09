import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";
import { generateQRCode, closeBrowser } from "./qr.js";

let socket = null;
let isConnected = false;

export async function getSocket() {
    if (socket && isConnected) return socket;

    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    socket = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "debug" }), // Debug-Level für mehr Logs
        browser: ["Chrome (Linux)", "", ""]
    });

    // Browser öffnen für QR-Code
    await generateQRCode();

    // Connection-Events abwarten
    return new Promise((resolve, reject) => {
        socket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
            console.log(`🔄 Connection Update: ${connection}`);
            
            if (qr) {
                console.log("📱 QR-Code generiert - wird im Edge Browser angezeigt!");
                await generateQRCode(qr);
            }
            
            if (connection === "close") {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log("🔴 Verbindung geschlossen:", lastDisconnect?.error);
                
                if (shouldReconnect) {
                    console.log("🔄 Versuche Wiederverbindung...");
                    isConnected = false;
                    socket = null;
                    getSocket().then(resolve).catch(reject);
                } else {
                    await closeBrowser();
                }
            } else if (connection === "open") {
                // ROBUSTE SESSION-VALIDIERUNG: Prüfe ECHTE Authentifizierung!
                const isAuthenticated = !!state.creds?.me?.id;
                
                if (!isAuthenticated) {
                    console.log("🔌 Socket verbunden - warte auf Authentifizierung...");
                    console.log("📱 Bereit für QR-Code Scan...");
                    // KEINE Success-Messages bei nicht-authentifizierter Verbindung!
                    return;
                }
                
                // NUR BEI ECHTER AUTHENTIFIZIERUNG: Success Messages!
                // ABER: Success Messages werden jetzt im creds.update Handler gemacht
                isConnected = true;
                
                // Test: Alle Event-Listener anzeigen
                console.log("🎧 Registrierte Events:", Object.keys(socket.ev.listenerCount));
                
                resolve(socket);
            }
        });

        socket.ev.on("creds.update", async (creds) => {
            await saveCreds();
            
            // WICHTIG: Prüfe ob User jetzt authentifiziert ist (QR-Code gescannt)
            if (creds?.me?.id && isConnected) {
                console.log("🎉 QR-Code erfolgreich gescannt!");
                console.log(`👤 Authentifiziert als: ${creds.me.id}`);
                console.log("✅ Erfolgreich mit WhatsApp authentifiziert!");
                console.log("🎉 Du kannst jetzt den Browser schließen oder offen lassen");
                
                // Test: Alle Event-Listener anzeigen
                console.log("🎧 Registrierte Events:", Object.keys(socket.ev.listenerCount));
                
                resolve(socket);
            }
        });
        
        // WICHTIG: Alle Events loggen für Debug
        socket.ev.on("messages.upsert", (data) => {
            console.log("🚨 RAW MESSAGE EVENT:");
            console.log(`   Type: ${data.type}`);
            console.log(`   Messages: ${data.messages.length}`);
            data.messages.forEach((msg, i) => {
                console.log(`   Message ${i + 1}:`, {
                    from: msg.key.remoteJid,
                    fromMe: msg.key.fromMe,
                    hasMessage: !!msg.message,
                    type: Object.keys(msg.message || {})[0]
                });
            });
        });
        
        socket.ev.on("chats.set", (data) => {
            console.log("💬 Chats Set Event:", data.length, "chats");
        });
        
        socket.ev.on("contacts.set", (data) => {
            console.log("👥 Contacts Set Event:", data.length, "contacts");
        });
        
        // Timeout nach 60 Sekunden
        setTimeout(() => {
            if (!isConnected) {
                reject(new Error("Connection timeout - QR-Code im Browser nicht gescannt?"));
            }
        }, 60000);
    });
}
