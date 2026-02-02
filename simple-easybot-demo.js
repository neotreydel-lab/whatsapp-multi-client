// 🤖 Simple EasyBot Demo - WAEngine v1.7.3
// Kopiere diese Datei in einen anderen Ordner und führe sie aus!

import { EasyBot } from 'waengine';

console.log('🚀 Starting Simple EasyBot Demo...');

// Erstelle einen einfachen Bot
const bot = EasyBot.create({
    authDir: './auth',
    quietHeartbeat: true
});

// Basic Responses - SEPARATE CHAINS!
bot.when('hallo').reply('👋 Hallo! Wie geht es dir?');
bot.when('hi').reply('Hi! 😊');
bot.when('bye').reply('Tschüss! 👋');
bot.when('danke').reply('Gerne! 😊');

// Commands mit Action Chaining
bot.when('test')
    .type(2)
    .reply('⚡ EasyBot Test erfolgreich!')
    .react('✅')
    .done();

// Typing Demo - KORRIGIERT!
bot.when('typing demo')
    .reply('Ich zeige dir verschiedene Typing-Geschwindigkeiten...')
    .quickType('Schnell! ⚡')
    .normalType('Normal... 📝')
    .slowType('Langsam... 🐌')
    .done();

// Hidetag Demo (nur in Gruppen)
bot.when('alle')
    .reply('📢 Wichtige Nachricht für alle!', [], { hidetag: 'all' })
    .done();

// Advanced Features Demo - VEREINFACHT!
bot.when('advanced test')
    .reply('🚀 Teste Advanced Features...')
    .buttons('Wähle eine Option:', [
        { id: 'opt1', text: '✅ Super!' },
        { id: 'opt2', text: '❌ Nicht so gut' }
    ])
    .done();

// Help Command
bot.when('help')
    .reply(`🤖 **EasyBot Demo Commands:**

**Basic:**
• hallo, hi, bye, danke
• ping, status, version

**Demos:**
• test - Action Chaining Demo
• typing demo - Verschiedene Typing-Geschwindigkeiten
• advanced test - Advanced Features
• alle - Hidetag Demo (nur Gruppen)
• greet me - Template Demo

**Info:**
• help - Diese Hilfe

🚀 Powered by WAEngine v1.7.3`)
    .done();

// Conditional Logic - SEPARATE!
bot.if('is group').then('reply Das ist eine Gruppe! 👥');
bot.if('is private').then('reply Das ist ein privater Chat! 💬');
bot.if('contains bot').then('react 🤖');

// Template System - SEPARATE!
bot.template('greeting', 'Hallo {name}! Heute ist {day} um {time}');
bot.when('greet me').useTemplate('greeting');

// Auto Responses - SEPARATE!
bot.autoReply('ping', 'pong! 🏓');
bot.autoReply('status', '✅ Bot läuft perfekt!');
bot.autoReply('version', '🚀 WAEngine v1.7.3 mit EasyBot');

// Bot starten
bot.start().then(() => {
    console.log('✅ EasyBot Demo gestartet!');
    console.log('📱 Scanne den QR-Code und sende "help" für Commands');
}).catch(error => {
    console.error('❌ Fehler beim Starten:', error);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Bot wird beendet...');
    await bot.stop();
    process.exit(0);
});