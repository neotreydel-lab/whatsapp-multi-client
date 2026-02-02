// 🚀 Multi-Device Demo - Sequenzielles QR-Scanning!
import { MultiWhatsAppClient } from "./src/index.js";

console.log("🚀 Multi-Device Demo - Ein QR-Code nach dem anderen!");

async function multiDeviceDemo() {
    // Multi-Client erstellen (bis zu 3 Devices)
    const multiClient = new MultiWhatsAppClient({
        maxDevices: 3,                    // Max 3 WhatsApp Accounts
        loadBalancing: 'round-robin',     // Nachrichten gleichmäßig verteilen
        
        // Clean QR für alle Devices
        printQR: false,                   // Browser QR bevorzugt
        qrSpamPrevention: true,          // Anti-Spam
        clearTerminalOnQR: true          // Saubere Anzeige
    });

    console.log("📱 Füge 3 verschiedene WhatsApp Accounts hinzu...");

    // ===== DEVICE 1: Haupt-Bot =====
    await multiClient.addDevice('main-bot', {
        browser: ['MainBot', '1.0.0', ''],
        // Eigene Auth-Daten in ./auth/main-bot/
    });

    // ===== DEVICE 2: Backup-Bot =====  
    await multiClient.addDevice('backup-bot', {
        browser: ['BackupBot', '1.0.0', ''],
        // Eigene Auth-Daten in ./auth/backup-bot/
    });

    // ===== DEVICE 3: Support-Bot =====
    await multiClient.addDevice('support-bot', {
        browser: ['SupportBot', '1.0.0', ''],
        // Eigene Auth-Daten in ./auth/support-bot/
    });

    console.log("✅ 3 Devices hinzugefügt!");
    console.log("\n🎯 SEQUENZIELLES QR-SCANNING:");
    console.log("   1. Erst wird QR-Code für 'main-bot' angezeigt");
    console.log("   2. Scanne diesen mit WhatsApp Account #1");
    console.log("   3. Nach erfolgreichem Scan → QR-Code für 'backup-bot'");
    console.log("   4. Scanne diesen mit WhatsApp Account #2");
    console.log("   5. Nach erfolgreichem Scan → QR-Code für 'support-bot'");
    console.log("   6. Scanne diesen mit WhatsApp Account #3");
    console.log("\n💡 Kein Chaos mehr - ein QR nach dem anderen!");

    // Commands für alle 3 Devices
    multiClient.setPrefix("!");

    multiClient.addCommand('ping', async (msg) => {
        // Antwort vom gleichen Device das die Nachricht empfangen hat
        await msg.replyFromSameDevice(`🏓 Pong von Device: ${msg.deviceId}!`);
    });

    multiClient.addCommand('status', async (msg) => {
        const status = multiClient.getStatus();
        await msg.replyFromSameDevice(
            `📊 Multi-Device Status:\n` +
            `✅ Aktive Devices: ${status.activeDevices}/${status.totalDevices}\n` +
            `⚖️ Load Balancing: ${status.loadBalancing}\n` +
            `🔄 Sequenzielles Scanning: Aktiviert`
        );
    });

    multiClient.addCommand('broadcast', async (msg, args) => {
        const message = args.join(' ');
        
        // Nachricht von ALLEN 3 Devices senden!
        const results = await multiClient.broadcast(msg.from, { 
            text: `📢 Broadcast von allen Devices: ${message}` 
        });
        
        await msg.replyFromSameDevice(`✅ Broadcast von ${results.length} Devices gesendet!`);
    });

    multiClient.addCommand('device', async (msg, args) => {
        const [deviceName, ...messageParts] = args;
        const message = messageParts.join(' ');
        
        // Nachricht von spezifischem Device senden
        try {
            await multiClient.sendFromDevice(deviceName, msg.from, { 
                text: `📱 Nachricht von ${deviceName}: ${message}` 
            });
            await msg.replyFromSameDevice(`✅ Nachricht von ${deviceName} gesendet!`);
        } catch (error) {
            await msg.replyFromSameDevice(`❌ Device ${deviceName} nicht gefunden!`);
        }
    });

    // Message Handler
    multiClient.on('message', async (msg) => {
        console.log(`📨 Nachricht empfangen von Device: ${msg.deviceId}`);
        
        if (msg.text === 'test') {
            // Load-balanced Antwort (automatisch nächstes Device)
            await multiClient.sendMessage(msg.from, { 
                text: `✅ Test erfolgreich! Beantwortet von: ${msg.deviceId}` 
            });
        }
        
        if (msg.text === 'alle') {
            // Antwort von ALLEN Devices gleichzeitig!
            await multiClient.broadcast(msg.from, { 
                text: `👥 Alle 3 Devices antworten gleichzeitig!` 
            });
        }
    });

    // Device Events
    multiClient.on('device.connected', (data) => {
        console.log(`✅ Device '${data.deviceId}' erfolgreich verbunden!`);
        console.log("➡️ Bereit für nächstes Device...");
    });

    multiClient.on('device.disconnected', (data) => {
        console.log(`🔴 Device '${data.deviceId}' getrennt`);
    });

    // SEQUENZIELLE VERBINDUNG STARTEN
    console.log("\n🔄 Starte sequenzielle Verbindung...");
    console.log("📱 QR-Codes werden nacheinander angezeigt!");
    console.log("⚠️ Verwende 3 verschiedene WhatsApp Accounts!");
    
    try {
        // Sequenzielle Verbindung - ein QR nach dem anderen!
        const results = await multiClient.connect();
        
        const connectedDevices = results.filter(r => r.status === 'connected');
        
        console.log(`\n🎉 Sequenzielles Multi-Device Setup abgeschlossen!`);
        console.log(`✅ ${connectedDevices.length}/3 Devices verbunden`);
        
        if (connectedDevices.length > 0) {
            console.log("\n🎯 Verbundene Devices:");
            connectedDevices.forEach(device => {
                console.log(`   ✅ ${device.deviceId}`);
            });
            
            console.log("\n🧪 Test-Befehle:");
            console.log("   - 'test' → Load-balanced Antwort");
            console.log("   - 'alle' → Antwort von allen Devices");
            console.log("   - '!ping' → Ping von empfangendem Device");
            console.log("   - '!status' → Multi-Device Status");
            console.log("   - '!broadcast <msg>' → Von allen Devices senden");
            console.log("   - '!device main-bot <msg>' → Von spezifischem Device");
            console.log("\n🎯 Load Balancing aktiv - Nachrichten werden automatisch verteilt!");
        }
        
    } catch (error) {
        console.error("❌ Fehler beim sequenziellen Setup:", error.message);
    }
}

multiDeviceDemo();