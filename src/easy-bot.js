import { WhatsAppClient } from "./client.js";
import { MultiWhatsAppClient } from "./multi-client.js";

export class EasyBot {
    constructor() {
        this.client = null;
        this.multiClient = null;
        this.rules = [];
        this.commands = new Map();
        this.templates = new Map();
        this.autoResponses = new Map();
        this.isRunning = false;
        this.isMultiDevice = false;
        
        // Easy settings
        this.settings = {
            autoGreeting: true,
            autoHelp: true,
            typingEnabled: true,
            reactionsEnabled: true
        };
    }

    // ===== FACTORY METHODS =====
    
    static create(options = {}) {
        const bot = new EasyBot();
        bot.client = new WhatsAppClient({
            authDir: "./auth",
            logLevel: "silent",
            ...options
        });
        return bot;
    }

    static createMulti(deviceCount = 2, options = {}) {
        const bot = new EasyBot();
        bot.isMultiDevice = true;
        bot.multiClient = new MultiWhatsAppClient({
            maxDevices: deviceCount,
            loadBalancing: 'round-robin',
            ...options
        });
        return bot;
    }

    static quick() {
        return EasyBot.create().enableDefaults();
    }

    // ===== SIMPLE RULES =====
    
    when(trigger) {
        const rule = new EasyRule(trigger, this);
        this.rules.push(rule);
        return rule;
    }

    // Shorthand methods
    onText(text, response) {
        return this.when(text).reply(response);
    }

    onContains(word, response) {
        return this.when(word).reply(response);
    }

    onCommand(cmd, response) {
        return this.command(cmd, response);
    }

    // ===== SIMPLE COMMANDS =====
    
    command(cmd, response) {
        this.commands.set(cmd.toLowerCase(), response);
        return this;
    }

    // ===== AUTO RESPONSES =====
    
    autoReply(trigger, response) {
        this.autoResponses.set(trigger.toLowerCase(), response);
        return this;
    }

    // ===== TEMPLATES =====
    
    template(name, text) {
        this.templates.set(name, text);
        return this;
    }

    // Enhanced template processing
    processTemplate(templateText, msg) {
        const sender = msg.from.split('@')[0];
        const now = new Date();
        
        return templateText
            .replace('{name}', sender)
            .replace('{sender}', sender)
            .replace('{time}', now.toLocaleTimeString('de-DE'))
            .replace('{date}', now.toLocaleDateString('de-DE'))
            .replace('{datetime}', now.toLocaleString('de-DE'))
            .replace('{day}', now.toLocaleDateString('de-DE', { weekday: 'long' }))
            .replace('{chat}', msg.isGroup ? 'Gruppe' : 'Privat');
    }

    // ===== CONDITIONAL LOGIC =====
    
    if(condition) {
        return new EasyCondition(condition, this);
    }

    // ===== EASY SETUP METHODS =====
    
    enableDefaults() {
        // Standard Antworten
        this.autoReply("hallo", "Hallo! 👋 Wie kann ich dir helfen?");
        this.autoReply("hi", "Hi! 😊");
        this.autoReply("hey", "Hey! 🙋‍♂️");
        this.autoReply("tschüss", "Tschüss! 👋 Bis bald!");
        this.autoReply("bye", "Bye! 👋");
        
        // Standard Commands
        this.command("hilfe", "🤖 Verfügbare Commands:\n!hilfe - Diese Hilfe\n!ping - Ping Test\n!zeit - Aktuelle Zeit");
        this.command("ping", "Pong! 🏓");
        this.command("zeit", () => `🕐 ${new Date().toLocaleString('de-DE')}`);
        
        return this;
    }

    enableMultiDevice(deviceCount = 2) {
        if (!this.isMultiDevice) {
            this.isMultiDevice = true;
            this.multiClient = new MultiWhatsAppClient({
                maxDevices: deviceCount,
                loadBalancing: 'round-robin'
            });
        }
        return this;
    }

