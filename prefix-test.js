// Test für Chat-spezifische Prefixes
import { WhatsAppClient } from "./src/index.js";

async function prefixTest() {
    console.log("🎯 Prefix-System Test...");
    
    const client = new WhatsAppClient({
        authDir: "./auth",
        logLevel: "silent",
        browser: ["PrefixTest", "1.0.0", ""],
        printQR: true
    });

    // Standard Global Prefix
    client.setPrefix("!");

    // ===== SETPREFIX COMMAND =====
    client.addCommand('setprefix', async (msg, args) => {
        // Nur Admins können Prefix ändern
        if (msg.isGroup && !(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können den Prefix ändern!');
        }

        if (args.length === 0) {
            const currentPrefix = client.getChatPrefix(msg.from);
            return msg.reply(`🎯 Aktueller Prefix: "${currentPrefix}"`);
        }

        const newPrefix = args[0];
        
        // Validierung
        if (newPrefix.length > 5) {
            return msg.reply('❌ Prefix darf maximal 5 Zeichen lang sein!');
        }

        if (newPrefix.includes(' ')) {
            return msg.reply('❌ Prefix darf keine Leerzeichen enthalten!');
        }

        try {
            client.setChatPrefix(msg.from, newPrefix);
            await msg.reply(`✅ Prefix geändert zu: "${newPrefix}"\n\nBeispiel: ${newPrefix}help`);
        } catch (error) {
            await msg.reply(`❌ Fehler: ${error.message}`);
        }
    });

    // ===== PREFIX INFO COMMAND =====
    client.addCommand('prefixinfo', async (msg) => {
        const chatPrefix = client.getChatPrefix(msg.from);
        const stats = client.getPrefixStats();
        
        let info = `🎯 **Prefix Information**\n\n`;
        info += `📍 **Dieser Chat:** "${chatPrefix}"\n`;
        info += `🌐 **Global Standard:** "${stats.defaultPrefix}"\n`;
        info += `📊 **Gesamt Chats:** ${stats.totalChats}\n`;
        info += `🏆 **Meist verwendet:** "${stats.mostUsedPrefix}"\n\n`;
        
        if (msg.isGroup && await msg.isAdmin()) {
            info += `⚙️ **Admin Commands:**\n`;
            info += `${chatPrefix}setprefix <prefix> - Prefix ändern\n`;
            info += `${chatPrefix}resetprefix - Auf Standard zurücksetzen`;
        }
        
        await msg.reply(info);
    });

    // ===== RESET PREFIX COMMAND =====
    client.addCommand('resetprefix', async (msg) => {
        if (msg.isGroup && !(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können den Prefix zurücksetzen!');
        }

        const success = client.removeChatPrefix(msg.from);
        const newPrefix = client.getChatPrefix(msg.from);
        
        if (success) {
            await msg.reply(`🔄 Prefix zurückgesetzt auf Standard: "${newPrefix}"`);
        } else {
            await msg.reply(`ℹ️ Bereits Standard-Prefix: "${newPrefix}"`);
        }
    });

    // ===== ALLE PREFIXES ANZEIGEN (NUR OWNER) =====
    client.addCommand('allprefixes', async (msg) => {
        // Nur für Bot Owner (du kannst hier deine JID eintragen)
        const ownerJid = "DEINE_NUMMER@s.whatsapp.net"; // Ändere das!
        
        if (msg.getSender() !== ownerJid) {
            return msg.reply('❌ Nur für Bot Owner!');
        }

        const allPrefixes = client.getAllPrefixes();
        const stats = client.getPrefixStats();
        
        let list = `📋 **Alle Chat-Prefixes** (${stats.totalChats})\n\n`;
        
        if (Object.keys(allPrefixes).length === 0) {
            list += `ℹ️ Keine benutzerdefinierten Prefixes gesetzt.\nAlle Chats nutzen Standard: "${stats.defaultPrefix}"`;
        } else {
            for (const [chatId, prefix] of Object.entries(allPrefixes)) {
                const chatName = chatId.includes('@g.us') ? 'Gruppe' : 'Privat';
                list += `${prefix} - ${chatName} (${chatId.substring(0, 15)}...)\n`;
            }
        }
        
        await msg.reply(list);
    });

    // ===== TEST COMMANDS =====
    client.addCommand('help', async (msg) => {
        const prefix = client.getChatPrefix(msg.from);
        
        let help = `🤖 **Bot Commands** (Prefix: "${prefix}")\n\n`;
        help += `${prefix}help - Diese Hilfe\n`;
        help += `${prefix}ping - Ping Test\n`;
        help += `${prefix}prefixinfo - Prefix Informationen\n`;
        
        if (msg.isGroup) {
            help += `\n👑 **Admin Commands:**\n`;
            help += `${prefix}setprefix <prefix> - Prefix ändern\n`;
            help += `${prefix}resetprefix - Prefix zurücksetzen\n`;
        }
        
        await msg.reply(help);
    });

    client.addCommand('ping', async (msg) => {
        const prefix = client.getChatPrefix(msg.from);
        await msg.reply(`🏓 Pong! (Prefix: "${prefix}")`);
    });

    // ===== EVENTS =====
    client.on('connected', () => {
        console.log("✅ Prefix-Test Bot verbunden!");
        console.log("🎯 Features:");
        console.log("   - Chat-spezifische Prefixes");
        console.log("   - Persistent gespeichert");
        console.log("   - Admin-only Änderungen");
        console.log("   - Automatische Validierung");
    });

    client.on('message', async (msg) => {
        // Debug: Zeige welcher Prefix verwendet wird
        if (msg.isCommand) {
            console.log(`🎯 Command "${msg.command}" mit Prefix "${msg.prefix}" in ${msg.from}`);
        }
    });

    try {
        await client.connect();
        
        console.log("\n🎯 Prefix-Test Commands:");
        console.log("   - !setprefix <prefix> → Prefix für Chat setzen (Admin only)");
        console.log("   - !prefixinfo → Prefix Informationen anzeigen");
        console.log("   - !resetprefix → Prefix zurücksetzen (Admin only)");
        console.log("   - !help → Hilfe anzeigen");
        console.log("   - !ping → Ping Test");
        console.log("   - !allprefixes → Alle Prefixes (Owner only)");
        
    } catch (error) {
        console.error("❌ Prefix-Test Fehler:", error);
    }
}

prefixTest();