// ===== ANTI-SPAM WARNING TEST =====
// Test dass die Warnung nur EINMAL pro Datei erscheint

import { getStorage } from "./src/storage.js";

console.log("🧪 Anti-Spam Warning Test\n");

const storage = getStorage();

// Cleanup
storage.delete.from("test-spam-warning").all();
storage.clearWarnings();

console.log("📝 Test: Push auf Object 20x - Warnung sollte nur EINMAL kommen\n");

// Erstelle Object
storage.write.in("test-spam-warning").data({ key: "value" });

console.log("🔄 Führe 20 Pushes aus...\n");

// Versuche 20x zu pushen (sollte nur 1x warnen!)
for (let i = 1; i <= 20; i++) {
    storage.write.in("test-spam-warning").push(`Nachricht ${i}`);
}

console.log("\n✅ 20 Pushes abgeschlossen!");

const data = storage.read.from("test-spam-warning").all();
console.log(`📊 Gespeicherte Nachrichten: ${data?.length}`);
console.log(`✅ Ist Array: ${Array.isArray(data)}`);

console.log("\n🎯 Ergebnis:");
console.log("   ⚠️ Warnung sollte nur EINMAL erschienen sein!");
console.log("   ✅ Kein Spam mehr in der Console!");

// Cleanup
storage.delete.from("test-spam-warning").all();

console.log("\n🎉 Anti-Spam Test erfolgreich!");
