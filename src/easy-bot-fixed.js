import { WhatsAppClient } from "./client.js";
import { MultiWhatsAppClient } from "./multi-client.js";
import { EasyAdvanced, EasyAdvancedRule } from "./easy-advanced.js";
import { ConsoleLogger } from "./console-logger.js";
import { ErrorHandler } from "./error-handler.js";

// ===== CHAIN-PROXY PATTERN =====
// Lösung: Alle Methoden sind sowohl auf EasyBot als auch EasyRule verfügbar
// und geben ein Proxy-Objekt zurück, das beide APIs unterstützt

class EasyChain {
    constructor(bot) {
        this.bot = bot;
        this.currentRule = null;
    }

    // ===== RULE METHODS =====
    when(trigger) {
        const rule = new EasyRule(trigger, this.bot);
        this.bot.rules.push(rule);
        this.currentRule = rule;
        return this; // Gibt EasyChain zurück
    }

    reply(text) {
        if (this.currentRule) {
            this.currentRule.actions.push({ type: 'reply', value: text });
        }
        return this; // Für weitere Chaining
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
        
        // Chain-Proxy für Fluent API
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
            qrMaxDisplays: 3,
            clearTerminalOnQR: true,
            
            // ROBUSTE CONNECTION DEFAULTS
            maxReconnectAttempts: 100,
            reconnectInterval: 2000,
            exponentialBackoff: true,
            maxBackoffDelay: 30000,
            heartbeatInterval: 20000,
            
            // ADVANCED DEFAULTS
            enableAdvancedFeatures: true,
            enableAnalytics: true,
            enableStorage: true,
            enableScheduler: true,
            enableErrorHandling: true,
            
            ...options
        });
        
        // Advanced features initialisieren
        bot.advanced = new EasyAdvanced(bot);
        
        return bot.chain; // ✅ Gibt Chain-Proxy zurück!
    }

    // ===== SIMPLE RULES =====
    
    when(trigger) {
        const rule = new EasyRule(trigger, this);
        this.rules.push(rule);
        return rule;
    }

    // ===== BOT CONTROL =====
    
    async start() {
        if (this.isRunning) {
            console.log('⚠️ Bot läuft bereits');
            return this;
        }

        try {
            console.log('🚀 Starte EasyBot...');
            
            // Client verbinden
            await this.client.connect();
            
            // Message Handler registrieren
            this.client.on('message', async (msg) => {
                await this.handleMessage(msg);
            });
            
            this.isRunning = true;
            console.log('✅ EasyBot gestartet!');
            console.log(`📝 ${this.rules.length} Regeln geladen`);
            console.log(`⚡ ${this.commands.size} Commands verfügbar`);
            
            return this;
            
        } catch (error) {
            console.error('❌ EasyBot Start-Fehler:', error);
            throw error;
        }
    }

    async stop() {
        if (!this.isRunning) {
            console.log('⚠️ Bot läuft nicht');
            return this;
        }

        try {
            console.log('🛑 Stoppe EasyBot...');
            
            if (this.client) {
                await this.client.gracefulShutdown();
            }
            
            this.isRunning = false;
            console.log('✅ EasyBot gestoppt');
            
            return this;
            
        } catch (error) {
            console.error('❌ EasyBot Stop-Fehler:', error);
            throw error;
        }
    }

    // ===== MESSAGE HANDLING =====
    
    async handleMessage(msg) {
        try {
            const text = msg.body?.toLowerCase() || '';
            
            // Rules durchgehen
            for (const rule of this.rules) {
                if (this.matchesRule(text, rule.trigger)) {
                    await rule.execute(msg);
                    break; // Nur erste passende Rule ausführen
                }
            }
            
            // Commands prüfen
            for (const [cmd, response] of this.commands) {
                if (text === cmd.toLowerCase()) {
                    await msg.reply(response);
                    break;
                }
            }
            
            // Auto-Responses prüfen
            for (const [trigger, response] of this.autoResponses) {
                if (text.includes(trigger.toLowerCase())) {
                    await msg.reply(response);
                    break;
                }
            }
            
        } catch (error) {
            console.error('❌ Message handling error:', error);
        }
    }

    matchesRule(text, trigger) {
        if (typeof trigger === 'string') {
            return text.includes(trigger.toLowerCase());
        } else if (trigger instanceof RegExp) {
            return trigger.test(text);
        }
        return false;
    }

    // ===== UTILITY METHODS =====
    
    status() {
        return {
            running: this.isRunning,
            rules: this.rules.length,
            commands: this.commands.size,
            autoResponses: this.autoResponses.size,
            multiDevice: this.isMultiDevice
        };
    }

    // ===== ADVANCED FEATURES =====
    
    enableAI() {
        if (this.client) {
            this.client.enableAI();
        }
        return this;
    }

    enableAll() {
        this.enableDefaults();
        this.enableAI();
        return this;
    }

    enableDefaults() {
        this.settings.autoGreeting = true;
        this.settings.autoHelp = true;
        this.settings.typingEnabled = true;
        this.settings.reactionsEnabled = true;
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

    // Actions - Return this for action chaining within rule
    reply(text) {
        this.actions.push({ type: 'reply', value: text });
        return this;
    }

    send(text) {
        this.actions.push({ type: 'reply', value: text });
        return this;
    }

    react(emoji) {
        this.actions.push({ type: 'react', value: emoji });
        return this;
    }

    type(seconds = 2) {
        this.actions.push({ type: 'type', value: seconds * 1000 });
        return this;
    }

    // Execute all actions
    async execute(msg) {
        try {
            for (const action of this.actions) {
                switch (action.type) {
                    case 'reply':
                        await msg.reply(action.value);
                        break;
                    case 'react':
                        await msg.react(action.value);
                        break;
                    case 'type':
                        await new Promise(resolve => setTimeout(resolve, action.value));
                        break;
                }
            }
        } catch (error) {
            console.error('❌ Rule execution error:', error);
        }
    }
}