// 🔌 WAEngine - Einfacher Plugin Test (Optional Loading)
import { WhatsAppClient } from './src/client.js';

const client = new WhatsAppClient({
    printQR: true,
    browser: ['WAEngine Simple', 'Chrome', '1.0.0']
});

// 🔌 Plugins sind OPTIONAL - nur laden wenn gewünscht!

client.on('connected', async () => {
    console.log('✅ WhatsApp verbunden!');
    console.log('');
    console.log('🔌 Plugin Loading Beispiele:');
    console.log('');
    
    // Beispiel 1: Einzelne Plugins laden
    console.log('💰 Lade Economy System...');
    await client.load.Plugins('economy-system');
    
    console.log('🎮 Lade Games Plugin...');
    await client.load.Plugins('games-plugin');
    
    // Beispiel 2: Alle Plugins auf einmal laden
    // await client.load.Plugins('all');
    
    console.log('');
    console.log('✅ Plugins geladen! Teste mit:');
    console.log('   !balance - Economy System');
    console.log('   !dice - Games Plugin');
    console.log('   !plugins - Plugin Status');
});

client.on('message', async (msg) => {
    const text = msg.text;
    
    if (text === '!test') {
        const stats = client.plugins.getStats();
        await msg.reply(`🔌 Plugin Status:\n✅ ${stats.loaded}/${stats.available} Plugins geladen\n📋 Geladene: ${stats.plugins.join(', ')}`);
    }
    
    if (text === '!load-more') {
        await msg.reply('🔌 Lade weitere Plugins...');
        await client.load.Plugins('creative-plugin');
        await client.load.Plugins('analytics-plugin');
        await msg.reply('✅ Creative & Analytics Plugins geladen!\nTeste: !joke, !mystats');
    }
    
    if (text === '!load-all') {
        await msg.reply('🚀 Lade alle verfügbaren Plugins...');
        await client.load.Plugins('all');
        const stats = client.plugins.getStats();
        await msg.reply(`✅ Alle Plugins geladen!\n🔌 ${stats.loaded} Plugins aktiv`);
    }
});

// Starte ohne Plugins - sie werden nur geladen wenn explizit aufgerufen!
client.connect().then(() => {
    console.log('🚀 WAEngine gestartet - Plugins sind OPTIONAL!');
    console.log('');
    console.log('💡 Ohne client.load.Plugins() werden KEINE Plugins geladen');
    console.log('🔌 Verwende !load-more oder !load-all zum Nachladen');
}).catch(console.error);