    enableTyping(enabled = true) {
        this.settings.typingEnabled = enabled;
        return this;
    }

    enableReactions(enabled = true) {
        this.settings.reactionsEnabled = enabled;
        return this;
    }

    // ===== MULTI-DEVICE SETUP =====
    
    async addDevice(deviceId, options = {}) {
        if (!this.isMultiDevice) {
            throw new Error("❌ Multi-Device nicht aktiviert! Nutze EasyBot.createMulti() oder .enableMultiDevice()");
        }
        
        await this.multiClient.addDevice(deviceId, options);
        console.log(`✅ Device '${deviceId}' hinzugefügt`);
        return this;
    }

    // ===== START BOT =====
    
    async start() {
        if (this.isRunning) {
            console.log("✅ Bot läuft bereits!");
            return this;
        }

        console.log("🚀 Starte EasyBot...");
        
        const activeClient = this.isMultiDevice ? this.multiClient : this.client;
        
        // Setup Commands
        if (this.commands.size > 0) {
            activeClient.setPrefix("!");
            
            for (const [cmd, response] of this.commands) {
                activeClient.addCommand(cmd, async (msg) => {
                    if (this.settings.typingEnabled) {
                        await this.typeMessage(msg, 1000);
                    }
                    
                    const reply = typeof response === 'function' ? response(msg) : response;
                    await this.sendReply(msg, reply);
                });
            }
        }

        // Setup Message Handler
        activeClient.on('message', async (msg) => {
            // Skip commands
            if (msg.isCommand) return;
            
            const text = msg.text?.toLowerCase() || '';
            
            // Auto Responses (exact match)
            for (const [trigger, response] of this.autoResponses) {
                if (text === trigger || text.includes(trigger)) {
                    if (this.settings.typingEnabled) {
                        await this.typeMessage(msg, 1500);
                    }
                    
                    const reply = typeof response === 'function' ? response(msg) : response;
                    await this.sendReply(msg, reply);
                    return;
                }
            }
            
            // Process rules
            for (const rule of this.rules) {
                if (rule.matches(msg)) {
                    await rule.execute(msg);
                    break; // Only first match
                }
            }
        });

        // Multi-Device Setup
        if (this.isMultiDevice) {
            // Auto-add default devices if none exist
            if (this.multiClient.deviceManager.devices.size === 0) {
                await this.multiClient.addDevice('bot1');
                await this.multiClient.addDevice('bot2');
                console.log("✅ Standard Devices (bot1, bot2) hinzugefügt");
            }
        }

        // Connect
        await activeClient.connect();
        this.isRunning = true;
        
        console.log("✅ EasyBot gestartet!");
        console.log(`📝 ${this.rules.length} Regeln aktiv`);
        console.log(`⚡ ${this.commands.size} Commands verfügbar`);
        console.log(`🤖 ${this.autoResponses.size} Auto-Antworten aktiv`);
        
        if (this.isMultiDevice) {
            const status = this.multiClient.getStatus();
            console.log(`🔧 Multi-Device: ${status.activeDevices}/${status.totalDevices} Devices`);
        }
        
        return this;
    }

    // ===== HELPER METHODS =====
    
    async typeMessage(msg, duration = 1500) {
        if (!this.settings.typingEnabled) return;
        
        try {
            if (this.isMultiDevice) {
                await this.multiClient.setTyping(msg.from);
                await new Promise(r => setTimeout(r, duration));
            } else {
                await msg.visualWrite(true);
                await new Promise(r => setTimeout(r, duration));
                await msg.visualWrite(false);
            }
        } catch (error) {
            // Ignore typing errors
        }
    }

    async sendReply(msg, text) {
        try {
            if (this.isMultiDevice) {
                await this.multiClient.sendMessage(msg.from, { text });
            } else {
                await msg.reply(text);
            }
        } catch (error) {
            console.error("❌ Fehler beim Senden:", error.message);
        }
    }

