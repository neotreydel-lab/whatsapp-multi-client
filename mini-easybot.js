// 🤖 Mini EasyBot - Nur 20 Zeilen Code!
import { EasyBot } from 'waengine';

const bot = EasyBot.create();

// Separate Chains - KORREKT!
bot.when('hallo').reply('👋 Hi!');

bot.when('test')
    .type(2)
    .reply('✅ Test erfolgreich!')
    .react('🎉')
    .done();

bot.when('help').reply('Commands: hallo, test, help, ping');

// Auto Responses separat
bot.autoReply('ping', 'pong! 🏓');

await bot.start();
console.log('🚀 Mini EasyBot läuft!');