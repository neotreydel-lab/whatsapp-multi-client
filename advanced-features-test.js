import { WhatsAppClient, EasyBot } from "./src/index.js";

async function testAdvancedFeatures() {
    console.log("🚀 Advanced Features Test startet...");
    
    // ===== STANDARD CLIENT TEST =====
    console.log("\n📱 Teste Standard WhatsApp Client v1.7.3...");
    
    const client = new WhatsAppClient({
        authDir: "./auth",
        logLevel: "silent",
        quietHeartbeat: true
    });

    client.setPrefix("!");

    // ===== ADVANCED MEDIA FEATURES TESTS =====
    console.log("🎵 Registriere Advanced Media Commands...");
    
    client.addCommand('voice', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !voice <audio-path>');
        }
        
        try {
            await msg.sendVoiceMessage(args[0]);
            await msg.reply('✅ Voice Message gesendet!');
        } catch (error) {
            await msg.reply(`❌ Voice Fehler: ${error.message}`);
        }
    });

    client.addCommand('videomsg', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !videomsg <video-path>');
        }
        
        try {
            await msg.sendVideoMessage(args[0]);
            await msg.reply('✅ Video Message gesendet!');
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
            await msg.sendGif(gifPath, caption);
            await msg.reply('✅ GIF gesendet!');
        } catch (error) {
            await msg.reply(`❌ GIF Fehler: ${error.message}`);
        }
    });

    // ===== ADVANCED MESSAGE FEATURES TESTS =====
    console.log("💬 Registriere Advanced Message Commands...");
    
    client.addCommand('forward', async (msg, args) => {
        try {
            const mentions = msg.getMentions();
            if (mentions.length > 0) {
                const results = await msg.forwardToMentioned();
                await msg.reply(`✅ Nachricht an ${results.length} User weitergeleitet!`);
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

    // ===== RICH CONTENT FEATURES TESTS =====
    console.log("🎨 Registriere Rich Content Commands...");
    
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

    // ===== GROUP FEATURES TESTS =====
    console.log("👥 Registriere Group Commands...");
    
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

    // ===== PRIVACY FEATURES TESTS =====
    console.log("🔒 Registriere Privacy Commands...");
    
    client.addCommand('block', async (msg, args) => {
        const mentions = msg.getMentions();
        const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
        
        try {
            await client.privacy.block(targetJid);
            await msg.reply('🚫 User blockiert!');
        } catch (error) {
            await msg.reply(`❌ Block Fehler: ${error.message}`);
        }
    });

    client.addCommand('unblock', async (msg, args) => {
        const mentions = msg.getMentions();
        const targetJid = mentions.length > 0 ? mentions[0] : msg.getSender();
        
        try {
            await client.privacy.unblock(targetJid);
            await msg.reply('✅ User entblockiert!');
        } catch (error) {
            await msg.reply(`❌ Unblock Fehler: ${error.message}`);
        }
    });

    // ===== ANALYTICS FEATURES TESTS =====
    console.log("📊 Registriere Analytics Commands...");
    
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

    // ===== STATUS FEATURES TESTS =====
    console.log("📢 Registriere Status Commands...");
    
    client.addCommand('status', async (msg, args) => {
        const text = args.join(' ') || 'Test Status von Advanced Features!';
        
        try {
            await client.status.send('text', text);
            await msg.reply(`📢 Status gesendet: "${text}"`);
        } catch (error) {
            await msg.reply(`❌ Status Fehler: ${error.message}`);
        }
    });

    // ===== SYSTEM FEATURES TESTS =====
    console.log("⚙️ Registriere System Commands...");
    
    client.addCommand('backup', async (msg, args) => {
        try {
            await msg.reply('💾 Erstelle Backup...');
            const backup = await client.system.backup();
            await msg.reply(`✅ Backup erstellt! Timestamp: ${backup.timestamp}`);
        } catch (error) {
            await msg.reply(`❌ Backup Fehler: ${error.message}`);
        }
    });

    // ===== PROFILE PICTURE FEATURES =====
    console.log("🖼️ Registriere Profile Picture Commands...");
    
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

    // ===== HELP COMMAND =====
    client.addCommand('help', async (msg, args) => {
        let help = `🤖 **WAEngine v1.7.3 - Advanced Features Test Commands**\n\n`;
        help += `🎵 **Media Features:**\n`;
        help += `!voice <path> - Voice Message senden\n`;
        help += `!videomsg <path> - Video Message senden\n`;
        help += `!gif <path> [caption] - GIF senden\n\n`;
        help += `💬 **Message Features:**\n`;
        help += `!forward - Nachricht weiterleiten\n`;
        help += `!pin - Nachricht pinnen (Admin)\n`;
        help += `!star - Nachricht markieren\n`;
        help += `!quote <text> - Nachricht zitieren\n\n`;
        help += `🎨 **Rich Content:**\n`;
        help += `!buttons [text] - Button Message\n`;
        help += `!list - List Message\n\n`;
        help += `👥 **Group Features:**\n`;
        help += `!groupinfo - Gruppeninfo anzeigen\n`;
        help += `!invitelink - Einladungslink (Admin)\n\n`;
        help += `🔒 **Privacy:**\n`;
        help += `!block [@user] - User blockieren\n`;
        help += `!unblock [@user] - User entblockieren\n\n`;
        help += `📊 **Analytics:**\n`;
        help += `!online [@user] - Online Status prüfen\n`;
        help += `!archive - Chat archivieren\n`;
        help += `!mute [minuten] - Chat stummschalten\n\n`;
        help += `📢 **Status:**\n`;
        help += `!status <text> - Status senden\n\n`;
        help += `🖼️ **Profile:**\n`;
        help += `!profilpic @user - Profilbild senden\n`;
        help += `!meinprofil - Eigenes Profilbild\n\n`;
        help += `⚙️ **System:**\n`;
        help += `!backup - Backup erstellen`;
        
        await msg.reply(help);
    });

    // ===== EASYBOT TEST =====
    console.log("\n🤖 Teste EasyBot Advanced Features...");
    
    const easyBot = EasyBot.create({
        authDir: "./auth/easy-bot",
        quietHeartbeat: true
    });

    // EasyBot Advanced Features Chaining Test
    easyBot
        .when('test voice')
        .voice('./test-audio.ogg')
        .reply('Voice Message Test!')
        .done()
        
        .when('test forward')
        .forward()
        .reply('Forward Test!')
        .done()
        
        .when('test buttons')
        .buttons('Wähle eine Option:', [
            { id: 'opt1', text: 'Option 1' },
            { id: 'opt2', text: 'Option 2' }
        ], 'EasyBot Test')
        .done()
        
        .when('test group')
        .groupInfo()
        .inviteLink()
        .done()
        
        .when('test analytics')
        .checkOnline()
        .archive()
        .done()
        
        .when('test status')
        .sendStatus('EasyBot Advanced Features Test!')
        .done()
        
        .when('test backup')
        .backup()
        .reply('Backup Test abgeschlossen!')
        .done();

    console.log("✅ EasyBot Advanced Features konfiguriert!");

    // ===== CLIENT STARTEN =====
    console.log("\n🚀 Starte WhatsApp Client...");
    
    try {
        await client.connect();
        console.log("✅ Standard Client verbunden!");
        
        // Optional: EasyBot auch starten
        // await easyBot.start();
        // console.log("✅ EasyBot gestartet!");
        
    } catch (error) {
        console.error("❌ Fehler beim Starten:", error);
    }
}

// ===== ADVANCED FEATURES DEMO =====
async function demoAdvancedFeatures() {
    console.log("\n🎯 Advanced Features Demo...");
    
    const bot = EasyBot.create()
        .enableDefaults()
        .enableAll();

    // Komplexe Advanced Features Chains
    bot
        .when('demo media')
        .reply('🎵 Media Features Demo:')
        .voice('./demo-audio.ogg')
        .gif('./demo.gif', 'Demo GIF!')
        .reply('✅ Media Demo abgeschlossen!')
        .done()
        
        .when('demo rich')
        .reply('🎨 Rich Content Demo:')
        .buttons('Wähle deine Lieblings-Feature:', [
            { id: 'media', text: '🎵 Media' },
            { id: 'group', text: '👥 Groups' },
            { id: 'privacy', text: '🔒 Privacy' }
        ])
        .list('Advanced Features', 'Alle verfügbaren Features:', 'Features anzeigen', [
            {
                title: 'Core Features',
                rows: [
                    { title: 'Voice Messages', description: 'Sprachnachrichten', id: 'voice' },
                    { title: 'Rich Content', description: 'Buttons & Lists', id: 'rich' }
                ]
            }
        ])
        .done()
        
        .when('demo group')
        .reply('👥 Group Features Demo:')
        .groupInfo()
        .inviteLink()
        .reply('✅ Group Demo abgeschlossen!')
        .done()
        
        .when('demo all')
        .reply('🚀 Vollständige Advanced Features Demo:')
        .voice('./demo-audio.ogg')
        .forward()
        .star()
        .buttons('Demo Buttons:', [{ id: 'demo', text: '✨ Demo' }])
        .groupInfo()
        .checkOnline()
        .sendStatus('Advanced Features Demo!')
        .backup()
        .reply('🎉 Alle Advanced Features demonstriert!')
        .done();

    console.log("✅ Advanced Features Demo konfiguriert!");
    
    return bot;
}

// ===== MAIN EXECUTION =====
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log("🎯 Advanced Features Test & Demo");
    console.log("================================");
    
    try {
        await testAdvancedFeatures();
        
        // Optional: Demo auch ausführen
        // const demoBot = await demoAdvancedFeatures();
        // await demoBot.start();
        
    } catch (error) {
        console.error("❌ Fehler:", error);
        process.exit(1);
    }
}

export { testAdvancedFeatures, demoAdvancedFeatures };