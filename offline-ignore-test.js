import { WhatsAppClient, createBot } from "./src/index.js";

console.log("🚀 Offline Message Ignore Test startet...");

// ===== ADVANCED API TEST =====
console.log("\n1️⃣ Advanced API Test:");

const client = new WhatsAppClient({
    logLevel: "silent"
});

// DEINE NEUE API! 🎉
client.ignore.message.offline(true); // Ignoriert alle Offline-Messages

client.setPrefix("!");

client.addCommand('test', async (msg) => {
    await msg.reply('✅ Test erfolgreich! Diese Nachricht wurde verarbeitet.');
});

client.addCommand('status', async (msg) => {
    const status = client.ignoreOfflineMessages ? 'AKTIVIERT' : 'DEAKTIVIERT';
    await msg.reply(`📵 Offline Message Ignore: ${status}`);
});

client.on('message', async (msg) => {
    if (msg.text === 'hello') {
        await msg.reply('👋 Hallo! Ich ignoriere Offline-Messages!');
    }
});

// ===== EASYBOT API TEST =====
console.log("\n2️⃣ EasyBot API Test:");

const easyBot = createBot()
    .ignoreOfflineMessages(true) // DEINE NEUE EASYBOT API! 🎉
    .when("test").reply("✅ EasyBot Test erfolgreich!").done()
    .when("demo").reply("🎬 Demo läuft - keine Offline-Messages!").done()
    .command("help", "🤖 Verfügbare Commands: !help, !test, !status")
    .enableDefaults();

// Starte beide Tests
async function startTests() {
    try {
        console.log("\n🔌 Starte Advanced API Client...");
        await client.connect();
        
        console.log("✅ Advanced API Client läuft!");
        console.log("💬 Teste: 'hello', '!test', '!status'");
        console.log("📵 Offline Messages werden ignoriert!");
        
        // EasyBot in separatem Prozess würde starten
        console.log("\n📝 EasyBot Beispiel bereit (nicht gleichzeitig gestartet)");
        console.log("💡 Verwende: bot.ignoreOfflineMessages(true) vor .start()");
        
    } catch (error) {
        console.error("❌ Fehler:", error);
    }
}

startTests();

// ===== USAGE EXAMPLES =====
console.log(`
🎯 USAGE EXAMPLES:

1️⃣ Advanced API:
   const client = new WhatsAppClient();
   client.ignore.message.offline(true);  // Aktivieren
   client.ignore.message.offline(false); // Deaktivieren
   await client.connect();

2️⃣ EasyBot API:
   createBot()
       .ignoreOfflineMessages(true)  // Aktivieren
       .when("hello").reply("Hi!")
       .start();

3️⃣ Chaining:
   createBot()
       .ignoreOfflineMessages(true)
       .enableDefaults()
       .enableAll()
       .start();

📵 WAS PASSIERT:
   - Bot ignoriert alle Messages die VOR der Verbindung gesendet wurden
   - Verhindert Spam beim Neustart
   - Perfekt für Production-Bots
   - Keine alten Messages werden verarbeitet

✅ VORTEILE:
   - Kein Message-Spam beim Restart
   - Sauberer Bot-Start
   - Production-ready
   - Einfache API
`);