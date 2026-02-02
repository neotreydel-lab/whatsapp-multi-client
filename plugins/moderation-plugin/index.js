// 🛡️ Moderation Plugin
export default class ModerationPlugin {
    constructor(client) {
        this.client = client;
        this.name = 'moderation-plugin';
        this.version = '1.0.0';
        this.description = 'Erweiterte Moderation mit Auto-Mod, Spam-Schutz und Admin-Tools';
        
        this.spamTracker = new Map();
        this.autoModSettings = {
            maxMessages: 5,
            timeWindow: 10000, // 10 Sekunden
            banWords: ['spam', 'werbung', 'fake', 'scam'],
            maxCapsPercent: 70,
            maxEmojis: 10
        };
        
        this.initAutoMod();
    }

    initAutoMod() {
        // Auto-Moderation bei jeder Nachricht
        this.client.on('message', async (msg) => {
            if (!msg.isGroup || msg.fromMe) return;
            
            const groupId = msg.from;
            const userId = msg.getSender();
            
            // Prüfe Auto-Mod Einstellungen für Gruppe
            const autoModEnabled = this.client.storage.read.from('moderation').get(`${groupId}.autoMod`) || false;
            
            if (autoModEnabled && !msg.isAdmin()) {
                await this.checkMessage(msg);
            }
        });
    }

    async checkMessage(msg) {
        const groupId = msg.from;
        const userId = msg.getSender();
        const text = msg.text || '';
        
        let violations = [];
        
        // Spam-Check
        if (this.isSpam(userId, text)) {
            violations.push('Spam');
        }
        
        // Banned Words Check
        if (this.containsBannedWords(text)) {
            violations.push('Verbotene Wörter');
        }
        
        // Caps Check
        if (this.isTooMuchCaps(text)) {
            violations.push('Zu viele Großbuchstaben');
        }
        
        // Emoji Check
        if (this.tooManyEmojis(text)) {
            violations.push('Zu viele Emojis');
        }
        
        if (violations.length > 0) {
            await this.handleViolation(msg, violations);
        }
    }

    isSpam(userId, text) {
        const now = Date.now();
        
        if (!this.spamTracker.has(userId)) {
            this.spamTracker.set(userId, []);
        }
        
        const userMessages = this.spamTracker.get(userId);
        
        // Alte Nachrichten entfernen
        const filtered = userMessages.filter(time => now - time < this.autoModSettings.timeWindow);
        
        filtered.push(now);
        this.spamTracker.set(userId, filtered);
        
        return filtered.length > this.autoModSettings.maxMessages;
    }

    containsBannedWords(text) {
        const lowerText = text.toLowerCase();
        return this.autoModSettings.banWords.some(word => lowerText.includes(word));
    }

    isTooMuchCaps(text) {
        if (text.length < 10) return false;
        
        const capsCount = (text.match(/[A-Z]/g) || []).length;
        const capsPercent = (capsCount / text.length) * 100;
        
        return capsPercent > this.autoModSettings.maxCapsPercent;
    }

    tooManyEmojis(text) {
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        const emojis = text.match(emojiRegex) || [];
        
        return emojis.length > this.autoModSettings.maxEmojis;
    }

    async handleViolation(msg, violations) {
        const groupId = msg.from;
        const userId = msg.getSender();
        
        // Warnung hinzufügen
        this.client.storage.write.in('moderation').increment(`${groupId}.warnings.${userId}`, 1);
        const warnings = this.client.storage.read.from('moderation').get(`${groupId}.warnings.${userId}`) || 0;
        
        // Nachricht löschen
        try {
            await msg.delete();
        } catch (error) {
            console.log('⚠️ Konnte Nachricht nicht löschen');
        }
        
        // Warnung senden
        let warnText = `⚠️ **Auto-Moderation**\n\n`;
        warnText += `👤 User: @${userId.split('@')[0]}\n`;
        warnText += `📋 Verstöße: ${violations.join(', ')}\n`;
        warnText += `⚠️ Warnungen: ${warnings}/3\n\n`;
        
        if (warnings >= 3) {
            warnText += `🚫 **Automatischer Kick nach 3 Warnungen!**`;
            
            try {
                await this.client.removeParticipant(groupId, userId);
            } catch (error) {
                warnText += `\n❌ Kick fehlgeschlagen - Keine Admin-Rechte`;
            }
        } else {
            warnText += `💡 Bitte beachte die Gruppenregeln!`;
        }
        
        await msg.reply(warnText, [userId]);
    }

