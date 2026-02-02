// Custom Poll Test - Testet benutzerdefinierte Poll-Commands
import { WhatsAppClient } from "./src/client.js";

console.log("🎯 CUSTOM POLL TEST - Benutzerdefinierte Umfragen");
console.log("=" .repeat(60));

const client = new WhatsAppClient({
    printQR: true,
    silent: false,
    verbose: false,
    connectionTimeout: 30000,
    autoRestart: false
});

// Poll Command hinzufügen
client.addCommand('poll', async (msg, args) => {
    console.log('📊 Poll Command aufgerufen!');
    console.log('📋 Rohe Args:', args);
    console.log('📋 Args Länge:', args.length);
    
    if (args.length < 3) {
        const usage = `❌ **Poll Usage:**\n\n` +
                     `\`!poll "Frage" "Option1" "Option2" ...\`\n\n` +
                     `**Beispiele:**\n` +
                     `• \`!poll "Lieblings Farbe?" "Rot" "Blau" "Grün"\`\n` +
                     `• \`!poll "Pizza oder Pasta?" "🍕 Pizza" "🍝 Pasta"\`\n` +
                     `• \`!poll "Meeting Zeit?" "Morgens" "Mittags" "Abends"\`\n\n` +
                     `📝 **Wichtig:** Verwende Anführungszeichen um Frage und Optionen!`;
        
        return msg.reply(usage);
    }
    
    const question = args[0];
    const options = args.slice(1);
    
    console.log('❓ Frage:', question);
    console.log('📝 Optionen:', options);
    
    // Validierung
    if (options.length < 2) {
        return msg.reply('❌ Mindestens 2 Optionen erforderlich!');
    }
    
    if (options.length > 12) {
        return msg.reply('❌ Maximal 12 Optionen erlaubt!');
    }
    
    try {
        console.log('🚀 Erstelle Poll...');
        await msg.reply(`🧪 Erstelle Poll: "${question}" mit ${options.length} Optionen...`);
        
        const result = await msg.sendPoll(question, options);
        
        if (result) {
            await msg.reply(`✅ Poll erfolgreich erstellt!\n📊 **${question}**\n🎯 ${options.length} Optionen verfügbar`);
        } else {
            await msg.reply('⚠️ Poll wurde als Fallback erstellt (Emoji-Version)');
        }
        
    } catch (error) {
        console.error('❌ Poll Fehler:', error);
        await msg.reply(`❌ Poll-Fehler: ${error.message}`);
    }
});

// Multi-Poll Command
client.addCommand('multipoll', async (msg, args) => {
    console.log('📊 Multi-Poll Command aufgerufen!');
    console.log('📋 Args:', args);
    
    if (args.length < 4) {
        const usage = `❌ **Multi-Poll Usage:**\n\n` +
                     `\`!multipoll "Frage" "Anzahl" "Option1" "Option2" ...\`\n\n` +
                     `**Beispiele:**\n` +
                     `• \`!multipoll "Sprachen?" "2" "JS" "Python" "Java" "Go"\`\n` +
                     `• \`!multipoll "Hobbys?" "3" "Sport" "Musik" "Gaming" "Lesen"\`\n\n` +
                     `📝 **Anzahl:** Wie viele Optionen wählbar sind (1-12)`;
        
        return msg.reply(usage);
    }
    
    const question = args[0];
    const maxSelections = parseInt(args[1]);
    const options = args.slice(2);
    
    console.log('❓ Frage:', question);
    console.log('🔢 Max Auswahlen:', maxSelections);
    console.log('📝 Optionen:', options);
    
    // Validierung
    if (isNaN(maxSelections) || maxSelections < 1 || maxSelections > 12) {
        return msg.reply('❌ Anzahl muss zwischen 1 und 12 sein!');
    }
    
    if (options.length < 2) {
        return msg.reply('❌ Mindestens 2 Optionen erforderlich!');
    }
    
    if (maxSelections > options.length) {
        return msg.reply('❌ Anzahl kann nicht größer als verfügbare Optionen sein!');
    }
    
    try {
        console.log('🚀 Erstelle Multi-Poll...');
        await msg.reply(`🧪 Erstelle Multi-Poll: "${question}" (max ${maxSelections} Auswahlen)...`);
        
        const result = await msg.sendMultiPoll(question, options, maxSelections);
        
        if (result) {
            await msg.reply(`✅ Multi-Poll erfolgreich erstellt!\n📊 **${question}**\n🎯 Max ${maxSelections} von ${options.length} Optionen wählbar`);
        } else {
            await msg.reply('⚠️ Multi-Poll wurde als Fallback erstellt');
        }
        
    } catch (error) {
        console.error('❌ Multi-Poll Fehler:', error);
        await msg.reply(`❌ Multi-Poll-Fehler: ${error.message}`);
    }
});

