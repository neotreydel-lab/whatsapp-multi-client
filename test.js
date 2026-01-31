import { WhatsAppClient } from "./src/index.js";

async function main() {
    console.log("🚀 Starte WhatsApp Library Test...");
    
    // Deine eigene WhatsApp Library verwenden
    const client = new WhatsAppClient({
        authDir: "./auth",
        logLevel: "silent" // Sauber ohne Debug-Spam
    });

    // ===== PREFIX SYSTEM SETUP =====
    const prefix = "!"; // Dein Prefix
    client.setPrefix(prefix);

    // ===== COMMAND REGISTRIERUNG =====
    client.addCommand('help', async (msg, args) => {
        const commands = client.getCommands();
        await msg.reply(`📋 Verfügbare Commands:\n${commands.map(cmd => `${prefix}${cmd}`).join('\n')}`);
    });

    client.addCommand('ping', async (msg, args) => {
        await msg.reply('🏓 Pong!');
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

    try {
        console.log("📝 Registriere Event-Handler...");
        
        // Event-Handler registrieren
        client.on('connected', () => {
            console.log("\n🎉 ERFOLGREICH VERBUNDEN!");
            console.log("✅ WhatsApp Library ist bereit!");
            console.log(`🎯 Prefix: "${prefix}"`);
            console.log(`⚡ Commands: ${client.getCommands().length}`);
        });

        // ===== COMMAND EVENT =====
        client.on('command', async (msg) => {
            console.log(`\n⚡ COMMAND EMPFANGEN: ${prefix}${msg.command}`);
            console.log(`📝 Args: [${msg.args.join(', ')}]`);
            console.log(`👤 Von: ${msg.getSender()}`);
            console.log(`🏢 Admin: ${await msg.isAdmin()}`);
        });

        // ===== MESSAGE EVENT =====
        client.on('message', async (msg) => {
            // Nur normale Nachrichten loggen (keine Commands)
            if (!msg.isCommand) {
                console.log("\n" + "=".repeat(60));
                console.log("📨 NEUE NACHRICHT EMPFANGEN!");
                console.log("=".repeat(60));
                console.log(`📱 Von: ${msg.from}`);
                console.log(`💬 Text: "${msg.text}"`);
                console.log(`🏷️ Typ: ${msg.type}`);
                console.log(`👥 Gruppe: ${msg.isGroup ? 'Ja' : 'Nein'}`);
                console.log(`⏰ Zeit: ${new Date(msg.timestamp * 1000).toLocaleString()}`);
                console.log("=".repeat(60));

                // Deine eigenen Message-Funktionen testen
                try {
                    if (msg.text === 'hallo') {
                        console.log("🤖 Antworte mit 'Hallo zurück!' (mit Typing)");
                        await msg.normalType('Hallo zurück! 👋');
                    }

                    if (msg.text === 'test') {
                        console.log("🤖 Antworte mit Test-Nachricht (mit Typing)");
                        await msg.realisticType('Test erfolgreich! Deine Library funktioniert perfekt! 🎉');
                    }

                    if (msg.text === 'poll') {
                        console.log("🤖 Erstelle Test-Poll (mit Typing)");
                        await msg.quickType('Erstelle Poll...');
                        await msg.sendPoll('Lieblings Farbe?', ['Rot', 'Blau', 'Grün', 'Gelb']);
                    }

                    if (msg.text === 'mention') {
                        console.log("🤖 Antworte mit Mention (mit Typing)");
                        await msg.slowType('Hallo @user! Wie geht es dir?', [msg.getSender()]);
                    }

                    if (msg.text === 'alle' && msg.isGroup) {
                        console.log("🤖 Erwähne alle in der Gruppe (mit Typing)");
                        await msg.normalType('Sammle alle Mitglieder...');
                        await msg.mentionAll('Hallo an alle in der Gruppe!');
                    }

                    if (msg.text === 'typing') {
                        console.log("🤖 Typing Demo");
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

        console.log("🔄 Starte Verbindung...");
        
        // Verbinden
        await client.connect();

        console.log("\n🎯 Library ist bereit!");
        console.log("\n📋 **NEUE FEATURES:**");
        console.log(`   🎯 Prefix System: "${prefix}"`);
        console.log(`   ⚡ Commands: ${prefix}help, ${prefix}ping, ${prefix}poll, ${prefix}stats, ${prefix}kick`);
        console.log(`   📊 Polls: msg.sendPoll(question, options)`);
        console.log(`   🛡️ Permissions: msg.isAdmin(), msg.isBotAdmin(), msg.isOwner()`);
        console.log(`   📈 Stats: msg.stats.getMessageCount(), getUserActivity(), etc.`);
        console.log("\n💬 **TEST NACHRICHTEN:**");
        console.log("   - 'hallo' → Antwortet mit Hallo zurück");
        console.log("   - 'poll' → Erstellt Test-Poll");
        console.log("   - 'mention' → Antwortet mit Mention");
        console.log(`   - '${prefix}help' → Zeigt alle Commands`);
        console.log(`   - '${prefix}stats' → Zeigt Statistiken`);

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