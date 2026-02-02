// 🎨 Beautiful Console Demo - Zeigt das neue schöne Console System
import { MultiWhatsAppClient } from "./src/multi-client.js";

console.log("🎬 Beautiful Console Demo wird gestartet...\n");

// Multi-Device Bot mit schöner Console
const multiClient = new MultiWhatsAppClient({
    maxDevices: 2,
    loadBalancing: 'round-robin',
    verbose: false,  // Für saubere Ausgabe
    silent: false    // Zeige schöne Animationen
});

// Devices hinzufügen
await multiClient.addDevice('bot1');
await multiClient.addDevice('bot2');

// Commands hinzufügen
multiClient.setPrefix('!');

multiClient.addCommand('hello', async (msg) => {
    await msg.reply('Hi! 👋');
});

multiClient.addCommand('ping', async (msg) => {
    await msg.reply('Pong! 🏓');
});

multiClient.addCommand('help', async (msg) => {
    await msg.reply('Verfügbare Commands: !hello, !ping, !help, !status');
});

multiClient.addCommand('status', async (msg) => {
    const status = multiClient.getStatus();
    await msg.reply(`Bot läuft perfekt! ✅\n📊 ${status.activeDevices}/${status.totalDevices} Devices aktiv`);
});

// Event Handler
multiClient.on('message', async (msg) => {
    if (msg.text === 'test') {
        await msg.reply(`Hello from ${msg.deviceId}! 🤖`);
    }
});

// Bot starten mit schöner Console
try {
    await multiClient.connect();
    console.log('\n🎉 Bot ist bereit und wartet auf Nachrichten!');
} catch (error) {
    console.error('❌ Fehler beim Starten:', error.message);
}