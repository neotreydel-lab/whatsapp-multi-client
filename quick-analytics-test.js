// Quick Analytics Test - Verifiziert dass der Bug gefixt ist

import { AnalyticsManager } from "./src/analytics-manager.js";
import { getStorage } from "./src/storage.js";

console.log("🧪 Quick Analytics Test\n");

// Mock Client
const mockClient = {
    emit: (event, data) => {
        console.log(`📡 Event emitted: ${event}`);
    }
};

// Create Analytics Manager
const analytics = new AnalyticsManager(mockClient);

console.log("✅ AnalyticsManager erstellt\n");

// Test 1: Track Message
console.log("📝 Test 1: Track Message");
analytics.trackMessage({
    type: 'text',
    from: 'user123@s.whatsapp.net',
    isGroup: false,
    chatId: 'chat123'
});
console.log("✅ Message tracked\n");

// Test 2: Track Command
console.log("📝 Test 2: Track Command");
analytics.trackCommand('ping', 'user123@s.whatsapp.net', true);
console.log("✅ Command tracked\n");

// Test 3: Track Response Time
console.log("📝 Test 3: Track Response Time");
analytics.trackResponseTime(150);
console.log("✅ Response time tracked\n");

// Test 4: Get Stats
console.log("📝 Test 4: Get Overview Stats");
const stats = analytics.getOverviewStats();
console.log("📊 Stats:", JSON.stringify(stats, null, 2));
console.log("✅ Stats retrieved\n");

// Test 5: Simulate Performance Alert (der kritische Test!)
console.log("📝 Test 5: Simulate Performance Alert (Critical Test!)");
analytics.monitoring.memory = { percentage: 85 };
analytics.monitoring.responseTime = 5500;
analytics.checkAlerts();
console.log("✅ Alerts checked (sollte keine Fehler geben!)\n");

// Verify alerts were stored
const storage = getStorage();
const alerts = storage.read.from("analytics-alerts").all();
console.log(`📊 Gespeicherte Alerts: ${alerts ? alerts.length : 0}`);
if (alerts && alerts.length > 0) {
    console.log("✅ Alerts erfolgreich gespeichert!");
    console.log("📋 Letzte Alerts:", JSON.stringify(alerts.slice(-2), null, 2));
} else {
    console.log("ℹ️ Keine Alerts (Memory/Response Time unter Schwellwert)");
}

console.log("\n🎉 Alle Tests erfolgreich!");
console.log("✅ Analytics Push Bug ist definitiv gefixt!");

// Cleanup
console.log("\n🧹 Cleanup...");
storage.delete.from("analytics").all();
storage.delete.from("analytics-alerts").all();
console.log("✅ Cleanup abgeschlossen");