// Test Command für Argument-Parsing
client.addCommand('testargs', async (msg, args) => {
    console.log('🧪 Test Args Command aufgerufen!');
    console.log('📋 Roher Text:', msg.text);
    console.log('📋 Command:', msg.command);
    console.log('📋 Args Array:', args);
    console.log('📋 Args Länge:', args.length);
    
    let response = `🧪 **Argument-Parsing Test**\n\n`;
    response += `📝 **Roher Text:** \`${msg.text}\`\n`;
    response += `⚡ **Command:** \`${msg.command}\`\n`;
    response += `📋 **Args (${args.length}):**\n`;
    
    args.forEach((arg, index) => {
        response += `   ${index + 1}. "${arg}"\n`;
    });
    
    response += `\n🎯 **Test verschiedene Formate:**\n`;
    response += `• \`!testargs "arg1" "arg2" "arg3"\`\n`;
    response += `• \`!testargs arg1 arg2 arg3\`\n`;
    response += `• \`!testargs "mit leerzeichen" "normal"\``;
    
    await msg.reply(response);
});

// Help Command
client.addCommand('help', async (msg, args) => {
    const helpText = `🎯 **CUSTOM POLL COMMANDS**\n\n` +
                   `📊 **!poll** "Frage" "Opt1" "Opt2" ...\n` +
                   `   Erstellt eine einfache Umfrage\n\n` +
                   `📊 **!multipoll** "Frage" "Anzahl" "Opt1" "Opt2" ...\n` +
                   `   Erstellt Multi-Auswahl Umfrage\n\n` +
                   `🧪 **!testargs** "arg1" "arg2" ...\n` +
                   `   Testet Argument-Parsing\n\n` +
                   `❓ **!help**\n` +
                   `   Zeigt diese Hilfe\n\n` +
                   `📝 **Wichtig:** Verwende immer Anführungszeichen!\n` +
                   `✅ Richtig: \`!poll "Frage?" "Ja" "Nein"\`\n` +
                   `❌ Falsch: \`!poll Frage? Ja Nein\``;
    
    await msg.reply(helpText);
});

client.on('connected', () => {
    console.log("🎉 Bot verbunden!");
    console.log("🎯 Custom Poll System bereit!");
    console.log("\n📊 **Test-Commands:**");
    console.log("   !poll \"Frage?\" \"Opt1\" \"Opt2\"");
    console.log("   !multipoll \"Frage?\" \"2\" \"Opt1\" \"Opt2\" \"Opt3\"");
    console.log("   !testargs \"test1\" \"test2\"");
    console.log("   !help");
});

client.on('message', (message) => {
    if (message.isCommand) {
        console.log(`⚡ Command: ${message.command}, Args: [${message.args.join(', ')}]`);
    }
});

console.log("🔄 Starte Verbindung für Custom Poll Test...");

try {
    await client.connect();
    console.log("🎯 Bot läuft! Sende '!help' für alle Commands.");
    
    // Automatisches Beenden nach 30 Sekunden für Test-Zwecke
    setTimeout(() => {
        console.log("\n⏰ Test-Timeout erreicht - beende Bot...");
        process.exit(0);
    }, 30000);
    
} catch (error) {
    console.error("❌ Verbindungsfehler:", error.message);
    process.exit(1);
}

process.on('SIGINT', async () => {
    console.log('\n👋 Beende Library...');
    process.exit(0);
});

main();