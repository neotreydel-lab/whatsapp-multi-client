import { createBot } from './src/index.js';

console.log('🚀 WAEngine - Terminal QR Test');
console.log('='.repeat(30));

// Bot mit Terminal QR-Code
const bot = createBot({
    authDir: './auth/terminal-test',
    printQR: true,
    qrInTerminal: true,
    browserQR: false,
    qrSpamPrevention: false,  // Spam-Schutz deaktivieren für Test
    qrDisplayInterval: 5000,  // Alle 5 Sekunden
    qrMaxDisplays: 10,        // Bis zu 10 mal anzeigen
    clearTerminalOnQR: false, // Terminal nicht leeren
    logLevel: 'debug'
});

// Einfache Test-Commands
bot.when('test').reply('✅ Terminal QR Test funktioniert!');
bot.when('hi').reply('👋 Hallo vom Terminal QR Bot!');

console.log('🔄 Bot startet mit Terminal QR...');

bot.start().catch(error => {
    console.error('❌ Fehler:', error);
});