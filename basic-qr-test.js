import { WhatsAppClient } from './src/index.js';
import qrcode from 'qrcode-terminal';

console.log('🚀 WAEngine - Basic QR Test');
console.log('='.repeat(25));

const client = new WhatsAppClient({
    authDir: './auth/basic-qr-test',
    printQR: false,  // Wir machen es manuell
    logLevel: 'info'
});

// QR manuell anzeigen
client.on('qr', (qr) => {
    console.log('\n📱 QR-Code:');
    qrcode.generate(qr, { small: true });
    console.log('📱 Scanne mit WhatsApp!');
});

client.on('ready', () => {
    console.log('✅ Verbunden!');
});

client.on('message', async (msg) => {
    if (msg.body === 'test') {
        await msg.reply('✅ Basic QR Test funktioniert!');
    }
});

console.log('🔄 Startet...');
client.connect();