import { WhatsAppClient } from './src/index.js';

console.log('🚀 WAEngine - Force Terminal QR Test');
console.log('='.repeat(35));

// Direkter Client mit erzwungenem Terminal QR
const client = new WhatsAppClient({
    authDir: './auth/force-qr-test',
    printQR: true,
    qrSpamPrevention: false,     // Anti-Spam komplett aus
    qrDisplayInterval: 1000,     // Jede Sekunde
    qrMaxDisplays: 100,          // Viele Versuche
    clearTerminalOnQR: false,    // Terminal nicht leeren
    logLevel: 'info'
});

// QR Event Handler
client.on('qr', (qr) => {
    console.log('\n📱 QR-Code für WhatsApp:');
    console.log('='.repeat(40));
    
    // QR direkt im Terminal anzeigen
    const qrcode = require('qrcode-terminal');
    qrcode.generate(qr, { small: true });
    
    console.log('='.repeat(40));
    console.log('📱 Scanne diesen QR-Code mit WhatsApp!');
});

// Ready Event
client.on('ready', () => {
    console.log('✅ Bot ist bereit!');
    console.log('💡 Sende "test" um zu testen!');
});

// Message Handler
client.on('message', async (msg) => {
    const text = msg.body?.toLowerCase() || '';
    
    if (text === 'test') {
        await msg.reply('✅ Force Terminal QR Test funktioniert!');
    }
    
    if (text === 'hi' || text === 'hallo') {
        await msg.reply('👋 Hallo! QR-Code wurde im Terminal angezeigt!');
    }
});

// Error Handler
client.on('error', (error) => {
    console.error('❌ Fehler:', error);
    console.error('Bei Problemen hier melden: Liaia@outlook.de');
});

console.log('🔄 Client startet...');
console.log('📱 QR-Code wird im Terminal angezeigt!');

// Client starten
client.initialize().catch(error => {
    console.error('❌ Fehler beim Starten:', error);
    console.error('Bei Problemen hier melden: Liaia@outlook.de');
});