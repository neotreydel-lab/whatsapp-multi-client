// EasyBot Advanced Features Integration
// Einfache APIs für alle Advanced Features

export class EasyAdvanced {
    constructor(easyBot) {
        this.bot = easyBot;
        this.client = easyBot.client;
    }

    // ===== EASY MEDIA METHODS =====
    
    voice(audioPath) {
        this.bot.rules.push({
            type: 'voice',
            audioPath: audioPath,
            execute: async (msg) => {
                const mentions = msg.getMentions();
                if (mentions.length > 0) {
                    return await msg.sendVoiceToMentioned(audioPath);
                } else {
                    return await msg.sendVoiceMessage(audioPath);
                }
            }
        });
        return this.bot;
    }

    videoMessage(videoPath) {
        this.bot.rules.push({
            type: 'videoMessage',
            videoPath: videoPath,
            execute: async (msg) => {
                const mentions = msg.getMentions();
                if (mentions.length > 0) {
                    return await msg.sendVideoMessageToMentioned(videoPath);
                } else {
                    return await msg.sendVideoMessage(videoPath);
                }
            }
        });
        return this.bot;
    }

    gif(gifPath, caption = "") {
        this.bot.rules.push({
            type: 'gif',
            gifPath: gifPath,
            caption: caption,
            execute: async (msg) => {
                const mentions = msg.getMentions();
                if (mentions.length > 0) {
                    return await msg.sendGifToMentioned(gifPath, caption);
                } else {
                    return await msg.sendGif(gifPath, caption);
                }
            }
        });
        return this.bot;
    }

    // ===== EASY MESSAGE METHODS =====
    
    forward(targetChat = null) {
        this.bot.rules.push({
            type: 'forward',
            targetChat: targetChat,
            execute: async (msg) => {
                if (targetChat) {
                    return await msg.forward(targetChat);
                } else {
                    const mentions = msg.getMentions();
                    if (mentions.length > 0) {
                        return await msg.forwardToMentioned();
                    } else {
                        return await msg.forwardToSender();
                    }
                }
            }
        });
        return this.bot;
    }

    pin() {
        this.bot.rules.push({
            type: 'pin',
            execute: async (msg) => {
                if (!msg.isGroup) {
                    return await msg.reply('❌ Pin funktioniert nur in Gruppen!');
                }
                
                if (!(await msg.isAdmin())) {
                    return await msg.reply('❌ Nur Admins können pinnen!');
                }
                
                return await msg.pin();
            }
        });
        return this.bot;
    }

    star() {
        this.bot.rules.push({
            type: 'star',
            execute: async (msg) => {
                return await msg.star();
            }
        });
        return this.bot;
    }

    quote(text) {
        this.bot.rules.push({
            type: 'quote',
            text: text,
            execute: async (msg) => {
                return await msg.quote(text);
            }
        });
        return this.bot;
    }

    // ===== EASY RICH CONTENT METHODS =====
    
    buttons(text, buttonList, footer = "") {
        this.bot.rules.push({
            type: 'buttons',
            text: text,
            buttons: buttonList,
            footer: footer,
            execute: async (msg) => {
                return await msg.sendButtons(text, buttonList, footer);
            }
        });
        return this.bot;
    }

    list(title, description, buttonText, sections) {
        this.bot.rules.push({
            type: 'list',
            title: title,
            description: description,
            buttonText: buttonText,
            sections: sections,
            execute: async (msg) => {
                return await msg.sendList(title, description, buttonText, sections);
            }
        });
        return this.bot;
    }

    // ===== EASY GROUP METHODS =====
    
    groupInfo() {
        this.bot.rules.push({
            type: 'groupInfo',
            execute: async (msg) => {
                if (!msg.isGroup) {
                    return await msg.reply('❌ Nur in Gruppen verfügbar!');
                }

                const metadata = await this.client.get.GroupMetadata(msg.from);
                let info = `🏢 **Gruppeninfo**\n\n`;
                info += `📝 Name: ${metadata.subject}\n`;
                info += `👥 Mitglieder: ${metadata.participants.length}\n`;
                info += `👑 Admins: ${metadata.participants.filter(p => p.admin).length}\n`;
                info += `📅 Erstellt: ${new Date(metadata.creation * 1000).toLocaleDateString()}\n`;
                if (metadata.desc) info += `📄 Beschreibung: ${metadata.desc}\n`;

                return await msg.reply(info);
            }
        });
        return this.bot;
    }

