// 🔌 WAEngine Plugin System Test - Optionales Plugin Loading
import { WhatsAppClient } from './src/client.js';

const client = new WhatsAppClient({
    sessionName: 'plugin-test',
    printQR: true,
    browser: ['WAEngine Plugins', 'Chrome', '1.0.0']
});

client.on('connected', async () => {
    // 🔌 OPTIONAL: Plugins nur laden wenn gewünscht
    // Kommentiere diese Zeilen aus um Plugins zu deaktivieren:
    
    await client.load.Plugins('economy-system');    // Economy System laden
    await client.load.Plugins('games-plugin');      // Games Plugin laden
    await client.load.Plugins('creative-plugin');   // Creative Plugin laden
    await client.load.Plugins('analytics-plugin');  // Analytics Plugin laden
    
    // Oder alle auf einmal:
    // await client.load.Plugins('all');
    
    // Ohne diese Zeilen: KEINE Plugins geladen!
    
    console.log('🚀 WAEngine Plugin System ist bereit!');
    console.log('');
    console.log('🔌 Geladene Plugins:');
    const stats = client.plugins.getStats();
    console.log(`   ✅ ${stats.loaded} von ${stats.available} Plugins geladen`);
    console.log('   💰 Economy System - !balance, !daily, !shop');
    console.log('   🎮 Games Plugin - !dice, !rps, !quiz');
    console.log('   🎨 Creative Plugin - !meme, !joke, !ascii');
    console.log('   📊 Analytics Plugin - !stats, !heatmap, !topusers');
    console.log('');
    console.log('💡 Verwende !plugin-test für alle Commands!');
});