    async sendReaction(msg, emoji) {
        try {
            if (this.isMultiDevice) {
                const client = this.multiClient.getNextDevice();
                await client.socket.sendMessage(msg.from, {
                    react: { text: emoji, key: msg.raw.key }
                });
            } else {
                await msg.react(emoji);
            }
        } catch (error) {
            console.error("❌ Fehler bei Reaction:", error.message);
        }
    }

    async sendMedia(msg, type, data) {
        try {
            const client = this.isMultiDevice ? this.multiClient.getNextDevice() : this.client;
            
            switch (type) {
                case 'image':
                    if (this.isMultiDevice) {
                        // Use advanced client for multi-device
                        await client.socket.sendMessage(msg.from, {
                            image: { url: data.path },
                            caption: data.caption
                        });
                    } else {
                        await msg.sendImage(data.path, data.caption);
                    }
                    break;
                    
                case 'sticker':
                    if (this.isMultiDevice) {
                        await client.socket.sendMessage(msg.from, {
                            sticker: { url: data }
                        });
                    } else {
                        await msg.sendSticker(data);
                    }
                    break;
                    
                case 'location':
                    if (this.isMultiDevice) {
                        await client.socket.sendMessage(msg.from, {
                            location: {
                                degreesLatitude: data.lat,
                                degreesLongitude: data.lng
                            }
                        });
                    } else {
                        await msg.sendLocation(data.lat, data.lng);
                    }
                    break;
            }
        } catch (error) {
            console.error(`❌ Fehler beim Senden von ${type}:`, error.message);
        }
    }

    // ===== ADVANCED ACCESS =====
    
    getAdvancedClient() {
        if (this.isMultiDevice) {
            return this.multiClient;
        }
        return this.client;
    }

    getWhatsAppClient() {
        return this.client;
    }

    getMultiClient() {
        return this.multiClient;
    }

    // ===== UTILITY =====
    
    stop() {
        const activeClient = this.isMultiDevice ? this.multiClient : this.client;
        if (activeClient) {
            activeClient.disconnect();
        }
        this.isRunning = false;
        console.log("🛑 EasyBot gestoppt");
        return this;
    }

    status() {
        const baseStatus = {
            running: this.isRunning,
            rules: this.rules.length,
            commands: this.commands.size,
            templates: this.templates.size,
            autoResponses: this.autoResponses.size,
            multiDevice: this.isMultiDevice
        };

        if (this.isMultiDevice && this.multiClient) {
            return {
                ...baseStatus,
                ...this.multiClient.getStatus()
            };
        }

        return baseStatus;
    }

    // ===== QUICK METHODS =====
    
    quickStart() {
        return this.enableDefaults().start();
    }

    addQuickCommands() {
        this.command("status", () => {
            const status = this.status();
            return `📊 Bot Status:\n✅ Läuft: ${status.running}\n📝 Regeln: ${status.rules}\n⚡ Commands: ${status.commands}`;
        });
        
        this.command("info", "🤖 EasyBot v1.0\n📚 Einfache WhatsApp Bot Library\n🔧 Powered by Baileys");
        
        return this;
    }
}

// ===== EASY RULE CLASS =====

class EasyRule {
    constructor(trigger, bot) {
        this.trigger = trigger;
        this.bot = bot;
        this.actions = [];
    }

    // Actions - Return this rule for chaining!
    reply(text) {
        this.actions.push({ type: 'reply', value: text });
        return this; // Rule chaining!
    }

    send(text) {
        return this.reply(text);
    }

    react(emoji) {
        this.actions.push({ type: 'react', value: emoji });
        return this; // Rule chaining!
    }

    type(seconds = 2) {
        this.actions.push({ type: 'type', value: seconds * 1000 });
        return this; // Rule chaining!
    }

    typeAndReply(text, seconds = 2) {
        this.type(seconds);
        this.reply(text);
        return this; // Rule chaining!
    }

