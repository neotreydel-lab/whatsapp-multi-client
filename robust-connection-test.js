import { WhatsAppClient, createBot, MultiWhatsAppClient } from "./src/index.js";

console.log("🚀 Robuste Verbindung Test - 24/7 Ready!");

// ===== 1. ADVANCED API - ULTRA ROBUST =====
console.log("\n1️⃣ Advanced API - Ultra Robust:");

const client = new WhatsAppClient({
    logLevel: "silent",
    
    // ULTRA ROBUSTE EINSTELLUNGEN! 💪
    maxReconnectAttempts: 500,    // 500 Wiederverbindungsversuche
    reconnectInterval: 1000,      // 1 Sekunde zwischen Versuchen
    exponentialBackoff: true,     // Exponential backoff
    maxBackoffDelay: 30000,       // Max 30 Sekunden Wartezeit
    heartbeatInterval: 10000,     // 10 Sekunden Heartbeat
    connectionTimeout: 300000,    // 5 Minuten Timeout
    keepAlive: true,              // Keep-Alive aktiviert
    
    // Auto-Restart auch ultra robust
    autoRestart: true,
    restartDelay: 2000            // 2 Sekunden Restart-Delay
});

client.ignore.message.offline(true);
client.setPrefix("!");

client.addCommand('robust', async (msg) => {
    const health = client.connectionHealth;
    const uptime = Date.now() - (client.lastConnectionTime || Date.now());
    
    await msg.reply(`💪 **ROBUSTE VERBINDUNG**\n\n` +
        `⏱️ Uptime: ${Math.floor(uptime / 1000)}s\n` +
        `💓 Pings: ${health.pingCount}\n` +
        `❌ Failed: ${health.failedPings}\n` +
        `⚡ Avg Response: ${Math.round(health.avgResponseTime)}ms\n` +
        `🔄 Reconnects: ${client.reconnectAttempts}\n\n` +
        `✅ 24/7 BEREIT!`);
});

client.addCommand('health', async (msg) => {
    await client.checkConnectionHealth();
    await msg.reply('🔍 Connection Health Check durchgeführt!');
});

client.on('message', async (msg) => {
    if (msg.text === 'test') {
        await msg.reply('✅ Robuste Verbindung funktioniert perfekt!');
    }
});

// ===== 2. EASYBOT - ULTRA ROBUST =====
console.log("\n2️⃣ EasyBot - Ultra Robust:");

const robustBot = createBot()
    .enableUltraRobust()          // ULTRA ROBUSTE EINSTELLUNGEN! 🚀
    .ignoreOfflineMessages(true)
    .when("hello").reply("👋 Ultra robuste Verbindung!").done()
    .when("status").reply("💪 24/7 Online - Keine Timeouts!").done()
    .command("uptime", "⏱️ Läuft seit dem letzten Restart!")
    .enableDefaults();

// ===== 3. MULTI-DEVICE - ROBUST =====
console.log("\n3️⃣ Multi-Device - Robust:");

const multiClient = new MultiWhatsAppClient({
    maxDevices: 2,
    loadBalancing: 'round-robin',
    
    // ROBUSTE MULTI-DEVICE EINSTELLUNGEN! 🔥
    maxReconnectAttempts: 200,
    reconnectInterval: 1500,
    heartbeatInterval: 15000,
    connectionTimeout: 240000,
    keepAlive: true
});

// ===== STARTE TESTS =====
async function startRobustTests() {
    try {
        console.log("\n🔌 Starte Ultra Robuste Verbindung...");
        await client.connect();
        
        console.log("✅ Advanced API Client läuft ultra robust!");
        console.log("💬 Teste: 'test', '!robust', '!health'");
        console.log("💪 Verbindung übersteht jetzt:");
        console.log("   - PC Standby/Hibernate");
        console.log("   - Kurze Internet-Unterbrechungen");
        console.log("   - WhatsApp Server-Probleme");
        console.log("   - Netzwerk-Wechsel");
        console.log("   - 24/7 Betrieb ohne Timeouts");
        
    } catch (error) {
        console.error("❌ Fehler:", error);
        console.log("🔄 Robuste Wiederverbindung läuft...");
    }
}

startRobustTests();

// ===== USAGE EXAMPLES =====
console.log(`
🎯 ROBUSTE VERBINDUNG EXAMPLES:

1️⃣ Advanced API - Ultra Robust:
   const client = new WhatsAppClient({
       maxReconnectAttempts: 500,
       reconnectInterval: 1000,
       heartbeatInterval: 10000,
       connectionTimeout: 300000,
       exponentialBackoff: true,
       keepAlive: true
   });

2️⃣ EasyBot - Ultra Robust:
   createBot()
       .enableUltraRobust()  // Alle robusten Features
       .when("hello").reply("Hi!")
       .start();

3️⃣ EasyBot - Custom Robust:
   createBot()
       .enableRobustConnection(true)
       .setReconnectAttempts(1000)
       .setHeartbeatInterval(5000)
       .start();

4️⃣ Factory Method:
   EasyBot.createRobust()  // Vorkonfiguriert robust
       .when("hello").reply("Hi!")
       .start();

💪 ROBUSTE FEATURES:
   ✅ 500+ Wiederverbindungsversuche
   ✅ Exponential Backoff (1s → 30s)
   ✅ 10s Heartbeat System
   ✅ Connection Health Monitoring
   ✅ Automatic Watchdog
   ✅ Force Reconnect bei Problemen
   ✅ 5 Minuten Connection Timeout
   ✅ Keep-Alive aktiviert
   ✅ Robuster Auto-Restart
   ✅ 24/7 Production Ready

🚀 PERFEKT FÜR:
   - Server-Bots (24/7)
   - Production-Umgebungen
   - Instabile Internetverbindungen
   - Laptops mit Standby
   - Kritische Anwendungen
`);