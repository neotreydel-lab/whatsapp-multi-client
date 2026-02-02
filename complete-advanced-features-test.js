import { 
    EasyBot,
    BusinessManager,
    AnalyticsManager,
    UIComponents,
    AIFeatures,
    CrossPlatform,
    SecurityManager,
    AdvancedScheduler,
    GamingManager,
    DatabaseManager,
    ABTestingManager,
    ReportingManager
} from './src/index.js';

console.log('🚀 WAEngine - Complete Advanced Features Test');
console.log('='.repeat(50));

// Bot erstellen
const bot = new EasyBot({
    authPath: './auth/complete-test',
    printQR: true,
    logLevel: 'info'
});

// Alle Advanced Manager initialisieren
let businessManager, analyticsManager, uiComponents, aiFeatures;
let crossPlatform, securityManager, advancedScheduler, gamingManager;
let databaseManager, abTestingManager, reportingManager;

bot.on('ready', async () => {
    console.log('✅ Bot ist bereit!');
    
    try {
        // ===== MANAGER INITIALISIERUNG =====
        console.log('\n📦 Initialisiere Advanced Manager...');
        
        businessManager = new BusinessManager(bot.client);
        analyticsManager = new AnalyticsManager(bot.client);
        uiComponents = new UIComponents(bot.client);
        aiFeatures = new AIFeatures(bot.client);
        crossPlatform = new CrossPlatform(bot.client);
        securityManager = new SecurityManager(bot.client);
        advancedScheduler = new AdvancedScheduler(bot.client);
        gamingManager = new GamingManager(bot.client);
        databaseManager = new DatabaseManager(bot.client);
        abTestingManager = new ABTestingManager(bot.client);
        reportingManager = new ReportingManager(bot.client);
        
        console.log('✅ Alle Manager initialisiert!');
        
        // ===== BUSINESS FEATURES TEST =====
        console.log('\n💼 Teste Business Features...');
        
        // Business Profil erstellen
        await businessManager.createBusinessProfile({
            name: 'WAEngine Test Business',
            description: 'Test Business für WAEngine',
            category: 'Technology',
            website: 'https://waengine.com',
            email: 'test@waengine.com'
        });
        
        // Produkt hinzufügen
        await businessManager.addProduct({
            name: 'WAEngine Pro',
            description: 'Professional WhatsApp Bot Framework',
            price: 99.99,
            currency: 'EUR',
            category: 'Software'
        });
        
        console.log('✅ Business Features getestet!');
        
        // ===== DATABASE TEST =====
        console.log('\n🗄️ Teste Database Features...');
        
        // Test User erstellen
        const userId = await databaseManager.insert('users', {
            name: 'Test User',
            phone: '+49123456789',
            email: 'test@example.com',
            isActive: true
        });
        
        console.log(`✅ User erstellt: ${userId.id}`);
        
        // User suchen
        const users = await databaseManager.find('users', { isActive: true });
        console.log(`✅ ${users.length} aktive User gefunden`);
        
        // ===== A/B TESTING TEST =====
        console.log('\n🧪 Teste A/B Testing...');
        
        const experimentId = abTestingManager.createExperiment({
            name: 'Welcome Message Test',
            description: 'Test verschiedene Begrüßungsnachrichten',
            variants: [
                { id: 'control', name: 'Standard', allocation: 50 },
                { id: 'friendly', name: 'Freundlich', allocation: 50 }
            ],
            successMetrics: ['conversion', 'engagement'],
            hypothesis: 'Freundlichere Nachrichten führen zu mehr Engagement'
        });
        
        abTestingManager.startExperiment(experimentId);
        console.log(`✅ A/B Test gestartet: ${experimentId}`);
        
        // ===== GAMING TEST =====
        console.log('\n🎮 Teste Gaming Features...');
        
        // Verfügbare Spiele anzeigen
        const availableGames = gamingManager.getAvailableGames();
        console.log(`✅ ${availableGames.length} Spiele verfügbar:`, availableGames.map(g => g.name));
        
        // ===== REPORTING TEST =====
        console.log('\n📊 Teste Reporting Features...');
        
        // Metriken aufzeichnen
        reportingManager.incrementCounter('messages_sent', 1);
        reportingManager.setGauge('active_users', 5);
        reportingManager.recordHistogram('response_time', 150);
        
        // Report generieren
        const reportId = await reportingManager.generateReport({
            name: 'Test Report',
            metrics: ['messages_sent', 'active_users', 'response_time'],
            timeRange: { period: '1h' },
            format: 'text'
        });
        
        console.log(`✅ Report generiert: ${reportId}`);
        
        // ===== SCHEDULER TEST =====
        console.log('\n⏰ Teste Advanced Scheduler...');
        
        // Nachricht für in 10 Sekunden planen
        const taskId = advancedScheduler.scheduleMessage(
            'test@test.com', // Wird durch echte Chat ID ersetzt
            'Das ist eine geplante Test-Nachricht! 🚀',
            new Date(Date.now() + 10000) // 10 Sekunden
        );
        
        console.log(`✅ Nachricht geplant: ${taskId}`);
        
        // ===== SECURITY TEST =====
        console.log('\n🔒 Teste Security Features...');
        
        // Rate Limiting testen
        const rateLimitResult = securityManager.checkRateLimit('test_user', 'message');
        console.log(`✅ Rate Limit Check: ${rateLimitResult ? 'Erlaubt' : 'Blockiert'}`);
        
        // ===== AI FEATURES TEST =====
        console.log('\n🤖 Teste AI Features...');
        
        // Sentiment Analysis
        const sentiment = await aiFeatures.analyzeSentiment('Ich bin sehr glücklich heute!');
        console.log(`✅ Sentiment Analysis: ${sentiment.label} (${sentiment.score})`);
        
        console.log('\n🎉 Alle Advanced Features erfolgreich getestet!');
        console.log('📱 Bot läuft und wartet auf Nachrichten...');
        
    } catch (error) {
        console.error('❌ Fehler beim Testen der Features:', error);
    }
});

