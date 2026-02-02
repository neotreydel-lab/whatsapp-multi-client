// 🤖 Funktionierende EasyBot Demo - WAEngine v1.7.3
import { EasyBot } from 'waengine';

console.log('🚀 Starting EasyBot...');

// Bot erstellen
const bot = EasyBot.create({
    authDir: './auth',
    quietHeartbeat: true
});

// Basic Commands
bot.when('hallo').reply('👋 Hallo! Wie geht es dir?');
bot.when('hi').reply('Hi! 😊');
bot.when('test')
    .type(2)
    .reply('✅ Test erfolgreich!')
    .react('🎉')
    .done();

// Auto Responses
bot.autoReply('ping', 'pong! 🏓');
bot.autoReply('status', '✅ Bot läuft!');

// Help Command
bot.when('help').reply(`🤖 **Commands:**
• hallo, hi - Begrüßung
• test - Test mit Typing
• ping - Pong Response
• help - Diese Hilfe

🚀 WAEngine v1.7.3`);

// Bot starten
bot.start().then(() => {
    console.log('✅ EasyBot gestartet!');
    console.log('📱 Scanne QR-Code und sende "help"');
}).catch(error => {
    console.error('❌ Fehler:', error);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Bot wird beendet...');
    await bot.stop();
    process.exit(0);
});