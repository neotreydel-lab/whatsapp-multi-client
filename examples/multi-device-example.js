import { MultiWhatsAppClient } from "../src/index.js";

// ===== MULTI-DEVICE BOT EXAMPLE =====

async function startMultiDeviceBot() {
    console.log("🚀 Starte Multi-Device WhatsApp Bot...");
    
    // Multi-Client mit 3 Devices initialisieren
    const multiClient = new MultiWhatsAppClient({
        maxDevices: 3,
        loadBalancing: 'round-robin', // round-robin, random, least-used, failover
        syncEvents: true
    });

    // ===== DEVICES HINZUFÜGEN =====
    
    try {
        // Device 1: Haupt-Bot
        await multiClient.addDevice('main-bot', {
            browser: ['MainBot', '1.0.0', ''],
            logLevel: 'silent'
        });

        // Device 2: Backup-Bot  
        await multiClient.addDevice('backup-bot', {
            browser: ['BackupBot', '1.0.0', ''],
            logLevel: 'silent'
        });

        // Device 3: Support-Bot
        await multiClient.addDevice('support-bot', {
            browser: ['SupportBot', '1.0.0', ''],
            logLevel: 'silent'
        });

        console.log("✅ Alle 3 Devices hinzugefügt");

    } catch (error) {
        console.error("❌ Fehler beim Hinzufügen der Devices:", error.message);
        return;
    }

    // ===== COMMAND SYSTEM =====
    
    const prefix = "!";
    multiClient.setPrefix(prefix);

    // Commands für alle Devices
    multiClient.addCommand('ping', async (msg) => {
        const deviceInfo = msg.deviceId ? ` (Device: ${msg.deviceId})` : '';
        await msg.replyFromSameDevice(`🏓 Pong!${deviceInfo}`);
    });

    multiClient.addCommand('status', async (msg) => {
        const status = multiClient.getStatus();
        const health = multiClient.getHealthCheck();
        
        let response = `📊 **Multi-Device Status**\n\n`;
        response += `🔧 Devices: ${status.activeDevices}/${status.totalDevices} aktiv\n`;
        response += `💚 Health: ${health.healthPercentage}% (${health.recommendation})\n`;
        response += `⚖️ Load Balancing: ${status.loadBalancing}\n\n`;
        
        response += `**Device Details:**\n`;
        status.devices.forEach(device => {
            const statusIcon = device.status === 'connected' ? '✅' : 
                              device.status === 'connecting' ? '🔄' : '❌';
            response += `${statusIcon} ${device.id}: ${device.messageCount} msgs, ${device.errors} errors\n`;
        });
        
        await msg.replyFromSameDevice(response);
    });

    multiClient.addCommand('broadcast', async (msg, args) => {
        if (args.length === 0) {
            return msg.replyFromSameDevice('❌ Verwendung: !broadcast <nachricht>');
        }
        
        const message = args.join(' ');
        const results = await multiClient.broadcast(msg.from, { text: `📢 Broadcast: ${message}` });
        
        const successful = results.filter(r => r.success).length;
        await msg.replyFromSameDevice(`✅ Broadcast an ${successful}/${results.length} Devices gesendet`);
    });

    multiClient.addCommand('device', async (msg, args) => {
        if (args.length < 2) {
            return msg.replyFromSameDevice('❌ Verwendung: !device <deviceId> <nachricht>');
        }
        
        const [deviceId, ...messageParts] = args;
        const message = messageParts.join(' ');
        
        try {
            await multiClient.sendFromDevice(deviceId, msg.from, { text: `📱 Von ${deviceId}: ${message}` });
            await msg.replyFromSameDevice(`✅ Nachricht von Device '${deviceId}' gesendet`);
        } catch (error) {
            await msg.replyFromSameDevice(`❌ Fehler: ${error.message}`);
        }
    });

    multiClient.addCommand('failover', async (msg, args) => {
        if (args.length === 0) {
            return msg.replyFromSameDevice('❌ Verwendung: !failover <nachricht>');
        }
        
        const message = args.join(' ');
        
        try {
            await multiClient.sendWithFailover(msg.from, { text: `🔄 Failover: ${message}` });
            await msg.replyFromSameDevice('✅ Failover-Nachricht gesendet');
        } catch (error) {
            await msg.replyFromSameDevice(`❌ Alle Devices fehlgeschlagen: ${error.message}`);
        }
    });

    // ===== EVENT HANDLERS =====
    
    // Message Events von allen Devices
    multiClient.on('message', async (msg) => {
        // Ignore Commands (werden separat behandelt)
        if (msg.isCommand) return;
        
        // Einfache Auto-Responses
        if (msg.text?.toLowerCase().includes('hallo')) {
            // Load-balanced Response
            await multiClient.sendMessage(msg.from, { 
                text: `Hallo! 👋 (Beantwortet von Device: ${msg.deviceId})` 
            });
        }
        
        if (msg.text?.toLowerCase().includes('hilfe')) {
            const helpText = `🤖 **Multi-Device Bot Hilfe**\n\n` +
                           `${prefix}ping - Ping Test\n` +
                           `${prefix}status - Device Status\n` +
                           `${prefix}broadcast <msg> - An alle Devices\n` +
                           `${prefix}device <id> <msg> - Spezifisches Device\n` +
                           `${prefix}failover <msg> - Mit Failover\n\n` +
                           `Aktive Devices: ${multiClient.getActiveDevices().join(', ')}`;
            
            await msg.replyFromSameDevice(helpText);
        }
    });

    // Device Connection Events
    multiClient.on('device.connected', (data) => {
        console.log(`✅ Device '${data.deviceId}' verbunden`);
    });

    multiClient.on('device.disconnected', (data) => {
        console.log(`🔴 Device '${data.deviceId}' getrennt:`, data.reason || 'Unbekannt');
    });

    multiClient.on('device.error', (data) => {
        console.error(`❌ Device '${data.deviceId}' Fehler:`, data.error.message);
    });

    // ===== VERBINDUNG STARTEN =====
    
    try {
        console.log("🔄 Verbinde alle Devices...");
        const connectedCount = await multiClient.connect();
        
        console.log(`🎉 Multi-Device Bot gestartet!`);
        console.log(`✅ ${connectedCount} Devices erfolgreich verbunden`);
        console.log(`🎯 Prefix: "${prefix}"`);
        console.log(`⚖️ Load Balancing: ${multiClient.deviceManager.config.loadBalancing}`);
        
        // Status alle 5 Minuten loggen
        setInterval(() => {
            const health = multiClient.getHealthCheck();
            console.log(`💚 Health Check: ${health.healthPercentage}% - ${health.recommendation}`);
        }, 5 * 60 * 1000);
        
        // Device Rotation alle 10 Minuten (optional)
        setInterval(() => {
            multiClient.rotateDevices();
        }, 10 * 60 * 1000);
        
    } catch (error) {
        console.error("❌ Fehler beim Starten des Multi-Device Bots:", error.message);
        process.exit(1);
    }

    // ===== GRACEFUL SHUTDOWN =====
    
    process.on('SIGINT', async () => {
        console.log("\n🛑 Shutdown Signal empfangen...");
        await multiClient.cleanup();
        console.log("✅ Multi-Device Bot sauber beendet");
        process.exit(0);
    });
}

