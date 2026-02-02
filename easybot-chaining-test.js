// EasyBot Chaining Test - Das ursprüngliche Problem testen
import { quickBot } from './src/easy-bot.js';

console.log('🔗 EasyBot Chaining Test startet...');

async function testChaining() {
    try {
        const bot = quickBot();
        
        console.log('1️⃣ Teste einfaches Chaining...');
        
        // Das sollte funktionieren
        bot.when("test1").reply("Antwort 1");
        
        console.log('✅ Einfaches Chaining funktioniert');
        
        console.log('2️⃣ Teste komplexes Chaining...');
        
        // Das ist das Problem - das sollte jetzt funktionieren!
        try {
            const result = bot.when("test2")
               .reply("Erste Antwort")
               .when("test3")
               .react("👋")
               .reply("Zweite Antwort");
            
            console.log('✅ Komplexes Chaining funktioniert jetzt!');
            console.log('📊 Ergebnis:', typeof result);
        } catch (error) {
            console.log('❌ Komplexes Chaining wirft Fehler:', error.message);
            return false;
        }
        
        console.log('3️⃣ Teste korrekte Syntax...');
        
        // Das ist die korrekte Syntax - beide sollten funktionieren
        bot.when("test2").reply("Erste Antwort");
        bot.when("test3").react("👋").reply("Zweite Antwort"); // Das sollte jetzt funktionieren!
        
        console.log('✅ Korrekte Syntax funktioniert');
        
        console.log('4️⃣ Teste neues Chaining...');
        
        // Das neue Chaining sollte funktionieren
        bot.when("chain1")
           .reply("Erste Antwort")
           .react("✅")
           .when("chain2")
           .reply("Zweite Antwort")
           .react("🎉");
        
        console.log('✅ Neues Chaining funktioniert!');
        
        console.log('5️⃣ Status prüfen...');
        const status = bot.status();
        console.log('📊 Rules erstellt:', status.rules);
        
        return true;
        
    } catch (error) {
        console.error('❌ Chaining Test fehlgeschlagen:', error);
        return false;
    }
}

testChaining().then(success => {
    if (success) {
        console.log('🏆 Chaining Test: Problem identifiziert');
    } else {
        console.log('💥 Chaining Test: Unerwartetes Verhalten');
    }
});