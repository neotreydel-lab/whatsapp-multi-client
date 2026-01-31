import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";
import { generateQRCode, closeBrowser } from "./qr.js";
import { Message } from "./message.js";

export class WhatsAppClient {
    constructor(options = {}) {
        this.options = {
            authDir: "./auth",
            printQR: false,
            browser: options.browser || ["MyLibrary", "1.0.0", ""],
            logLevel: options.logLevel || "silent", // Sauber ohne Debug
            ...options
        };
        
        this.socket = null;
        this.isConnected = false;
        this.eventHandlers = new Map();
        
        // Prefix System
        this.prefix = null;
        this.commands = new Map();
        
        // Deine eigenen API-Objekte
        this.get = new GetAPI(this);
        this.add = new AddAPI(this);
        this.kick = new KickAPI(this);
        this.promote = new PromoteAPI(this);
        this.demote = new DemoteAPI(this);
    }

    // ===== CONNECTION METHODS =====
    
    async connect() {
        console.log("🔄 Starte Verbindung...");
        
        if (this.socket && this.isConnected) {
            console.log("✅ Bereits verbunden");
            return this.socket;
        }

        const { state, saveCreds } = await useMultiFileAuthState(this.options.authDir);
        console.log("📁 Auth-Daten geladen");

        // Prüfen ob bereits eingeloggt
        const isLoggedIn = !!state.creds?.me?.id;
        console.log(`🔐 Login-Status: ${isLoggedIn ? 'Eingeloggt' : 'Nicht eingeloggt'}`);

        this.socket = makeWASocket({
            auth: state,
            printQRInTerminal: this.options.printQR,
            logger: pino({ level: this.options.logLevel }),
            browser: this.options.browser
        });

        console.log("🔌 Socket erstellt");

        // QR-Code Browser nur öffnen wenn nicht eingeloggt
        if (!this.options.printQR && !isLoggedIn) {
            console.log("🌐 Öffne Browser für QR-Code...");
            await generateQRCode();
        } else if (isLoggedIn) {
            console.log("✅ Bereits authentifiziert, verbinde direkt...");
        }

        return new Promise((resolve, reject) => {
            this.socket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
                console.log(`🔄 Connection Status: ${connection}`);
                
                if (qr && !this.options.printQR && !isLoggedIn) {
                    console.log("📱 QR Code empfangen, zeige im Browser...");
                    await generateQRCode(qr);
                }
                
                if (connection === "connecting") {
                    console.log("🔄 Verbinde mit WhatsApp...");
                }
                
                if (connection === "close") {
                    console.log("🔴 Verbindung geschlossen");
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                    
                    if (shouldReconnect) {
                        console.log("🔄 Wiederverbindung...");
                        this.isConnected = false;
                        this.socket = null;
                        setTimeout(() => this.connect().then(resolve).catch(reject), 3000);
                    } else {
                        console.log("👋 Ausgeloggt - QR-Code wird beim nächsten Start benötigt");
                        await closeBrowser();
                        this.emit('disconnected', { reason: 'logged_out' });
                    }
                } else if (connection === "open") {
                    console.log("✅ WhatsApp erfolgreich verbunden!");
                    this.isConnected = true;
                    this.setupEventHandlers();
                    this.emit('connected');
                    resolve(this);
                }
            });

            this.socket.ev.on("creds.update", saveCreds);
            
            setTimeout(() => {
                if (!this.isConnected) {
                    console.log("⏰ Verbindungs-Timeout");
                    reject(new Error("Connection timeout"));
                }
            }, 60000);
        });
    }

    async disconnect() {
        if (this.socket) {
            this.socket.end();
            this.socket = null;
            this.isConnected = false;
            await closeBrowser();
            this.emit('disconnected', { reason: 'manual' });
        }
    }

    // ===== EVENT SYSTEM =====
    
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
        return this;
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
        return this;
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`❌ Error in event handler for '${event}':`, error);
                }
            });
        }
    }

    setupEventHandlers() {
        // Messages - Sauber ohne Debug-Spam
        this.socket.ev.on("messages.upsert", ({ messages, type }) => {
            if (type !== "notify") return;

            messages.forEach(msg => {
                if (!msg.message || msg.key.fromMe) return;

                const messageData = this.parseMessage(msg);
                const messageObj = new Message(this, messageData);
                
                // Prefix System - Command Check
                if (this.prefix && messageData.text && messageData.text.startsWith(this.prefix)) {
                    const commandText = messageData.text.slice(this.prefix.length).trim();
                    const [command, ...args] = commandText.split(' ');
                    
                    messageObj.isCommand = true;
                    messageObj.command = command.toLowerCase();
                    messageObj.args = args;
                    messageObj.commandText = commandText;
                    
                    // Command Event emittieren
                    this.emit('command', messageObj);
                    
                    // Spezifischen Command Handler aufrufen falls vorhanden
                    if (this.commands.has(command.toLowerCase())) {
                        const handler = this.commands.get(command.toLowerCase());
                        try {
                            handler(messageObj, args);
                        } catch (error) {
                            console.error(`❌ Fehler in Command '${command}':`, error);
                        }
                    }
                } else {
                    messageObj.isCommand = false;
                    messageObj.command = null;
                    messageObj.args = [];
                }
                
                this.emit('message', messageObj);
            });
        });

        // Group updates
        this.socket.ev.on("group-participants.update", (update) => {
            this.emit('group.participants.update', update);
        });

        // Presence updates
        this.socket.ev.on("presence.update", (update) => {
            this.emit('presence.update', update);
        });
    }

    parseMessage(msg) {
        const text = 
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            null;

        return {
            id: msg.key.id,
            from: msg.key.remoteJid,
            fromMe: msg.key.fromMe,
            text: text,
            timestamp: msg.messageTimestamp,
            type: this.getMessageType(msg.message),
            isGroup: msg.key.remoteJid?.includes("@g.us"),
            raw: msg
        };
    }

    getMessageType(message) {
        if (message.conversation) return 'text';
        if (message.imageMessage) return 'image';
        if (message.videoMessage) return 'video';
        if (message.audioMessage) return 'audio';
        if (message.documentMessage) return 'document';
        if (message.stickerMessage) return 'sticker';
        if (message.locationMessage) return 'location';
        if (message.contactMessage) return 'contact';
        return 'unknown';
    }

    getConnectionState() {
        return {
            isConnected: this.isConnected,
            socket: !!this.socket
        };
    }

    // ===== PREFIX SYSTEM =====
    
    setPrefix(prefix) {
        this.prefix = prefix;
        console.log(`🎯 Prefix gesetzt auf: "${prefix}"`);
        return this;
    }

    getPrefix() {
        return this.prefix;
    }

    addCommand(command, handler) {
        this.commands.set(command.toLowerCase(), handler);
        console.log(`⚡ Command registriert: ${this.prefix || ''}${command}`);
        return this;
    }

    removeCommand(command) {
        const removed = this.commands.delete(command.toLowerCase());
        if (removed) {
            console.log(`🗑️ Command entfernt: ${command}`);
        }
        return this;
    }

    getCommands() {
        return Array.from(this.commands.keys());
    }

    // ===== PRESENCE SYSTEM =====
    
    async setPresence(presence, chatId = null) {
        try {
            await this.socket.sendPresenceUpdate(presence, chatId);
            return true;
        } catch (error) {
            console.error(`❌ Fehler beim Setzen der Presence '${presence}':`, error);
            return false;
        }
    }

    async setOnline() {
        return await this.setPresence('available');
    }

    async setOffline() {
        return await this.setPresence('unavailable');
    }

    async setTyping(chatId) {
        return await this.setPresence('composing', chatId);
    }

    async setRecording(chatId) {
        return await this.setPresence('recording', chatId);
    }

    async setPaused(chatId) {
        return await this.setPresence('paused', chatId);
    }
}