// ===== ADVANCED USAGE EXAMPLES =====

async function advancedExamples() {
    const multiClient = new MultiWhatsAppClient();
    
    // Beispiel 1: Device-spezifische Konfiguration
    await multiClient.addDevice('premium-bot', {
        browser: ['PremiumBot', '2.0.0', ''],
        logLevel: 'info'
    });
    
    await multiClient.configureDevice('premium-bot', {
        maxRetries: 5,
        timeout: 30000
    });

    // Beispiel 2: Load Balancing Strategy wechseln
    multiClient.setLoadBalancingStrategy('least-used');

    // Beispiel 3: Conditional Messaging
    multiClient.on('message', async (msg) => {
        if (msg.isGroup && msg.text?.includes('wichtig')) {
            // Wichtige Nachrichten über alle Devices broadcasten
            await multiClient.broadcast(msg.from, { 
                text: '🚨 Wichtige Nachricht erkannt - alle Devices alarmiert!' 
            });
        } else {
            // Normale Nachrichten load-balanced
            await multiClient.sendMessage(msg.from, { 
                text: 'Normale Antwort via Load Balancing' 
            });
        }
    });

    // Beispiel 4: Device Health Monitoring
    setInterval(async () => {
        const health = multiClient.getHealthCheck();
        
        if (health.healthPercentage < 50) {
            console.warn('🚨 Kritische Device-Health! Versuche Reconnect...');
            
            // Versuche fehlerhafte Devices zu reconnecten
            const status = multiClient.getStatus();
            for (const device of status.devices) {
                if (device.status !== 'connected') {
                    try {
                        await multiClient.deviceManager.connectDevice(device.id);
                    } catch (error) {
                        console.error(`❌ Reconnect fehlgeschlagen für ${device.id}:`, error.message);
                    }
                }
            }
        }
    }, 2 * 60 * 1000); // Alle 2 Minuten prüfen
}

// Bot starten
if (import.meta.url === `file://${process.argv[1]}`) {
    startMultiDeviceBot().catch(console.error);
}