    useTemplate(templateName) {
        this.actions.push({ type: 'template', value: templateName });
        return this; // Rule chaining!
    }

    // Media actions
    sendImage(path, caption = "") {
        this.actions.push({ type: 'image', value: { path, caption } });
        return this;
    }

    sendSticker(path) {
        this.actions.push({ type: 'sticker', value: path });
        return this;
    }

    sendLocation(lat, lng) {
        this.actions.push({ type: 'location', value: { lat, lng } });
        return this;
    }

    // Mention actions
    mentionSender(text) {
        this.actions.push({ type: 'mentionSender', value: text });
        return this;
    }

    mentionAll(text) {
        this.actions.push({ type: 'mentionAll', value: text });
        return this;
    }

    mentionUser(text, userJid) {
        this.actions.push({ type: 'mentionUser', value: { text, userJid } });
        return this;
    }

    // Delete actions
    deleteMessage() {
        this.actions.push({ type: 'delete' });
        return this;
    }

    deleteAfter(seconds) {
        this.actions.push({ type: 'deleteAfter', value: seconds });
        return this;
    }

    // End chaining - return bot
    done() {
        return this.bot;
    }

    // Matching
    matches(msg) {
        const text = msg.text?.toLowerCase() || '';
        const trigger = this.trigger.toLowerCase();
        
        // Exact match
        if (text === trigger) return true;
        
        // Contains match
        if (text.includes(trigger)) return true;
        
        // Starts with match
        if (text.startsWith(trigger)) return true;
        
        return false;
    }

    // Execution
    async execute(msg) {
        for (const action of this.actions) {
            try {
                switch (action.type) {
                    case 'reply':
                        await this.bot.sendReply(msg, action.value);
                        break;
                        
                    case 'react':
                        if (this.bot.settings.reactionsEnabled) {
                            await this.bot.sendReaction(msg, action.value);
                        }
                        break;
                        
                    case 'type':
                        await this.bot.typeMessage(msg, action.value);
                        break;
                        
                    case 'template':
                        const template = this.bot.templates.get(action.value);
                        if (template) {
                            const text = this.bot.processTemplate(template, msg);
                            await this.bot.sendReply(msg, text);
                        }
                        break;
                        
                    case 'image':
                        await this.bot.sendMedia(msg, 'image', action.value);
                        break;
                        
                    case 'sticker':
                        await this.bot.sendMedia(msg, 'sticker', action.value);
                        break;
                        
                    case 'location':
                        await this.bot.sendMedia(msg, 'location', action.value);
                        break;
                        
                    case 'mentionSender':
                        if (this.bot.isMultiDevice) {
                            await this.bot.multiClient.sendMessage(msg.from, {
                                text: action.value.replace('@user', `@${msg.getSender().split('@')[0]}`),
                                mentions: [msg.getSender()]
                            });
                        } else {
                            await msg.replyWithMention(action.value, msg.getSender());
                        }
                        break;
                        
                    case 'mentionAll':
                        if (msg.isGroup) {
                            if (this.bot.isMultiDevice) {
                                const client = this.bot.multiClient.getNextDevice();
                                const metadata = await client.get.GroupMetadata(msg.from);
                                const allMembers = metadata.participants.map(p => p.id);
                                const mentionText = action.value + ' ' + allMembers.map(id => `@${id.split('@')[0]}`).join(' ');
                                
                                await this.bot.multiClient.sendMessage(msg.from, {
                                    text: mentionText,
                                    mentions: allMembers
                                });
                            } else {
                                await msg.mentionAll(action.value);
                            }
                        } else {
                            await this.bot.sendReply(msg, action.value + " (Nur in Gruppen verfügbar)");
                        }
                        break;
                        
                    case 'mentionUser':
                        if (this.bot.isMultiDevice) {
                            await this.bot.multiClient.sendMessage(msg.from, {
                                text: action.value.text.replace('@user', `@${action.value.userJid.split('@')[0]}`),
                                mentions: [action.value.userJid]
                            });
                        } else {
                            await msg.replyWithMention(action.value.text, action.value.userJid);
                        }
                        break;
                        
                    case 'delete':
                        if (this.bot.isMultiDevice) {
                            const client = this.bot.multiClient.getNextDevice();
                            await client.socket.sendMessage(msg.from, {
                                delete: msg.raw.key
                            });
                        } else {
                            await msg.delete();
                        }
                        break;
                        
                    case 'deleteAfter':
                        setTimeout(async () => {
                            try {
                                if (this.bot.isMultiDevice) {
                                    const client = this.bot.multiClient.getNextDevice();
                                    await client.socket.sendMessage(msg.from, {
                                        delete: msg.raw.key
                                    });
                                } else {
                                    await msg.delete();
                                }
                            } catch (error) {
                                console.error('❌ Fehler beim verzögerten Löschen:', error.message);
                            }
                        }, action.value * 1000);
                        break;
                }
            } catch (error) {
                console.error('❌ Fehler bei Aktion:', error.message);
            }
        }
    }
}

