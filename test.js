import { WhatsAppClient } from "./src/index.js";

async function main() {
    console.log("🚀 WAEngine Test startet...");
    
    // Deine eigene WhatsApp Library verwenden
    const client = new WhatsAppClient({
        authDir: "./auth",
        logLevel: "silent", // Clean output
        browser: ["WAEngine", "1.0.3", ""], // Updated version
        heartbeatInterval: 60000, // 60 Sekunden statt 30 - weniger Spam
        maxReconnectAttempts: 50, // Weniger Versuche
        reconnectInterval: 5000, // 5 Sekunden zwischen Versuchen
        quietHeartbeat: true // Heartbeat-Spam deaktivieren
    });

    // ===== OFFLINE MESSAGE IGNORE - NEUE FUNKTION! =====
    client.ignore.message.offline(true); // Ignoriert alle Offline-Messages beim Restart

    // ===== PREFIX SYSTEM SETUP =====
    const prefix = "/"; // Dein Prefix
    client.setPrefix(prefix);

    // ===== COMMAND REGISTRIERUNG =====
    client.addCommand('help', async (msg, args) => {
        let help = `🤖 **WAEngine v1.7.3 - Advanced Features**\n\n`;
        help += `📋 **Standard Commands:**\n`;
        help += `!help - Diese Hilfe\n`;
        help += `!ping - Ping Test\n`;
        help += `!ignore - Offline Message Status\n`;
        help += `!poll "Frage" "Opt1" "Opt2" - Poll erstellen\n`;
        help += `!stats - Statistiken anzeigen\n\n`;
        
        help += `🎵 **Advanced Media Features:**\n`;
        help += `!voice <path> - Voice Message senden\n`;
        help += `!videomsg <path> - Video Message senden\n`;
        help += `!gif <path> [caption] - GIF senden\n\n`;
        
        help += `💬 **Advanced Message Features:**\n`;
        help += `!forward - Nachricht weiterleiten\n`;
        help += `!pin - Nachricht pinnen (Admin)\n`;
        help += `!star - Nachricht markieren\n`;
        help += `!quote <text> - Nachricht zitieren\n\n`;
        
        help += `🎨 **Rich Content Features:**\n`;
        help += `!buttons [text] - Button Message\n`;
        help += `!list - List Message\n\n`;
        
        help += `👥 **Group Features:**\n`;
        help += `!groupinfo - Gruppeninfo anzeigen\n`;
        help += `!invitelink - Einladungslink (Admin)\n\n`;
        
        help += `🔒 **Privacy Features:**\n`;
        help += `!block [@user] - User blockieren\n`;
        help += `!unblock [@user] - User entblockieren\n\n`;
        
        help += `📊 **Analytics Features:**\n`;
        help += `!online [@user] - Online Status prüfen\n`;
        help += `!archive - Chat archivieren\n`;
        help += `!mute [minuten] - Chat stummschalten\n\n`;
        
        help += `📢 **Status Features:**\n`;
        help += `!status <text> - Status senden\n\n`;
        
        help += `🖼️ **Profile Picture Features:**\n`;
        help += `!profilpic @user - Profilbild senden\n`;
        help += `!meinprofil - Eigenes Profilbild\n\n`;
        
        help += `⚙️ **System Features:**\n`;
        help += `!backup - Backup erstellen\n\n`;
        
        help += `🚀 **Über 400+ Advanced Features verfügbar!**\n`;
        help += `📖 Siehe: ADVANCED-FEATURES.md`;
        
        await msg.reply(help);
    });

    client.addCommand('ping', async (msg, args) => {
        await msg.reply('🏓 Pong!');
    });

    client.addCommand('ignore', async (msg, args) => {
        const status = client.ignoreOfflineMessages ? 'AKTIVIERT ✅' : 'DEAKTIVIERT ❌';
        const startTime = client.connectionStartTime ? new Date(client.connectionStartTime).toLocaleString() : 'Nicht verfügbar';
        const ignoredCount = client.ignoredMessagesCount || 0;
        
        await msg.reply(`📵 **Offline Message Ignore**\n\nStatus: ${status}\nVerbunden seit: ${startTime}\nIgnorierte Messages: ${ignoredCount}\n\n💡 Offline Messages werden ${client.ignoreOfflineMessages ? 'ignoriert' : 'verarbeitet'}`);
    });

    client.addCommand('poll', async (msg, args) => {
        if (args.length < 3) {
            return msg.reply(`❌ Usage: ${prefix}poll "Frage" "Option1" "Option2" ...`);
        }
        
        const question = args[0];
        const options = args.slice(1);
        
        try {
            await msg.sendPoll(question, options);
            await msg.reply('✅ Poll erstellt!');
        } catch (error) {
            await msg.reply(`❌ Fehler: ${error.message}`);
        }
    });

    client.addCommand('stats', async (msg, args) => {
        try {
            const stats = await msg.stats.getMessageCount();
            const userActivity = await msg.stats.getUserActivity();
            
            let response = `📊 **STATISTIKEN**\n\n`;
            response += `💬 **Nachrichten:**\n`;
            response += `   Total: ${stats.total}\n`;
            response += `   Heute: ${stats.today}\n`;
            response += `   Diese Woche: ${stats.thisWeek}\n\n`;
            response += `👤 **Deine Aktivität:**\n`;
            response += `   Nachrichten: ${userActivity.messagesCount}\n`;
            response += `   Ø pro Tag: ${userActivity.averagePerDay}\n`;
            response += `   Status: ${userActivity.isActive ? 'Aktiv' : 'Inaktiv'}`;
            
            if (msg.isGroup) {
                const groupStats = await msg.stats.getGroupStats();
                response += `\n\n🏢 **Gruppe:**\n`;
                response += `   Name: ${groupStats.groupName}\n`;
                response += `   Mitglieder: ${groupStats.totalMembers}\n`;
                response += `   Admins: ${groupStats.admins}`;
            }
            
            await msg.reply(response);
        } catch (error) {
            await msg.reply(`❌ Fehler beim Laden der Stats: ${error.message}`);
        }
    });

    client.addCommand('kick', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Dieser Command funktioniert nur in Gruppen!');
        }
        
        if (!(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können diesen Command nutzen!');
        }
        
        // Bot Admin Check - mit Fallback
        const isBotAdmin = await msg.isBotAdmin();
        if (!isBotAdmin) {
            console.log('⚠️ Bot ist nicht in der Gruppe oder kein Admin');
            // Versuche trotzdem zu kicken (falls Bot externe Rechte hat)
            await msg.reply('⚠️ Bot ist nicht in der Gruppe, versuche trotzdem...');
        }
        
        const mentions = msg.getMentions();
        if (mentions.length === 0) {
            return msg.reply('❌ Bitte erwähne jemanden zum kicken!');
        }
        
        try {
            console.log('🦵 Versuche User zu kicken:', mentions);
            const result = await client.kick.user(msg.from, mentions, mentions);
            console.log('✅ Kick Ergebnis:', result);
            await msg.reply('✅ User erfolgreich entfernt!');
        } catch (error) {
            console.error('❌ Kick Fehler:', error);
            await msg.reply(`❌ Fehler beim Kicken: ${error.message}\n\n💡 Mögliche Ursachen:\n- Bot ist nicht in der Gruppe\n- Bot hat keine Admin-Rechte\n- User ist Admin/Owner`);
        }
    });

    client.addCommand('debug', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Debug nur in Gruppen!');
        }
        
        try {
            const metadata = await client.get.GroupMetadata(msg.from);
            const botJid = client.socket.user?.id;
            const senderJid = msg.getSender();
            
            console.log('🔍 VOLLSTÄNDIGE DEBUG INFO:');
            console.log('🤖 Bot JID:', botJid);
            console.log('👤 Sender JID:', senderJid);
            console.log('🏢 Gruppe:', metadata.subject);
            console.log('� Teilnehmer:', metadata.participants.length);
            
            let response = `🔍 **DEBUG INFO**\n\n`;
            response += `🤖 **Bot:**\n`;
            response += `   JID: ${botJid}\n`;
            response += `   Nummer: ${botJid ? botJid.split('@')[0].split(':')[0] : 'N/A'}\n`;
            response += `   Admin: ${await msg.isBotAdmin()}\n\n`;
            response += `👤 **Sender:**\n`;
            response += `   JID: ${senderJid}\n`;
            response += `   Nummer: ${senderJid.split('@')[0].split(':')[0]}\n`;
            response += `   Admin: ${await msg.isAdmin()}\n\n`;
            response += `🏢 **Gruppe:**\n`;
            response += `   Name: ${metadata.subject}\n`;
            response += `   Teilnehmer: ${metadata.participants.length}\n`;
            response += `   Admins: ${metadata.participants.filter(p => p.admin).length}\n\n`;
            
            // Zeige alle Admins
            const admins = metadata.participants.filter(p => p.admin);
            if (admins.length > 0) {
                response += `👑 **Admins:**\n`;
                admins.forEach((admin, index) => {
                    const adminNumber = admin.id.split('@')[0].split(':')[0];
                    response += `   ${index + 1}. ${adminNumber} (${admin.admin})\n`;
                });
            }
            
            await msg.reply(response);
            
            // Zusätzlich: Prüfe ob Bot überhaupt in der Gruppe ist
            const botNumber = botJid ? botJid.split('@')[0].split(':')[0] : null;
            const botInGroup = metadata.participants.find(p => {
                const pNumber = p.id.split('@')[0].split(':')[0];
                return pNumber === botNumber;
            });
            
            if (!botInGroup && botNumber) {
                await msg.reply(`⚠️ **PROBLEM GEFUNDEN:**\nBot (${botNumber}) ist nicht in der Gruppe!\nDer Bot muss zur Gruppe hinzugefügt werden.`);
            }
            
        } catch (error) {
            await msg.reply(`❌ Debug Fehler: ${error.message}`);
        }
    });

    client.addCommand('testpoll', async (msg, args) => {
        console.log('🧪 Teste verschiedene Poll-Formate...');
        
        try {
            await msg.reply('🧪 Starte Poll-Tests...');
            
            // Test 1: Über msg.sendPoll (mit Fallback)
            console.log('📊 Test 1: msg.sendPoll()');
            await msg.sendPoll('Test 1: Lieblings Farbe?', ['Rot', 'Blau', 'Grün']);
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s Pause
            
            // Test 2: Direkte Baileys Standard Syntax
            console.log('📊 Test 2: Standard Baileys Syntax');
            try {
                await client.socket.sendMessage(msg.from, {
                    poll: {
                        name: 'Test 2: Pizza?',
                        values: ['Margherita', 'Salami', 'Hawaii'],
                        selectableCount: 1
                    }
                });
                console.log('✅ Standard Syntax funktioniert');
            } catch (e) {
                console.log('❌ Standard Syntax fehlgeschlagen:', e.message);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s Pause
            
            // Test 3: V3 Creation Message Syntax
            console.log('📊 Test 3: V3 Creation Message Syntax');
            try {
                await client.socket.sendMessage(msg.from, {
                    pollCreationMessage: {
                        name: 'Test 3: Getränk?',
                        options: [
                            { optionName: 'Wasser' },
                            { optionName: 'Cola' },
                            { optionName: 'Saft' }
                        ],
                        selectableOptionsCount: 1
                    }
                });
                console.log('✅ V3 Creation Syntax funktioniert');
            } catch (e) {
                console.log('❌ V3 Creation Syntax fehlgeschlagen:', e.message);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s Pause
            
            // Test 4: Alternative V3 Syntax
            console.log('📊 Test 4: Alternative V3 Syntax');
            try {
                await client.socket.sendMessage(msg.from, {
                    pollCreationMessageV3: {
                        name: 'Test 4: Sport?',
                        options: [
                            { optionName: 'Fußball' },
                            { optionName: 'Basketball' },
                            { optionName: 'Tennis' }
                        ],
                        selectableOptionsCount: 1
                    }
                });
                console.log('✅ Alternative V3 Syntax funktioniert');
            } catch (e) {
                console.log('❌ Alternative V3 Syntax fehlgeschlagen:', e.message);
            }
            
            await msg.reply('✅ Alle Poll-Tests abgeschlossen! Schau welche funktionieren.');
            
        } catch (error) {
            console.error('❌ Poll Test Fehler:', error);
            await msg.reply(`❌ Poll Test Fehler: ${error.message}`);
        }
    });

    client.addCommand('addbot', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }
        
        if (!(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können den Bot hinzufügen!');
        }
        
        const botJid = client.socket.user?.id;
        const botNumber = botJid ? botJid.split('@')[0].split(':')[0] : null;
        
        if (!botNumber) {
            return msg.reply('❌ Bot Nummer nicht verfügbar!');
        }
        
        try {
            // Versuche Bot zur Gruppe hinzuzufügen
            const botWithLid = `${botNumber}@lid`;
            const result = await client.add.user(msg.from, [botWithLid]);
            
            await msg.reply(`✅ Bot (${botNumber}) zur Gruppe hinzugefügt!\n\n💡 Mache den Bot jetzt zum Admin damit er kicken kann.`);
            
        } catch (error) {
            console.error('❌ Add Bot Fehler:', error);
            await msg.reply(`❌ Konnte Bot nicht hinzufügen: ${error.message}\n\n📱 **Manuell hinzufügen:**\n1. Gruppeninfo öffnen\n2. "Teilnehmer hinzufügen"\n3. Nummer: +${botNumber}\n4. Bot zu Admin machen`);
        }
    });

    client.addCommand('type', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !type "Nachricht" [Dauer in ms]');
        }
        
        const text = args.join(' ');
        const duration = args[args.length - 1].match(/^\d+$/) ? parseInt(args.pop()) : 2000;
        const message = args.join(' ');
        
        console.log(`⌨️ Typing Test: "${message}" für ${duration}ms`);
        
        try {
            await msg.typeAndReply(message || text, duration);
        } catch (error) {
            await msg.reply(`❌ Typing Fehler: ${error.message}`);
        }
    });

    client.addCommand('realistic', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !realistic "Nachricht"');
        }
        
        const text = args.join(' ');
        console.log(`🎭 Realistic Typing: "${text}"`);
        
        try {
            await msg.realisticType(text);
        } catch (error) {
            await msg.reply(`❌ Realistic Typing Fehler: ${error.message}`);
        }
    });

    client.addCommand('demo', async (msg, args) => {
        try {
            await msg.reply('🎭 Typing Demo startet...');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Demo 1: Manuell (wie du wolltest)
            await msg.reply('Demo 1: Manuelles Typing...');
            await msg.visualWrite(true);
            await new Promise(resolve => setTimeout(resolve, 2000));
            await msg.visualWrite(false);
            await msg.reply('Das war 2 Sekunden manuelles Typing! ⌨️');
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Demo 2: Mit fester Zeit
            await msg.reply('Demo 2: Feste Zeit...');
            await msg.typeAndReply('Das war typeAndReply mit 3 Sekunden!', 3000);
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Demo 3: Realistisch
            await msg.reply('Demo 3: Realistisches Typing...');
            await msg.simulateTyping('Das hier wird realistisch basierend auf der Textlänge getippt. Je länger der Text, desto länger dauert es!', {
                typingSpeed: 50,
                minTypingTime: 1000,
                maxTypingTime: 6000
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await msg.reply('✅ Typing Demo abgeschlossen!');
            
        } catch (error) {
            await msg.reply(`❌ Demo Fehler: ${error.message}`);
        }
    });

    client.addCommand('customtype', async (msg, args) => {
        if (args.length < 2) {
            return msg.reply('❌ Usage: !customtype <milliseconds> "text"\nBeispiel: !customtype 3000 "Hallo Welt"');
        }
        
        const duration = parseInt(args[0]);
        const text = args.slice(1).join(' ');
        
        if (isNaN(duration)) {
            return msg.reply('❌ Erste Parameter muss eine Zahl (Millisekunden) sein!');
        }
        
        console.log(`⌨️ Custom Typing: ${duration}ms für "${text}"`);
        
        try {
            await msg.typeAndReply(text, duration);
        } catch (error) {
            await msg.reply(`❌ Custom Type Fehler: ${error.message}`);
        }
    });

    client.addCommand('slowtype', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !slowtype "text"');
        }
        
        const text = args.join(' ');
        
        try {
            // Sehr langsames, realistisches Typing
            await msg.simulateTyping(text, {
                typingSpeed: 80,      // Langsam
                minTypingTime: 3000,  // Minimum 3 Sekunden
                maxTypingTime: 10000  // Maximum 10 Sekunden
            });
        } catch (error) {
            await msg.reply(`❌ Slow Type Fehler: ${error.message}`);
        }
    });

    // ===== PROFILE PICTURE COMMAND - NEU! =====
    client.addCommand('profilpic', async (msg, args) => {
        try {
            const mentions = msg.getMentions();
            
            if (mentions.length === 0) {
                return msg.reply('❌ Usage: !profilpic @user\nBeispiel: !profilpic @1234567890');
            }
            
            const targetJid = mentions[0];
            const targetNumber = targetJid.split('@')[0].split(':')[0];
            
            await msg.reply(`🖼️ Lade Profilbild von +${targetNumber}...`);
            
            // Profilbild abrufen und senden
            const success = await msg.sendProfilePicture(targetJid, `📸 Profilbild von +${targetNumber}`);
            
            if (success) {
                console.log(`✅ Profilbild von ${targetNumber} erfolgreich gesendet`);
            }
            
        } catch (error) {
            console.error('❌ Profilpic Command Fehler:', error);
            await msg.reply(`❌ Fehler: ${error.message}`);
        }
    });

    // Alternative: Eigenes Profilbild
    client.addCommand('meinprofil', async (msg, args) => {
        try {
            const senderJid = msg.getSender();
            const senderNumber = senderJid.split('@')[0].split(':')[0];
            
            await msg.reply(`🖼️ Lade dein Profilbild...`);
            
            const success = await msg.sendProfilePicture(senderJid, `📸 Dein Profilbild (+${senderNumber})`);
            
            if (success) {
                console.log(`✅ Profilbild von ${senderNumber} (selbst) erfolgreich gesendet`);
            }
            
        } catch (error) {
            console.error('❌ Mein Profil Command Fehler:', error);
            await msg.reply(`❌ Fehler: ${error.message}`);
        }
    });

    // ===== ADVANCED FEATURES TEST COMMANDS - NEU! =====
    
    // ===== ADVANCED FEATURES TEST COMMANDS - VOLLSTÄNDIG! =====
    console.log("🚀 Registriere alle Advanced Features Test Commands...");
    
    // Advanced Media Features
    client.addCommand('voice', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !voice <audio-path>');
        }
        
        try {
            const mentions = msg.getMentions();
            if (mentions.length > 0) {
                await msg.sendVoiceToMentioned(args[0]);
                await msg.reply(`✅ Voice Message an ${mentions.length} User gesendet!`);
            } else {
                await msg.sendVoiceMessage(args[0]);
                await msg.reply('✅ Voice Message gesendet!');
            }
        } catch (error) {
            await msg.reply(`❌ Voice Fehler: ${error.message}`);
        }
    });

    client.addCommand('videomsg', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !videomsg <video-path>');
        }
        
        try {
            const mentions = msg.getMentions();
            if (mentions.length > 0) {
                await msg.sendVideoMessageToMentioned(args[0]);
                await msg.reply(`✅ Video Message an ${mentions.length} User gesendet!`);
            } else {
                await msg.sendVideoMessage(args[0]);
                await msg.reply('✅ Video Message gesendet!');
            }
        } catch (error) {
            await msg.reply(`❌ Video Message Fehler: ${error.message}`);
        }
    });

    client.addCommand('gif', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !gif <gif-path> [caption]');
        }
        
        const gifPath = args[0];
        const caption = args.slice(1).join(' ') || '';
        
        try {
            const mentions = msg.getMentions();
            if (mentions.length > 0) {
                await msg.sendGifToMentioned(gifPath, caption);
                await msg.reply(`✅ GIF an ${mentions.length} User gesendet!`);
            } else {
                await msg.sendGif(gifPath, caption);
                await msg.reply('✅ GIF gesendet!');
            }
        } catch (error) {
            await msg.reply(`❌ GIF Fehler: ${error.message}`);
        }
    });

    // Advanced Message Features
    client.addCommand('forward', async (msg, args) => {
        try {
            const mentions = msg.getMentions();
            if (mentions.length > 0) {
                const results = await msg.forwardToMentioned();
                const successCount = results.filter(r => r.success).length;
                await msg.reply(`✅ Nachricht an ${successCount}/${results.length} User weitergeleitet!`);
            } else {
                await msg.forwardToSender();
                await msg.reply('✅ Nachricht an dich weitergeleitet!');
            }
        } catch (error) {
            await msg.reply(`❌ Forward Fehler: ${error.message}`);
        }
    });

    client.addCommand('pin', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Pin funktioniert nur in Gruppen!');
        }
        
        if (!(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können pinnen!');
        }
        
        try {
            await msg.pin();
            await msg.reply('📌 Nachricht gepinnt!');
        } catch (error) {
            await msg.reply(`❌ Pin Fehler: ${error.message}`);
        }
    });

    client.addCommand('star', async (msg, args) => {
        try {
            await msg.star();
            await msg.reply('⭐ Nachricht markiert!');
        } catch (error) {
            await msg.reply(`❌ Star Fehler: ${error.message}`);
        }
    });

    client.addCommand('quote', async (msg, args) => {
        const text = args.join(' ') || 'Das ist ein Zitat!';
        
        try {
            await msg.quote(text);
        } catch (error) {
            await msg.reply(`❌ Quote Fehler: ${error.message}`);
        }
    });

    // Rich Content Features
    client.addCommand('buttons', async (msg, args) => {
        const text = args.join(' ') || 'Wähle eine Option:';
        
        const buttons = [
            { id: 'btn1', text: '✅ Ja' },
            { id: 'btn2', text: '❌ Nein' },
            { id: 'btn3', text: '🤔 Vielleicht' }
        ];
        
        try {
            await msg.sendButtons(text, buttons, 'Advanced Features Test');
        } catch (error) {
            await msg.reply(`❌ Buttons Fehler: ${error.message}`);
        }
    });

    client.addCommand('list', async (msg, args) => {
        const title = 'Advanced Features Menu';
        const description = 'Wähle eine Kategorie:';
        const buttonText = 'Optionen anzeigen';
        
        const sections = [
            {
                title: 'Media Features',
                rows: [
                    { title: 'Voice Messages', description: 'Sprachnachrichten senden', id: 'voice' },
                    { title: 'Video Messages', description: 'Videonachrichten senden', id: 'video' },
                    { title: 'GIF Support', description: 'Animierte GIFs senden', id: 'gif' }
                ]
            },
            {
                title: 'Message Features',
                rows: [
                    { title: 'Forward Messages', description: 'Nachrichten weiterleiten', id: 'forward' },
                    { title: 'Pin Messages', description: 'Nachrichten pinnen', id: 'pin' },
                    { title: 'Star Messages', description: 'Nachrichten markieren', id: 'star' }
                ]
            }
        ];
        
        try {
            await msg.sendList(title, description, buttonText, sections);
        } catch (error) {
            await msg.reply(`❌ List Fehler: ${error.message}`);
        }
    });

    // Advanced Group Features
    client.addCommand('groupinfo', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }
        
        try {
            const metadata = await client.get.GroupMetadata(msg.from);
            let info = `🏢 **Gruppeninfo**\n\n`;
            info += `📝 Name: ${metadata.subject}\n`;
            info += `👥 Mitglieder: ${metadata.participants.length}\n`;
            info += `👑 Admins: ${metadata.participants.filter(p => p.admin).length}\n`;
            info += `📅 Erstellt: ${new Date(metadata.creation * 1000).toLocaleDateString()}\n`;
            if (metadata.desc) info += `📄 Beschreibung: ${metadata.desc}\n`;
            
            await msg.reply(info);
        } catch (error) {
            await msg.reply(`❌ Group Info Fehler: ${error.message}`);
        }
    });

    client.addCommand('invitelink', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }
        
        if (!(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können Einladungslinks erstellen!');
        }
        
        try {
            const inviteLink = await client.group.getInviteLink(msg.from);
            await msg.reply(`🔗 **Einladungslink:**\n${inviteLink}`);
        } catch (error) {
            await msg.reply(`❌ Invite Link Fehler: ${error.message}`);
        }
    });

    // Privacy Features
    client.addCommand('block', async (msg, args) => {
        const mentions = msg.getMentions();
        const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
        
        try {
            await client.privacy.block(targetJid);
            const userNumber = targetJid.split('@')[0].split(':')[0];
            await msg.reply(`🚫 User +${userNumber} blockiert!`);
        } catch (error) {
            await msg.reply(`❌ Block Fehler: ${error.message}`);
        }
    });

    client.addCommand('unblock', async (msg, args) => {
        const mentions = msg.getMentions();
        const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
        
        try {
            await client.privacy.unblock(targetJid);
            const userNumber = targetJid.split('@')[0].split(':')[0];
            await msg.reply(`✅ User +${userNumber} entblockiert!`);
        } catch (error) {
            await msg.reply(`❌ Unblock Fehler: ${error.message}`);
        }
    });

    // Analytics Features
    client.addCommand('online', async (msg, args) => {
        const mentions = msg.getMentions();
        const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
        
        try {
            const isOnline = await client.analytics.isOnline(targetJid);
            const userNumber = targetJid.split('@')[0].split(':')[0];
            await msg.reply(`📱 +${userNumber} ist ${isOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
        } catch (error) {
            await msg.reply(`❌ Online Check Fehler: ${error.message}`);
        }
    });

    client.addCommand('archive', async (msg, args) => {
        try {
            await client.analytics.archiveChat(msg.from);
            await msg.reply('📦 Chat archiviert!');
        } catch (error) {
            await msg.reply(`❌ Archive Fehler: ${error.message}`);
        }
    });

    client.addCommand('mute', async (msg, args) => {
        const duration = args[0] ? parseInt(args[0]) * 60 * 1000 : 8 * 60 * 60 * 1000; // Default 8 Stunden
        
        try {
            await client.analytics.muteChat(msg.from, duration);
            await msg.reply(`🔇 Chat für ${Math.round(duration / 60000)} Minuten stummgeschaltet!`);
        } catch (error) {
            await msg.reply(`❌ Mute Fehler: ${error.message}`);
        }
    });

    // Status Features
    client.addCommand('status', async (msg, args) => {
        const text = args.join(' ') || 'Test Status von Advanced Features!';
        
        try {
            await client.status.send('text', text);
            await msg.reply(`📢 Status gesendet: "${text}"`);
        } catch (error) {
            await msg.reply(`❌ Status Fehler: ${error.message}`);
        }
    });

    // System Features
    client.addCommand('backup', async (msg, args) => {
        try {
            await msg.reply('💾 Erstelle Backup...');
            const backup = await client.system.backup();
            await msg.reply(`✅ Backup erstellt! Timestamp: ${backup.timestamp}`);
        } catch (error) {
            await msg.reply(`❌ Backup Fehler: ${error.message}`);
        }
    });

    // Profile Picture Features - DEINE NEUE FUNKTION!
    client.addCommand('profilpic', async (msg, args) => {
        const mentions = msg.getMentions();
        
        if (mentions.length === 0) {
            return msg.reply('❌ Erwähne einen User: !profilpic @user');
        }
        
        const targetJid = mentions[0];
        
        try {
            const success = await msg.sendProfilePicture(targetJid, `Profilbild von @${targetJid.split('@')[0]}`);
            if (!success) {
                await msg.reply('❌ Kein Profilbild verfügbar oder Fehler beim Laden.');
            }
        } catch (error) {
            await msg.reply(`❌ Profilbild Fehler: ${error.message}`);
        }
    });

    client.addCommand('meinprofil', async (msg, args) => {
        const senderJid = msg.getSender();
        
        try {
            const success = await msg.sendProfilePicture(senderJid, 'Dein Profilbild');
            if (!success) {
                await msg.reply('❌ Dein Profilbild ist nicht verfügbar.');
            }
        } catch (error) {
            await msg.reply(`❌ Profilbild Fehler: ${error.message}`);
        }
    });

    console.log("✅ Alle Advanced Features Commands registriert!");

    client.addCommand('videomsg', async (msg, args) => {
        await msg.reply('📹 Video Message Feature ist verfügbar!\nUsage: msg.sendVideoMessage("video.mp4")');
    });

    client.addCommand('gif', async (msg, args) => {
        await msg.reply('🎬 GIF Feature ist verfügbar!\nUsage: msg.sendGif("animation.gif", "Caption")');
    });

    // Advanced Message Features
    client.addCommand('forward', async (msg, args) => {
        const mentions = msg.getMentions();
        if (mentions.length === 0) {
            return msg.reply('❌ Usage: !forward @user\nLeitet diese Nachricht an den erwähnten User weiter');
        }

        try {
            await msg.reply('🔄 Leite Nachricht weiter...');
            const results = await msg.forwardToMentioned();
            
            const successCount = results.filter(r => r.success).length;
            await msg.reply(`✅ Nachricht an ${successCount}/${results.length} User weitergeleitet!`);
        } catch (error) {
            await msg.reply(`❌ Forward Fehler: ${error.message}`);
        }
    });

    client.addCommand('pin', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Pin funktioniert nur in Gruppen!');
        }

        if (!(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können Nachrichten pinnen!');
        }

        try {
            await msg.pin();
            await msg.reply('📌 Nachricht gepinnt!');
        } catch (error) {
            await msg.reply(`❌ Pin Fehler: ${error.message}`);
        }
    });

    client.addCommand('star', async (msg, args) => {
        try {
            await msg.star();
            await msg.reply('⭐ Nachricht markiert!');
        } catch (error) {
            await msg.reply(`❌ Star Fehler: ${error.message}`);
        }
    });

    client.addCommand('quote', async (msg, args) => {
        const text = args.join(' ');
        if (!text) {
            return msg.reply('❌ Usage: !quote <text>');
        }

        try {
            await msg.quote(text);
        } catch (error) {
            await msg.reply(`❌ Quote Fehler: ${error.message}`);
        }
    });

    // Rich Content Features
    client.addCommand('buttons', async (msg, args) => {
        const text = args.join(' ') || 'Wähle eine Option:';
        
        try {
            await msg.sendButtons(text, [
                { id: 'btn1', text: 'Option 1' },
                { id: 'btn2', text: 'Option 2' },
                { id: 'btn3', text: 'Option 3' }
            ], 'WAEngine Button Test');
        } catch (error) {
            await msg.reply(`❌ Buttons Fehler: ${error.message}`);
        }
    });

    client.addCommand('list', async (msg, args) => {
        const title = args.join(' ') || 'Wähle aus der Liste:';
        
        try {
            await msg.sendList(title, 'Beschreibung der Liste', 'Optionen anzeigen', [
                {
                    title: 'Kategorie 1',
                    rows: [
                        { id: 'opt1', title: 'Option 1', description: 'Beschreibung 1' },
                        { id: 'opt2', title: 'Option 2', description: 'Beschreibung 2' }
                    ]
                },
                {
                    title: 'Kategorie 2',
                    rows: [
                        { id: 'opt3', title: 'Option 3', description: 'Beschreibung 3' }
                    ]
                }
            ]);
        } catch (error) {
            await msg.reply(`❌ List Fehler: ${error.message}`);
        }
    });

    // Advanced Group Features
    client.addCommand('groupinfo', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }

        try {
            const metadata = await client.get.GroupMetadata(msg.from);
            let info = `🏢 **Gruppeninfo**\n\n`;
            info += `📝 Name: ${metadata.subject}\n`;
            info += `👥 Mitglieder: ${metadata.participants.length}\n`;
            info += `👑 Admins: ${metadata.participants.filter(p => p.admin).length}\n`;
            info += `📅 Erstellt: ${new Date(metadata.creation * 1000).toLocaleDateString()}\n`;
            if (metadata.desc) info += `📄 Beschreibung: ${metadata.desc}\n`;

            await msg.reply(info);
        } catch (error) {
            await msg.reply(`❌ Group Info Fehler: ${error.message}`);
        }
    });

    client.addCommand('invitelink', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }

        if (!(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können Einladungslinks erstellen!');
        }

        try {
            const inviteLink = await client.group.getInviteLink(msg.from);
            await msg.reply(`🔗 **Einladungslink:**\n${inviteLink}`);
        } catch (error) {
            await msg.reply(`❌ Invite Link Fehler: ${error.message}`);
        }
    });

    // Privacy Features
    client.addCommand('block', async (msg, args) => {
        const mentions = msg.getMentions();
        if (mentions.length === 0) {
            return msg.reply('❌ Usage: !block @user');
        }

        try {
            await client.privacy.block(mentions[0]);
            await msg.reply(`🚫 User blockiert!`);
        } catch (error) {
            await msg.reply(`❌ Block Fehler: ${error.message}`);
        }
    });

    client.addCommand('unblock', async (msg, args) => {
        const mentions = msg.getMentions();
        if (mentions.length === 0) {
            return msg.reply('❌ Usage: !unblock @user');
        }

        try {
            await client.privacy.unblock(mentions[0]);
            await msg.reply(`✅ User entblockiert!`);
        } catch (error) {
            await msg.reply(`❌ Unblock Fehler: ${error.message}`);
        }
    });

    // Analytics Features
    client.addCommand('online', async (msg, args) => {
        const mentions = msg.getMentions();
        if (mentions.length === 0) {
            return msg.reply('❌ Usage: !online @user');
        }

        try {
            const isOnline = await client.analytics.isOnline(mentions[0]);
            const userNumber = mentions[0].split('@')[0].split(':')[0];
            await msg.reply(`📱 +${userNumber} ist ${isOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
        } catch (error) {
            await msg.reply(`❌ Online Check Fehler: ${error.message}`);
        }
    });

    client.addCommand('archive', async (msg, args) => {
        try {
            await client.analytics.archiveChat(msg.from);
            await msg.reply(`📦 Chat archiviert!`);
        } catch (error) {
            await msg.reply(`❌ Archive Fehler: ${error.message}`);
        }
    });

    client.addCommand('mute', async (msg, args) => {
        const duration = args[0] ? parseInt(args[0]) * 60 * 1000 : 8 * 60 * 60 * 1000; // Default 8h
        
        try {
            await client.analytics.muteChat(msg.from, duration);
            await msg.reply(`🔇 Chat für ${Math.round(duration / 60000)} Minuten stummgeschaltet!`);
        } catch (error) {
            await msg.reply(`❌ Mute Fehler: ${error.message}`);
        }
    });

    // Status Features
    client.addCommand('sendstatus', async (msg, args) => {
        const text = args.join(' ');
        if (!text) {
            return msg.reply('❌ Usage: !sendstatus <text>');
        }

        try {
            await client.status.send('text', text);
            await msg.reply(`📢 Status gesendet: "${text}"`);
        } catch (error) {
            await msg.reply(`❌ Status Fehler: ${error.message}`);
        }
    });

    // System Features
    client.addCommand('backup', async (msg, args) => {
        try {
            await msg.reply('💾 Erstelle Backup...');
            const backup = await client.system.backup();
            await msg.reply(`✅ Backup erstellt! Timestamp: ${backup.timestamp}`);
        } catch (error) {
            await msg.reply(`❌ Backup Fehler: ${error.message}`);
        }
    });

    client.addCommand('devices', async (msg, args) => {
        try {
            const devices = await client.system.getDevices();
            let deviceList = `📱 **Verknüpfte Geräte:**\n\n`;
            
            if (devices.length === 0) {
                deviceList += 'Keine zusätzlichen Geräte verknüpft.';
            } else {
                devices.forEach((device, i) => {
                    deviceList += `${i + 1}. ${device.name || 'Unbekannt'} (${device.id})\n`;
                });
            }
            
            await msg.reply(deviceList);
        } catch (error) {
            await msg.reply(`❌ Devices Fehler: ${error.message}`);
        }
    });

    // Group Lock/Unlock Commands - NEU!
    client.addCommand('lock', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }
        
        if (!(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können die Gruppe sperren!');
        }
        
        try {
            await msg.reply('🔒 Sperre Gruppe...');
            await client.group.setSettings(msg.from, {
                messagesAdminOnly: true
            });
            await msg.reply('🔒 Gruppe gesperrt! Nur noch Admins können schreiben.');
        } catch (error) {
            console.error('❌ Lock Fehler:', error);
            await msg.reply(`❌ Fehler beim Sperren: ${error.message}\n💡 Stelle sicher, dass ich Admin-Rechte habe.`);
        }
    });

    client.addCommand('unlock', async (msg, args) => {
        if (!msg.isGroup) {
            return msg.reply('❌ Nur in Gruppen verfügbar!');
        }
        
        if (!(await msg.isAdmin())) {
            return msg.reply('❌ Nur Admins können die Gruppe entsperren!');
        }
        
        try {
            await msg.reply('🔓 Entsperre Gruppe...');
            await client.group.setSettings(msg.from, {
                messagesAdminOnly: false
            });
            await msg.reply('🔓 Gruppe entsperrt! Alle können wieder schreiben.');
        } catch (error) {
            console.error('❌ Unlock Fehler:', error);
            await msg.reply(`❌ Fehler beim Entsperren: ${error.message}\n💡 Stelle sicher, dass ich Admin-Rechte habe.`);
        }
    });

    // Advanced Features Overview
    client.addCommand('advanced', async (msg, args) => {
        let overview = `🚀 **WAEngine v1.7.3 - Advanced Features**\n\n`;
        overview += `📱 **Media:** !voice, !videomsg, !gif\n`;
        overview += `💬 **Messages:** !forward, !pin, !star, !quote\n`;
        overview += `🎨 **Rich Content:** !buttons, !list\n`;
        overview += `👥 **Groups:** !groupinfo, !invitelink, !lock, !unlock\n`;
        overview += `🔐 **Privacy:** !block, !unblock\n`;
        overview += `📊 **Analytics:** !online, !archive, !mute\n`;
        overview += `📢 **Status:** !sendstatus\n`;
        overview += `🛠️ **System:** !backup, !devices\n\n`;
        overview += `✨ **Insgesamt 400+ neue Funktionen verfügbar!**`;
        
        await msg.reply(overview);
    });

    try {
        console.log("📝 Event-Handler registriert");
        
        // Event-Handler registrieren
        client.on('connected', () => {
            console.log("✅ WAEngine verbunden!");
            console.log(`🎯 Prefix: "${prefix}" | Commands: ${client.getCommands().length}`);
        });

        // ===== COMMAND EVENT =====
        client.on('command', async (msg) => {
            console.log(`⚡ Command: ${prefix}${msg.command} von ${msg.getSender()}`);
        });

        // ===== MESSAGE EVENT =====
        client.on('message', async (msg) => {
            // Nur normale Nachrichten loggen (keine Commands)
            if (!msg.isCommand) {
                console.log(`📨 Nachricht empfangen: "${msg.text}" von ${msg.from}`);

                // Deine eigenen Message-Funktionen testen
                try {
                    if (msg.text === 'hallo') {
                        console.log("🤖 Antworte auf 'hallo'...");
                        await msg.normalType('Hallo zurück! 👋');
                    }

                    if (msg.text === 'test') {
                        console.log("🤖 Antworte auf 'test'...");
                        await msg.realisticType('Test erfolgreich! WAEngine funktioniert! 🎉');
                    }

                    if (msg.text === 'debug') {
                        console.log("🤖 Debug-Info senden...");
                        await msg.reply(`🔍 Debug Info:\n✅ Message empfangen\n✅ Event-Handler aktiv\n✅ WAEngine v1.0.3 funktioniert!`);
                    }

                    if (msg.text === 'poll') {
                        console.log("🤖 Erstelle Poll...");
                        await msg.quickType('Erstelle Poll...');
                        await msg.sendPoll('Lieblings Farbe?', ['Rot', 'Blau', 'Grün', 'Gelb']);
                    }

                    if (msg.text === 'mention') {
                        console.log("🤖 Mention-Test...");
                        await msg.slowTypeWithMention('Hallo @user! Wie geht es dir?', msg.getSender());
                    }

                    if (msg.text === 'quickmention') {
                        console.log("🤖 Quick Mention-Test...");
                        await msg.quickTypeWithMention('Hey @user! 👋', msg.getSender());
                    }

                    if (msg.text === 'normalmention') {
                        console.log("🤖 Normal Mention-Test...");
                        await msg.normalTypeWithMention('Hallo @user, schön dich zu sehen!', msg.getSender());
                    }

                    if (msg.text === 'alle' && msg.isGroup) {
                        console.log("🤖 Mention All...");
                        await msg.mentionAll('Hallo an alle in der Gruppe!');
                    }

                    if (msg.text === 'typing') {
                        console.log("🤖 Typing Demo...");
                        await msg.visualWrite(true);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        await msg.visualWrite(false);
                        await msg.reply('Das war ein 3-Sekunden Typing Test! ⌨️');
                    }
                } catch (error) {
                    console.error("❌ Fehler beim Antworten:", error);
                }
            }
        });

        client.on('disconnected', (data) => {
            console.log("🔴 Verbindung getrennt:", data.reason);
        });

        console.log("🔄 Verbinde...");
        
        // Verbinden
        await client.connect();

        console.log("🎯 WAEngine bereit!");
        console.log(`💬 Test-Nachrichten: 'hallo', 'test', 'poll', 'mention', 'quickmention', 'normalmention', 'alle', 'typing', '${prefix}help', '${prefix}ignore'`);

    } catch (error) {
        console.error("❌ Fehler:", error);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Beende Library...');
    process.exit(0);
});

main();