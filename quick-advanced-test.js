import { EasyBot, GamingManager, DatabaseManager, ReportingManager, AdvancedScheduler } from './src/index.js';

console.log('🚀 WAEngine - Quick Advanced Features Test');
console.log('='.repeat(40));

// Bot mit Advanced Features
const bot = new EasyBot()
    .setAuthPath('./auth/quick-test')
    .enableQR()
    .enableDefaults();

let gamingManager, databaseManager, reportingManager, advancedScheduler;

// Advanced Features nach Bot-Start initialisieren
bot.start().then(() => {
    console.log('✅ Bot bereit!');
    
    // Manager initialisieren
    gamingManager = new GamingManager(bot.client);
    databaseManager = new DatabaseManager(bot.client);
    reportingManager = new ReportingManager(bot.client);
    advancedScheduler = new AdvancedScheduler(bot.client);
    
    console.log('📦 Manager initialisiert!');
    console.log('💡 Sende eine Nachricht um zu testen!');
}).catch(error => {
    console.error('❌ Fehler beim Starten:', error);
    console.error('Bei Problemen hier melden: Liaia@outlook.de');
});

// Basic Commands
bot.when('test').reply('✅ WAEngine Advanced Features funktionieren!');
bot.when('help').reply(`
🚀 *Quick Test Commands:*

• test - Funktionstest
• quiz - Quiz Spiel starten  
• stats - Statistik testen
• help - Diese Hilfe

Bei Problemen: Liaia@outlook.de
`);

// Advanced Commands mit Custom Handler
bot.when('quiz').then(async (msg) => {
    if (gamingManager) {
        const gameId = await gamingManager.startGame(msg.from, 'quiz');
        await gamingManager.joinGame(msg.from, msg.author || msg.from, 'Player');
        await gamingManager.forceStartGame(gameId);
    }
});

bot.when('stats').then(async (msg) => {
    if (reportingManager) {
        reportingManager.incrementCounter('test_messages', 1);
        await msg.reply('📊 Statistik aufgezeichnet!');
    }
});

console.log('🔄 Quick Test Bot startet...');
console.log('📱 QR-Code scannen und "help" senden!');