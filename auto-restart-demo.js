// 🔄 Auto-Restart Demo - Automatischer Neustart nach Logout
import { quickBot } from './src/index.js';

console.log('🔄 Auto-Restart Demo startet...');
console.log('');

// Bot mit Auto-Restart erstellen
const bot = quickBot()
    .enableAutoRestart(true, 5)  // 5 Sekunden Delay
    .when("hello").reply("Hi! 👋 Auto-Restart ist aktiviert!")
    .when("status").reply("🔄 Status: Auto-Restart läuft\n⏰ Delay: 5 Sekunden\n✅ Bei Logout starte ich automatisch neu!")
    .when("test").reply("✅ Test erfolgreich! Bot läuft mit Auto-Restart.")
    .when("help").reply("🤖 Verfügbare Commands:\n• hello - Begrüßung\n• status - Auto-Restart Status\n• test - Test durchführen\n• help - Diese Hilfe");

// Event-Handler für besseres Feedback
bot.client.on('connected', () => {
    console.log('');
    console.log('✅ Bot ist online!');
    console.log('🔄 Auto-Restart ist aktiviert');
    console.log('');
    console.log('💡 Zum Testen des Auto-Restarts:');
    console.log('   1. Bot mit WhatsApp verbinden');
    console.log('   2. In WhatsApp: Einstellungen → Verknüpfte Geräte');
    console.log('   3. Bot-Gerät entfernen/ausloggen');
    console.log('   4. Auto-Restart startet automatisch');
    console.log('   5. Neuer QR-Code wird angezeigt');
    console.log('');
});

bot.client.on('disconnected', (data) => {
    console.log('');
    console.log('📡 Verbindung getrennt:');
    console.log(`   📋 Grund: ${data.reason}`);
    console.log(`   🧹 Session bereinigt: ${data.cleaned}`);
    
    if (data.reason === 'logged_out') {
        console.log('');
        console.log('👋 Logout erkannt!');
        console.log('🔄 Auto-Restart wird gestartet...');
        console.log('📱 Neuer QR-Code wird in 5 Sekunden angezeigt');
    }
});

// Bot starten
bot.start();

console.log('🚀 Auto-Restart Demo gestartet!');
console.log('');
console.log('🎯 Features:');
console.log('   ✅ Automatischer Neustart nach Logout');
console.log('   ✅ 5 Sekunden Wartezeit vor Restart');
console.log('   ✅ Automatische Session-Bereinigung');
console.log('   ✅ Retry-Mechanismus bei Fehlern');
console.log('   ✅ Event-basierte Benachrichtigungen');
console.log('');
console.log('📱 Scanne den QR-Code um zu starten...');