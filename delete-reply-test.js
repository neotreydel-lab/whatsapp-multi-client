import { WhatsAppClient } from "./src/client.js";

console.log("🧪 Delete Reply Test");
console.log("=" .repeat(50));

const client = new WhatsAppClient({
    printQR: true,
    logLevel: "silent"
});

client.setPrefix('!');

// Test Command: Lösche die Message auf die geantwortet wurde
client.addCommand('delete', async (msg) => {
    console.log('\n🗑️ Delete Command ausgeführt');
    
    // Prüfe ob es eine Reply ist
    const hasQuoted = msg.raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!hasQuoted) {
        await msg.reply('❌ Bitte antworte auf eine Nachricht die gelöscht werden soll!');
        return;
    }
    
    // Lösche die Reply-Message
    const result = await msg.deleteFromReply();
    
    console.log('📋 Lösch-Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
        await msg.reply('✅ Nachricht wurde gelöscht!');
    } else {
        // Detaillierte Fehlermeldungen
        let errorMsg = '❌ Fehler beim Löschen:\n\n';
        
        switch (result.reason) {
            case 'no_reply':
                errorMsg += '📝 Keine Reply gefunden';
                break;
            case 'not_from_bot':
                errorMsg += '🤖 Diese Nachricht ist nicht vom Bot!\n';
                errorMsg += '💡 Tipp: Nur Bot-Nachrichten können gelöscht werden';
                break;
            case 'message_not_found':
                errorMsg += '� Message zu alt oder bereits gelöscht\n';
                errorMsg += '💡 Tipp: Nur neuere Messages können gelöscht werden';
                break;
            case 'no_permission':
                errorMsg += '🔒 Keine Berechtigung zum Löschen\n';
                errorMsg += '💡 Tipp: Nur eigene Messages können gelöscht werden';
                break;
            default:
                errorMsg += `⚠️ ${result.error || 'Unbekannter Fehler'}`;
        }
        
        await msg.reply(errorMsg);
    }
});

// Test Command: Info über Reply
client.addCommand('replyinfo', async (msg) => {
    const quotedMessage = msg.raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedKey = msg.raw.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const quotedParticipant = msg.raw.message?.extendedTextMessage?.contextInfo?.participant;
    
    if (!quotedMessage) {
        await msg.reply('❌ Keine Reply gefunden!');
        return;
    }
    
    const botJid = msg.client.socket.user?.id;
    const botNumber = botJid?.split('@')[0]?.split(':')[0];
    const quotedNumber = quotedParticipant?.split('@')[0]?.split(':')[0];
    const isFromBot = botNumber === quotedNumber;
    
    let info = '📋 Reply Info:\n\n';
    info += `🆔 Message ID: ${quotedKey}\n`;
    info += `👤 Participant: ${quotedParticipant || 'N/A'}\n`;
    info += `🤖 Bot JID: ${botJid}\n`;
    info += `� Bot Number: ${botNumber}\n`;
    info += `🔢 Quoted Number: ${quotedNumber}\n`;
    info += `✅ Is from Bot: ${isFromBot ? 'JA' : 'NEIN'}\n`;
    info += `📝 Type: ${Object.keys(quotedMessage)[0]}\n`;
    info += `📱 Is Group: ${msg.isGroup ? 'JA' : 'NEIN'}\n`;
    
    await msg.reply(info);
});

// Test Command: Sende eine Test-Message vom Bot
client.addCommand('testmsg', async (msg) => {
    await msg.reply('🧪 Dies ist eine Test-Nachricht vom Bot!\n\n💡 Antworte darauf mit !delete um sie zu löschen.');
});

// Connection Events
client.on('connected', () => {
    console.log("\n✅ Bot verbunden!");
    console.log("\n📝 Verfügbare Commands:");
    console.log("   !testmsg - Sende eine Test-Nachricht vom Bot");
    console.log("   !delete - Lösche die Message auf die geantwortet wurde");
    console.log("   !replyinfo - Zeige Info über die Reply-Message");
    console.log("\n💡 Anleitung:");
    console.log("   1. Sende eine beliebige Nachricht (oder !testmsg)");
    console.log("   2. Antworte darauf mit: !delete");
    console.log("   3. Die Nachricht wird gelöscht (wenn möglich)!");
    console.log("\n⚠️ HINWEIS: WhatsApp erlaubt nur das Löschen eigener Messages!");
    console.log("   Bot-Messages: ✅ Können gelöscht werden");
    console.log("   User-Messages: ❌ Können NICHT gelöscht werden (WhatsApp Einschränkung)");
});

// Verbinden
await client.connect();

console.log("\n⏳ Warte auf Commands...");