// ===== DEINE API-KLASSEN =====

class GetAPI {
    constructor(client) {
        this.client = client;
    }

    async GroupMetadata(groupId) {
        return await this.client.socket.groupMetadata(groupId);
    }

    async GroupParticipants(groupId) {
        const metadata = await this.GroupMetadata(groupId);
        return metadata.participants;
    }

    async GroupAdmins(groupId) {
        const participants = await this.GroupParticipants(groupId);
        return participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
    }
}

class AddAPI {
    constructor(client) {
        this.client = client;
    }

    async user(groupId, users, mentions = []) {
        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'add');
        
        if (mentions.length > 0) {
            const welcomeText = `Willkommen! ${mentions.map(id => `@${id.split('@')[0]}`).join(' ')}`;
            await this.client.socket.sendMessage(groupId, {
                text: welcomeText,
                mentions: mentions
            });
        }

        return result;
    }
}

class KickAPI {
    constructor(client) {
        this.client = client;
    }

    async user(groupId, users, mentions = []) {
        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'remove');
        
        if (mentions.length > 0) {
            const kickText = `${mentions.map(id => `@${id.split('@')[0]}`).join(' ')} wurde entfernt.`;
            await this.client.socket.sendMessage(groupId, {
                text: kickText,
                mentions: mentions
            });
        }

        return result;
    }
}

class PromoteAPI {
    constructor(client) {
        this.client = client;
    }

    async user(groupId, users, mentions = []) {
        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'promote');
        
        if (mentions.length > 0) {
            const promoteText = `🎉 ${mentions.map(id => `@${id.split('@')[0]}`).join(' ')} ist jetzt Admin!`;
            await this.client.socket.sendMessage(groupId, {
                text: promoteText,
                mentions: mentions
            });
        }

        return result;
    }
}

class DemoteAPI {
    constructor(client) {
        this.client = client;
    }

    async user(groupId, users, mentions = []) {
        const result = await this.client.socket.groupParticipantsUpdate(groupId, users, 'demote');
        
        if (mentions.length > 0) {
            const demoteText = `${mentions.map(id => `@${id.split('@')[0]}`).join(' ')} ist nicht mehr Admin.`;
            await this.client.socket.sendMessage(groupId, {
                text: demoteText,
                mentions: mentions
            });
        }

        return result;
    }
}
