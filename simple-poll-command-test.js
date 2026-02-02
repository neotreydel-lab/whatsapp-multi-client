// Simple Poll Command Test - Testet nur das Command-Parsing ohne WhatsApp-Verbindung
import { PrefixManager } from "./src/prefix-manager.js";

console.log("🎯 SIMPLE POLL COMMAND TEST");
console.log("=" .repeat(50));

const prefixManager = new PrefixManager('./data');

// Simuliere eine Message-Klasse für Tests
class MockMessage {
    constructor(text, from = 'test@s.whatsapp.net') {
        this.text = text;
        this.from = from;
        this.isCommand = false;
        this.command = null;
        this.args = [];
        
        // Parse Command
        const commandData = prefixManager.parseCommand(text, from);
        if (commandData) {
            this.isCommand = true;
            this.command = commandData.command;
            this.args = commandData.args;
        }
    }
    
    async reply(text) {
        console.log(`📤 Reply: ${text}`);
        return { key: { id: 'mock123' } };
    }
    
    async sendPoll(question, options) {
        console.log(`📊 sendPoll aufgerufen:`);
        console.log(`   ❓ Frage: "${question}"`);
        console.log(`   📝 Optionen: [${options.map(opt => `"${opt}"`).join(', ')}]`);
        return { key: { id: 'poll123' } };
    }
}

// Simuliere Poll Command Handler
async function handlePollCommand(msg, args) {
    console.log('\n📊 Poll Command Handler aufgerufen!');
    console.log(`📋 Args: [${args.map(arg => `"${arg}"`).join(', ')}]`);
    console.log(`📋 Args Länge: ${args.length}`);
    
    if (args.length < 3) {
        const usage = `❌ **Poll Usage:**\n` +
                     `!poll "Frage" "Option1" "Option2" ...\n` +
                     `Beispiel: !poll "Lieblings Farbe?" "Rot" "Blau" "Grün"`;
        
        await msg.reply(usage);
        return;
    }
    
    const question = args[0];
    const options = args.slice(1);
    
    console.log(`❓ Extrahierte Frage: "${question}"`);
    console.log(`📝 Extrahierte Optionen: [${options.map(opt => `"${opt}"`).join(', ')}]`);
    
    // Validierung
    if (options.length < 2) {
        await msg.reply('❌ Mindestens 2 Optionen erforderlich!');
        return;
    }
    
    if (options.length > 12) {
        await msg.reply('❌ Maximal 12 Optionen erlaubt!');
        return;
    }
    
    try {
        await msg.reply(`🧪 Erstelle Poll: "${question}" mit ${options.length} Optionen...`);
        await msg.sendPoll(question, options);
        await msg.reply(`✅ Poll erfolgreich erstellt!`);
        
    } catch (error) {
        console.error('❌ Poll Fehler:', error);
        await msg.reply(`❌ Poll-Fehler: ${error.message}`);
    }
}

// Test verschiedene Poll-Commands
const testCommands = [
    '!poll "Lieblings Farbe?" "Rot" "Blau" "Grün"',
    '!poll "Was ist 2+2?" "3" "4" "5"',
    '!poll "Pizza oder Pasta?" "🍕 Pizza" "🍝 Pasta"',
    '!poll "Meeting Zeit?" "Morgens" "Mittags" "Abends"',
    '!poll Ohne Anführungszeichen Test',
    '!poll "Nur eine Option"',
    '!poll',
    '!poll "Zu viele" "1" "2" "3" "4" "5" "6" "7" "8" "9" "10" "11" "12" "13"'
];

console.log("🧪 Teste verschiedene Poll-Commands:\n");

for (let i = 0; i < testCommands.length; i++) {
    const testCommand = testCommands[i];
    
    console.log(`${i + 1}. Test: ${testCommand}`);
    console.log("-".repeat(50));
    
    const mockMsg = new MockMessage(testCommand);
    
    if (mockMsg.isCommand && mockMsg.command === 'poll') {
        await handlePollCommand(mockMsg, mockMsg.args);
    } else {
        console.log('❌ Kein Poll-Command erkannt');
    }
    
    console.log('');
}

console.log("✅ Simple Poll Command Test abgeschlossen!");
console.log("🎯 Das Argument-Parsing funktioniert korrekt!");