    inviteLink() {
        this.bot.rules.push({
            type: 'inviteLink',
            execute: async (msg) => {
                if (!msg.isGroup) {
                    return await msg.reply('❌ Nur in Gruppen verfügbar!');
                }

                if (!(await msg.isAdmin())) {
                    return await msg.reply('❌ Nur Admins können Einladungslinks erstellen!');
                }

                try {
                    const inviteLink = await this.client.group.getInviteLink(msg.from);
                    return await msg.reply(`🔗 **Einladungslink:**\n${inviteLink}`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this.bot;
    }

    // ===== EASY PRIVACY METHODS =====
    
    block() {
        this.bot.rules.push({
            type: 'block',
            execute: async (msg) => {
                const mentions = msg.getMentions();
                const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
                
                try {
                    await this.client.privacy.block(targetJid);
                    return await msg.reply(`🚫 User blockiert!`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this.bot;
    }

    unblock() {
        this.bot.rules.push({
            type: 'unblock',
            execute: async (msg) => {
                const mentions = msg.getMentions();
                const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
                
                try {
                    await this.client.privacy.unblock(targetJid);
                    return await msg.reply(`✅ User entblockiert!`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this.bot;
    }

    // ===== EASY ANALYTICS METHODS =====
    
    checkOnline() {
        this.bot.rules.push({
            type: 'checkOnline',
            execute: async (msg) => {
                const mentions = msg.getMentions();
                const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
                
                try {
                    const isOnline = await this.client.analytics.isOnline(targetJid);
                    const userNumber = targetJid.split('@')[0].split(':')[0];
                    return await msg.reply(`📱 +${userNumber} ist ${isOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this.bot;
    }

    archive() {
        this.bot.rules.push({
            type: 'archive',
            execute: async (msg) => {
                try {
                    await this.client.analytics.archiveChat(msg.from);
                    return await msg.reply(`📦 Chat archiviert!`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this.bot;
    }

    mute(duration = 8 * 60 * 60 * 1000) { // 8 Stunden default
        this.bot.rules.push({
            type: 'mute',
            duration: duration,
            execute: async (msg) => {
                try {
                    await this.client.analytics.muteChat(msg.from, duration);
                    return await msg.reply(`🔇 Chat für ${Math.round(duration / 60000)} Minuten stummgeschaltet!`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this.bot;
    }

    // ===== EASY STATUS METHODS =====
    
    sendStatus(text, options = {}) {
        this.bot.rules.push({
            type: 'sendStatus',
            text: text,
            options: options,
            execute: async (msg) => {
                try {
                    await this.client.status.send('text', text, options);
                    return await msg.reply(`📢 Status gesendet: "${text}"`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this.bot;
    }

    // ===== EASY SYSTEM METHODS =====
    
    backup() {
        this.bot.rules.push({
            type: 'backup',
            execute: async (msg) => {
                try {
                    await msg.reply('💾 Erstelle Backup...');
                    const backup = await this.client.system.backup();
                    return await msg.reply(`✅ Backup erstellt! Timestamp: ${backup.timestamp}`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this.bot;
    }

    // ===== CHAINING METHODS =====
    
    done() {
        return this.bot;
    }
}

// ===== EASY ADVANCED RULE CLASS =====

export class EasyAdvancedRule {
    constructor(trigger, bot) {
        this.trigger = trigger;
        this.bot = bot;
        this.actions = [];
        this.advanced = new EasyAdvanced(bot);
    }

    // Advanced Media Actions
    voice(audioPath) {
        this.actions.push({
            type: 'voice',
            audioPath: audioPath,
            execute: async (msg) => {
                const mentions = msg.getMentions();
                if (mentions.length > 0) {
                    return await msg.sendVoiceToMentioned(audioPath);
                } else {
                    return await msg.sendVoiceMessage(audioPath);
                }
            }
        });
        return this;
    }

    videoMessage(videoPath) {
        this.actions.push({
            type: 'videoMessage',
            videoPath: videoPath,
            execute: async (msg) => {
                const mentions = msg.getMentions();
                if (mentions.length > 0) {
                    return await msg.sendVideoMessageToMentioned(videoPath);
                } else {
                    return await msg.sendVideoMessage(videoPath);
                }
            }
        });
        return this;
    }

    gif(gifPath, caption = "") {
        this.actions.push({
            type: 'gif',
            gifPath: gifPath,
            caption: caption,
            execute: async (msg) => {
                const mentions = msg.getMentions();
                if (mentions.length > 0) {
                    return await msg.sendGifToMentioned(gifPath, caption);
                } else {
                    return await msg.sendGif(gifPath, caption);
                }
            }
        });
        return this;
    }

    // Advanced Message Actions
    forward(targetChat = null) {
        this.actions.push({
            type: 'forward',
            targetChat: targetChat,
            execute: async (msg) => {
                if (targetChat) {
                    return await msg.forward(targetChat);
                } else {
                    const mentions = msg.getMentions();
                    if (mentions.length > 0) {
                        return await msg.forwardToMentioned();
                    } else {
                        return await msg.forwardToSender();
                    }
                }
            }
        });
        return this;
    }

    pin() {
        this.actions.push({
            type: 'pin',
            execute: async (msg) => {
                if (!msg.isGroup) {
                    return await msg.reply('❌ Pin funktioniert nur in Gruppen!');
                }
                
                if (!(await msg.isAdmin())) {
                    return await msg.reply('❌ Nur Admins können pinnen!');
                }
                
                return await msg.pin();
            }
        });
        return this;
    }

    star() {
        this.actions.push({
            type: 'star',
            execute: async (msg) => {
                return await msg.star();
            }
        });
        return this;
    }

    quote(text) {
        this.actions.push({
            type: 'quote',
            text: text,
            execute: async (msg) => {
                return await msg.quote(text);
            }
        });
        return this;
    }

    // Rich Content Actions
    buttons(text, buttonList, footer = "") {
        this.actions.push({
            type: 'buttons',
            text: text,
            buttons: buttonList,
            footer: footer,
            execute: async (msg) => {
                return await msg.sendButtons(text, buttonList, footer);
            }
        });
        return this;
    }

    list(title, description, buttonText, sections) {
        this.actions.push({
            type: 'list',
            title: title,
            description: description,
            buttonText: buttonText,
            sections: sections,
            execute: async (msg) => {
                return await msg.sendList(title, description, buttonText, sections);
            }
        });
        return this;
    }

    // Group Actions
    groupInfo() {
        this.actions.push({
            type: 'groupInfo',
            execute: async (msg) => {
                if (!msg.isGroup) {
                    return await msg.reply('❌ Nur in Gruppen verfügbar!');
                }

                const metadata = await this.bot.client.get.GroupMetadata(msg.from);
                let info = `🏢 **Gruppeninfo**\n\n`;
                info += `📝 Name: ${metadata.subject}\n`;
                info += `👥 Mitglieder: ${metadata.participants.length}\n`;
                info += `👑 Admins: ${metadata.participants.filter(p => p.admin).length}\n`;
                info += `📅 Erstellt: ${new Date(metadata.creation * 1000).toLocaleDateString()}\n`;
                if (metadata.desc) info += `📄 Beschreibung: ${metadata.desc}\n`;

                return await msg.reply(info);
            }
        });
        return this;
    }

    inviteLink() {
        this.actions.push({
            type: 'inviteLink',
            execute: async (msg) => {
                if (!msg.isGroup) {
                    return await msg.reply('❌ Nur in Gruppen verfügbar!');
                }

                if (!(await msg.isAdmin())) {
                    return await msg.reply('❌ Nur Admins können Einladungslinks erstellen!');
                }

                try {
                    const inviteLink = await this.bot.client.group.getInviteLink(msg.from);
                    return await msg.reply(`🔗 **Einladungslink:**\n${inviteLink}`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this;
    }

    // Privacy Actions
    block() {
        this.actions.push({
            type: 'block',
            execute: async (msg) => {
                const mentions = msg.getMentions();
                const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
                
                try {
                    await this.bot.client.privacy.block(targetJid);
                    return await msg.reply(`🚫 User blockiert!`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this;
    }

    unblock() {
        this.actions.push({
            type: 'unblock',
            execute: async (msg) => {
                const mentions = msg.getMentions();
                const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
                
                try {
                    await this.bot.client.privacy.unblock(targetJid);
                    return await msg.reply(`✅ User entblockiert!`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this;
    }

    // Analytics Actions
    checkOnline() {
        this.actions.push({
            type: 'checkOnline',
            execute: async (msg) => {
                const mentions = msg.getMentions();
                const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
                
                try {
                    const isOnline = await this.bot.client.analytics.isOnline(targetJid);
                    const userNumber = targetJid.split('@')[0].split(':')[0];
                    return await msg.reply(`📱 +${userNumber} ist ${isOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this;
    }

    archive() {
        this.actions.push({
            type: 'archive',
            execute: async (msg) => {
                try {
                    await this.bot.client.analytics.archiveChat(msg.from);
                    return await msg.reply(`📦 Chat archiviert!`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this;
    }

    mute(duration = 8 * 60 * 60 * 1000) { // 8 Stunden default
        this.actions.push({
            type: 'mute',
            duration: duration,
            execute: async (msg) => {
                try {
                    await this.bot.client.analytics.muteChat(msg.from, duration);
                    return await msg.reply(`🔇 Chat für ${Math.round(duration / 60000)} Minuten stummgeschaltet!`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this;
    }

    // Status Actions
    sendStatus(text, options = {}) {
        this.actions.push({
            type: 'sendStatus',
            text: text,
            options: options,
            execute: async (msg) => {
                try {
                    await this.bot.client.status.send('text', text, options);
                    return await msg.reply(`📢 Status gesendet: "${text}"`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this;
    }

    // System Actions
    backup() {
        this.actions.push({
            type: 'backup',
            execute: async (msg) => {
                try {
                    await msg.reply('💾 Erstelle Backup...');
                    const backup = await this.bot.client.system.backup();
                    return await msg.reply(`✅ Backup erstellt! Timestamp: ${backup.timestamp}`);
                } catch (error) {
                    return await msg.reply(`❌ Fehler: ${error.message}`);
                }
            }
        });
        return this;
    }

    done() {
        // Regel zur Bot-Liste hinzufügen
        this.bot.rules.push({
            trigger: this.trigger,
            actions: this.actions,
            execute: async (msg) => {
                for (const action of this.actions) {
                    try {
                        await action.execute(msg);
                        
                        // Kleine Pause zwischen Actions für bessere UX
                        if (this.actions.length > 1) {
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    } catch (error) {
                        console.error(`❌ Action ${action.type} fehlgeschlagen:`, error);
                        await msg.reply(`❌ ${action.type} Fehler: ${error.message}`);
                    }
                }
            }
        });
        
        return this.bot;
    }
}