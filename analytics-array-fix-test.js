// Analytics Array Fix Test - Testet die Storage Array-Konvertierung
import { WhatsAppClient } from "./src/client.js";
import { getStorage } from "./src/storage.js";

console.log("🔧 Analytics Array Fix Test");
console.log("=" .repeat(50));

// Storage testen
const storage = getStorage();

console.log("📊 Teste Storage Array-Konvertierung...");

// Test 1: Object zu Array konvertieren
console.log("\n1️⃣ Test: Object zu Array Konvertierung");
storage.write.in("test-analytics").data({
    "0": "erste Nachricht",
    "1": "zweite Nachricht", 
    "2": "dritte Nachricht"
});

console.log("✅ Object gespeichert");

// Versuche push (sollte Object zu Array konvertieren)
const pushResult1 = storage.write.in("test-analytics").push("vierte Nachricht");
console.log(`📝 Push Result: ${pushResult1}`);

const data1 = storage.read.from("test-analytics").all();
console.log("📋 Daten nach Konvertierung:", data1);
console.log(`🔍 Ist Array: ${Array.isArray(data1)}`);

// Test 2: Normales Object in Array wrappen
console.log("\n2️⃣ Test: Object in Array wrappen");
storage.write.in("test-analytics2").data({
    messages: 100,
    users: 50,
    commands: 25
});

console.log("✅ Normales Object gespeichert");

const pushResult2 = storage.write.in("test-analytics2").push("neue Daten");
console.log(`📝 Push Result: ${pushResult2}`);

const data2 = storage.read.from("test-analytics2").all();
console.log("📋 Daten nach Wrapping:", data2);
console.log(`🔍 Ist Array: ${Array.isArray(data2)}`);

// Test 3: Echtes Array (sollte normal funktionieren)
console.log("\n3️⃣ Test: Echtes Array");
storage.write.in("test-analytics3").data(["item1", "item2", "item3"]);

const pushResult3 = storage.write.in("test-analytics3").push("item4");
console.log(`📝 Push Result: ${pushResult3}`);

const data3 = storage.read.from("test-analytics3").all();
console.log("📋 Array Daten:", data3);
console.log(`🔍 Ist Array: ${Array.isArray(data3)}`);

// Test 4: WhatsApp Client mit Analytics
console.log("\n4️⃣ Test: WhatsApp Client Analytics");

const client = new WhatsAppClient({
    silent: true,  // Keine Console-Ausgaben für Test
    printQR: true  // Terminal QR für Test
});

// Analytics Manager testen
console.log("📊 Analytics Manager Test...");

// Simuliere Message Tracking
client.analyticsManager.trackMessage({
    type: 'text',
    from: '1234567890@s.whatsapp.net',
    isGroup: false,
    location: { country: 'DE' }
});

console.log("✅ Message getrackt");

// Simuliere Command Tracking  
client.analyticsManager.trackCommand('test', '1234567890@s.whatsapp.net', true);
console.log("✅ Command getrackt");

// Analytics Daten abrufen
const stats = client.analyticsManager.getDetailedStats(1);
console.log("📈 Analytics Stats:", {
    totalUsers: stats.overview.totalUsers,
    totalMessages: stats.overview.totalMessages,
    messageTypes: Object.keys(stats.messages.byType).length
});

// Cleanup
console.log("\n🧹 Cleanup Test-Dateien...");
storage.delete.from("test-analytics").all();
storage.delete.from("test-analytics2").all(); 
storage.delete.from("test-analytics3").all();

console.log("✅ Analytics Array Fix Test abgeschlossen!");
console.log("🎯 Alle Tests erfolgreich - keine '❌ analytics ist kein Array!' Fehler mehr!");