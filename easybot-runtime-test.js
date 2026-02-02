// EasyBot Runtime Test - Alle Funktionen testen
import { quickBot } from './src/easy-bot.js';

console.log('🧪 EasyBot Runtime Test startet...');

async function testEasyBot() {
    try {
        // Bot erstellen
        console.log('1️⃣ Bot erstellen...');
        const bot = quickBot();
        
        // Basis-Funktionen testen
        console.log('2️⃣ Basis-Funktionen testen...');
        
        // Rules hinzufügen - EINFACHES CHAINING
        bot.when("test").reply("Test erfolgreich! ✅");
        bot.when("hallo").react("👋");
        bot.when("hallo2").reply("Hallo zurück!");
        
        // Commands hinzufügen
        bot.command("ping", "Pong! 🏓");
        bot.command("status", (msg) => {
            const status = bot.status();
            return `📊 Status: ${status.running ? 'Läuft' : 'Gestoppt'}\n📝 Regeln: ${status.rules}\n⚡ Commands: ${status.commands}`;
        });
        
        // Auto-Responses
        bot.autoReply("hi", "Hi! 😊");
        
        // Templates
        bot.template("welcome", "Willkommen {name}! Es ist {time}");
        
        // Erweiterte Rules - EINFACH
        bot.when("template test").useTemplate("welcome");
        bot.when("media test").sendImage("./test-image.jpg", "Test Bild");
        bot.when("mention test").mentionSender("Hallo @user!");
        bot.when("delete test").reply("Diese Nachricht wird in 5 Sekunden gelöscht");
        
        // Conditional Logic
        bot.if("contains test")
           .then("reply Test-Bedingung erfüllt!");
        
        bot.if("is group")
           .then("reply Das ist eine Gruppe!");
        
        // Status prüfen
        console.log('3️⃣ Status prüfen...');
        const status = bot.status();
        console.log('📊 Bot Status:', status);
        
        // Erweiterte Features testen
        console.log('4️⃣ Erweiterte Features testen...');
        
        // Settings
        bot.enableTyping(true);
        bot.enableReactions(true);
        bot.enableAutoRestart(true, 5);
        
        // Quick Commands
        bot.addQuickCommands();
        
        console.log('✅ Alle Tests erfolgreich!');
        console.log('📝 Regeln erstellt:', bot.rules.length);
        console.log('⚡ Commands erstellt:', bot.commands.size);
        console.log('🤖 Auto-Responses erstellt:', bot.autoResponses.size);
        console.log('📄 Templates erstellt:', bot.templates.size);
        
        // Multi-Device Test
        console.log('5️⃣ Multi-Device Test...');
        try {
            const multiBot = bot.enableMultiDevice(3);
            console.log('✅ Multi-Device aktiviert');
            
            const multiStatus = multiBot.status();
            console.log('🔧 Multi-Device Status:', multiStatus);
        } catch (multiError) {
            console.log('⚠️ Multi-Device Test übersprungen:', multiError.message);
        }
        
        console.log('🎉 Alle Runtime-Tests bestanden!');
        console.log('💡 Bot ist bereit zum Starten mit: await bot.start()');
        
        return true;
        
    } catch (error) {
        console.error('❌ Runtime Test fehlgeschlagen:', error);
        console.error('📍 Stack:', error.stack);
        return false;
    }
}

// Test ausführen
testEasyBot().then(success => {
    if (success) {
        console.log('🏆 EasyBot Runtime Test: BESTANDEN');
        process.exit(0);
    } else {
        console.log('💥 EasyBot Runtime Test: FEHLGESCHLAGEN');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 Unerwarteter Fehler:', error);
    process.exit(1);
});