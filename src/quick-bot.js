// 🚀 QuickBot - WIRKLICH einfache WhatsApp Bot API
import { WhatsAppClient } from "./client.js";

export class QuickBot {
    constructor() {
        this.client = new WhatsAppClient({ 
            authDir: './auth', 
            quietHeartbeat: true,
            logLevel: 'silent'
        });
        this.responses = new Map();
    }

    // Einfache Antworten
    when(trigger, response) {
        this.responses.set(trigger.toLowerCase(), response);
        return this;
    }

    // Alias für when
    on(trigger, response) {
        return this.when(trigger, response);
    }

    // Bot starten
    async start() {
        // Message Handler
        this.client.on('message', async (msg) => {
            if (msg.isCommand) return; // Skip commands
            
            const text = msg.text?.toLowerCase() || '';
            
            // Check responses
            for (const [trigger, response] of this.responses) {
                if (text === trigger || text.includes(trigger)) {
                    const reply = typeof response === 'function' ? await response(msg) : response;
                    await msg.reply(reply);
                    return;
                }
            }
        });

        await this.client.connect();
        console.log('🚀 QuickBot started!');
        return this;
    }

    // Bot stoppen
    async stop() {
        await this.client.disconnect();
        return this;
    }
}

// Factory function für noch einfachere Verwendung
export function quickBot() {
    return new QuickBot();
}

// Super einfache One-Liner API
export function createBot() {
    return new QuickBot();
}