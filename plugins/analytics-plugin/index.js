// 📊 Analytics Plugin
export default class AnalyticsPlugin {
    constructor(client) {
        this.client = client;
        this.name = 'analytics-plugin';
        this.version = '1.0.0';
        this.description = 'Detaillierte Statistiken und Analytics für Gruppen und User';
        
        this.initTracking();
    }

    initTracking() {
        // Tracking bei jeder Nachricht
        this.client.on('message', async (msg) => {
            if (msg.fromMe) return;
            
            await this.trackMessage(msg);
        });
    }

    async trackMessage(msg) {
        const userId = msg.getSender();
        const groupId = msg.isGroup ? msg.from : 'private';
        const timestamp = Date.now();
        const hour = new Date().getHours();
        const day = new Date().getDay(); // 0 = Sonntag
        const messageLength = msg.text ? msg.text.length : 0;
        
        // User-Statistiken
        this.client.storage.write.in('analytics').increment(`users.${userId}.totalMessages`, 1);
        this.client.storage.write.in('analytics').increment(`users.${userId}.totalChars`, messageLength);
        this.client.storage.write.in('analytics').set(`users.${userId}.lastSeen`, timestamp);
        this.client.storage.write.in('analytics').increment(`users.${userId}.hourly.${hour}`, 1);
        this.client.storage.write.in('analytics').increment(`users.${userId}.daily.${day}`, 1);
        
        // Gruppen-Statistiken (falls Gruppe)
        if (msg.isGroup) {
            this.client.storage.write.in('analytics').increment(`groups.${groupId}.totalMessages`, 1);
            this.client.storage.write.in('analytics').increment(`groups.${groupId}.totalChars`, messageLength);
            this.client.storage.write.in('analytics').increment(`groups.${groupId}.hourly.${hour}`, 1);
            this.client.storage.write.in('analytics').increment(`groups.${groupId}.daily.${day}`, 1);
            this.client.storage.write.in('analytics').increment(`groups.${groupId}.users.${userId}`, 1);
            this.client.storage.write.in('analytics').set(`groups.${groupId}.lastActivity`, timestamp);
        }
        
        // Globale Statistiken
        this.client.storage.write.in('analytics').increment('global.totalMessages', 1);
        this.client.storage.write.in('analytics').increment('global.totalChars', messageLength);
        this.client.storage.write.in('analytics').increment(`global.hourly.${hour}`, 1);
        this.client.storage.write.in('analytics').increment(`global.daily.${day}`, 1);
        
        // Nachrichtentyp tracking
        if (msg.type && msg.type !== 'text') {
            this.client.storage.write.in('analytics').increment(`users.${userId}.mediaMessages`, 1);
            if (msg.isGroup) {
                this.client.storage.write.in('analytics').increment(`groups.${groupId}.mediaMessages`, 1);
            }
        }
        
        // Command tracking
        if (msg.text && msg.text.startsWith('!')) {
            const command = msg.text.split(' ')[0].substring(1);
            this.client.storage.write.in('analytics').increment(`commands.${command}`, 1);
            this.client.storage.write.in('analytics').increment(`users.${userId}.commands`, 1);
        }
    }

    getUserStats(userId) {
        const userStats = this.client.storage.read.from('analytics').get(`users.${userId}`) || {};
        
        return {
            totalMessages: userStats.totalMessages || 0,
            totalChars: userStats.totalChars || 0,
            mediaMessages: userStats.mediaMessages || 0,
            commands: userStats.commands || 0,
            lastSeen: userStats.lastSeen || null,
            avgMessageLength: userStats.totalMessages ? Math.round(userStats.totalChars / userStats.totalMessages) : 0,
            hourly: userStats.hourly || {},
            daily: userStats.daily || {}
        };
    }

    getGroupStats(groupId) {
        const groupStats = this.client.storage.read.from('analytics').get(`groups.${groupId}`) || {};
        
        return {
            totalMessages: groupStats.totalMessages || 0,
            totalChars: groupStats.totalChars || 0,
            mediaMessages: groupStats.mediaMessages || 0,
            lastActivity: groupStats.lastActivity || null,
            users: groupStats.users || {},
            hourly: groupStats.hourly || {},
            daily: groupStats.daily || {},
            activeUsers: Object.keys(groupStats.users || {}).length
        };
    }

    getGlobalStats() {
        const globalStats = this.client.storage.read.from('analytics').get('global') || {};
        
        return {
            totalMessages: globalStats.totalMessages || 0,
            totalChars: globalStats.totalChars || 0,
            hourly: globalStats.hourly || {},
            daily: globalStats.daily || {}
        };
    }

