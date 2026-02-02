import { createBot } from './src/index.js';

console.log('🚀 ANALYTICS FIXED TEST - Fehler behoben!');
console.log('='.repeat(45));

// Bot mit repariertem Analytics-System
const bot = createBot({
    authDir: './auth/analytics-fixed-test',
    printQR: true,
    logLevel: 'info'
});

// Test Commands
bot.when('test').reply('✅ Analytics Fixed Test funktioniert!');
bot.when('analytics').reply('📊 Analytics-System wurde repariert!');
bot.when('track').then(async (msg) => {
    // Analytics Event tracken
    bot.trackEvent('test_command_used', {
        userId: msg.author || msg.from,
        timestamp: Date.now()
    });
    await msg.reply('📈 Event getrackt!');
});

bot.when('stats').then(async (msg) => {
    try {
        const analytics = bot.getAnalytics(7);
        await msg.reply(`📊 *Analytics (7 Tage):*\n\nDaten erfolgreich abgerufen!`);
    } catch (error) {
        await msg.reply(`❌ Analytics Fehler: ${error.message}`);
    }
});

bot.when('advanced').reply(`
🎉 *WAEngine Advanced Features - ANALYTICS REPARIERT:*

✅ Business Manager - Geschäftsprofile & Produkte
✅ Analytics Manager - REPARIERT & FUNKTIONSFÄHIG
✅ Gaming Manager - 5 Spiele (Quiz, Raten, etc.)
✅ Database Manager - NoSQL Datenbank
✅ A/B Testing Manager - Experimente & Tests
✅ Advanced Scheduler - Intelligente Planung
✅ Security Manager - Sicherheit & Rate Limiting
✅ AI Features - KI-Integration & Sentiment
✅ Cross Platform - Multi-Platform Support
✅ UI Components - Interaktive Elemente
✅ Reporting Manager - Reports & Dashboards

🔧 Analytics-Konflikt behoben!
Bei Problemen: Liaia@outlook.de
`);

bot.when('help').reply(`
🚀 *Analytics Fixed Test Commands:*

• test - Funktionstest
• analytics - Analytics-Info
• track - Event tracken
• stats - Analytics anzeigen
• advanced - Alle Features
• help - Diese Hilfe

✅ Analytics-System repariert!
🔧 Konflikt zwischen AnalyticsManager und analytics-Objekt behoben

Bei Problemen: Liaia@outlook.de
`);

console.log('🔄 Analytics Fixed Test startet...');
console.log('🔧 Analytics-Konflikt wurde behoben!');
console.log('📊 AnalyticsManager → analyticsManager umbenannt');

bot.start().catch(error => {
    console.error('❌ Fehler:', error);
    console.error('Bei Problemen hier melden: Liaia@outlook.de');
});