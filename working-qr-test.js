import { WhatsAppClient } from './src/index.js';
import qrcode from 'qrcode-terminal';

console.log('🚀 WAEngine - Working QR Test');
console.log('='.repeat(30));

const client = new WhatsAppClient({
    authDir: './auth/working-qr-test',
    printQR: true,  // Terminal QR aktivieren
    qrSpamPrevention: false,  // Anti-Spam deaktivieren
    clearTerminalOnQR: true,  // Terminal leeren
    logLevel: 'info'
});

// Connection Update Handler überschreiben
const originalConnect = client.connect.bind(client);
client.connect = async function() {
    const result = await originalConnect();
    
    // QR Handler hinzufügen
    if (this.socket) {
        this.socket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
            if (qr) {
                console.clear();
                console.log('\n' + '='.repeat(60));
                console.log('📱 WHATSAPP QR-CODE - WORKING VERSION!');
                console.log('='.repeat(60));
                
                // QR-Code direkt anzeigen
                qrcode.generate(qr, { small: true });
                
                console.log('='.repeat(60));
                console.log('📲 SCAN-ANLEITUNG:');
                console.log('1. WhatsApp öffnen');
                console.log('2. Einstellungen → Verknüpfte Geräte');
                console.log('3. "Gerät verknüpfen" → QR scannen');
                console.log('='.repeat(60));
                console.log('⏳ Warte auf Scan...\n');
                
                // Event für andere Handler emittieren
                this.emit('qr', qr);
            }
            
            if (connection === 'open') {
                console.log('✅ VERBUNDEN! Bot ist bereit!');
                this.emit('ready');
            }
        });
    }
    
    return result;
};

// Message Handler
client.on('message', async (msg) => {
    try {
        const text = msg.body?.toLowerCase() || '';
        
        if (text === 'test') {
            await msg.reply('✅ Working QR Test funktioniert perfekt!');
        }
        
        if (text === 'hallo' || text === 'hi') {
            await msg.reply('👋 Hallo! Der QR-Code wurde erfolgreich angezeigt!');
        }
        
        if (text === 'help') {
            await msg.reply(`
🚀 *Working QR Test Commands:*

• test - Funktionstest
• hallo - Begrüßung
• help - Diese Hilfe

✅ QR-Code wurde im Terminal angezeigt!
Bei Problemen: Liaia@outlook.de
            `);
        }
    } catch (error) {
        console.error('❌ Message Handler Fehler:', error);
    }
});

// Error Handler
client.on('error', (error) => {
    console.error('❌ Client Fehler:', error.message);
    console.error('Bei Problemen hier melden: Liaia@outlook.de');
});

console.log('🔄 Working QR Test startet...');
console.log('📱 QR-Code wird garantiert im Terminal angezeigt!');

client.connect().catch(error => {
    console.error('❌ Verbindungsfehler:', error);
    console.error('Bei Problemen hier melden: Liaia@outlook.de');
});