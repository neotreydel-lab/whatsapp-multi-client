// Poll Fix Test - Testet die korrigierte Umfrage-Funktion
import { WhatsAppClient } from "./src/client.js";

console.log("🔧 POLL FIX TEST - Testet korrigierte Umfrage-Funktion");
console.log("=" .repeat(60));

const client = new WhatsAppClient({
    printQR: true,
    silent: false,
    verbose: false,
    connectionTimeout: 30000,
    autoRestart: false
});

client.on('connected', () => {
    console.log("🎉 Bot verbunden!");
    console.log("📊 Poll-System ist bereit!");
    console.log("\n🎯 Test-Commands:");
    console.log("   - !poll → Einfache Umfrage");
    console.log("   - !multipoll → Multi-Auswahl Umfrage");
    console.log("   - !custompoll → Benutzerdefinierte Umfrage");
});

client.on('message', async (message) => {
    console.log(`📨 Nachricht: "${message.text}" von ${message.getSender()}`);
    
    try {
        // Test 1: Einfache Poll
        if (message.text === '!poll') {
            console.log("📊 Teste einfache Poll...");
            await message.reply("🧪 Teste einfache Umfrage...");
            
            const result = await message.sendPoll("Lieblings Farbe?", ["🔴 Rot", "🔵 Blau", "🟢 Grün", "🟡 Gelb"]);
            
            if (result) {
                await message.reply("✅ Einfache Poll erfolgreich erstellt!");
            } else {
                await message.reply("❌ Poll fehlgeschlagen - Fallback verwendet");
            }
        }
        
        // Test 2: Multi-Poll
        if (message.text === '!multipoll') {
            console.log("📊 Teste Multi-Poll...");
            await message.reply("🧪 Teste Multi-Auswahl Umfrage...");
            
            const result = await message.sendMultiPoll(
                "Welche Programmiersprachen kennst du?", 
                ["JavaScript", "Python", "Java", "C++", "Go", "Rust"], 
                3
            );
            
            if (result) {
                await message.reply("✅ Multi-Poll erfolgreich erstellt!");
            } else {
                await message.reply("❌ Multi-Poll fehlgeschlagen - Fallback verwendet");
            }
        }
        
        // Test 3: Custom Poll mit verschiedenen Optionen
        if (message.text === '!custompoll') {
            console.log("📊 Teste Custom Poll...");
            await message.reply("🧪 Teste benutzerdefinierte Umfrage...");
            
            const result = await message.sendPoll(
                "Beste Zeit für Meetings?", 
                ["🌅 Morgens (8-10)", "☀️ Vormittags (10-12)", "🌞 Mittags (12-14)", "🌇 Nachmittags (14-16)", "🌆 Abends (16-18)"]
            );
            
            if (result) {
                await message.reply("✅ Custom Poll erfolgreich erstellt!");
            } else {
                await message.reply("❌ Custom Poll fehlgeschlagen - Fallback verwendet");
            }
        }
        
        // Test 4: Poll mit vielen Optionen
        if (message.text === '!bigpoll') {
            console.log("📊 Teste große Poll...");
            await message.reply("🧪 Teste Umfrage mit vielen Optionen...");
            
            const result = await message.sendPoll(
                "Lieblings Monat?", 
                ["Januar", "Februar", "März", "April", "Mai", "Juni", 
                 "Juli", "August", "September", "Oktober", "November", "Dezember"]
            );
            
            if (result) {
                await message.reply("✅ Große Poll erfolgreich erstellt!");
            } else {
                await message.reply("❌ Große Poll fehlgeschlagen - Fallback verwendet");
            }
        }
        
        // Test 5: Fehlerhafte Poll (zu wenig Optionen)
        if (message.text === '!errorpoll') {
            console.log("📊 Teste fehlerhafte Poll...");
            await message.reply("🧪 Teste fehlerhafte Umfrage (zu wenig Optionen)...");
            
            try {
                await message.sendPoll("Test?", ["Nur eine Option"]);
                await message.reply("❌ Fehlerhafte Poll sollte nicht funktionieren!");
            } catch (error) {
                await message.reply(`✅ Fehler korrekt abgefangen: ${error.message}`);
            }
        }
        
        // Help Command
        if (message.text === '!help' || message.text === '!pollhelp') {
            const helpText = `📊 **POLL TEST COMMANDS**\n\n` +
                           `!poll - Einfache Umfrage testen\n` +
                           `!multipoll - Multi-Auswahl Umfrage testen\n` +
                           `!custompoll - Benutzerdefinierte Umfrage\n` +
                           `!bigpoll - Umfrage mit 12 Optionen\n` +
                           `!errorpoll - Fehlerhafte Umfrage testen\n` +
                           `!pollhelp - Diese Hilfe anzeigen\n\n` +
                           `🎯 **Erwartetes Verhalten:**\n` +
                           `- Native WhatsApp Polls wenn unterstützt\n` +
                           `- Emoji-Fallback mit Auto-Reactions wenn nicht\n` +
                           `- Alle Polls sollten funktionieren!`;
            
            await message.reply(helpText);
        }
        
    } catch (error) {
        console.error("❌ Fehler beim Poll-Test:", error);
        await message.reply(`❌ Poll-Test Fehler: ${error.message}`);
    }
});

console.log("🔄 Starte Verbindung für Poll-Fix Test...");

try {
    await client.connect();
    console.log("🎯 Bot läuft! Sende '!help' für alle Test-Commands.");
    
} catch (error) {
    console.error("❌ Verbindungsfehler:", error.message);
}