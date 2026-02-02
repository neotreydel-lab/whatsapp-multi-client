// 🚀 QuickBot Demo - Funktioniert jetzt!
import { quickBot } from './src/index.js';

console.log('🤖 QuickBot Demo startet...');

// Erstelle einen einfachen Bot mit Chaining
const bot = quickBot()
    .when("hello").reply("Hi! 👋 Wie geht's?")
    .when("hi").reply("Hallo! 😊")
    .when("test").reply("✅ Test erfolgreich!")
    .when("help").reply("🤖 Verfügbare Commands:\n• hello - Begrüßung\n• hi - Hallo sagen\n• test - Test durchführen\n• help - Diese Hilfe")
    .when("bye").reply("Tschüss! 👋 Bis bald!");

console.log('✅ Bot erstellt mit Chaining!');
console.log(`📋 Regeln definiert: ${bot.rules.length}`);

// Zeige alle Regeln
bot.rules.forEach((rule, index) => {
    console.log(`   ${index + 1}. "${rule.trigger}" → ${rule.actions.length} Aktion(en)`);
});

console.log('');
console.log('🎯 Bot bereit! Verwende bot.start() um zu starten.');
console.log('');
console.log('💡 Beispiel-Code:');
console.log(`
import { quickBot } from "waengine";

quickBot()
    .when("hello").reply("Hi! 👋")
    .when("help").reply("Ich kann dir helfen!")
    .start();
`);

// Für Demo nicht starten, nur zeigen dass es funktioniert
console.log('✨ QuickBot Chaining funktioniert perfekt!');