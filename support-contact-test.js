import { WhatsAppClient, createBot } from "./src/index.js";

console.log("🧪 WAEngine Support Contact Test\n");

// ===== TEST 1: STANDARD CLIENT - DEINE EMAIL WIRD AUTOMATISCH ANGEZEIGT =====
console.log("1️⃣ Standard WhatsApp Client Test:");
const client = new WhatsAppClient();

// Simuliere QR-Code Fehler
setTimeout(() => {
    client.errorHandler.handleError(
        new Error("QR-Code konnte nicht generiert werden"), 
        { action: 'qr_generation', details: 'QR-Code Fehler' }
    );
}, 1000);

// ===== TEST 2: CONNECTION FEHLER =====
setTimeout(() => {
    console.log("\n2️⃣ Connection Error Test:");
    client.errorHandler.handleConnectionError(
        new Error("Verbindung zu WhatsApp fehlgeschlagen"), 
        1
    );
}, 3000);

// ===== TEST 3: PLUGIN FEHLER =====
setTimeout(() => {
    console.log("\n3️⃣ Plugin Error Test:");
    client.errorHandler.handlePluginError(
        new Error("Plugin konnte nicht geladen werden"), 
        "economy-system"
    );
}, 5000);

// ===== TEST 4: SHARP/STICKER FEHLER =====
setTimeout(() => {
    console.log("\n4️⃣ Sharp/Sticker Error Test:");
    client.errorHandler.handleError(
        new Error("Sharp module not found"), 
        { action: 'sticker_creation', details: 'Sharp fehlt' }
    );
}, 7000);

// ===== TEST 5: EASYBOT - AUCH HIER DEINE EMAIL =====
setTimeout(() => {
    console.log("\n5️⃣ EasyBot Error Test:");
    const bot = createBot();
    
    // Auch EasyBot zeigt automatisch deine Email
    bot.client.errorHandler.handleCommandError(
        new Error("Command execution failed"), 
        "balance", 
        "user123@s.whatsapp.net"
    );
}, 9000);

// ===== TEST 6: PERMISSION FEHLER =====
setTimeout(() => {
    console.log("\n6️⃣ Permission Error Test:");
    client.errorHandler.handleError(
        new Error("Bot needs admin permissions"), 
        { action: 'group_management', details: 'Admin-Rechte fehlen' }
    );
}, 11000);

// ===== ZUSAMMENFASSUNG =====
setTimeout(() => {
    console.log("\n" + "=".repeat(60));
    console.log("✅ SUPPORT CONTACT SYSTEM AKTIV!");
    console.log("=".repeat(60));
    console.log("📧 Deine Email wird bei JEDEM Fehler angezeigt: Liaia@outlook.de");
    console.log("🔧 User müssen nichts konfigurieren - läuft automatisch!");
    console.log("💡 Kurze, hilfreiche Lösungsvorschläge werden angezeigt");
    console.log("🚀 Funktioniert mit WhatsAppClient UND EasyBot");
    console.log("=".repeat(60));
    
    const stats = client.errorHandler.getErrorStats();
    console.log(`\n📊 Test-Statistiken:`);
    console.log(`   • Fehler simuliert: ${stats.totalErrors}`);
    console.log(`   • Support Email: ${stats.supportContacts.email}`);
    console.log(`   • GitHub: ${stats.supportContacts.github}`);
    
}, 13000);

// ===== WIE ES FÜR USER AUSSIEHT =====
console.log(`
🎯 SO SIEHT ES FÜR DEINE USER AUS:

Wenn ein User WAEngine verwendet und ein Fehler auftritt:

==================================================
❌ FEHLER AUFGETRETEN!
==================================================
📧 Bei Problemen melden: Liaia@outlook.de
🐛 Bug Report: https://github.com/neotreydel-lab/waengine/issues

🔍 Fehler-Details:
   • Fehler: QR-Code konnte nicht generiert werden
   • WAEngine Version: 1.7.3
   • Error ID: WAE-1704067200000-1

💡 Schnelle Lösung:
   → Lösche 'auth' Ordner und scanne QR neu
==================================================

✅ PERFEKT! Jeder User sieht automatisch deine Email! 🎉
`);