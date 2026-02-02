// 🔄 Auto-Restart Test - Automatischer Neustart nach Logout
import { WhatsAppClient, quickBot } from './src/index.js';

console.log('🔄 Auto-Restart Feature Test');
console.log('');

// Test 1: WhatsAppClient mit Auto-Restart
console.log('📋 Test 1: WhatsAppClient mit Auto-Restart');

const client = new WhatsAppClient({
    printQR: true,
    autoRestart: true,        // Auto-Restart aktiviert
    restartDelay: 3000,       // 3 Sekunden Wartezeit
    browser: ['AutoRestart Test', 'Chrome', '1.0.0']
});

console.log('✅ Client erstellt mit Auto-Restart');
console.log(`   🔄 Auto-Restart: ${client.options.autoRestart}`);
console.log(`   ⏰ Restart-Delay: ${client.options.restartDelay / 1000} Sekunden`);

// Test 2: EasyBot mit Auto-Restart
console.log('');
console.log('📋 Test 2: EasyBot mit Auto-Restart');

const bot = quickBot()
    .enableAutoRestart(true, 5)  // 5 Sekunden Delay
    .when("hello").reply("Hi! 👋")
    .when("restart").reply("🔄 Auto-Restart ist aktiviert!");

console.log('✅ EasyBot erstellt mit Auto-Restart');

// Test 3: Konfiguration zur Laufzeit
console.log('');
console.log('📋 Test 3: Runtime-Konfiguration');

client.enableAutoRestart(true, 10);  // 10 Sekunden
client.setRestartDelay(7);           // 7 Sekunden
client.disableAutoRestart();         // Deaktivieren
client.enableAutoRestart(true, 5);   // Wieder aktivieren mit 5 Sekunden

console.log('✅ Runtime-Konfiguration getestet');

// Event-Handler für Disconnect
client.on('disconnected', (data) => {
    console.log('');
    console.log('📡 Disconnect Event empfangen:');
    console.log(`   📋 Grund: ${data.reason}`);
    console.log(`   🧹 Session bereinigt: ${data.cleaned}`);
    
    if (data.reason === 'logged_out') {
        console.log('👋 Logout erkannt - Auto-Restart sollte starten...');
    }
});

client.on('connected', () => {
    console.log('');
    console.log('✅ Verbindung hergestellt!');
    console.log('🎯 Auto-Restart Feature ist bereit');
    console.log('');
    console.log('💡 Zum Testen:');
    console.log('   1. Bot mit WhatsApp verbinden');
    console.log('   2. In WhatsApp: Einstellungen → Verknüpfte Geräte → Bot entfernen');
    console.log('   3. Auto-Restart sollte automatisch starten');
    console.log('   4. Neuer QR-Code wird angezeigt');
});

console.log('');
console.log('🚀 Starte Client mit Auto-Restart...');
console.log('');
console.log('⚠️ HINWEIS: Zum Testen des Auto-Restarts:');
console.log('   1. Bot verbinden');
console.log('   2. In WhatsApp ausloggen');
console.log('   3. Auto-Restart wird automatisch ausgeführt');

// Für Demo nicht starten, nur Konfiguration zeigen
console.log('');
console.log('✨ Auto-Restart Feature konfiguriert!');
console.log('');
console.log('📝 Verwendung:');
console.log(`
// WhatsAppClient
const client = new WhatsAppClient({
    autoRestart: true,      // Auto-Restart aktivieren
    restartDelay: 5000      // 5 Sekunden Wartezeit
});

// EasyBot
quickBot()
    .enableAutoRestart(true, 5)  // 5 Sekunden Delay
    .when("hello").reply("Hi!")
    .start();

// Runtime-Konfiguration
client.enableAutoRestart(true, 10);  // 10 Sekunden
client.setRestartDelay(7);           // 7 Sekunden ändern
client.disableAutoRestart();         // Deaktivieren
`);