// ===== MESSAGE HANDLER FÜR INTERAKTIVE TESTS =====
bot.onMessage(async (message) => {
    const text = message.body?.toLowerCase() || '';
    const chatId = message.from;
    const userId = message.author || message.from;
    
    try {
        // Gaming Commands
        if (text.startsWith('!game ')) {
            const gameType = text.split(' ')[1];
            if (['quiz', 'guess', 'wordchain', 'trivia', 'math'].includes(gameType)) {
                const gameId = await gamingManager.startGame(chatId, gameType);
                await message.reply(`🎮 ${gameType} Spiel gestartet! ID: ${gameId}`);
            }
        }
        
        if (text === '!join') {
            const joined = await gamingManager.joinGame(chatId, userId, 'Test Player');
            if (joined) {
                await message.reply('✅ Du bist dem Spiel beigetreten!');
            }
        }
        
        if (text === '!start') {
            const game = gamingManager.findActiveGameByChat(chatId);
            if (game) {
                await gamingManager.forceStartGame(game.id);
            }
        }
        
        // Handle game messages
        await gamingManager.handleGameMessage(chatId, userId, text);
        
        // Business Commands
        if (text === '!products') {
            const products = businessManager.getAllProducts();
            let response = '🛍️ *Verfügbare Produkte:*\n\n';
            products.forEach(product => {
                response += `• ${product.name} - ${product.price}€\n`;
                response += `  ${product.description}\n\n`;
            });
            await message.reply(response);
        }
        
        // Database Commands
        if (text === '!stats') {
            const userStats = await databaseManager.findById('users', userId);
            if (userStats) {
                await message.reply(`📊 *Deine Stats:*\n• Name: ${userStats.name}\n• Registriert: ${userStats.createdAt}`);
            } else {
                await message.reply('❌ Keine Stats gefunden. Registriere dich zuerst!');
            }
        }
        
        if (text.startsWith('!register ')) {
            const name = text.substring(10);
            await databaseManager.insert('users', {
                id: userId,
                name: name,
                phone: chatId,
                isActive: true
            });
            await message.reply(`✅ Registriert als: ${name}`);
        }
        
        // A/B Testing
        if (text === '!welcome') {
            const experiments = abTestingManager.getActiveExperiments();
            if (experiments.length > 0) {
                const experiment = experiments[0];
                const assignment = abTestingManager.assignUserToVariant(experiment.id, userId);
                
                if (assignment) {
                    let welcomeMessage;
                    if (assignment.variantId === 'control') {
                        welcomeMessage = 'Willkommen bei WAEngine!';
                    } else {
                        welcomeMessage = '🎉 Herzlich willkommen bei WAEngine! Schön, dass du da bist! 😊';
                    }
                    
                    await message.reply(welcomeMessage);
                    
                    // Track event
                    abTestingManager.trackEvent(experiment.id, userId, 'welcome_shown');
                }
            }
        }
        
        // Reporting Commands
        if (text === '!report') {
            const reportId = await reportingManager.generateReport({
                name: 'Live Report',
                metrics: ['messages_sent', 'active_users'],
                timeRange: { period: '1h' },
                format: 'text'
            });
            
            const report = reportingManager.getReport(reportId);
            await message.reply(report.formattedContent);
        }
        
        // Scheduler Commands
        if (text.startsWith('!remind ')) {
            const reminderText = text.substring(8);
            const taskId = advancedScheduler.scheduleMessage(
                chatId,
                `⏰ Erinnerung: ${reminderText}`,
                new Date(Date.now() + 60000) // 1 Minute
            );
            await message.reply(`✅ Erinnerung geplant für 1 Minute: ${taskId}`);
        }
        
        // UI Components Test
        if (text === '!menu') {
            const menuButtons = uiComponents.createButtonMenu([
                { id: 'games', text: '🎮 Spiele' },
                { id: 'products', text: '🛍️ Produkte' },
                { id: 'stats', text: '📊 Statistiken' },
                { id: 'help', text: '❓ Hilfe' }
            ]);
            
            await message.reply('📋 *Hauptmenü:*\nWähle eine Option:', menuButtons);
        }
        
        // Help Command
        if (text === '!help' || text === '/help') {
            const helpText = `
🚀 *WAEngine Advanced Features Test*

🎮 *Gaming:*
• !game quiz - Quiz starten
• !game guess - Zahlenraten
• !game wordchain - Wortkette
• !join - Spiel beitreten
• !start - Spiel beginnen

💼 *Business:*
• !products - Produkte anzeigen

🗄️ *Database:*
• !register [Name] - Registrieren
• !stats - Deine Statistiken

🧪 *A/B Testing:*
• !welcome - Begrüßung testen

📊 *Reporting:*
• !report - Live Report

⏰ *Scheduler:*
• !remind [Text] - Erinnerung in 1 Min

🎛️ *UI:*
• !menu - Hauptmenü anzeigen

❓ *Hilfe:*
• !help - Diese Hilfe
            `;
            
            await message.reply(helpText);
        }
        
        // Analytics tracking
        analyticsManager.trackEvent('message_received', {
            chatId: chatId,
            userId: userId,
            messageType: message.type,
            hasText: !!message.body
        });
        
        // Reporting metrics
        reportingManager.incrementCounter('messages_received', 1);
        
    } catch (error) {
        console.error('❌ Fehler beim Verarbeiten der Nachricht:', error);
        await message.reply('❌ Ein Fehler ist aufgetreten. Bei Problemen melde dich hier: Liaia@outlook.de');
    }
});

// Error Handler
bot.on('error', (error) => {
    console.error('❌ Bot Fehler:', error);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Bot wird beendet...');
    
    // Cleanup
    if (advancedScheduler) {
        console.log('⏰ Scheduler wird gestoppt...');
    }
    
    if (gamingManager) {
        console.log('🎮 Aktive Spiele werden beendet...');
    }
    
    await bot.destroy();
    process.exit(0);
});

console.log('🔄 Bot wird gestartet...');
console.log('📱 Scanne den QR-Code mit WhatsApp Web');
console.log('💡 Sende !help für verfügbare Befehle');