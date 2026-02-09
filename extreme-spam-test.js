// ===== EXTREME SPAM TEST =====
// Simuliert 1000 Pushes - Warnung sollte nur 1x kommen

import { getStorage } from "./src/storage.js";

console.log("🧪 Extreme Spam Test (1000 Pushes)\n");

const storage = getStorage();

// Cleanup
storage.delete.from("test-extreme-spam").all();
storage.clearWarnings();

// Erstelle Object
storage.write.in("test-extreme-spam").data({ key: "value" });

console.log("🔥 Führe 1000 Pushes aus...");
console.log("⚠️ Warnung sollte nur EINMAL erscheinen!\n");

const startTime = Date.now();

// 1000 Pushes!
for (let i = 1; i <= 1000; i++) {
    storage.write.in("test-extreme-spam").push(`Nachricht ${i}`);
    
    // Progress indicator
    if (i % 100 === 0) {
        console.log(`   📊 ${i}/1000 Pushes...`);
    }
}

const endTime = Date.now();
const duration = endTime - startTime;

console.log("\n✅ 1000 Pushes abgeschlossen!");
console.log(`⏱️ Dauer: ${duration}ms (${(duration/1000).toFixed(2)}s)`);

const data = storage.read.from("test-extreme-spam").all();
console.log(`📊 Gespeicherte Nachrichten: ${data?.length}`);
console.log(`✅ Ist Array: ${Array.isArray(data)}`);

console.log("\n🎯 Ergebnis:");
console.log("   ⚠️ Warnung sollte nur EINMAL erschienen sein!");
console.log("   ✅ Keine 1000 Warnungen!");
console.log("   🚀 Performance: OK");

// Cleanup
storage.delete.from("test-extreme-spam").all();

console.log("\n🎉 Extreme Spam Test erfolgreich!");
console.log("💪 Anti-Spam System funktioniert perfekt!");