    getTopUsers(limit = 10) {
        const allUsers = this.client.storage.read.from('analytics').get('users') || {};
        
        return Object.entries(allUsers)
            .map(([userId, stats]) => ({
                userId,
                messages: stats.totalMessages || 0,
                chars: stats.totalChars || 0,
                avgLength: stats.totalMessages ? Math.round(stats.totalChars / stats.totalMessages) : 0
            }))
            .sort((a, b) => b.messages - a.messages)
            .slice(0, limit);
    }

    getTopGroups(limit = 10) {
        const allGroups = this.client.storage.read.from('analytics').get('groups') || {};
        
        return Object.entries(allGroups)
            .map(([groupId, stats]) => ({
                groupId,
                messages: stats.totalMessages || 0,
                chars: stats.totalChars || 0,
                users: Object.keys(stats.users || {}).length,
                lastActivity: stats.lastActivity || null
            }))
            .sort((a, b) => b.messages - a.messages)
            .slice(0, limit);
    }

    getTopCommands(limit = 10) {
        const commands = this.client.storage.read.from('analytics').get('commands') || {};
        
        return Object.entries(commands)
            .map(([command, count]) => ({ command, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    getActivityHeatmap(type = 'global') {
        let data;
        
        if (type === 'global') {
            data = this.getGlobalStats();
        } else if (type.startsWith('user:')) {
            const userId = type.split(':')[1];
            data = this.getUserStats(userId);
        } else if (type.startsWith('group:')) {
            const groupId = type.split(':')[1];
            data = this.getGroupStats(groupId);
        }
        
        const hourly = data?.hourly || {};
        const daily = data?.daily || {};
        
        // Stunden-Heatmap (0-23)
        const hourlyHeatmap = [];
        for (let i = 0; i < 24; i++) {
            hourlyHeatmap.push({
                hour: i,
                messages: hourly[i] || 0,
                intensity: this.getIntensity(hourly[i] || 0, Math.max(...Object.values(hourly)))
            });
        }
        
        // Tages-Heatmap (0=Sonntag, 6=Samstag)
        const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const dailyHeatmap = [];
        for (let i = 0; i < 7; i++) {
            dailyHeatmap.push({
                day: i,
                dayName: dayNames[i],
                messages: daily[i] || 0,
                intensity: this.getIntensity(daily[i] || 0, Math.max(...Object.values(daily)))
            });
        }
        
        return { hourlyHeatmap, dailyHeatmap };
    }

    getIntensity(value, max) {
        if (max === 0) return 0;
        const percentage = (value / max) * 100;
        
        if (percentage >= 80) return 5; // 🔥🔥🔥🔥🔥
        if (percentage >= 60) return 4; // 🔥🔥🔥🔥
        if (percentage >= 40) return 3; // 🔥🔥🔥
        if (percentage >= 20) return 2; // 🔥🔥
        if (percentage > 0) return 1;   // 🔥
        return 0; // ⬜
    }

    formatHeatmap(heatmap, type = 'hourly') {
        let result = '';
        
        if (type === 'hourly') {
            result += '🕐 **Stunden-Aktivität (24h):**\n\n';
            
            for (let i = 0; i < 24; i += 6) {
                let line = '';
                for (let j = 0; j < 6 && (i + j) < 24; j++) {
                    const hour = i + j;
                    const data = heatmap.find(h => h.hour === hour);
                    const intensity = data ? data.intensity : 0;
                    const emoji = ['⬜', '🔥', '🔥🔥', '🔥🔥🔥', '🔥🔥🔥🔥', '🔥🔥🔥🔥🔥'][intensity];
                    line += `${hour.toString().padStart(2, '0')}h${emoji} `;
                }
                result += line + '\n';
            }
        } else {
            result += '📅 **Wochen-Aktivität:**\n\n';
            
            heatmap.forEach(day => {
                const emoji = ['⬜', '🔥', '🔥🔥', '🔥🔥🔥', '🔥🔥🔥🔥', '🔥🔥🔥🔥🔥'][day.intensity];
                result += `${day.dayName}: ${emoji} (${day.messages})\n`;
            });
        }
        
        return result;
    }

    getCommands() {
        return {
            'stats': this.handleStats.bind(this),
            'mystats': this.handleMyStats.bind(this),
            'groupstats': this.handleGroupStats.bind(this),
            'globalstats': this.handleGlobalStats.bind(this),
            'topusers': this.handleTopUsers.bind(this),
            'topgroups': this.handleTopGroups.bind(this),
            'topcommands': this.handleTopCommands.bind(this),
            'heatmap': this.handleHeatmap.bind(this),
            'analytics': this.handleAnalytics.bind(this),
            'export': this.handleExport.bind(this)
        };
    }

    async handleStats(msg, args) {
        const mentionedUsers = msg.getMentionedUsers();
        
        if (mentionedUsers.length > 0) {
            // Stats für erwähnten User
            const targetUser = mentionedUsers[0];
            const stats = this.getUserStats(targetUser);
            
            let statsText = `📊 **Statistiken für @${targetUser.split('@')[0]}**\n\n`;
            statsText += `💬 Nachrichten: ${stats.totalMessages.toLocaleString()}\n`;
            statsText += `📝 Zeichen: ${stats.totalChars.toLocaleString()}\n`;
            statsText += `📊 Ø Länge: ${stats.avgMessageLength} Zeichen\n`;
            statsText += `🎮 Commands: ${stats.commands}\n`;
            statsText += `📷 Medien: ${stats.mediaMessages}\n`;
            
            if (stats.lastSeen) {
                const lastSeen = new Date(stats.lastSeen);
                statsText += `👀 Zuletzt: ${lastSeen.toLocaleString('de-DE')}`;
            }
            
            await msg.reply(statsText, [targetUser]);
        } else {
            // Eigene Stats
            await this.handleMyStats(msg, args);
        }
    }

    async handleMyStats(msg, args) {
        const userId = msg.getSender();
        const stats = this.getUserStats(userId);
        
        let statsText = `📊 **Deine Statistiken**\n\n`;
        statsText += `💬 Nachrichten: ${stats.totalMessages.toLocaleString()}\n`;
        statsText += `📝 Zeichen: ${stats.totalChars.toLocaleString()}\n`;
        statsText += `📊 Ø Länge: ${stats.avgMessageLength} Zeichen\n`;
        statsText += `🎮 Commands: ${stats.commands}\n`;
        statsText += `📷 Medien: ${stats.mediaMessages}\n\n`;
        statsText += `💡 Verwende !heatmap für Aktivitätsmuster`;
        
        await msg.reply(statsText);
    }

    async handleGroupStats(msg, args) {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }

        const groupId = msg.from;
        const stats = this.getGroupStats(groupId);
        
        let statsText = `📊 **Gruppen-Statistiken**\n\n`;
        statsText += `💬 Nachrichten: ${stats.totalMessages.toLocaleString()}\n`;
        statsText += `📝 Zeichen: ${stats.totalChars.toLocaleString()}\n`;
        statsText += `👥 Aktive User: ${stats.activeUsers}\n`;
        statsText += `📷 Medien: ${stats.mediaMessages}\n`;
        
        if (stats.lastActivity) {
            const lastActivity = new Date(stats.lastActivity);
            statsText += `⏰ Letzte Aktivität: ${lastActivity.toLocaleString('de-DE')}\n`;
        }
        
        // Top 5 User in der Gruppe
        const topUsers = Object.entries(stats.users)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        if (topUsers.length > 0) {
            statsText += `\n🏆 **Top User:**\n`;
            topUsers.forEach(([userId, count], index) => {
                statsText += `${index + 1}. @${userId.split('@')[0]}: ${count}\n`;
            });
        }
        
        await msg.reply(statsText);
    }

    async handleGlobalStats(msg, args) {
        const stats = this.getGlobalStats();
        
        let statsText = `🌍 **Globale Statistiken**\n\n`;
        statsText += `💬 Gesamte Nachrichten: ${stats.totalMessages.toLocaleString()}\n`;
        statsText += `📝 Gesamte Zeichen: ${stats.totalChars.toLocaleString()}\n`;
        
        const avgLength = stats.totalMessages ? Math.round(stats.totalChars / stats.totalMessages) : 0;
        statsText += `📊 Ø Nachrichtenlänge: ${avgLength} Zeichen\n\n`;
        
        // Aktivste Stunde
        const hourlyStats = stats.hourly || {};
        const mostActiveHour = Object.entries(hourlyStats)
            .sort(([,a], [,b]) => b - a)[0];
        
        if (mostActiveHour) {
            statsText += `🕐 Aktivste Stunde: ${mostActiveHour[0]}:00 (${mostActiveHour[1]} Nachrichten)\n`;
        }
        
        // Aktivster Tag
        const dailyStats = stats.daily || {};
        const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const mostActiveDay = Object.entries(dailyStats)
            .sort(([,a], [,b]) => b - a)[0];
        
        if (mostActiveDay) {
            statsText += `📅 Aktivster Tag: ${dayNames[mostActiveDay[0]]} (${mostActiveDay[1]} Nachrichten)`;
        }
        
        await msg.reply(statsText);
    }

    async handleTopUsers(msg, args) {
        const limit = args.length > 0 ? parseInt(args[0]) || 10 : 10;
        const topUsers = this.getTopUsers(Math.min(limit, 20));
        
        if (topUsers.length === 0) {
            return msg.reply('📊 Noch keine User-Daten verfügbar!');
        }
        
        let topText = `🏆 **Top ${topUsers.length} User**\n\n`;
        
        topUsers.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            topText += `${medal} @${user.userId.split('@')[0]}\n`;
            topText += `   💬 ${user.messages.toLocaleString()} | 📝 ${user.chars.toLocaleString()} | Ø ${user.avgLength}\n\n`;
        });
        
        await msg.reply(topText);
    }

    async handleTopGroups(msg, args) {
        const limit = args.length > 0 ? parseInt(args[0]) || 10 : 10;
        const topGroups = this.getTopGroups(Math.min(limit, 20));
        
        if (topGroups.length === 0) {
            return msg.reply('📊 Noch keine Gruppen-Daten verfügbar!');
        }
        
        let topText = `🏆 **Top ${topGroups.length} Gruppen**\n\n`;
        
        topGroups.forEach((group, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            topText += `${medal} Gruppe\n`;
            topText += `   💬 ${group.messages.toLocaleString()} | 👥 ${group.users} User\n\n`;
        });
        
        await msg.reply(topText);
    }

    async handleTopCommands(msg, args) {
        const limit = args.length > 0 ? parseInt(args[0]) || 10 : 10;
        const topCommands = this.getTopCommands(Math.min(limit, 20));
        
        if (topCommands.length === 0) {
            return msg.reply('📊 Noch keine Command-Daten verfügbar!');
        }
        
        let topText = `🎮 **Top ${topCommands.length} Commands**\n\n`;
        
        topCommands.forEach((cmd, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            topText += `${medal} !${cmd.command}: ${cmd.count.toLocaleString()}x\n`;
        });
        
        await msg.reply(topText);
    }

    async handleHeatmap(msg, args) {
        let type = 'global';
        
        if (args.length > 0) {
            if (args[0] === 'me') {
                type = `user:${msg.getSender()}`;
            } else if (args[0] === 'group' && msg.isGroup) {
                type = `group:${msg.from}`;
            }
        }
        
        const { hourlyHeatmap, dailyHeatmap } = this.getActivityHeatmap(type);
        
        let heatmapText = `🔥 **Aktivitäts-Heatmap**\n\n`;
        heatmapText += this.formatHeatmap(hourlyHeatmap, 'hourly');
        heatmapText += '\n';
        heatmapText += this.formatHeatmap(dailyHeatmap, 'daily');
        heatmapText += '\n💡 Legende: ⬜ = Keine Aktivität, 🔥 = Niedrig, 🔥🔥🔥🔥🔥 = Sehr hoch';
        
        await msg.reply(heatmapText);
    }

    async handleAnalytics(msg, args) {
        let analyticsText = `📊 **Analytics Plugin - Übersicht**\n\n`;
        analyticsText += `📈 **!stats** [@user] - User-Statistiken\n`;
        analyticsText += `📊 **!mystats** - Deine Statistiken\n`;
        analyticsText += `👥 **!groupstats** - Gruppen-Statistiken\n`;
        analyticsText += `🌍 **!globalstats** - Globale Statistiken\n`;
        analyticsText += `🏆 **!topusers** [anzahl] - Top User\n`;
        analyticsText += `🏆 **!topgroups** [anzahl] - Top Gruppen\n`;
        analyticsText += `🎮 **!topcommands** [anzahl] - Top Commands\n`;
        analyticsText += `🔥 **!heatmap** [me/group] - Aktivitätsmuster\n`;
        analyticsText += `📤 **!export** - Daten exportieren\n\n`;
        analyticsText += `💡 Alle Daten werden automatisch erfasst!`;
        
        await msg.reply(analyticsText);
    }

    async handleExport(msg, args) {
        const userId = msg.getSender();
        const userStats = this.getUserStats(userId);
        
        let exportText = `📤 **Daten-Export für @${userId.split('@')[0]}**\n\n`;
        exportText += `📊 **Zusammenfassung:**\n`;
        exportText += `• Nachrichten: ${userStats.totalMessages}\n`;
        exportText += `• Zeichen: ${userStats.totalChars}\n`;
        exportText += `• Commands: ${userStats.commands}\n`;
        exportText += `• Medien: ${userStats.mediaMessages}\n\n`;
        exportText += `⚠️ **Datenschutz:** Deine Daten werden lokal gespeichert und nicht weitergegeben.\n`;
        exportText += `🗑️ Kontaktiere einen Admin für Datenlöschung.`;
        
        await msg.reply(exportText);
    }
}