    async getUserWarnings(groupId, userId) {
        return this.client.storage.read.from('moderation').get(`${groupId}.warnings.${userId}`) || 0;
    }

    async clearWarnings(groupId, userId) {
        this.client.storage.delete.from('moderation').key(`${groupId}.warnings.${userId}`);
    }

    async getModerationStats(groupId) {
        const warnings = this.client.storage.read.from('moderation').get(`${groupId}.warnings`) || {};
        const autoMod = this.client.storage.read.from('moderation').get(`${groupId}.autoMod`) || false;
        
        return {
            totalWarnings: Object.values(warnings).reduce((sum, count) => sum + count, 0),
            usersWithWarnings: Object.keys(warnings).length,
            autoModEnabled: autoMod,
            topOffenders: Object.entries(warnings)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([user, count]) => ({ user, warnings: count }))
        };
    }

    getCommands() {
        return {
            'warn': this.handleWarn.bind(this),
            'unwarn': this.handleUnwarn.bind(this),
            'warnings': this.handleWarnings.bind(this),
            'kick': this.handleKick.bind(this),
            'ban': this.handleBan.bind(this),
            'unban': this.handleUnban.bind(this),
            'mute': this.handleMute.bind(this),
            'unmute': this.handleUnmute.bind(this),
            'automod': this.handleAutoMod.bind(this),
            'modstats': this.handleModStats.bind(this),
            'rules': this.handleRules.bind(this),
            'setrules': this.handleSetRules.bind(this),
            'purge': this.handlePurge.bind(this)
        };
    }

    async handleWarn(msg, args) {
        if (!msg.isGroup || !msg.isAdmin()) {
            return msg.reply('❌ Nur Admins können Warnungen vergeben!');
        }

        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !warn @user [grund]\n\n⚠️ Beispiel: !warn @user Spam');
        }

        const mentionedUsers = msg.getMentionedUsers();
        if (mentionedUsers.length === 0) {
            return msg.reply('❌ Bitte erwähne einen User zum Warnen!');
        }

        const targetUser = mentionedUsers[0];
        const reason = args.slice(1).join(' ') || 'Kein Grund angegeben';
        const groupId = msg.from;
        
        // Warnung hinzufügen
        this.client.storage.write.in('moderation').increment(`${groupId}.warnings.${targetUser}`, 1);
        const warnings = this.client.storage.read.from('moderation').get(`${groupId}.warnings.${targetUser}`) || 0;
        
        let warnText = `⚠️ **Warnung vergeben**\n\n`;
        warnText += `👤 User: @${targetUser.split('@')[0]}\n`;
        warnText += `📝 Grund: ${reason}\n`;
        warnText += `⚠️ Warnungen: ${warnings}/3\n`;
        warnText += `👮 Admin: @${msg.getSender().split('@')[0]}`;
        
        if (warnings >= 3) {
            warnText += `\n\n🚫 **3 Warnungen erreicht - Automatischer Kick!**`;
            
            try {
                await this.client.removeParticipant(groupId, targetUser);
            } catch (error) {
                warnText += `\n❌ Kick fehlgeschlagen`;
            }
        }
        
        await msg.reply(warnText, [targetUser, msg.getSender()]);
    }

    async handleUnwarn(msg, args) {
        if (!msg.isGroup || !msg.isAdmin()) {
            return msg.reply('❌ Nur Admins können Warnungen entfernen!');
        }

        const mentionedUsers = msg.getMentionedUsers();
        if (mentionedUsers.length === 0) {
            return msg.reply('❌ Bitte erwähne einen User!');
        }

        const targetUser = mentionedUsers[0];
        const groupId = msg.from;
        
        const currentWarnings = this.client.storage.read.from('moderation').get(`${groupId}.warnings.${targetUser}`) || 0;
        
        if (currentWarnings === 0) {
            return msg.reply('❌ User hat keine Warnungen!');
        }
        
        this.client.storage.write.in('moderation').increment(`${groupId}.warnings.${targetUser}`, -1);
        const newWarnings = this.client.storage.read.from('moderation').get(`${groupId}.warnings.${targetUser}`) || 0;
        
        let unwarnText = `✅ **Warnung entfernt**\n\n`;
        unwarnText += `👤 User: @${targetUser.split('@')[0]}\n`;
        unwarnText += `⚠️ Warnungen: ${newWarnings}/3\n`;
        unwarnText += `👮 Admin: @${msg.getSender().split('@')[0]}`;
        
        await msg.reply(unwarnText, [targetUser, msg.getSender()]);
    }

    async handleWarnings(msg, args) {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }

        const groupId = msg.from;
        const mentionedUsers = msg.getMentionedUsers();
        
        if (mentionedUsers.length > 0) {
            // Warnungen für spezifischen User
            const targetUser = mentionedUsers[0];
            const warnings = await this.getUserWarnings(groupId, targetUser);
            
            let warningsText = `⚠️ **Warnungen für @${targetUser.split('@')[0]}**\n\n`;
            warningsText += `📊 Aktuelle Warnungen: ${warnings}/3`;
            
            await msg.reply(warningsText, [targetUser]);
        } else {
            // Alle Warnungen in der Gruppe
            const allWarnings = this.client.storage.read.from('moderation').get(`${groupId}.warnings`) || {};
            
            if (Object.keys(allWarnings).length === 0) {
                return msg.reply('✅ Keine Warnungen in dieser Gruppe!');
            }
            
            let warningsText = `⚠️ **Gruppen-Warnungen**\n\n`;
            
            Object.entries(allWarnings)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .forEach(([user, count]) => {
                    warningsText += `• @${user.split('@')[0]}: ${count}/3\n`;
                });
            
            await msg.reply(warningsText);
        }
    }

    async handleKick(msg, args) {
        if (!msg.isGroup || !msg.isAdmin()) {
            return msg.reply('❌ Nur Admins können User kicken!');
        }

        const mentionedUsers = msg.getMentionedUsers();
        if (mentionedUsers.length === 0) {
            return msg.reply('❌ Bitte erwähne einen User zum Kicken!');
        }

        const targetUser = mentionedUsers[0];
        const reason = args.slice(1).join(' ') || 'Kein Grund angegeben';
        const groupId = msg.from;
        
        try {
            await this.client.removeParticipant(groupId, targetUser);
            
            let kickText = `🚫 **User gekickt**\n\n`;
            kickText += `👤 User: @${targetUser.split('@')[0]}\n`;
            kickText += `📝 Grund: ${reason}\n`;
            kickText += `👮 Admin: @${msg.getSender().split('@')[0]}`;
            
            await msg.reply(kickText, [msg.getSender()]);
        } catch (error) {
            await msg.reply('❌ Kick fehlgeschlagen - Keine Admin-Rechte oder User nicht gefunden!');
        }
    }

    async handleAutoMod(msg, args) {
        if (!msg.isGroup || !msg.isAdmin()) {
            return msg.reply('❌ Nur Admins können Auto-Moderation verwalten!');
        }

        const groupId = msg.from;
        
        if (args.length === 0) {
            const autoMod = this.client.storage.read.from('moderation').get(`${groupId}.autoMod`) || false;
            
            let autoModText = `🤖 **Auto-Moderation Status**\n\n`;
            autoModText += `📊 Status: ${autoMod ? '✅ Aktiviert' : '❌ Deaktiviert'}\n\n`;
            autoModText += `⚙️ **Einstellungen:**\n`;
            autoModText += `• Max Nachrichten: ${this.autoModSettings.maxMessages} in ${this.autoModSettings.timeWindow/1000}s\n`;
            autoModText += `• Verbotene Wörter: ${this.autoModSettings.banWords.length}\n`;
            autoModText += `• Max Großbuchstaben: ${this.autoModSettings.maxCapsPercent}%\n`;
            autoModText += `• Max Emojis: ${this.autoModSettings.maxEmojis}\n\n`;
            autoModText += `💡 Verwende: !automod on/off`;
            
            return msg.reply(autoModText);
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on') {
            this.client.storage.write.in('moderation').set(`${groupId}.autoMod`, true);
            await msg.reply('✅ **Auto-Moderation aktiviert!**\n\n🤖 Spam, verbotene Wörter und andere Verstöße werden automatisch erkannt.');
        } else if (action === 'off') {
            this.client.storage.write.in('moderation').set(`${groupId}.autoMod`, false);
            await msg.reply('❌ **Auto-Moderation deaktiviert!**\n\n⚠️ Manuelle Moderation erforderlich.');
        } else {
            await msg.reply('❌ Verwendung: !automod on/off');
        }
    }

    async handleModStats(msg, args) {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }

        const groupId = msg.from;
        const stats = await this.getModerationStats(groupId);
        
        let statsText = `📊 **Moderations-Statistiken**\n\n`;
        statsText += `⚠️ Gesamte Warnungen: ${stats.totalWarnings}\n`;
        statsText += `👥 User mit Warnungen: ${stats.usersWithWarnings}\n`;
        statsText += `🤖 Auto-Mod: ${stats.autoModEnabled ? '✅ An' : '❌ Aus'}\n\n`;
        
        if (stats.topOffenders.length > 0) {
            statsText += `🏆 **Top Regelbrecher:**\n`;
            stats.topOffenders.forEach((offender, index) => {
                statsText += `${index + 1}. @${offender.user.split('@')[0]}: ${offender.warnings} Warnungen\n`;
            });
        }
        
        await msg.reply(statsText);
    }

    async handleRules(msg, args) {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }

        const groupId = msg.from;
        const rules = this.client.storage.read.from('moderation').get(`${groupId}.rules`) || [];
        
        if (rules.length === 0) {
            return msg.reply('📋 **Keine Regeln festgelegt!**\n\n💡 Admins können mit !setrules Regeln hinzufügen.');
        }
        
        let rulesText = `📋 **Gruppenregeln:**\n\n`;
        rules.forEach((rule, index) => {
            rulesText += `${index + 1}. ${rule}\n`;
        });
        
        await msg.reply(rulesText);
    }

    async handleSetRules(msg, args) {
        if (!msg.isGroup || !msg.isAdmin()) {
            return msg.reply('❌ Nur Admins können Regeln festlegen!');
        }

        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !setrules <regel1> | <regel2> | <regel3>\n\n📝 Beispiel: !setrules Kein Spam | Respektvoller Umgang | Keine Werbung');
        }

        const groupId = msg.from;
        const rulesText = args.join(' ');
        const rules = rulesText.split('|').map(rule => rule.trim()).filter(rule => rule.length > 0);
        
        this.client.storage.write.in('moderation').set(`${groupId}.rules`, rules);
        
        let confirmText = `✅ **Regeln aktualisiert!**\n\n📋 **Neue Regeln:**\n`;
        rules.forEach((rule, index) => {
            confirmText += `${index + 1}. ${rule}\n`;
        });
        
        await msg.reply(confirmText);
    }

    async handlePurge(msg, args) {
        if (!msg.isGroup || !msg.isAdmin()) {
            return msg.reply('❌ Nur Admins können Nachrichten löschen!');
        }

        if (args.length === 0) {
            return msg.reply('❌ Verwendung: !purge <anzahl>\n\n🗑️ Beispiel: !purge 10');
        }

        const amount = parseInt(args[0]);
        
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return msg.reply('❌ Anzahl muss zwischen 1 und 100 liegen!');
        }

        await msg.reply(`🗑️ **Purge-Befehl erhalten**\n\n⚠️ Lösche ${amount} Nachrichten...\n💡 Diese Funktion ist experimentell.`);
    }

    // Weitere Moderation-Methoden können hier hinzugefügt werden
    async handleBan(msg, args) {
        await msg.reply('🚫 **Ban-System**\n\n⚠️ Diese Funktion ist in Entwicklung.\n💡 Verwende !kick für sofortiges Entfernen.');
    }

    async handleUnban(msg, args) {
        await msg.reply('✅ **Unban-System**\n\n⚠️ Diese Funktion ist in Entwicklung.');
    }

    async handleMute(msg, args) {
        await msg.reply('🔇 **Mute-System**\n\n⚠️ Diese Funktion ist in Entwicklung.\n💡 WhatsApp unterstützt kein direktes Muting.');
    }

    async handleUnmute(msg, args) {
        await msg.reply('🔊 **Unmute-System**\n\n⚠️ Diese Funktion ist in Entwicklung.');
    }
}
