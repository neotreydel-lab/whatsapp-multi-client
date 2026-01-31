import { MultiWhatsAppClient } from "../src/index.js";

// ===== EINFACHES MULTI-DEVICE BEISPIEL =====

async function simpleMultiDevice() {
    console.log("🚀 Einfacher Multi-Device Bot");
    
    // Multi-Client erstellen
    const client = new MultiWhatsAppClient({
        maxDevices: 2,
        loadBalancing: 'round-robin'
    });

    // 2 Devices hinzufügen
    await client.addDevice('bot1');
    await client.addDevice('bot2');

    // Commands
    client.setPrefix('!');
    
    client.addCommand('ping', async (msg) => {
        await msg.replyFromSameDevice(`Pong von ${msg.deviceId}! 🏓`);
    });

    client.addCommand('test', async (msg) => {
        // Nachricht über Load Balancing senden
        await client.sendMessage(msg.from, { text: 'Test via Load Balancing!' });
    });

    // Events
    client.on('message', async (msg) => {
        if (msg.text === 'hallo') {
            await client.sendMessage(msg.from, { text: `Hallo von ${msg.deviceId}! 👋` });
        }
    });

    // Verbinden
    await client.connect();
    console.log("✅ Multi-Device Bot läuft!");
}

simpleMultiDevice().catch(console.error);