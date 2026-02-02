// Test für AI, HTTP und Scheduler Features
import { WhatsAppClient } from "./src/index.js";

async function testNewFeatures() {
    console.log("🚀 AI + HTTP + Scheduler Test...");
    
    const client = new WhatsAppClient({
        authDir: "./auth",
        logLevel: "silent",
        browser: ["AITest", "1.0.0", ""],
        printQR: true,
        ai: {
            // apiKey: 'dein-openai-key' // Optional
        }
    });

    client.setPrefix("!");

    // ===== AI COMMANDS =====
    
    client.addCommand('ai', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !ai <frage>\n\nBeispiel: !ai Erkläre mir JavaScript');
        }

        const question = args.join(' ');
        
        try {
            await msg.reply('🤖 Denke nach...');
            
            // DEIN COOLES WAITING SYSTEM!
            await msg.waiting.after.message(2000); // 2 Sekunden warten
            
            const answer = await client.ai.chat(question);
            await msg.reply(`🤖 **AI Antwort:**\n\n${answer}`);
            
        } catch (error) {
            await msg.reply(`❌ AI Fehler: ${error.message}\n\nTipp: Setze OPENAI_API_KEY in .env`);
        }
    });

    client.addCommand('translate', async (msg, args) => {
        if (args.length < 2) {
            return msg.reply('❌ Usage: !translate <sprache> <text>\n\nBeispiel: !translate en Hallo Welt');
        }

        const [targetLang, ...textParts] = args;
        const text = textParts.join(' ');
        
        try {
            await msg.reply('🔄 Übersetze...');
            await msg.waiting.after.message(1500);
            
            const translation = await client.ai.translate(text, targetLang);
            await msg.reply(`🌍 **Übersetzung (${targetLang}):**\n\n${translation}`);
            
        } catch (error) {
            await msg.reply(`❌ Übersetzung fehlgeschlagen: ${error.message}`);
        }
    });

    // ===== HTTP COMMANDS =====
    
    client.addCommand('wetter', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !wetter <stadt>\n\nBeispiel: !wetter Berlin');
        }

        const city = args.join(' ');
        
        try {
            await msg.reply('🌤️ Lade Wetterdaten...');
            await msg.waiting.after.message(1000);
            
            const weather = await client.http.getWeather(city);
            
            let response = `🌤️ **Wetter in ${weather.city}, ${weather.country}**\n\n`;
            response += `🌡️ **Temperatur:** ${weather.temperature}°C\n`;
            response += `📝 **Beschreibung:** ${weather.description}\n`;
            response += `💧 **Luftfeuchtigkeit:** ${weather.humidity}%\n`;
            response += `💨 **Windgeschwindigkeit:** ${weather.windSpeed} m/s`;
            
            await msg.reply(response);
            
        } catch (error) {
            await msg.reply(`❌ Wetter-Fehler: ${error.message}\n\nTipp: Setze WEATHER_API_KEY in .env`);
        }
    });

    client.addCommand('news', async (msg, args) => {
        const category = args[0] || 'general';
        
        try {
            await msg.reply('📰 Lade aktuelle News...');
            await msg.waiting.after.message(1500);
            
            const articles = await client.http.getNews(category);
            
            let response = `📰 **Aktuelle News (${category})**\n\n`;
            
            articles.slice(0, 3).forEach((article, index) => {
                response += `**${index + 1}.** ${article.title}\n`;
                response += `📅 ${article.publishedAt} | 📰 ${article.source}\n`;
                response += `🔗 ${article.url}\n\n`;
            });
            
            await msg.reply(response);
            
        } catch (error) {
            await msg.reply(`❌ News-Fehler: ${error.message}\n\nTipp: Setze NEWS_API_KEY in .env`);
        }
    });

    client.addCommand('crypto', async (msg, args) => {
        const symbol = args[0] || 'bitcoin';
        
        try {
            await msg.reply('💰 Lade Crypto-Preise...');
            await msg.waiting.after.message(1000);
            
            const price = await client.http.getCryptoPrice(symbol);
            
            let response = `💰 **${symbol.toUpperCase()} Preis**\n\n`;
            response += `💶 **EUR:** €${price.priceEUR.toLocaleString()}\n`;
            response += `💵 **USD:** $${price.priceUSD.toLocaleString()}\n`;
            response += `📈 **24h Änderung:** ${price.change24h}%`;
            
            await msg.reply(response);
            
        } catch (error) {
            await msg.reply(`❌ Crypto-Fehler: ${error.message}`);
        }
    });

    client.addCommand('short', async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Usage: !short <url>\n\nBeispiel: !short https://example.com');
        }

        const url = args[0];
        
        try {
            await msg.reply('🔗 Kürze URL...');
            await msg.waiting.after.message(1000);
            
            const result = await client.http.shortenUrl(url);
            
            await msg.reply(`🔗 **URL gekürzt!**\n\n📎 **Kurz:** ${result.shortUrl}\n🌐 **Original:** ${result.longUrl}\n⚙️ **Service:** ${result.service}`);
            
        } catch (error) {
            await msg.reply(`❌ URL-Shortener-Fehler: ${error.message}`);
        }
    });

    // ===== SCHEDULER COMMANDS =====
    
    client.addCommand('remind', async (msg, args) => {
        if (args.length < 2) {
            return msg.reply('❌ Usage: !remind <minuten> <nachricht>\n\nBeispiel: !remind 30 Meeting in 5 Minuten!');
        }

        const minutes = parseInt(args[0]);
        const message = args.slice(1).join(' ');
        
        if (isNaN(minutes) || minutes <= 0) {
            return msg.reply('❌ Ungültige Minutenanzahl!');
        }

        try {
            const reminderDate = new Date(Date.now() + minutes * 60 * 1000);
            const jobId = client.scheduler.scheduleOnce(
                reminderDate,
                msg.from,
                `⏰ **Erinnerung:**\n\n${message}\n\n_Erstellt von @${msg.getSender().split('@')[0]}_`
            );
            
            await msg.reply(`⏰ **Erinnerung erstellt!**\n\n📝 Nachricht: ${message}\n⏰ Zeit: ${reminderDate.toLocaleString('de-DE')}\n🆔 ID: ${jobId}`);
            
        } catch (error) {
            await msg.reply(`❌ Erinnerung-Fehler: ${error.message}`);
        }
    });

    client.addCommand('daily', async (msg, args) => {
        if (args.length < 2) {
            return msg.reply('❌ Usage: !daily <zeit> <nachricht>\n\nBeispiel: !daily 09:00 Guten Morgen!');
        }

        const time = args[0];
        const message = args.slice(1).join(' ');
        
        try {
            const jobId = client.scheduler.daily(
                time,
                msg.from,
                `📅 **Tägliche Nachricht:**\n\n${message}\n\n_Automatisch um {time} Uhr_`
            );
            
            await msg.reply(`📅 **Tägliche Nachricht erstellt!**\n\n📝 Nachricht: ${message}\n⏰ Zeit: ${time} Uhr\n🆔 ID: ${jobId}`);
            
        } catch (error) {
            await msg.reply(`❌ Daily-Fehler: ${error.message}`);
        }
    });

    client.addCommand('jobs', async (msg) => {
        const stats = client.scheduler.getStats();
        
        let response = `📅 **Scheduler Statistiken**\n\n`;
        response += `⚡ **Aktive Jobs:** ${stats.activeJobs}\n`;
        response += `📊 **Gesamt Jobs:** ${stats.totalJobs}\n`;
        response += `🔄 **Cron Jobs:** ${stats.cronJobs}\n`;
        response += `⏰ **One-time Jobs:** ${stats.onceJobs}\n`;
        response += `✅ **Ausgeführt:** ${stats.totalExecuted}\n\n`;
        
        if (stats.jobs.length > 0) {
            response += `**Aktive Jobs:**\n`;
            stats.jobs.slice(0, 5).forEach(job => {
                response += `• ${job.id} (${job.type})\n`;
            });
        }
        
        await msg.reply(response);
    });

    // ===== WAITING SYSTEM DEMO =====
    
    client.addCommand('demo', async (msg) => {
        await msg.reply('🎬 **Waiting System Demo startet...**');
        
        // 2 Sekunden warten
        await msg.waiting.after.message(2000);
        await msg.reply('⏰ 2 Sekunden vergangen...');
        
        // Weitere 3 Sekunden warten
        await msg.waiting.after.message(3000);
        await msg.reply('⏰ Weitere 3 Sekunden vergangen...');
        
        // Finale Nachricht nach 1 Sekunde
        await msg.waiting.after.message(1000);
        await msg.reply('🎉 **Demo abgeschlossen!** Das Waiting System funktioniert perfekt!');
    });

    // ===== HELP COMMAND =====
    client.addCommand('help', async (msg) => {
        let help = `🤖 **AI + HTTP + Scheduler Bot**\n\n`;
        
        help += `**🤖 AI Commands:**\n`;
        help += `!ai <frage> - AI Chat\n`;
        help += `!translate <sprache> <text> - Übersetzen\n\n`;
        
        help += `**🌐 HTTP Commands:**\n`;
        help += `!wetter <stadt> - Wetter abrufen\n`;
        help += `!news [kategorie] - Aktuelle News\n`;
        help += `!crypto [symbol] - Crypto-Preise\n`;
        help += `!short <url> - URL kürzen\n\n`;
        
        help += `**📅 Scheduler Commands:**\n`;
        help += `!remind <minuten> <text> - Erinnerung\n`;
        help += `!daily <zeit> <text> - Tägliche Nachricht\n`;
        help += `!jobs - Scheduler Statistiken\n\n`;
        
        help += `**🎬 Demo:**\n`;
        help += `!demo - Waiting System Demo\n\n`;
        
        help += `**💡 Features:**\n`;
        help += `• AI Integration (OpenAI)\n`;
        help += `• HTTP Client (Weather, News, Crypto)\n`;
        help += `• Scheduler System (Cron + One-time)\n`;
        help += `• Waiting System: await msg.waiting.after.message(ms)`;
        
        await msg.reply(help);
    });

    // ===== EVENTS =====
    client.on('connected', () => {
        console.log("✅ AI + HTTP + Scheduler Bot verbunden!");
        console.log("🚀 Neue Features:");
        console.log("   - AI Integration (OpenAI)");
        console.log("   - HTTP Client (Weather, News, Crypto)");
        console.log("   - Scheduler System (Cron + One-time)");
        console.log("   - Waiting System: await msg.waiting.after.message(ms)");
        
        // Feature-Status
        console.log(`🤖 AI: ${client.ai.enabled ? 'Aktiviert' : 'Deaktiviert (kein API Key)'}`);
        console.log(`🌐 HTTP: Aktiviert`);
        console.log(`📅 Scheduler: Aktiviert`);
    });

    try {
        await client.connect();
        
        console.log("\n🚀 Neue Commands:");
        console.log("   - !ai <frage> → AI Chat");
        console.log("   - !translate <sprache> <text> → Übersetzen");
        console.log("   - !wetter <stadt> → Wetter");
        console.log("   - !news [kategorie] → News");
        console.log("   - !crypto [symbol] → Crypto-Preise");
        console.log("   - !short <url> → URL kürzen");
        console.log("   - !remind <minuten> <text> → Erinnerung");
        console.log("   - !daily <zeit> <text> → Tägliche Nachricht");
        console.log("   - !jobs → Scheduler Stats");
        console.log("   - !demo → Waiting System Demo");
        
        console.log("\n💡 Environment Variables (optional):");
        console.log("   - OPENAI_API_KEY → AI Features");
        console.log("   - WEATHER_API_KEY → Wetter Features");
        console.log("   - NEWS_API_KEY → News Features");
        
    } catch (error) {
        console.error("❌ Test Fehler:", error);
    }
}

testNewFeatures();