import { WhatsAppClient } from "./client.js";
import { MultiWhatsAppClient } from "./multi-client.js";
import { EasyAdvanced, EasyAdvancedRule } from "./easy-advanced.js";
import { ConsoleLogger } from "./console-logger.js";
import { ErrorHandler } from "./error-handler.js";

// ===== CHAIN-PROXY PATTERN - UNIVERSELLE LÖSUNG =====
class EasyChain {
    constructor(bot) {
        this.bot = bot;
        this.currentRule = null;
    }

    // ===== RULE METHODS - ALLE geben this (EasyChain) zurück! =====
    when(trigger) {
        const rule = new EasyRule(trigger, this.bot);
        this.bot.rules.push(rule);
        this.currentRule = rule;
        return this; // ✅ KRITISCH: Gibt EasyChain zurück für weitere Chaining
    }

    reply(text) {
        if (this.currentRule) {
            this.currentRule.actions.push({ type: 'reply', value: text });
        }
        return this; // ✅ Gibt EasyChain zurück
    }

    send(text) {
        if (this.currentRule) {
            this.currentRule.actions.push({ type: 'reply', value: text });
        }
        return this;
    }

    react(emoji) {
        if (this.currentRule) {
            this.currentRule.actions.push({ type: 'react', value: emoji });
        }
        return this;
    }

    type(seconds = 2) {
        if (this.currentRule) {
            this.currentRule.actions.push({ type: 'type', value: seconds * 1000 });
        }
        return this;
    }

    // ===== NEUE METHODEN =====
    done() {
        this.currentRule = null; // Reset für nächste Rule
        return this; // Ermöglicht weitere .when() Aufrufe
    }

    // ===== BOT CONTROL METHODS =====
    start() {
        return this.bot.start();
    }

    stop() {
        return this.bot.stop();
    }

    status() {
        return this.bot.status();
    }

    // ===== ADVANCED METHODS =====
    enableAI() {
        this.bot.enableAI();
        return this;
    }

    enableAll() {
        this.bot.enableAll();
        return this;
    }

    enableDefaults() {
        this.bot.enableDefaults();
        return this;
    }

    command(cmd, response) {
        this.bot.command(cmd, response);
        return this;
    }

    autoReply(trigger, response) {
        this.bot.autoReply(trigger, response);
        return this;
    }

