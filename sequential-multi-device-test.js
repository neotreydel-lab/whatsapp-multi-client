// 🎯 Sequential Multi-Device Test - Ein QR nach dem anderen!
import { MultiWhatsAppClient } from "./src/index.js";
import fs from 'fs';

console.log("🎯 Sequential Multi-Device Test - Benutzerfreundliches QR-Scanning!");

async function sequentialTest() {
    // Lösche alte Auth-Daten für frischen Test
    const authDirs = ['./auth/seq-main', './auth/seq-backup'];
    authDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
    console.log("🗑️ Alte Auth-Daten gelöscht für frischen Test");

    // Multi-Client mit 2 Devices (einfacher zu testen)
    const multiClient = new MultiWhatsAppClient({
        maxDevices: 2,
        loadBalancing: 'round-robin',
        
        // Clean QR Settings
        printQR: false,
        qrSpamPrevention: true,
        clearTerminalOnQR: true,
        qrDisplayInterval: 45000  // Längere Intervalle für Multi-Device
    });

    console.log("\n📱 Setup: 2 Devices für einfacheren Test");

    // Device 1: Main Bot
    await multiClient.addDevice('seq-main', {
        browser: ['SeqMain', '1.0.0', '']
    });

    // Device 2: Backup Bot
    await multiClient.addDevice('seq-backup', {
        browser: ['SeqBackup', '1.0.0', '']
    });

    console.log("✅ 2 Devices hinzugefügt");

    // Commands
    multiClient.setPrefix("!");

    multiClient.addCommand('test', async (msg) => {
        await msg.replyFromSameDevice(`✅ Sequential Test OK! Device: ${msg.deviceId}`);
    });

    multiClient.addCommand('which', async (msg) => {
        await msg.replyFromSameDevice(`📱 Du sprichst mit Device: ${msg.deviceId}`);
    });

    multiClient.addCommand('both', async (msg, args) => {
        const message = args.join(' ') || 'Test von beiden Devices!';
        const results = await multiClient.broadcast(msg.from, { 
            text: `📢 ${message}` 
        });
        await msg.replyFromSameDevice(`✅ Nachricht von ${results.length} Devices gesendet!`);
    });

    // Events
    multiClient.on('message', async (msg) => {
        if (msg.text === 'hello') {
            await msg.replyFromSameDevice(`👋 Hallo! Ich bin ${msg.deviceId}!`);
        }
        
        if (msg.text === 'status') {
            const status = multiClient.getStatus();
            await msg.replyFromSameDevice(
                `📊 Status:\n` +
                `✅ ${status.activeDevices}/${status.totalDevices} Devices aktiv\n` +
                `🎯 Sequential Scanning: Aktiviert`
            );
        }
    });

    multiClient.on('device.connected', (data) => {
        console.log(`\n🎉 Device '${data.deviceId}' erfolgreich verbunden!`);
        
        // Zeige Fortschritt
        const status = multiClient.getStatus();
        console.log(`📊 Fortschritt: ${status.activeDevices}/${status.totalDevices} Devices verbunden`);
        
        if (status.activeDevices < status.totalDevices) {
            console.log("➡️ Weiter zum nächsten Device...");
        }
    });

    // SEQUENZIELLE VERBINDUNG STARTEN
    console.log("\n🚀 Starte Sequential Multi-Device Test...");
    console.log("=" .repeat(60));
    console.log("🎯 SEQUENTIAL QR-SCANNING PROZESS:");
    console.log("=" .repeat(60));
    console.log("1. 📱 QR-Code für 'seq-main' wird angezeigt");
    console.log("2. ⏳ Scanne mit WhatsApp Account #1");
    console.log("3. ✅ Warte auf erfolgreiche Verbindung");
    console.log("4. 📱 QR-Code für 'seq-backup' wird angezeigt");
    console.log("5. ⏳ Scanne mit WhatsApp Account #2");
    console.log("6. ✅ Beide Devices verbunden!");
    console.log("=" .repeat(60));
    console.log("💡 Kein Chaos - ein QR nach dem anderen!");
    console.log("");

    try {
        // Sequential Connection - das ist der Schlüssel!
        const results = await multiClient.connect();
        
        const connected = results.filter(r => r.status === 'connected');
        
        console.log("\n🎉 SEQUENTIAL SETUP ABGESCHLOSSEN!");
        console.log("=" .repeat(50));
        console.log(`✅ ${connected.length}/2 Devices erfolgreich verbunden`);
        
        if (connected.length > 0) {
            console.log("\n📱 Verbundene Devices:");
            connected.forEach((device, index) => {
                console.log(`   ${index + 1}. ✅ ${device.deviceId}`);
            });
            
            console.log("\n🧪 Test-Nachrichten:");
            console.log("   - 'hello' → Begrüßung vom empfangenden Device");
            console.log("   - 'status' → Multi-Device Status");
            console.log("   - '!test' → Test-Antwort");
            console.log("   - '!which' → Welches Device antwortet");
            console.log("   - '!both <msg>' → Nachricht von beiden Devices");
            
            console.log("\n🎯 Sequential Multi-Device System aktiv!");
            console.log("📨 Nachrichten werden automatisch load-balanced!");
        }
        
    } catch (error) {
        console.error("❌ Sequential Test Fehler:", error.message);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Beende Sequential Multi-Device Test...');
    process.exit(0);
});

sequentialTest();