// ===== EASY CONDITION CLASS =====

class EasyCondition {
    constructor(condition, bot) {
        this.condition = condition;
        this.bot = bot;
    }

    then(action) {
        const rule = this.parseAction(action);
        this.bot.rules.push(rule);
        return this.bot;
    }

    parseAction(action) {
        if (action.startsWith('reply ')) {
            const text = action.substring(6);
            return {
                matches: (msg) => this.evaluateCondition(msg),
                execute: async (msg) => await this.bot.sendReply(msg, text)
            };
        }
        
        if (action.startsWith('react ')) {
            const emoji = action.substring(6);
            return {
                matches: (msg) => this.evaluateCondition(msg),
                execute: async (msg) => await this.bot.sendReaction(msg, emoji)
            };
        }

        if (action.startsWith('type ')) {
            const seconds = parseInt(action.substring(5)) || 2;
            return {
                matches: (msg) => this.evaluateCondition(msg),
                execute: async (msg) => await this.bot.typeMessage(msg, seconds * 1000)
            };
        }

        if (action.startsWith('template ')) {
            const templateName = action.substring(9);
            return {
                matches: (msg) => this.evaluateCondition(msg),
                execute: async (msg) => {
                    const template = this.bot.templates.get(templateName);
                    if (template) {
                        const text = this.bot.processTemplate(template, msg);
                        await this.bot.sendReply(msg, text);
                    }
                }
            };
        }
        
        return {
            matches: () => false,
            execute: async () => {}
        };
    }

    evaluateCondition(msg) {
        const condition = this.condition.toLowerCase();
        const text = msg.text?.toLowerCase() || '';
        
        if (condition.includes('contains ')) {
            const word = condition.split('contains ')[1];
            return text.includes(word);
        }
        
        if (condition.includes('starts with ')) {
            const word = condition.split('starts with ')[1];
            return text.startsWith(word);
        }
        
        if (condition.includes('ends with ')) {
            const word = condition.split('ends with ')[1];
            return text.endsWith(word);
        }
        
        if (condition === 'is group') {
            return msg.isGroup;
        }
        
        if (condition === 'is private') {
            return !msg.isGroup;
        }
        
        if (condition === 'has media') {
            return msg.type !== 'text';
        }
        
        return false;
    }
}

// ===== HELPER FUNCTIONS =====

export function createBot(options = {}) {
    return EasyBot.create(options);
}

export function createMultiBot(deviceCount = 2, options = {}) {
    return EasyBot.createMulti(deviceCount, options);
}

export function quickBot() {
    return EasyBot.quick();
}

// ===== SHORTHAND FUNCTIONS =====

export function bot() {
    return EasyBot.create();
}

export function multiBot(devices = 2) {
    return EasyBot.createMulti(devices);
}