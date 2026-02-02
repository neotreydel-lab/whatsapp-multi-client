// Komplettes Warn-System mit WAEngine Storage
import { WhatsAppClient } from "./src/index.js";

async function warnSystemTest() {
    console.log("⚠️ Warn-System Test mit Storage...");
    
    const client = new WhatsAppClient({
        authDir: "./auth",
        logLevel: "silent",
        browser: ["WarnSystem", "1.0.0", ""],
        printQR: true
    });

    client.setPrefix("!");

    // ===== WARN SYSTEM COMMANDS =====

    // User warnen
    client.addCommand('warn', async (msg, args) => {
        // Nur Admins können warnen
        if (msg.isGroup && !(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können Warnungen vergeben!');
        }

        // Mentioned User oder Reply
        let targetUser = null;
        let reason = args.join(' ');

        // Check für Mentions
        const mentions = msg.getMentions();
        if (mentions.length > 0) {
            targetUser = mentions[0];
            // Reason ohne @mention
            reason = args.slice(1).join(' ');
        } 
        // Check für Reply
        else if (msg.raw.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            targetUser = msg.raw.message.extendedTextMessage.contextInfo.participant;
            reason = args.join(' ');
        }
        // Direkte JID (falls angegeben)
        else if (args[0] && args[0].includes('@')) {
            targetUser = args[0];
            reason = args.slice(1).join(' ');
        }

        if (!targetUser) {
            return msg.reply('❌ Bitte erwähne einen User oder antworte auf eine Nachricht!\n\nUsage: !warn @user <reason>');
        }

        if (!reason) {
            reason = 'Kein Grund angegeben';
        }

        // Warn-Daten erstellen
        const warnData = {
            id: Date.now(),
            user: targetUser,
            reason: reason,
            admin: msg.getSender(),
            chat: msg.from,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('de-DE')
        };

        // In Storage speichern - SO EINFACH!
        msg.write.in("warnings").push(warnData);
        
        // User-spezifische Warn-Count erhöhen
        msg.write.in("warn-counts").increment(targetUser, 1);
        
        // Aktuelle Warn-Anzahl abrufen
        const warnCount = msg.read.from("warn-counts").get(targetUser) || 1;
        
        // Response
        const userName = targetUser.split('@')[0];
        let response = `⚠️ **Warnung vergeben!**\n\n`;
        response += `👤 **User:** @${userName}\n`;
        response += `📝 **Grund:** ${reason}\n`;
        response += `📊 **Warnungen:** ${warnCount}/3\n`;
        response += `👮 **Admin:** @${msg.getSender().split('@')[0]}\n`;
        response += `🆔 **ID:** ${warnData.id}`;

        // Auto-Kick bei 3 Warnungen
        if (warnCount >= 3 && msg.isGroup) {
            try {
                if (await msg.isBotAdmin()) {
                    await client.kick.user(msg.from, [targetUser], [targetUser]);
                    response += `\n\n🚨 **AUTO-KICK:** User wurde automatisch entfernt! (3 Warnungen erreicht)`;
                    
                    // Warn-Count zurücksetzen nach Kick
                    msg.write.in("warn-counts").set(targetUser, 0);
                } else {
                    response += `\n\n⚠️ **3 Warnungen erreicht!** Bot hat keine Admin-Rechte zum Kicken.`;
                }
            } catch (error) {
                response += `\n\n❌ **Kick fehlgeschlagen:** ${error.message}`;
            }
        }

        await msg.reply(response, [targetUser, msg.getSender()]);
    });

    // Warnungen anzeigen
    client.addCommand('warnings', async (msg, args) => {
        let targetUser = msg.getSender(); // Default: eigene Warnungen

        // Check für Mentions oder Admin-Abfrage
        const mentions = msg.getMentions();
        if (mentions.length > 0) {
            if (msg.isGroup && !(await msg.isAdmin())) {
                return msg.reply('❌ Nur Admins können Warnungen anderer User einsehen!');
            }
            targetUser = mentions[0];
        }

        // Alle Warnungen des Users abrufen
        const allWarnings = msg.read.from("warnings").all() || [];
        const userWarnings = allWarnings.filter(warn => warn.user === targetUser);
        const warnCount = msg.read.from("warn-counts").get(targetUser) || 0;

        if (userWarnings.length === 0) {
            const userName = targetUser.split('@')[0];
            return msg.reply(`✅ @${userName} hat keine Warnungen!`, [targetUser]);
        }

        // Warnungen formatieren
        const userName = targetUser.split('@')[0];
        let response = `⚠️ **Warnungen für @${userName}** (${warnCount}/3)\n\n`;

        userWarnings.slice(-5).forEach((warn, index) => { // Nur letzte 5
            response += `**${index + 1}.** ${warn.reason}\n`;
            response += `📅 ${warn.date} | 👮 @${warn.admin.split('@')[0]}\n`;
            response += `🆔 ${warn.id}\n\n`;
        });

        if (userWarnings.length > 5) {
            response += `... und ${userWarnings.length - 5} weitere Warnungen`;
        }

        await msg.reply(response, [targetUser]);
    });

    // Warnung entfernen
    client.addCommand('unwarn', async (msg, args) => {
        // Nur Admins können Warnungen entfernen
        if (msg.isGroup && !(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können Warnungen entfernen!');
        }

        if (args.length === 0) {
            return msg.reply('❌ Usage: !unwarn <warn-id> oder !unwarn @user (letzte Warnung)');
        }

        // Check ob ID oder User
        const mentions = msg.getMentions();
        
        if (mentions.length > 0) {
            // Letzte Warnung des Users entfernen
            const targetUser = mentions[0];
            const allWarnings = msg.read.from("warnings").all() || [];
            const userWarnings = allWarnings.filter(warn => warn.user === targetUser);
            
            if (userWarnings.length === 0) {
                return msg.reply('❌ User hat keine Warnungen!');
            }
            
            // Letzte Warnung finden und entfernen
            const lastWarn = userWarnings[userWarnings.length - 1];
            const updatedWarnings = allWarnings.filter(warn => warn.id !== lastWarn.id);
            
            msg.write.in("warnings").data(updatedWarnings);
            msg.write.in("warn-counts").increment(targetUser, -1);
            
            const userName = targetUser.split('@')[0];
            const newCount = Math.max(0, msg.read.from("warn-counts").get(targetUser) || 0);
            
            await msg.reply(`✅ Letzte Warnung von @${userName} entfernt!\n📊 Neue Anzahl: ${newCount}/3`, [targetUser]);
            
        } else {
            // Spezifische Warn-ID entfernen
            const warnId = parseInt(args[0]);
            
            if (isNaN(warnId)) {
                return msg.reply('❌ Ungültige Warn-ID!');
            }
            
            const allWarnings = msg.read.from("warnings").all() || [];
            const warnToRemove = allWarnings.find(warn => warn.id === warnId);
            
            if (!warnToRemove) {
                return msg.reply('❌ Warnung mit dieser ID nicht gefunden!');
            }
            
            // Warnung entfernen
            const updatedWarnings = allWarnings.filter(warn => warn.id !== warnId);
            msg.write.in("warnings").data(updatedWarnings);
            msg.write.in("warn-counts").increment(warnToRemove.user, -1);
            
            const userName = warnToRemove.user.split('@')[0];
            const newCount = Math.max(0, msg.read.from("warn-counts").get(warnToRemove.user) || 0);
            
            await msg.reply(`✅ Warnung #${warnId} von @${userName} entfernt!\n📊 Neue Anzahl: ${newCount}/3`, [warnToRemove.user]);
        }
    });

    // Alle Warnungen löschen (Reset)
    client.addCommand('clearwarns', async (msg, args) => {
        // Nur Admins
        if (msg.isGroup && !(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können Warnungen löschen!');
        }

        const mentions = msg.getMentions();
        if (mentions.length === 0) {
            return msg.reply('❌ Bitte erwähne einen User!\n\nUsage: !clearwarns @user');
        }

        const targetUser = mentions[0];
        
        // Alle Warnungen des Users entfernen
        const allWarnings = msg.read.from("warnings").all() || [];
        const updatedWarnings = allWarnings.filter(warn => warn.user !== targetUser);
        
        msg.write.in("warnings").data(updatedWarnings);
        msg.write.in("warn-counts").set(targetUser, 0);
        
        const userName = targetUser.split('@')[0];
        await msg.reply(`✅ Alle Warnungen von @${userName} gelöscht!`, [targetUser]);
    });

    // Top Warned Users
    client.addCommand('topwarned', async (msg) => {
        if (msg.isGroup && !(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können diese Statistik einsehen!');
        }

        const warnCounts = msg.read.from("warn-counts").all() || {};
        
        if (Object.keys(warnCounts).length === 0) {
            return msg.reply('📊 Noch keine Warnungen vergeben!');
        }

        // Nach Warn-Count sortieren
        const sorted = Object.entries(warnCounts)
            .filter(([user, count]) => count > 0)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        let response = `📊 **Top Warned Users**\n\n`;
        
        sorted.forEach(([user, count], index) => {
            const userName = user.split('@')[0];
            const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍';
            response += `${emoji} @${userName}: ${count} Warnungen\n`;
        });

        await msg.reply(response);
    });

    // Warn Statistics
    client.addCommand('warnstats', async (msg) => {
        if (msg.isGroup && !(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können Statistiken einsehen!');
        }

        const allWarnings = msg.read.from("warnings").all() || [];
        const warnCounts = msg.read.from("warn-counts").all() || {};
        
        const totalWarnings = allWarnings.length;
        const totalUsers = Object.keys(warnCounts).length;
        const activeWarnings = Object.values(warnCounts).reduce((sum, count) => sum + count, 0);
        
        // Heute
        const today = new Date().toLocaleDateString('de-DE');
        const todayWarnings = allWarnings.filter(warn => warn.date === today).length;
        
        // Diese Woche
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekWarnings = allWarnings.filter(warn => new Date(warn.timestamp) > weekAgo).length;

        let response = `📊 **Warn-System Statistiken**\n\n`;
        response += `⚠️ **Gesamt Warnungen:** ${totalWarnings}\n`;
        response += `📈 **Aktive Warnungen:** ${activeWarnings}\n`;
        response += `👥 **Betroffene User:** ${totalUsers}\n`;
        response += `📅 **Heute:** ${todayWarnings}\n`;
        response += `📆 **Diese Woche:** ${weekWarnings}\n\n`;
        
        // Top Admin
        const adminStats = {};
        allWarnings.forEach(warn => {
            adminStats[warn.admin] = (adminStats[warn.admin] || 0) + 1;
        });
        
        if (Object.keys(adminStats).length > 0) {
            const topAdmin = Object.entries(adminStats).sort(([,a], [,b]) => b - a)[0];
            response += `👮 **Aktivster Admin:** @${topAdmin[0].split('@')[0]} (${topAdmin[1]} Warnungen)`;
        }

        await msg.reply(response);
    });

    // ===== BROADCAST SYSTEM =====
    
    // Broadcast Command - Nachricht an alle Gruppen senden
    client.addCommand('broadcast', async (msg, args) => {
        // Nur Bot Owner (ändere die JID zu deiner!)
        const ownerJid = "DEINE_NUMMER@s.whatsapp.net"; // ⚠️ ÄNDERE DAS!
        
        if (msg.getSender() !== ownerJid) {
            return msg.reply('❌ Nur der Bot Owner kann Broadcasts senden!');
        }

        if (args.length === 0) {
            return msg.reply('❌ Usage: !broadcast <nachricht>\n\nBeispiel: !broadcast Wartungsarbeiten um 20:00 Uhr!');
        }

        const broadcastMessage = args.join(' ');
        
        // Alle bekannten Gruppen aus Storage abrufen
        let knownGroups = msg.read.from("groups").all() || [];
        
        // Falls keine Gruppen gespeichert, versuche aus aktueller Session zu sammeln
        if (knownGroups.length === 0) {
            try {
                // Alle Chats aus WhatsApp abrufen
                const chats = await client.socket.chatFind({});
                const groups = chats.filter(chat => chat.id.includes('@g.us'));
                
                knownGroups = groups.map(group => ({
                    id: group.id,
                    name: group.name || 'Unbekannte Gruppe',
                    addedAt: new Date().toISOString()
                }));
                
                // Gruppen speichern für nächstes Mal
                msg.write.in("groups").data(knownGroups);
                console.log(`📋 ${knownGroups.length} Gruppen gefunden und gespeichert`);
            } catch (error) {
                console.error('❌ Fehler beim Abrufen der Chats:', error);
                return msg.reply('❌ Konnte keine Gruppen finden! Stelle sicher, dass der Bot in Gruppen ist.');
            }
        }

        if (knownGroups.length === 0) {
            return msg.reply('❌ Keine Gruppen gefunden! Bot muss erst in Gruppen hinzugefügt werden.');
        }

        // Broadcast starten
        await msg.reply(`📡 **Broadcast gestartet...**\n\n📝 Nachricht: "${broadcastMessage}"\n👥 Ziel-Gruppen: ${knownGroups.length}\n\n⏳ Sende...`);

        let successCount = 0;
        let failCount = 0;
        const results = [];

        // An alle Gruppen senden
        for (const group of knownGroups) {
            try {
                // Broadcast-Nachricht formatieren
                const formattedMessage = `📢 **BROADCAST**\n\n${broadcastMessage}\n\n_Gesendet von Bot Owner_`;
                
                await client.socket.sendMessage(group.id, { text: formattedMessage });
                
                successCount++;
                results.push({ group: group.name, status: '✅ Erfolgreich' });
                
                console.log(`✅ Broadcast gesendet an: ${group.name} (${group.id})`);
                
                // Kleine Pause zwischen Nachrichten (Anti-Spam)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                failCount++;
                results.push({ group: group.name, status: `❌ Fehler: ${error.message}` });
                
                console.error(`❌ Broadcast Fehler für ${group.name}:`, error.message);
            }
        }

        // Broadcast-Statistik speichern
        const broadcastStats = {
            id: Date.now(),
            message: broadcastMessage,
            sender: msg.getSender(),
            timestamp: new Date().toISOString(),
            totalGroups: knownGroups.length,
            successCount,
            failCount,
            results
        };
        
        msg.write.in("broadcasts").push(broadcastStats);

        // Ergebnis senden
        let resultMessage = `📊 **Broadcast abgeschlossen!**\n\n`;
        resultMessage += `✅ **Erfolgreich:** ${successCount}\n`;
        resultMessage += `❌ **Fehlgeschlagen:** ${failCount}\n`;
        resultMessage += `📊 **Gesamt:** ${knownGroups.length}\n\n`;
        
        if (failCount > 0) {
            resultMessage += `**Fehler-Details:**\n`;
            results.filter(r => r.status.includes('❌')).forEach(r => {
                resultMessage += `• ${r.group}: ${r.status}\n`;
            });
        }

        await msg.reply(resultMessage);
    });

    // Broadcast History anzeigen
    client.addCommand('broadcasts', async (msg) => {
        const ownerJid = "DEINE_NUMMER@s.whatsapp.net"; // ⚠️ ÄNDERE DAS!
        
        if (msg.getSender() !== ownerJid) {
            return msg.reply('❌ Nur der Bot Owner kann Broadcast-History einsehen!');
        }

        const broadcasts = msg.read.from("broadcasts").all() || [];
        
        if (broadcasts.length === 0) {
            return msg.reply('📡 Noch keine Broadcasts gesendet!');
        }

        let history = `📡 **Broadcast History** (${broadcasts.length})\n\n`;
        
        // Letzte 5 Broadcasts anzeigen
        broadcasts.slice(-5).forEach((broadcast, index) => {
            const date = new Date(broadcast.timestamp).toLocaleDateString('de-DE');
            const time = new Date(broadcast.timestamp).toLocaleTimeString('de-DE');
            
            history += `**${broadcasts.length - index}.** ${broadcast.message.substring(0, 50)}${broadcast.message.length > 50 ? '...' : ''}\n`;
            history += `📅 ${date} ${time}\n`;
            history += `📊 ${broadcast.successCount}/${broadcast.totalGroups} erfolgreich\n\n`;
        });

        if (broadcasts.length > 5) {
            history += `... und ${broadcasts.length - 5} weitere Broadcasts`;
        }

        await msg.reply(history);
    });

    // Gruppen-Liste anzeigen
    client.addCommand('groups', async (msg) => {
        const ownerJid = "DEINE_NUMMER@s.whatsapp.net"; // ⚠️ ÄNDERE DAS!
        
        if (msg.getSender() !== ownerJid) {
            return msg.reply('❌ Nur der Bot Owner kann die Gruppen-Liste einsehen!');
        }

        const groups = msg.read.from("groups").all() || [];
        
        if (groups.length === 0) {
            return msg.reply('👥 Noch keine Gruppen gespeichert!\n\nTipp: Verwende !broadcast um Gruppen automatisch zu sammeln.');
        }

        let groupList = `👥 **Bekannte Gruppen** (${groups.length})\n\n`;
        
        groups.forEach((group, index) => {
            groupList += `**${index + 1}.** ${group.name}\n`;
            groupList += `🆔 ${group.id.substring(0, 20)}...\n`;
            groupList += `📅 Hinzugefügt: ${new Date(group.addedAt).toLocaleDateString('de-DE')}\n\n`;
        });

        await msg.reply(groupList);
    });

    // Gruppen-Liste aktualisieren
    client.addCommand('updategroups', async (msg) => {
        const ownerJid = "DEINE_NUMMER@s.whatsapp.net"; // ⚠️ ÄNDERE DAS!
        
        if (msg.getSender() !== ownerJid) {
            return msg.reply('❌ Nur der Bot Owner kann Gruppen aktualisieren!');
        }

        await msg.reply('🔄 Aktualisiere Gruppen-Liste...');

        try {
            // Alle Chats aus WhatsApp abrufen
            const chats = await client.socket.chatFind({});
            const groups = chats.filter(chat => chat.id.includes('@g.us'));
            
            const groupData = groups.map(group => ({
                id: group.id,
                name: group.name || 'Unbekannte Gruppe',
                addedAt: new Date().toISOString(),
                participants: group.participants?.length || 0
            }));
            
            // Gruppen speichern
            msg.write.in("groups").data(groupData);
            
            await msg.reply(`✅ Gruppen-Liste aktualisiert!\n\n👥 **Gefunden:** ${groupData.length} Gruppen\n📊 **Gesamt Teilnehmer:** ${groupData.reduce((sum, g) => sum + g.participants, 0)}`);
            
        } catch (error) {
            console.error('❌ Fehler beim Aktualisieren der Gruppen:', error);
            await msg.reply(`❌ Fehler beim Aktualisieren: ${error.message}`);
        }
    });

    // ===== AUTO-MODERATION =====
    
    // Automatische Warnungen für bestimmte Wörter
    const badWords = ['spam', 'idiot', 'dumm']; // Beispiel
    
    client.on('message', async (msg) => {
        if (msg.isCommand || !msg.isGroup || !msg.text) return;
        
        // Check für Bad Words
        const text = msg.text.toLowerCase();
        const foundBadWord = badWords.find(word => text.includes(word));
        
        if (foundBadWord) {
            // Auto-Warn
            const warnData = {
                id: Date.now(),
                user: msg.getSender(),
                reason: `Auto-Moderation: "${foundBadWord}"`,
                admin: 'SYSTEM',
                chat: msg.from,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString('de-DE')
            };

            msg.write.in("warnings").push(warnData);
            msg.write.in("warn-counts").increment(msg.getSender(), 1);
            
            const warnCount = msg.read.from("warn-counts").get(msg.getSender()) || 1;
            
            await msg.reply(`⚠️ **Auto-Moderation**\n\n👤 @${msg.getSender().split('@')[0]}\n📝 Unangemessene Sprache erkannt\n📊 Warnungen: ${warnCount}/3`, [msg.getSender()]);
            
            // Auto-Delete Message
            try {
                await msg.delete();
            } catch (error) {
                console.log('Could not delete message:', error.message);
            }
        }
    });

    // ===== HELP COMMAND =====
    client.addCommand('help', async (msg) => {
        let help = `🤖 **Warn-System + Broadcast Bot**\n\n`;
        
        help += `**👥 User Commands:**\n`;
        help += `!warnings - Deine Warnungen anzeigen\n\n`;
        
        if (msg.isGroup && await msg.isAdmin()) {
            help += `**👮 Admin Commands:**\n`;
            help += `!warn @user <reason> - User warnen\n`;
            help += `!warnings @user - Warnungen eines Users\n`;
            help += `!unwarn <id> - Warnung entfernen (ID)\n`;
            help += `!unwarn @user - Letzte Warnung entfernen\n`;
            help += `!clearwarns @user - Alle Warnungen löschen\n`;
            help += `!topwarned - Top warned users\n`;
            help += `!warnstats - Warn-Statistiken\n\n`;
        }
        
        // Owner Commands (nur für Bot Owner)
        const ownerJid = "DEINE_NUMMER@s.whatsapp.net"; // ⚠️ ÄNDERE DAS!
        if (msg.getSender() === ownerJid) {
            help += `**👑 Owner Commands:**\n`;
            help += `!broadcast <nachricht> - An alle Gruppen senden\n`;
            help += `!broadcasts - Broadcast History\n`;
            help += `!groups - Gruppen-Liste anzeigen\n`;
            help += `!updategroups - Gruppen-Liste aktualisieren\n\n`;
        }
        
        help += `**🤖 Features:**\n`;
        help += `• Auto-Kick bei 3 Warnungen\n`;
        help += `• Auto-Moderation für Bad Words\n`;
        help += `• Broadcast an alle Gruppen\n`;
        help += `• Persistent Storage\n`;
        help += `• Detaillierte Statistiken`;
        
        await msg.reply(help);
    });

    // ===== EVENTS =====
    client.on('connected', () => {
        console.log("✅ Warn-System + Broadcast Bot verbunden!");
        console.log("⚠️ Features:");
        console.log("   - User Warnings mit Storage");
        console.log("   - Auto-Kick bei 3 Warnungen");
        console.log("   - Auto-Moderation");
        console.log("   - Broadcast an alle Gruppen");
        console.log("   - Detaillierte Statistiken");
        console.log("   - Admin-only Commands");
        
        // Startup Statistics
        const stats = client.storage.getStats();
        console.log(`📊 Storage: ${stats.totalFiles} files, ${stats.totalSizeFormatted}`);
        
        // Gruppen-Count
        const groups = client.storage.read.from("groups").all() || [];
        console.log(`👥 Bekannte Gruppen: ${groups.length}`);
    });

    // Auto-Gruppen-Tracking
    client.on('group.participants.update', async (update) => {
        // Wenn Bot zu Gruppe hinzugefügt wird
        if (update.action === 'add' && update.participants.includes(client.socket.user?.id)) {
            try {
                const groupMetadata = await client.get.GroupMetadata(update.id);
                
                // Gruppe zu Liste hinzufügen
                const groups = client.storage.read.from("groups").all() || [];
                const existingGroup = groups.find(g => g.id === update.id);
                
                if (!existingGroup) {
                    const newGroup = {
                        id: update.id,
                        name: groupMetadata.subject || 'Unbekannte Gruppe',
                        addedAt: new Date().toISOString(),
                        participants: groupMetadata.participants.length
                    };
                    
                    groups.push(newGroup);
                    client.storage.write.in("groups").data(groups);
                    
                    console.log(`👥 Neue Gruppe hinzugefügt: ${newGroup.name} (${update.id})`);
                }
            } catch (error) {
                console.error('❌ Fehler beim Hinzufügen der Gruppe:', error);
            }
        }
    });

    try {
        await client.connect();
        
        console.log("\n⚠️ Warn-System + Broadcast Commands:");
        console.log("   - !warn @user <reason> → User warnen (Admin)");
        console.log("   - !warnings [@user] → Warnungen anzeigen");
        console.log("   - !unwarn <id|@user> → Warnung entfernen (Admin)");
        console.log("   - !clearwarns @user → Alle Warnungen löschen (Admin)");
        console.log("   - !topwarned → Top warned users (Admin)");
        console.log("   - !warnstats → Warn-Statistiken (Admin)");
        console.log("\n📡 Broadcast Commands (Owner only):");
        console.log("   - !broadcast <nachricht> → An alle Gruppen senden");
        console.log("   - !broadcasts → Broadcast History");
        console.log("   - !groups → Gruppen-Liste anzeigen");
        console.log("   - !updategroups → Gruppen-Liste aktualisieren");
        console.log("\n⚠️ WICHTIG: Ändere 'DEINE_NUMMER@s.whatsapp.net' zu deiner JID!");
        
    } catch (error) {
        console.error("❌ Warn-System Fehler:", error);
    }
}

warnSystemTest();