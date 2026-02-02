import { WhatsAppClient, createBot } from "./src/index.js";

// ===== BEISPIEL 1: ADVANCED CLIENT MIT CUSTOM SUPPORT INFO =====
console.log("🚀 WAEngine Error Handling Demo\n");

const client = new WhatsAppClient({
    // Custom Support Information
    supportEmail: "deine-email@domain.de",
    supportDiscord: "https://discord.gg/dein-server",
    supportGitHub: "https://github.com/dein-username/dein-repo/issues",
    
    // Error Handling Settings
    showSupportInfo: true,        // Support-Info bei Fehlern anzeigen
    logErrors: true,             // Fehler detailliert loggen
    sendErrorReports: false,     // Automatische Fehlerberichte (optional)
    
    // Connection Settings
    maxReconnectAttempts: 10,
    reconnectInterval: 3000
});

// Error Event Listener
client.on('error', (error, context) => {
    console.log(`🔥 Custom Error Handler: ${error.message}`);
    
    // Hier könntest du eigene Aktionen ausführen:
    // - Email senden
    // - Discord Webhook
    // - Slack Notification
    // - Database Log
});

// Commands mit Error Handling
client.setPrefix('!');

client.addCommand('test-error', async (msg) => {
    try {
        // Simuliere einen Fehler
        throw new Error("Das ist ein Test-Fehler!");
    } catch (error) {
        // Error Handler wird automatisch aufgerufen
        await msg.reply("❌ Ein Fehler ist aufgetreten! Support wurde benachrichtigt.");
    }
});

client.addCommand('error-stats', async (msg) => {
    const stats = client.errorHandler.getErrorStats();
    await msg.reply(`📊 Fehler-Statistiken:\n` +
                   `• Total: ${stats.totalErrors}\n` +
                   `• Support: ${stats.supportContacts.email}`);
});

// ===== BEISPIEL 2: EASYBOT MIT SUPPORT INFO =====
const easyBot = createBot()
    // Support-Kontakt konfigurieren
    .setSupportContact(
        "support@meinbot.de",
        "https://discord.gg/meinbot",
        "https://github.com/meinuser/meinbot/issues"
    )
    
    // Error Reporting aktivieren (optional)
    .enableErrorReporting(true)
    
    // Error Handler hinzufügen
    .onError((error, context) => {
        console.log(`🚨 EasyBot Error: ${error.message}`);
    })
    
    // Normale Bot-Funktionen
    .when("hello").reply("Hi! 👋")
    .when("error").reply("❌ Fehler-Test!")
    
    .command("support", async (msg) => {
        const stats = msg.client.errorHandler.getErrorStats();
        await msg.reply(`🆘 SUPPORT KONTAKT:\n` +
                       `📧 Email: ${stats.supportContacts.email}\n` +
                       `💬 Discord: ${stats.supportContacts.discord}\n` +
                       `🐛 GitHub: ${stats.supportContacts.github}\n\n` +
                       `📊 Fehler bisher: ${stats.totalErrors}`);
    });

// ===== BEISPIEL 3: MANUELLER ERROR HANDLER =====
function simulateErrors() {
    console.log("\n🧪 Simuliere verschiedene Fehler-Typen...\n");
    
    // Connection Error
    client.errorHandler.handleConnectionError(
        new Error("Verbindung unterbrochen"), 
        3
    );
    
    setTimeout(() => {
        // Plugin Error
        client.errorHandler.handlePluginError(
            new Error("Plugin konnte nicht geladen werden"), 
            "economy-system"
        );
    }, 2000);
    
    setTimeout(() => {
        // Command Error
        client.errorHandler.handleCommandError(
            new Error("Command-Ausführung fehlgeschlagen"), 
            "balance", 
            "user123@s.whatsapp.net"
        );
    }, 4000);
    
    setTimeout(() => {
        // Message Error
        client.errorHandler.handleMessageError(
            new Error("Nachricht konnte nicht gesendet werden"), 
            "image"
        );
    }, 6000);
}

// ===== DEMO STARTEN =====
async function startDemo() {
    try {
        console.log("📱 Starte Error Handling Demo...");
        
        // Simuliere Fehler ohne WhatsApp-Verbindung
        simulateErrors();
        
        // Zeige Error Stats nach 8 Sekunden
        setTimeout(() => {
            const stats = client.errorHandler.getErrorStats();
            console.log("\n📊 FINALE ERROR STATISTIKEN:");
            console.log(`   Total Errors: ${stats.totalErrors}`);
            console.log(`   Support Email: ${stats.supportContacts.email}`);
            console.log(`   Support Discord: ${stats.supportContacts.discord}`);
            console.log(`   Support GitHub: ${stats.supportContacts.github}`);
            
            if (stats.lastError) {
                console.log(`   Letzter Fehler: ${stats.lastError.error.message}`);
                console.log(`   Kontext: ${stats.lastError.context.action}`);
                console.log(`   Zeit: ${stats.lastError.timestamp.toLocaleString()}`);
            }
        }, 8000);
        
        // Für echte WhatsApp-Verbindung (auskommentiert):
        // await client.connect();
        // await easyBot.start();
        
    } catch (error) {
        console.error("❌ Demo-Fehler:", error.message);
    }
}

// Demo starten
startDemo();

// ===== VERWENDUNG IN PRODUCTION =====
/*

// 1. BASIC SETUP
const client = new WhatsAppClient({
    supportEmail: "support@meinbot.de"
});

// 2. EASYBOT SETUP
const bot = createBot()
    .setSupportContact("support@meinbot.de")
    .when("hello").reply("Hi!")
    .start();

// 3. CUSTOM ERROR HANDLING
client.on('error', async (error, context) => {
    // Sende Email an Support
    await sendSupportEmail(error, context);
    
    // Log in Database
    await logErrorToDatabase(error, context);
    
    // Discord Webhook
    await sendDiscordAlert(error, context);
});

// 4. ERROR STATS COMMAND
client.addCommand('errors', async (msg) => {
    if (!(await msg.isAdmin())) return;
    
    const stats = client.errorHandler.getErrorStats();
    await msg.reply(`📊 Error Stats: ${stats.totalErrors} total`);
});

*/