    template(name, content) {
        this.bot.template(name, content);
        return this;
    }
}

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

        // Advanced features integration
        this.advanced = null;
        
        // ✅ Chain-Proxy für Fluent API
        this.chain = new EasyChain(this);
    }

    // ===== FACTORY METHODS =====
    
    static create(options = {}) {
        const bot = new EasyBot();
        bot.client = new WhatsAppClient({
            authDir: "./auth",
            logLevel: "silent",
            
            // CLEAN QR DEFAULTS
            printQR: false,
            qrSpamPrevention: true,
            qrDisplayInterval: 30000,
            qrMaxDisplays: 1, // ✅ FIX: Nur 1 QR Code!
            clearTerminalOnQR: true,
            
            // ROBUSTE CONNECTION DEFAULTS
            maxReconnectAttempts: 100,
            reconnectInterval: 2000,
            exponentialBackoff: true,
            maxBackoffDelay: 30000,
            heartbeatInterval: 20000,
            connectionTimeout: 180000, // 3 Minuten Timeout
            keepAlive: true,
            quietHeartbeat: true, // Heartbeat-Spam deaktivieren
            
            // SCHÖNE CONSOLE FÜR ALLE!
            verbose: options.verbose || false,
            silent: options.silent || false,
            
            // ERROR HANDLER - DEINE EMAIL IMMER DABEI!
            errorHandler: {
                supportEmail: "Liaia@outlook.de", // IMMER deine Email
                showSupportInfo: true,
                logErrors: true
            },
            
            ...options
        });
        
        // Advanced Features nach Client-Erstellung initialisieren
        bot.advanced = new EasyAdvanced(bot);
        
        return bot.chain; // ✅ KRITISCH: Gibt Chain-Proxy zurück für Fluent API!
    }

    static createMulti(deviceCount = 2, options = {}) {
        const bot = new EasyBot();
        bot.isMultiDevice = true;
        bot.multiClient = new MultiWhatsAppClient({
            maxDevices: deviceCount,
            loadBalancing: 'round-robin',
            // ROBUSTE CONNECTION DEFAULTS - NEU!
            maxReconnectAttempts: 100,
            reconnectInterval: 2000,
            exponentialBackoff: true,
            maxBackoffDelay: 30000,
            heartbeatInterval: 20000,
            connectionTimeout: 180000,
            keepAlive: true,
            quietHeartbeat: true, // Heartbeat-Spam deaktivieren
            // Console Logger Settings
            verbose: options.verbose || false,
            silent: options.silent || false,
            ...options
        });
        return bot;
    }

    static quick() {
        return EasyBot.create().enableDefaults();
    }

    // ROBUSTE CONNECTION FACTORY - NEU!
    static createRobust(options = {}) {
        return EasyBot.create({
            maxReconnectAttempts: 200, // Noch mehr Versuche
            reconnectInterval: 1000, // Sehr schnelle Wiederverbindung
            heartbeatInterval: 15000, // 15 Sekunden Heartbeat
            connectionTimeout: 300000, // 5 Minuten Timeout
            quietHeartbeat: true, // Heartbeat-Spam deaktivieren
            ...options
        });
    }

    // ===== SIMPLE RULES =====
    
    when(trigger) {
        const rule = new EasyRule(trigger, this);
        this.rules.push(rule);
        return this.chain; // ✅ KRITISCH: Gibt Chain zurück für Fluent API!
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

    // ===== NEUE EASYBOT FEATURES =====
    
    enableAI(apiKey) {
        if (this.client && this.client.ai) {
            this.client.ai.setApiKey(apiKey);
            console.log('🤖 AI aktiviert');
        }
        return this;
    }

    enableWeather() {
        this.command("wetter", async (msg, args) => {
            const city = args.join(' ');
            if (!city) return msg.reply('❌ Verwendung: !wetter <Stadt>');
            
            try {
                const weather = await this.client.http.getWeather(city);
                await msg.reply(`🌤️ **${weather.city}**: ${weather.temperature}°C, ${weather.description}`);
            } catch (error) {
                await msg.reply('❌ Wetter nicht verfügbar');
            }
        });
        return this;
    }

    enableCrypto() {
        this.command("crypto", async (msg, args) => {
            const symbol = args[0] || 'bitcoin';
            try {
                const price = await this.client.http.getCryptoPrice(symbol);
                await msg.reply(`💰 **${price.symbol.toUpperCase()}**: €${price.priceEUR} (${price.change24h})`);
            } catch (error) {
                await msg.reply('❌ Crypto-Daten nicht verfügbar');
            }
        });
        return this;
    }

    enableNews() {
        this.command("news", async (msg, args) => {
            const category = args[0] || 'general';
            try {
                const articles = await this.client.http.getNews(category);
                if (articles && articles.length > 0) {
                    const article = articles[0];
                    await msg.reply(`📰 **${article.title}**\n\n${article.description}\n\n🔗 ${article.url}`);
                } else {
                    await msg.reply('📰 Keine News gefunden');
                }
            } catch (error) {
                await msg.reply('❌ News nicht verfügbar');
            }
        });
        return this;
    }

    enableFun() {
        this.command("würfel", (msg) => {
            const result = Math.floor(Math.random() * 6) + 1;
            return `🎲 Du hast eine ${result} gewürfelt!`;
        });
        
        this.command("münze", (msg) => {
            const result = Math.random() < 0.5 ? 'Kopf' : 'Zahl';
            return `🪙 ${result}!`;
        });
        
        this.command("8ball", (msg, args) => {
            const responses = [
                "Ja, definitiv!", "Nein, niemals!", "Vielleicht...", 
                "Frag später nochmal", "Sehr wahrscheinlich", 
                "Eher unwahrscheinlich", "Auf jeden Fall!", "Niemals!"
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            return `🎱 ${response}`;
        });
        
        return this;
    }

    enableStorage() {
        this.command("save", async (msg, args) => {
            if (args.length < 2) return msg.reply('❌ Verwendung: !save <key> <value>');
            const [key, ...value] = args;
            msg.write.in('userdata').set(`${msg.getSender()}.${key}`, value.join(' '));
            await msg.reply('💾 Daten gespeichert!');
        });
        
        this.command("load", async (msg, args) => {
            if (args.length < 1) return msg.reply('❌ Verwendung: !load <key>');
            const key = args[0];
            const data = msg.read.from('userdata').get(`${msg.getSender()}.${key}`);
            await msg.reply(data ? `📖 ${key}: ${data}` : '❌ Keine Daten gefunden');
        });
        
        return this;
    }

    enableScheduler() {
        this.command("remind", async (msg, args) => {
            if (args.length < 2) return msg.reply('❌ Verwendung: !remind <minuten> <nachricht>');
            const minutes = parseInt(args[0]);
            const message = args.slice(1).join(' ');
            
            if (isNaN(minutes)) return msg.reply('❌ Ungültige Minutenangabe');
            
            const reminderTime = new Date(Date.now() + (minutes * 60 * 1000));
            this.client.scheduler.scheduleOnce(reminderTime, msg.from, `⏰ Erinnerung: ${message}`);
            await msg.reply(`⏰ Erinnerung in ${minutes} Minuten gesetzt!`);
        });
        
        return this;
    }

    enableAll() {
        return this
            .enableDefaults()
            .enableWeather()
            .enableCrypto()
            .enableNews()
            .enableFun()
            .enableStorage()
            .enableScheduler();
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

    enableAutoRestart(enabled = true, delay = 5) {
        if (this.client) {
            this.client.enableAutoRestart(enabled, delay * 1000);
        } else if (this.multiClient) {
            // Für Multi-Client später implementieren
            console.log("⚠️ Auto-Restart für Multi-Client noch nicht verfügbar");
        }
        return this;
    }

    disableAutoRestart() {
        return this.enableAutoRestart(false);
    }

    enableReactions(enabled = true) {
        this.settings.reactionsEnabled = enabled;
        return this;
    }

    // Ignore API für EasyBot - DEINE NEUE FUNKTION!
    ignoreOfflineMessages(enabled = true) {
        if (this.client) {
            this.client.ignore.message.offline(enabled);
        } else if (this.multiClient) {
            // Für Multi-Client später implementieren
            console.log("⚠️ Offline Message Ignore für Multi-Client noch nicht verfügbar");
        }
        return this;
    }

    // ROBUSTE CONNECTION API - NEU!
    enableRobustConnection(enabled = true) {
        if (this.client) {
            // Robuste Einstellungen aktivieren
            this.client.options.maxReconnectAttempts = enabled ? 200 : 50;
            this.client.options.reconnectInterval = enabled ? 1000 : 3000;
            this.client.options.heartbeatInterval = enabled ? 15000 : 30000;
            this.client.options.connectionTimeout = enabled ? 300000 : 120000;
            console.log(`💪 Robuste Verbindung ${enabled ? 'AKTIVIERT' : 'DEAKTIVIERT'}`);
        }
        return this;
    }

    setReconnectAttempts(attempts) {
        if (this.client) {
            this.client.options.maxReconnectAttempts = attempts;
            console.log(`🔄 Max Wiederverbindungsversuche: ${attempts}`);
        }
        return this;
    }

    setHeartbeatInterval(interval) {
        if (this.client) {
            this.client.options.heartbeatInterval = interval;
            console.log(`💓 Heartbeat Interval: ${interval / 1000}s`);
        }
        return this;
    }

    enableUltraRobust() {
        return this
            .enableRobustConnection(true)
            .setReconnectAttempts(500) // Sehr viele Versuche
            .setHeartbeatInterval(10000) // 10 Sekunden Heartbeat
            .enableAutoRestart(true, 2000); // 2 Sekunden Restart-Delay
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
            if (activeClient.setPrefix && typeof activeClient.setPrefix === 'function') {
                activeClient.setPrefix("!");
            }
            
            for (const [cmd, response] of this.commands) {
                if (activeClient.addCommand && typeof activeClient.addCommand === 'function') {
                    activeClient.addCommand(cmd, async (msg) => {
                        try {
                            if (this.settings.typingEnabled) {
                                await this.typeMessage(msg, 1000);
                            }
                            
                            const reply = typeof response === 'function' ? await response(msg) : response;
                            await this.sendReply(msg, reply);
                        } catch (error) {
                            console.error(`❌ Fehler bei Command '${cmd}':`, error.message);
                            try {
                                await this.sendReply(msg, "❌ Fehler beim Ausführen des Commands");
                            } catch (fallbackError) {
                                console.error("❌ Auch Fallback-Antwort fehlgeschlagen:", fallbackError.message);
                            }
                        }
                    });
                } else {
                    console.log(`⚠️ Client unterstützt keine Commands - Command '${cmd}' übersprungen`);
                }
            }
        }

        // Setup Message Handler
        activeClient.on('message', async (msg) => {
            try {
                // Skip commands
                if (msg.isCommand) return;
                
                const text = msg.text?.toLowerCase() || '';
                
                // Auto Responses (exact match)
                for (const [trigger, response] of this.autoResponses) {
                    if (text === trigger || text.includes(trigger)) {
                        try {
                            if (this.settings.typingEnabled) {
                                await this.typeMessage(msg, 1500);
                            }
                            
                            const reply = typeof response === 'function' ? await response(msg) : response;
                            await this.sendReply(msg, reply);
                            return;
                        } catch (responseError) {
                            console.error(`❌ Fehler bei Auto-Response '${trigger}':`, responseError.message);
                        }
                    }
                }
                
                // Process rules
                for (const rule of this.rules) {
                    try {
                        if (rule.matches(msg)) {
                            await rule.execute(msg);
                            break; // Only first match
                        }
                    } catch (ruleError) {
                        console.error('❌ Fehler bei Rule-Ausführung:', ruleError.message);
                    }
                }
            } catch (error) {
                console.error('❌ Fehler im Message Handler:', error.message);
            }
        });

        // Multi-Device Setup
        if (this.isMultiDevice) {
            try {
                // Auto-add default devices if none exist
                if (this.multiClient.deviceManager && this.multiClient.deviceManager.devices.size === 0) {
                    await this.multiClient.addDevice('bot1');
                    await this.multiClient.addDevice('bot2');
                    console.log("✅ Standard Devices (bot1, bot2) hinzugefügt");
                }
            } catch (deviceError) {
                console.error("⚠️ Fehler beim Hinzufügen der Standard-Devices:", deviceError.message);
            }
        }

        // Connect
        try {
            await activeClient.connect();
            this.isRunning = true;
        } catch (connectError) {
            console.error("❌ Fehler beim Verbinden:", connectError.message);
            throw connectError;
        }
        
        console.log("✅ EasyBot gestartet!");
        console.log(`📝 ${this.rules.length} Regeln aktiv`);
        console.log(`⚡ ${this.commands.size} Commands verfügbar`);
        console.log(`🤖 ${this.autoResponses.size} Auto-Antworten aktiv`);
        
        if (this.isMultiDevice) {
            try {
                const status = this.multiClient.getStatus();
                console.log(`🔧 Multi-Device: ${status.activeDevices}/${status.totalDevices} Devices`);
            } catch (statusError) {
                console.log("🔧 Multi-Device: Status nicht verfügbar");
            }
        }
        
        return this;
    }

    // ===== HELPER METHODS =====
    
    async typeMessage(msg, duration = 1500) {
        if (!this.settings.typingEnabled) return;
        
        try {
            if (this.isMultiDevice) {
                const client = this.multiClient.getNextDevice();
                if (client && client.socket) {
                    await client.socket.sendPresenceUpdate('composing', msg.from);
                    await new Promise(r => setTimeout(r, duration));
                    await client.socket.sendPresenceUpdate('paused', msg.from);
                }
            } else {
                if (msg.visualWrite && typeof msg.visualWrite === 'function') {
                    await msg.visualWrite(true);
                    await new Promise(r => setTimeout(r, duration));
                    await msg.visualWrite(false);
                } else {
                    // Fallback: Direct client call
                    await this.client.socket.sendPresenceUpdate('composing', msg.from);
                    await new Promise(r => setTimeout(r, duration));
                    await this.client.socket.sendPresenceUpdate('paused', msg.from);
                }
            }
        } catch (error) {
            // Ignore typing errors silently
        }
    }

    async sendReply(msg, text, mentions = []) {
        try {
            if (this.isMultiDevice) {
                const client = this.multiClient.getNextDevice();
                if (client && client.socket) {
                    const messageObj = { text: String(text) };
                    if (mentions.length > 0) {
                        messageObj.mentions = mentions;
                    }
                    await client.socket.sendMessage(msg.from, messageObj);
                } else {
                    throw new Error('Kein verfügbarer Multi-Device Client');
                }
            } else {
                if (msg.reply && typeof msg.reply === 'function') {
                    await msg.reply(String(text), mentions);
                } else {
                    // Fallback: Direct client call
                    const messageObj = { text: String(text) };
                    if (mentions.length > 0) {
                        messageObj.mentions = mentions;
                    }
                    await this.client.socket.sendMessage(msg.from, messageObj);
                }
            }
        } catch (error) {
            console.error("❌ Fehler beim Senden:", error.message);
            // Fallback attempt
            try {
                if (this.client && this.client.socket) {
                    const messageObj = { text: String(text) };
                    if (mentions.length > 0) {
                        messageObj.mentions = mentions;
                    }
                    await this.client.socket.sendMessage(msg.from, messageObj);
                }
            } catch (fallbackError) {
                console.error("❌ Auch Fallback fehlgeschlagen:", fallbackError.message);
            }
        }
    }

    async sendReaction(msg, emoji) {
        try {
            if (this.isMultiDevice) {
                const client = this.multiClient.getNextDevice();
                if (client && client.socket && msg.raw && msg.raw.key) {
                    await client.socket.sendMessage(msg.from, {
                        react: { text: emoji, key: msg.raw.key }
                    });
                } else {
                    throw new Error('Multi-Device Client oder Message Key nicht verfügbar');
                }
            } else {
                if (msg.react && typeof msg.react === 'function') {
                    await msg.react(emoji);
                } else if (this.client && this.client.socket && msg.raw && msg.raw.key) {
                    // Fallback: Direct client call
                    await this.client.socket.sendMessage(msg.from, {
                        react: { text: emoji, key: msg.raw.key }
                    });
                } else {
                    throw new Error('Message Key nicht verfügbar für Reaction');
                }
            }
        } catch (error) {
            console.error("❌ Fehler bei Reaction:", error.message);
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
        try {
            const activeClient = this.isMultiDevice ? this.multiClient : this.client;
            if (activeClient && typeof activeClient.disconnect === 'function') {
                activeClient.disconnect();
            }
            this.isRunning = false;
            console.log("🛑 EasyBot gestoppt");
        } catch (error) {
            console.error("❌ Fehler beim Stoppen:", error.message);
            this.isRunning = false;
        }
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
            try {
                return {
                    ...baseStatus,
                    ...this.multiClient.getStatus()
                };
            } catch (statusError) {
                return {
                    ...baseStatus,
                    multiDeviceError: statusError.message
                };
            }
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
    
    // ===== ERROR HANDLING METHODS - NEU! =====
    
    /**
     * Configure support contact information
     */
    setSupportContact(email, discord = null, github = null) {
        if (this.client) {
            this.client.errorHandler.options.supportEmail = email;
            if (discord) this.client.errorHandler.options.supportDiscord = discord;
            if (github) this.client.errorHandler.options.supportGitHub = github;
        }
        return this;
    }
    
    /**
     * Enable/disable error reporting
     */
    enableErrorReporting(enabled = true) {
        if (this.client) {
            this.client.errorHandler.options.sendErrorReports = enabled;
        }
        return this;
    }
    
    /**
     * Get error statistics
     */
    getErrorStats() {
        if (this.client) {
            return this.client.errorHandler.getErrorStats();
        }
        return { totalErrors: 0, lastError: null };
    }
    
    /**
     * Add error handling to bot
     */
    onError(callback) {
        if (this.client) {
            this.client.on('error', callback);
        }
        return this;
    }
    
    // ===== BUSINESS FEATURES - NEU! =====
    
    /**
     * Set business profile
     */
    setBusinessProfile(profileData) {
        if (this.client) {
            this.client.business.setProfile(profileData);
        }
        return this;
    }
    
    /**
     * Create product
     */
    createProduct(productData) {
        if (this.client) {
            return this.client.business.createProduct(productData);
        }
        return this;
    }
    
    /**
     * Send product template
     */
    sendProduct(productId) {
        this.addRule(new EasyRule('product', async (msg) => {
            if (this.client) {
                const product = this.client.business.getProduct(productId);
                if (product) {
                    await this.client.ui.sendProductTemplate(msg.from, product);
                }
            }
        }));
        return this;
    }
    
    // ===== UI COMPONENTS - NEU! =====
    
    /**
     * Send carousel
     */
    carousel(cards, options = {}) {
        this.addRule(new EasyRule('carousel', async (msg) => {
            if (this.client) {
                await this.client.ui.sendCarousel(msg.from, cards, options);
            }
        }));
        return this;
    }
    
    /**
     * Create interactive form
     */
    form(formConfig) {
        this.addRule(new EasyRule('form', async (msg) => {
            if (this.client) {
                await this.client.ui.createForm(msg.from, formConfig);
            }
        }));
        return this;
    }
    
    /**
     * Send quick replies
     */
    quickReplies(text, replies, options = {}) {
        this.addRule(new EasyRule('quickReplies', async (msg) => {
            if (this.client) {
                await this.client.ui.sendQuickReplies(msg.from, text, replies, options);
            }
        }));
        return this;
    }
    
    /**
     * Set persistent menu
     */
    setPersistentMenu(menuItems) {
        if (this.client) {
            // Set menu for all users who interact with the bot
            this.client.on('message', async (msg) => {
                if (msg.text?.toLowerCase() === 'menu') {
                    await this.client.ui.setPersistentMenu(msg.from, menuItems);
                }
            });
        }
        return this;
    }
    
    // ===== ANALYTICS FEATURES - NEU! =====
    
    /**
     * Get analytics stats
     */
    getAnalytics(days = 7) {
        if (this.client) {
            return this.client.analyticsManager.getDetailedStats(days);
        }
        return null;
    }
    
    /**
     * Track custom event
     */
    trackEvent(eventName, data = {}) {
        if (this.client) {
            this.client.analyticsManager.trackEvent(eventName, data);
        }
        return this;
    }
    
    // ===== HELPER METHODS FÜR MEDIA =====
    
    async sendMedia(msg, type, data) {
        try {
            const activeClient = this.isMultiDevice ? this.multiClient.getNextDevice() : this.client;
            
            switch (type) {
                case 'image':
                    if (data.path) {
                        await activeClient.socket.sendMessage(msg.from, {
                            image: { url: data.path },
                            caption: data.caption || ''
                        });
                    }
                    break;
                    
                case 'video':
                    if (data.path) {
                        await activeClient.socket.sendMessage(msg.from, {
                            video: { url: data.path },
                            caption: data.caption || ''
                        });
                    }
                    break;
                    
                case 'audio':
                    if (data) {
                        await activeClient.socket.sendMessage(msg.from, {
                            audio: { url: data },
                            mimetype: 'audio/mp4'
                        });
                    }
                    break;
                    
                case 'sticker':
                    if (data) {
                        await activeClient.socket.sendMessage(msg.from, {
                            sticker: { url: data }
                        });
                    }
                    break;
                    
                case 'document':
                    if (data.path) {
                        await activeClient.socket.sendMessage(msg.from, {
                            document: { url: data.path },
                            fileName: data.filename || 'document'
                        });
                    }
                    break;
                    
                case 'location':
                    await activeClient.socket.sendMessage(msg.from, {
                        location: {
                            degreesLatitude: data.lat,
                            degreesLongitude: data.lng
                        }
                    });
                    break;
                    
                case 'contact':
                    await activeClient.socket.sendMessage(msg.from, {
                        contacts: {
                            displayName: data.name,
                            contacts: [{ vcard: data.vcard }]
                        }
                    });
                    break;
                    
                case 'poll':
                    await activeClient.socket.sendMessage(msg.from, {
                        poll: {
                            name: data.question,
                            values: data.options,
                            selectableCount: 1
                        }
                    });
                    break;
            }
        } catch (error) {
            console.error(`❌ Fehler beim Senden von ${type}:`, error.message);
            await this.sendReply(msg, `❌ ${type} konnte nicht gesendet werden`);
        }
    }
    
    // ===== HELPER METHOD FÜR RULES =====
    
    addRule(rule) {
        this.rules.push(rule);
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

    // Actions - Return chain for fluent API!
    reply(text) {
        this.actions.push({ type: 'reply', value: text });
        return this.bot.chain; // ✅ KRITISCH: Gibt Chain zurück für Fluent API!
    }

    send(text) {
        this.actions.push({ type: 'reply', value: text });
        return this.bot.chain; // ✅ KRITISCH: Gibt Chain zurück für Fluent API!
    }

    react(emoji) {
        this.actions.push({ type: 'react', value: emoji });
        return this.bot.chain; // ✅ KRITISCH: Gibt Chain zurück für Fluent API!
    }

    type(seconds = 2) {
        this.actions.push({ type: 'type', value: seconds * 1000 });
        return this.bot.chain; // ✅ KRITISCH: Gibt Chain zurück für Fluent API!
    }

    // Neue Typing-Methoden hinzufügen
    quickType(text) {
        this.actions.push({ type: 'quickType', value: text });
        return this;
    }

    normalType(text) {
        this.actions.push({ type: 'normalType', value: text });
        return this;
    }

    slowType(text) {
        this.actions.push({ type: 'slowType', value: text });
        return this;
    }

    typeAndReply(text, seconds = 2) {
        this.type(seconds);
        this.reply(text);
        return this; // Return this for more actions on same rule!
    }

    useTemplate(templateName) {
        this.actions.push({ type: 'template', value: templateName });
        return this; // Return this for more actions on same rule!
    }

    // ===== MEDIA ACTIONS =====
    
    sendImage(path, caption = "") {
        this.actions.push({ type: 'image', value: { path, caption } });
        return this;
    }

    sendVideo(path, caption = "") {
        this.actions.push({ type: 'video', value: { path, caption } });
        return this;
    }

    // ===== ADVANCED MEDIA ACTIONS - NEU! =====
    
    voice(audioPath) {
        this.actions.push({ type: 'voice', value: audioPath });
        return this;
    }

    videoMessage(videoPath) {
        this.actions.push({ type: 'videoMessage', value: videoPath });
        return this;
    }

    gif(gifPath, caption = "") {
        this.actions.push({ type: 'gif', value: { path: gifPath, caption } });
        return this;
    }

    // ===== ADVANCED MESSAGE ACTIONS - NEU! =====
    
    forward(targetChat = null) {
        this.actions.push({ type: 'forward', value: targetChat });
        return this;
    }

    pin() {
        this.actions.push({ type: 'pin', value: true });
        return this;
    }

    star() {
        this.actions.push({ type: 'star', value: true });
        return this;
    }

    quote(text) {
        this.actions.push({ type: 'quote', value: text });
        return this;
    }

    // ===== RICH CONTENT ACTIONS - NEU! =====
    
    buttons(text, buttonList, footer = "") {
        this.actions.push({ type: 'buttons', value: { text, buttons: buttonList, footer } });
        return this;
    }

    list(title, description, buttonText, sections) {
        this.actions.push({ type: 'list', value: { title, description, buttonText, sections } });
        return this;
    }

    // ===== GROUP ACTIONS - NEU! =====
    
    groupInfo() {
        this.actions.push({ type: 'groupInfo', value: true });
        return this;
    }

    inviteLink() {
        this.actions.push({ type: 'inviteLink', value: true });
        return this;
    }

    // ===== PRIVACY ACTIONS - NEU! =====
    
    block() {
        this.actions.push({ type: 'block', value: true });
        return this;
    }

    unblock() {
        this.actions.push({ type: 'unblock', value: true });
        return this;
    }

    // ===== ANALYTICS ACTIONS - NEU! =====
    
    checkOnline() {
        this.actions.push({ type: 'checkOnline', value: true });
        return this;
    }

    archive() {
        this.actions.push({ type: 'archive', value: true });
        return this;
    }

    mute(duration = 8 * 60 * 60 * 1000) {
        this.actions.push({ type: 'mute', value: duration });
        return this;
    }

    // ===== STATUS ACTIONS - NEU! =====
    
    sendStatus(text, options = {}) {
        this.actions.push({ type: 'sendStatus', value: { text, options } });
        return this;
    }

    // ===== SYSTEM ACTIONS - NEU! =====
    
    backup() {
        this.actions.push({ type: 'backup', value: true });
        return this;
    }

    sendAudio(path) {
        this.actions.push({ type: 'audio', value: path });
        return this;
    }

    sendSticker(path) {
        this.actions.push({ type: 'sticker', value: path });
        return this;
    }

    sendDocument(path, filename) {
        this.actions.push({ type: 'document', value: { path, filename } });
        return this;
    }

    sendLocation(lat, lng) {
        this.actions.push({ type: 'location', value: { lat, lng } });
        return this;
    }

    sendContact(vcard, name) {
        this.actions.push({ type: 'contact', value: { vcard, name } });
        return this;
    }

    sendPoll(question, options) {
        this.actions.push({ type: 'poll', value: { question, options } });
        return this;
    }

    // ===== ADVANCED ACTIONS =====
    
    createSticker(options = {}) {
        this.actions.push({ type: 'createSticker', value: options });
        return this;
    }

    hidetag(target = "all") {
        this.actions.push({ type: 'hidetag', value: target });
        return this;
    }

    record(duration = 3000) {
        this.actions.push({ type: 'record', value: duration });
        return this;
    }

    wait(ms) {
        this.actions.push({ type: 'wait', value: ms });
        return this;
    }

    // ===== AI ACTIONS =====
    
    aiReply(prompt, options = {}) {
        this.actions.push({ type: 'aiReply', value: { prompt, options } });
        return this;
    }

    translate(text, targetLang) {
        this.actions.push({ type: 'translate', value: { text, targetLang } });
        return this;
    }

    // ===== HTTP ACTIONS =====
    
    getWeather(city) {
        this.actions.push({ type: 'weather', value: city });
        return this;
    }

    getNews(category = 'general') {
        this.actions.push({ type: 'news', value: category });
        return this;
    }

    getCrypto(symbol) {
        this.actions.push({ type: 'crypto', value: symbol });
        return this;
    }

    // ===== STORAGE ACTIONS =====
    
    saveData(file, key, value) {
        this.actions.push({ type: 'saveData', value: { file, key, value } });
        return this;
    }

    loadData(file, key) {
        this.actions.push({ type: 'loadData', value: { file, key } });
        return this;
    }

    incrementCounter(file, key, amount = 1) {
        this.actions.push({ type: 'increment', value: { file, key, amount } });
        return this;
    }

    // ===== SCHEDULER ACTIONS =====
    
    scheduleMessage(time, message) {
        this.actions.push({ type: 'schedule', value: { time, message } });
        return this;
    }

    remindIn(minutes, message) {
        this.actions.push({ type: 'remind', value: { minutes, message } });
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

    // Neue Mention + Typing Kombinationen
    slowTypeWithMention(text) {
        this.actions.push({ type: 'slowTypeWithMention', value: text });
        return this;
    }

    quickTypeWithMention(text) {
        this.actions.push({ type: 'quickTypeWithMention', value: text });
        return this;
    }

    normalTypeWithMention(text) {
        this.actions.push({ type: 'normalTypeWithMention', value: text });
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

    // NEW: when() method on rule for chaining new rules! - KORRIGIERT!
    when(trigger) {
        // Create new rule and add to bot
        const newRule = new EasyRule(trigger, this.bot);
        this.bot.rules.push(newRule);
        this.bot.chain.currentRule = newRule; // Set new rule as current
        return this.bot.chain; // ✅ KRITISCH: Gibt Chain zurück für Fluent API!
    }

    // End action chaining, return bot for new rules
    done() {
        return this.bot;
    }

    // Alias for done() - return bot for new rules
    then() {
        return this.bot;
    }

    // ✅ KRITISCH: start() Methode hinzufügen!
    start() {
        return this.bot.start(); // Delegiere zu EasyBot.start()
    }

    // ✅ FEHLENDE METHODEN: Delegiere zu EasyBot
    command(cmd, response) {
        return this.bot.command(cmd, response);
    }

    autoReply(trigger, response) {
        return this.bot.autoReply(trigger, response);
    }

    template(name, content) {
        return this.bot.template(name, content);
    }

    enableDefaults() {
        return this.bot.enableDefaults();
    }

    enableAll() {
        return this.bot.enableAll();
    }

    status() {
        return this.bot.status();
    }

    stop() {
        return this.bot.stop();
    }

    // ✅ ADVANCED FEATURES: Delegiere zu EasyBot
    enableAI() {
        return this.bot.enableAI();
    }

    enableWeather() {
        return this.bot.enableWeather();
    }

    enableCrypto() {
        return this.bot.enableCrypto();
    }

    enableNews() {
        return this.bot.enableNews();
    }

    enableFun() {
        return this.bot.enableFun();
    }

    enableStorage() {
        return this.bot.enableStorage();
    }

    enableScheduler() {
        return this.bot.enableScheduler();
    }

    enableMultiDevice() {
        return this.bot.enableMultiDevice();
    }

    enableTyping() {
        return this.bot.enableTyping();
    }

    enableAutoRestart() {
        return this.bot.enableAutoRestart();
    }

    enableReactions() {
        return this.bot.enableReactions();
    }

    ignoreOfflineMessages() {
        return this.bot.ignoreOfflineMessages();
    }

    enableRobustConnection() {
        return this.bot.enableRobustConnection();
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
                        
                    case 'quickType':
                        await this.bot.typeMessage(msg, 1000); // 1 Sekunde
                        await this.bot.sendReply(msg, action.value);
                        break;
                        
                    case 'normalType':
                        await this.bot.typeMessage(msg, 2000); // 2 Sekunden
                        await this.bot.sendReply(msg, action.value);
                        break;
                        
                    case 'slowType':
                        await this.bot.typeMessage(msg, 4000); // 4 Sekunden
                        await this.bot.sendReply(msg, action.value);
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
                        
                    case 'video':
                        await this.bot.sendMedia(msg, 'video', action.value);
                        break;
                        
                    case 'audio':
                        await this.bot.sendMedia(msg, 'audio', action.value);
                        break;
                        
                    case 'sticker':
                        await this.bot.sendMedia(msg, 'sticker', action.value);
                        break;
                        
                    case 'document':
                        await this.bot.sendMedia(msg, 'document', action.value);
                        break;
                        
                    case 'location':
                        await this.bot.sendMedia(msg, 'location', action.value);
                        break;
                        
                    case 'contact':
                        await this.bot.sendMedia(msg, 'contact', action.value);
                        break;
                        
                    case 'poll':
                        await this.bot.sendMedia(msg, 'poll', action.value);
                        break;
                        
                    case 'createSticker':
                        try {
                            if (msg.create && msg.create.sticker) {
                                await msg.create.sticker.fromText('EasyBot Sticker', action.value);
                            } else {
                                await this.bot.sendReply(msg, '🎨 Sticker-Feature nicht verfügbar');
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei Sticker-Erstellung:', error.message);
                        }
                        break;
                        
                    case 'hidetag':
                        try {
                            if (msg.isGroup) {
                                await this.bot.sendReply(msg, '👥 Hidetag-Nachricht', [], { hidetag: action.value });
                            } else {
                                await this.bot.sendReply(msg, 'Hidetag funktioniert nur in Gruppen');
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei Hidetag:', error.message);
                        }
                        break;
                        
                    case 'record':
                        try {
                            if (msg.visualRecord) {
                                await msg.visualRecord(true);
                                await new Promise(resolve => setTimeout(resolve, action.value));
                                await msg.visualRecord(false);
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei Recording:', error.message);
                        }
                        break;
                        
                    case 'wait':
                        await new Promise(resolve => setTimeout(resolve, action.value));
                        break;
                        
                    case 'aiReply':
                        try {
                            if (this.bot.client && this.bot.client.ai) {
                                const response = await this.bot.client.ai.chat(action.value.prompt, action.value.options);
                                await this.bot.sendReply(msg, `🤖 ${response}`);
                            } else {
                                await this.bot.sendReply(msg, '🤖 AI nicht verfügbar');
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei AI:', error.message);
                            await this.bot.sendReply(msg, '❌ AI-Fehler');
                        }
                        break;
                        
                    case 'translate':
                        try {
                            if (this.bot.client && this.bot.client.ai) {
                                const translation = await this.bot.client.ai.translate(action.value.text, action.value.targetLang);
                                await this.bot.sendReply(msg, `🌍 ${translation}`);
                            } else {
                                await this.bot.sendReply(msg, '🌍 Übersetzung nicht verfügbar');
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei Übersetzung:', error.message);
                        }
                        break;
                        
                    case 'weather':
                        try {
                            if (this.bot.client && this.bot.client.http) {
                                const weather = await this.bot.client.http.getWeather(action.value);
                                await this.bot.sendReply(msg, `🌤️ **${weather.city}**: ${weather.temperature}°C, ${weather.description}`);
                            } else {
                                await this.bot.sendReply(msg, '🌤️ Wetter-Service nicht verfügbar');
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei Wetter:', error.message);
                        }
                        break;
                        
                    case 'news':
                        try {
                            if (this.bot.client && this.bot.client.http) {
                                const articles = await this.bot.client.http.getNews(action.value);
                                if (articles && articles.length > 0) {
                                    const article = articles[0];
                                    await this.bot.sendReply(msg, `📰 **${article.title}**\n\n${article.description}\n\n🔗 ${article.url}`);
                                } else {
                                    await this.bot.sendReply(msg, '📰 Keine News gefunden');
                                }
                            } else {
                                await this.bot.sendReply(msg, '📰 News-Service nicht verfügbar');
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei News:', error.message);
                        }
                        break;

                    // ===== ADVANCED FEATURES CASES - NEU! =====
                    
                    case 'voice':
                        try {
                            const mentions = msg.getMentions();
                            if (mentions.length > 0) {
                                await msg.sendVoiceToMentioned(action.value);
                            } else {
                                await msg.sendVoiceMessage(action.value);
                            }
                        } catch (error) {
                            console.error('❌ Voice Message Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Voice Message nicht verfügbar');
                        }
                        break;

                    case 'videoMessage':
                        try {
                            const mentions = msg.getMentions();
                            if (mentions.length > 0) {
                                await msg.sendVideoMessageToMentioned(action.value);
                            } else {
                                await msg.sendVideoMessage(action.value);
                            }
                        } catch (error) {
                            console.error('❌ Video Message Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Video Message nicht verfügbar');
                        }
                        break;

                    case 'gif':
                        try {
                            const mentions = msg.getMentions();
                            if (mentions.length > 0) {
                                await msg.sendGifToMentioned(action.value.path, action.value.caption);
                            } else {
                                await msg.sendGif(action.value.path, action.value.caption);
                            }
                        } catch (error) {
                            console.error('❌ GIF Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ GIF nicht verfügbar');
                        }
                        break;

                    case 'forward':
                        try {
                            if (action.value) {
                                await msg.forward(action.value);
                            } else {
                                const mentions = msg.getMentions();
                                if (mentions.length > 0) {
                                    await msg.forwardToMentioned();
                                } else {
                                    await msg.forwardToSender();
                                }
                            }
                        } catch (error) {
                            console.error('❌ Forward Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Forward nicht verfügbar');
                        }
                        break;

                    case 'pin':
                        try {
                            if (!msg.isGroup) {
                                await this.bot.sendReply(msg, '❌ Pin funktioniert nur in Gruppen!');
                            } else if (!(await msg.isAdmin())) {
                                await this.bot.sendReply(msg, '❌ Nur Admins können pinnen!');
                            } else {
                                await msg.pin();
                                await this.bot.sendReply(msg, '📌 Nachricht gepinnt!');
                            }
                        } catch (error) {
                            console.error('❌ Pin Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Pin nicht verfügbar');
                        }
                        break;

                    case 'star':
                        try {
                            await msg.star();
                            await this.bot.sendReply(msg, '⭐ Nachricht markiert!');
                        } catch (error) {
                            console.error('❌ Star Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Star nicht verfügbar');
                        }
                        break;

                    case 'quote':
                        try {
                            await msg.quote(action.value);
                        } catch (error) {
                            console.error('❌ Quote Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Quote nicht verfügbar');
                        }
                        break;

                    case 'buttons':
                        try {
                            await msg.sendButtons(action.value.text, action.value.buttons, action.value.footer);
                        } catch (error) {
                            console.error('❌ Buttons Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Buttons nicht verfügbar');
                        }
                        break;

                    case 'list':
                        try {
                            await msg.sendList(action.value.title, action.value.description, action.value.buttonText, action.value.sections);
                        } catch (error) {
                            console.error('❌ List Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ List nicht verfügbar');
                        }
                        break;

                    case 'groupInfo':
                        try {
                            if (!msg.isGroup) {
                                await this.bot.sendReply(msg, '❌ Nur in Gruppen verfügbar!');
                            } else {
                                const metadata = await this.bot.client.get.GroupMetadata(msg.from);
                                let info = `🏢 **Gruppeninfo**\n\n`;
                                info += `📝 Name: ${metadata.subject}\n`;
                                info += `👥 Mitglieder: ${metadata.participants.length}\n`;
                                info += `👑 Admins: ${metadata.participants.filter(p => p.admin).length}\n`;
                                info += `📅 Erstellt: ${new Date(metadata.creation * 1000).toLocaleDateString()}\n`;
                                if (metadata.desc) info += `📄 Beschreibung: ${metadata.desc}\n`;
                                await this.bot.sendReply(msg, info);
                            }
                        } catch (error) {
                            console.error('❌ Group Info Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Group Info nicht verfügbar');
                        }
                        break;

                    case 'inviteLink':
                        try {
                            if (!msg.isGroup) {
                                await this.bot.sendReply(msg, '❌ Nur in Gruppen verfügbar!');
                            } else if (!(await msg.isAdmin())) {
                                await this.bot.sendReply(msg, '❌ Nur Admins können Einladungslinks erstellen!');
                            } else {
                                const inviteLink = await this.bot.client.group.getInviteLink(msg.from);
                                await this.bot.sendReply(msg, `🔗 **Einladungslink:**\n${inviteLink}`);
                            }
                        } catch (error) {
                            console.error('❌ Invite Link Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Invite Link nicht verfügbar');
                        }
                        break;

                    case 'block':
                        try {
                            const mentions = msg.getMentions();
                            const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
                            await this.bot.client.privacy.block(targetJid);
                            await this.bot.sendReply(msg, '🚫 User blockiert!');
                        } catch (error) {
                            console.error('❌ Block Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Block nicht verfügbar');
                        }
                        break;

                    case 'unblock':
                        try {
                            const mentions = msg.getMentions();
                            const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
                            await this.bot.client.privacy.unblock(targetJid);
                            await this.bot.sendReply(msg, '✅ User entblockiert!');
                        } catch (error) {
                            console.error('❌ Unblock Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Unblock nicht verfügbar');
                        }
                        break;

                    case 'checkOnline':
                        try {
                            const mentions = msg.getMentions();
                            const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
                            const isOnline = await this.bot.client.analytics.isOnline(targetJid);
                            const userNumber = targetJid.split('@')[0].split(':')[0];
                            await this.bot.sendReply(msg, `📱 +${userNumber} ist ${isOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
                        } catch (error) {
                            console.error('❌ Online Check Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Online Check nicht verfügbar');
                        }
                        break;

                    case 'archive':
                        try {
                            await this.bot.client.analytics.archiveChat(msg.from);
                            await this.bot.sendReply(msg, '📦 Chat archiviert!');
                        } catch (error) {
                            console.error('❌ Archive Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Archive nicht verfügbar');
                        }
                        break;

                    case 'mute':
                        try {
                            await this.bot.client.analytics.muteChat(msg.from, action.value);
                            await this.bot.sendReply(msg, `🔇 Chat für ${Math.round(action.value / 60000)} Minuten stummgeschaltet!`);
                        } catch (error) {
                            console.error('❌ Mute Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Mute nicht verfügbar');
                        }
                        break;

                    case 'sendStatus':
                        try {
                            await this.bot.client.status.send('text', action.value.text, action.value.options);
                            await this.bot.sendReply(msg, `📢 Status gesendet: "${action.value.text}"`);
                        } catch (error) {
                            console.error('❌ Status Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Status nicht verfügbar');
                        }
                        break;

                    case 'backup':
                        try {
                            await this.bot.sendReply(msg, '💾 Erstelle Backup...');
                            const backup = await this.bot.client.system.backup();
                            await this.bot.sendReply(msg, `✅ Backup erstellt! Timestamp: ${backup.timestamp}`);
                        } catch (error) {
                            console.error('❌ Backup Fehler:', error.message);
                            await this.bot.sendReply(msg, '❌ Backup nicht verfügbar');
                        }
                        break;
                        
                    case 'crypto':
                        try {
                            if (this.bot.client && this.bot.client.http) {
                                const price = await this.bot.client.http.getCryptoPrice(action.value);
                                await this.bot.sendReply(msg, `💰 **${price.symbol.toUpperCase()}**: €${price.priceEUR} (${price.change24h})`);
                            } else {
                                await this.bot.sendReply(msg, '💰 Crypto-Service nicht verfügbar');
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei Crypto:', error.message);
                        }
                        break;
                        
                    case 'saveData':
                        try {
                            if (msg.write) {
                                msg.write.in(action.value.file).set(action.value.key, action.value.value);
                                await this.bot.sendReply(msg, '💾 Daten gespeichert');
                            }
                        } catch (error) {
                            console.error('❌ Fehler beim Speichern:', error.message);
                        }
                        break;
                        
                    case 'loadData':
                        try {
                            if (msg.read) {
                                const data = msg.read.from(action.value.file).get(action.value.key);
                                await this.bot.sendReply(msg, `📖 Daten: ${JSON.stringify(data)}`);
                            }
                        } catch (error) {
                            console.error('❌ Fehler beim Laden:', error.message);
                        }
                        break;
                        
                    case 'increment':
                        try {
                            if (msg.write) {
                                msg.write.in(action.value.file).increment(action.value.key, action.value.amount);
                                const newValue = msg.read.from(action.value.file).get(action.value.key);
                                await this.bot.sendReply(msg, `📊 Counter: ${newValue}`);
                            }
                        } catch (error) {
                            console.error('❌ Fehler beim Incrementieren:', error.message);
                        }
                        break;
                        
                    case 'schedule':
                        try {
                            if (this.bot.client && this.bot.client.scheduler) {
                                const scheduleTime = new Date(Date.now() + (action.value.time * 60 * 1000));
                                this.bot.client.scheduler.scheduleOnce(scheduleTime, msg.from, action.value.message);
                                await this.bot.sendReply(msg, `⏰ Nachricht geplant für ${scheduleTime.toLocaleString('de-DE')}`);
                            }
                        } catch (error) {
                            console.error('❌ Fehler beim Planen:', error.message);
                        }
                        break;
                        
                    case 'remind':
                        try {
                            if (this.bot.client && this.bot.client.scheduler) {
                                const reminderTime = new Date(Date.now() + (action.value.minutes * 60 * 1000));
                                this.bot.client.scheduler.scheduleOnce(reminderTime, msg.from, `⏰ Erinnerung: ${action.value.message}`);
                                await this.bot.sendReply(msg, `⏰ Erinnerung in ${action.value.minutes} Minuten gesetzt`);
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei Erinnerung:', error.message);
                        }
                        break;
                        
                    case 'mentionSender':
                        // Verbesserte Implementierung für mentionSender
                        try {
                            if (msg.replyWithMention && typeof msg.replyWithMention === 'function') {
                                await msg.replyWithMention(action.value, msg.getSender());
                            } else {
                                // Fallback
                                const senderName = msg.getSender().split('@')[0];
                                const mentionText = action.value.replace('@user', `@${senderName}`);
                                await this.bot.sendReply(msg, mentionText, [msg.getSender()]);
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei mentionSender:', error.message);
                            await this.bot.sendReply(msg, action.value);
                        }
                        break;
                        
                    case 'mentionAll':
                        // Verbesserte Implementierung für mentionAll
                        try {
                            if (msg.mentionAll && typeof msg.mentionAll === 'function') {
                                await msg.mentionAll(action.value);
                            } else {
                                await this.bot.sendReply(msg, action.value);
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei mentionAll:', error.message);
                            await this.bot.sendReply(msg, action.value);
                        }
                        break;
                        
                    case 'mentionUser':
                        // Implementierung für mentionUser
                        try {
                            if (msg.replyWithMention && typeof msg.replyWithMention === 'function') {
                                await msg.replyWithMention(action.value.text, action.value.userJid);
                            } else {
                                await this.bot.sendReply(msg, action.value.text);
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei mentionUser:', error.message);
                            await this.bot.sendReply(msg, action.value.text);
                        }
                        break;
                        
                    case 'slowTypeWithMention':
                        // Neue Funktion: Slow Type mit Mention
                        try {
                            if (msg.slowTypeWithMention && typeof msg.slowTypeWithMention === 'function') {
                                await msg.slowTypeWithMention(action.value, msg.getSender());
                            } else {
                                // Fallback
                                const senderName = msg.getSender().split('@')[0];
                                const mentionText = action.value.replace('@user', `@${senderName}`);
                                await this.bot.typeMessage(msg, 4000);
                                await this.bot.sendReply(msg, mentionText, [msg.getSender()]);
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei slowTypeWithMention:', error.message);
                        }
                        break;
                        
                    case 'quickTypeWithMention':
                        // Neue Funktion: Quick Type mit Mention
                        try {
                            if (msg.quickTypeWithMention && typeof msg.quickTypeWithMention === 'function') {
                                await msg.quickTypeWithMention(action.value, msg.getSender());
                            } else {
                                // Fallback
                                const senderName = msg.getSender().split('@')[0];
                                const mentionText = action.value.replace('@user', `@${senderName}`);
                                await this.bot.typeMessage(msg, 1000);
                                await this.bot.sendReply(msg, mentionText, [msg.getSender()]);
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei quickTypeWithMention:', error.message);
                        }
                        break;
                        
                    case 'normalTypeWithMention':
                        // Neue Funktion: Normal Type mit Mention
                        try {
                            if (msg.normalTypeWithMention && typeof msg.normalTypeWithMention === 'function') {
                                await msg.normalTypeWithMention(action.value, msg.getSender());
                            } else {
                                // Fallback
                                const senderName = msg.getSender().split('@')[0];
                                const mentionText = action.value.replace('@user', `@${senderName}`);
                                await this.bot.typeMessage(msg, 2000);
                                await this.bot.sendReply(msg, mentionText, [msg.getSender()]);
                            }
                        } catch (error) {
                            console.error('❌ Fehler bei normalTypeWithMention:', error.message);
                        }
                        break;
                        

                        
                    case 'delete':
                        // Implementierung für delete
                        console.log('Delete action ausgeführt');
                        break;
                        
                    case 'deleteAfter':
                        // Implementierung für deleteAfter
                        setTimeout(() => {
                            console.log('Delayed delete action ausgeführt');
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