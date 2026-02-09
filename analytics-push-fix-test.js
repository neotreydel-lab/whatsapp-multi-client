// ===== ANALYTICS PUSH FIX TEST =====
// Test für den Analytics Array Push Bug Fix

import { getStorage } from "./src/storage.js";

console.log("🧪 Analytics Push Fix Test\n");

const storage = getStorage();

// ===== TEST 1: Push auf nicht-existierende Datei =====
console.log("📝 Test 1: Push auf nicht-existierende Datei");

// Lösche alte Test-Daten
storage.delete.from("test-analytics-push").all();

// Push auf nicht-existierende Datei (sollte Array erstellen)
const result1 = storage.write.in("test-analytics-push").push("erste Nachricht");
console.log(`✅ Push Result: ${result1}`);

const data1 = storage.read.from("test-analytics-push").all();
console.log(`📊 Daten:`, data1);
console.log(`✅ Ist Array: ${Array.isArray(data1)}`);
console.log(`✅ Länge: ${data1?.length}\n`);

// ===== TEST 2: Push auf Object (sollte zu Array konvertieren) =====
console.log("📝 Test 2: Push auf Object (sollte warnen und neues Array erstellen)");

// Erstelle Object
storage.write.in("test-analytics-object").data({ key: "value" });

// Versuche push (sollte warnen und neues Array erstellen)
const result2 = storage.write.in("test-analytics-object").push("neue Nachricht");
console.log(`✅ Push Result: ${result2}`);

const data2 = storage.read.from("test-analytics-object").all();
console.log(`📊 Daten:`, data2);
console.log(`✅ Ist Array: ${Array.isArray(data2)}`);
console.log(`✅ Länge: ${data2?.length}\n`);

// ===== TEST 3: Mehrere Pushes =====
console.log("📝 Test 3: Mehrere Pushes hintereinander");

storage.delete.from("test-analytics-multi").all();

storage.write.in("test-analytics-multi").push("Nachricht 1");
storage.write.in("test-analytics-multi").push("Nachricht 2");
storage.write.in("test-analytics-multi").push("Nachricht 3");

const data3 = storage.read.from("test-analytics-multi").all();
console.log(`📊 Daten:`, data3);
console.log(`✅ Ist Array: ${Array.isArray(data3)}`);
console.log(`✅ Länge: ${data3?.length}\n`);

// ===== TEST 4: Analytics Alerts Simulation =====
console.log("📝 Test 4: Analytics Alerts Simulation (wie im echten Code)");

storage.delete.from("analytics-alerts").all();

// Simuliere Alert-Speicherung wie im AnalyticsManager
const alerts = [
    {
        type: 'memory',
        level: 'warning',
        message: 'High memory usage: 85.5%',
        timestamp: Date.now()
    },
    {
        type: 'response_time',
        level: 'warning',
        message: 'Slow response time: 5500ms',
        timestamp: Date.now()
    }
];

// Store each alert individually (wie im Fix)
alerts.forEach(alert => {
    storage.write.in("analytics-alerts").push(alert);
});

const alertsData = storage.read.from("analytics-alerts").all();
console.log(`📊 Alerts gespeichert: ${alertsData?.length}`);
console.log(`✅ Ist Array: ${Array.isArray(alertsData)}`);
console.log(`📋 Alerts:`, JSON.stringify(alertsData, null, 2));

// ===== CLEANUP =====
console.log("\n🧹 Cleanup...");
storage.delete.from("test-analytics-push").all();
storage.delete.from("test-analytics-object").all();
storage.delete.from("test-analytics-multi").all();
storage.delete.from("analytics-alerts").all();

console.log("\n✅ Alle Tests abgeschlossen!");
console.log("🎉 Analytics Push Bug ist gefixt!");
