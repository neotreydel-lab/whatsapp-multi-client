import { WhatsAppClient } from "./src/index.js";

console.log("🚀 Clean Offline Message Ignore Test");

const client = new WhatsAppClient({
    logLevel: "silent"
});

// Aktiviere Offline Message Ignore
client.ignore.message.offline(true);

client.setPrefix("!");

client.addCommand('test', async (msg) => {
    await msg.reply('✅ Test erfolgreich - keine Offline Messages!');
});

client.addCommand('stats', async (msg) => {
    const ignoredCount = client.ignoredMessagesCount || 0;
    await msg.reply(`📊 Ignorierte Offline Messages: ${ignoredCount}`);
});

client.on('message', async (msg) => {
    if (msg.text === 'hello') {
        await msg.reply('👋 Hallo! Sauberer Start ohne Spam!');
    }
});

async function start() {
    try {
        console.log("🔌 Verbinde...");
        await client.connect();
        
        console.log("✅ Bot läuft!");
        console.log("💬 Teste: 'hello', '!test', '!stats'");
        console.log("📵 Offline Messages werden sauber ignoriert!");
        
    } catch (error) {
        console.error("❌ Fehler:", error);
    }
}

start();