client.on('message', async (msg) => {
    const text = msg.text;
    const sender = msg.getSender();
    
    console.log(`📨 ${msg.isGroup ? 'Gruppe' : 'Privat'}: "${text}" von ${sender}`);
    
    // Plugin System Test
    if (text === '!plugin-test') {
        let testText = `🔌 **Plugin System Test - Alle 8 Plugins**\n\n`;
        
        // Economy System
        testText += `💰 **Economy System:**\n`;
        testText += `• !balance - Kontostand\n`;
        testText += `• !daily - Tägliche Belohnung\n`;
        testText += `• !shop - Shop anzeigen\n`;
        testText += `• !work - Arbeiten gehen\n\n`;
        
        // Games Plugin
        testText += `🎮 **Games Plugin:**\n`;
        testText += `• !dice - Würfeln\n`;
        testText += `• !rps schere - Schere-Stein-Papier\n`;
        testText += `• !quiz - Quiz starten\n`;
        testText += `• !number - Zahlenraten\n\n`;
        
        // Music Plugin
        testText += `🎵 **Music Plugin:**\n`;
        testText += `• !play despacito - Musik suchen\n`;
        testText += `• !lyrics hello - Songtexte\n`;
        testText += `• !playlist - Playlist verwalten\n\n`;
        
        // Travel Plugin
        testText += `✈️ **Travel Plugin:**\n`;
        testText += `• !weather Berlin - Wetter\n`;
        testText += `• !flight MUC BER - Flüge\n`;
        testText += `• !hotel Berlin - Hotels\n\n`;
        
        // Education Plugin
        testText += `📚 **Education Plugin:**\n`;
        testText += `• !wiki JavaScript - Wikipedia\n`;
        testText += `• !math 2+2 - Mathe-Rechner\n`;
        testText += `• !code console.log() - Code erklären\n\n`;
        
        // Moderation Plugin
        testText += `🛡️ **Moderation Plugin:**\n`;
        testText += `• !automod on - Auto-Moderation\n`;
        testText += `• !warn @user - User warnen\n`;
        testText += `• !rules - Regeln anzeigen\n\n`;
        
        // Creative Plugin
        testText += `🎨 **Creative Plugin:**\n`;
        testText += `• !meme 1 Programmieren - Meme erstellen\n`;
        testText += `• !joke - Witz erzählen\n`;
        testText += `• !ascii heart - ASCII-Art\n\n`;
        
        // Analytics Plugin
        testText += `📊 **Analytics Plugin:**\n`;
        testText += `• !mystats - Eigene Statistiken\n`;
        testText += `• !topusers - Top User\n`;
        testText += `• !heatmap - Aktivitätsmuster\n\n`;
        
        testText += `🚀 **Alle Plugins sind geladen und bereit!**`;
        
        await msg.reply(testText);
    }
    
    // Plugin Status
    if (text === '!plugins') {
        const pluginStats = client.plugins.getStats();
        
        let statusText = `🔌 **Plugin Status**\n\n`;
        statusText += `✅ Geladene Plugins: ${pluginStats.loaded}/${pluginStats.available}\n`;
        statusText += `📋 Verfügbare Plugins: ${pluginStats.plugins.join(', ')}\n\n`;
        statusText += `💡 Verwende !plugin-test für alle Commands`;
        
        await msg.reply(statusText);
    }
    
    // Einzelne Plugin Tests
    if (text === '!test-economy') {
        await msg.reply('💰 Teste Economy System...');
        
        setTimeout(async () => {
            await msg.reply('!balance');
        }, 1000);
        
        setTimeout(async () => {
            await msg.reply('!daily');
        }, 2000);
        
        setTimeout(async () => {
            await msg.reply('!shop');
        }, 3000);
    }
    
    if (text === '!test-games') {
        await msg.reply('🎮 Teste Games Plugin...');
        
        setTimeout(async () => {
            await msg.reply('!dice');
        }, 1000);
        
        setTimeout(async () => {
            await msg.reply('!rps stein');
        }, 2000);
        
        setTimeout(async () => {
            await msg.reply('!quiz');
        }, 3000);
    }
    
    if (text === '!test-creative') {
        await msg.reply('🎨 Teste Creative Plugin...');
        
        setTimeout(async () => {
            await msg.reply('!joke');
        }, 1000);
        
        setTimeout(async () => {
            await msg.reply('!quote');
        }, 2000);
        
        setTimeout(async () => {
            await msg.reply('!meme 1 Plugin System');
        }, 3000);
    }
    
    if (text === '!test-analytics') {
        await msg.reply('📊 Teste Analytics Plugin...');
        
        setTimeout(async () => {
            await msg.reply('!mystats');
        }, 1000);
        
        setTimeout(async () => {
            await msg.reply('!globalstats');
        }, 2000);
        
        setTimeout(async () => {
            await msg.reply('!topcommands');
        }, 3000);
    }
    
    if (text === '!test-all') {
        await msg.reply('🚀 **Vollständiger Plugin Test gestartet!**\n\nTeste alle 8 Plugins nacheinander...');
        
        const tests = [
            '!test-economy',
            '!test-games', 
            '!test-creative',
            '!test-analytics'
        ];
        
        for (let i = 0; i < tests.length; i++) {
            setTimeout(async () => {
                await msg.reply(tests[i]);
            }, (i + 1) * 5000);
        }
    }
});

client.on('disconnected', (reason) => {
    console.log('❌ Verbindung getrennt:', reason);
});

// Starte den Client
client.connect().then(() => {
    console.log('🚀 WAEngine Plugin System Test gestartet!');
    console.log('');
    console.log('📝 Verfügbare Test-Commands:');
    console.log('   • !plugin-test - Alle Plugin Commands anzeigen');
    console.log('   • !plugins - Plugin Status anzeigen');
    console.log('   • !test-economy - Economy System testen');
    console.log('   • !test-games - Games Plugin testen');
    console.log('   • !test-creative - Creative Plugin testen');
    console.log('   • !test-analytics - Analytics Plugin testen');
    console.log('   • !test-all - Alle Plugins nacheinander testen');
    console.log('');
    console.log('🔌 Nur die gewünschten Plugins werden geladen!');
}).catch(console.error);

// Plugin System Info
console.log('🔌 WAEngine Plugin System - Optionales Plugin Loading');
console.log('📦 Plugins werden nur geladen wenn explizit aufgerufen:');
console.log('   💰 Economy System - Coins, Shop, Daily Rewards');
console.log('   🎮 Games Plugin - Würfel, Quiz, RPS, Zahlenraten');
console.log('   🎨 Creative Plugin - Memes, ASCII-Art, Witze');
console.log('   📊 Analytics Plugin - Statistiken, Heatmaps');
console.log('');
console.log('🚀 Verbinde mit WhatsApp um gewählte Plugins zu laden...');