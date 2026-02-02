import { createBot } from './src/index.js';

console.log('🚀 WAEngine - Simple Advanced Test');
console.log('='.repeat(30));

// Minimaler Bot für grundlegende Tests
const bot = createBot({
    authDir: './auth/simple-test',
    printQR: true,
    qrInTerminal: true,  // QR im Terminal anzeigen
    browserQR: false,    // Browser QR deaktivieren
    logLevel: 'info'
});

// Message Handler hinzufügen
bot.when('test').reply('✅ WAEngine funktioniert perfekt! 🚀');
bot.when('hello').reply('👋 Hallo! Ich bin dein WAEngine Test Bot!');
bot.when('hallo').reply('👋 Hallo! Ich bin dein WAEngine Test Bot!');
bot.when('help').reply(`
🚀 *Simple Test Commands:*

• test - Funktionstest
• hello - Begrüßung
• help - Diese Hilfe

✅ WAEngine läuft!
Bei Problemen: Liaia@outlook.de
`);

// Bot starten
console.log('🔄 Simple Test Bot startet...');
console.log('📱 QR-Code scannen und "test" senden!');

bot.start().catch(error => {
    console.error('❌ Fehler beim Starten:', error);
    console.error('Bei Problemen hier melden: Liaia@outlook.de');
});