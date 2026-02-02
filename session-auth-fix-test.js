// Test für Session-Authentifizierung Fix
// Testet ob "erfolgreich verbunden" nur bei ECHTER Authentifizierung angezeigt wird

import { WhatsAppClient } from './src/client.js';
import fs from 'fs';

console.log("🧪 Session-Authentifizierung Fix Test");
console.log("=====================================");

// Cleanup alte Sessions
const authDirs = ['./auth', './auth_backup_*', '*-auth', './waengine-data'];
authDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`🗑️ Bereinigt: ${dir}`);
        } catch (e) {
            console.log(`⚠️ Konnte ${dir} nicht bereinigen: ${e.message}`);
        }
    }
});

console.log("\n📱 Starte Bot ohne bestehende Session...");
console.log("ERWARTUNG: Socket öffnet sich, aber KEINE 'erfolgreich verbunden' Nachricht");
console.log("ERWARTUNG: Erst nach QR-Scan soll Success-Message kommen");

const client = new WhatsAppClient({
    printQR: true,
    silent: false,
    verbose: true,
    autoRestart: false
});

// Event Listener für Tests
client.on('qr', (qr) => {
    console.log("\n✅ QR-Code Event empfangen");
    console.log("📱 Jetzt QR-Code scannen um Authentifizierung zu testen");
});

client.on('connected', () => {
    console.log("\n❌ FEHLER: 'connected' Event bei Socket-Open (sollte nicht passieren!)");
});

client.on('truly_connected', (data) => {
    console.log("\n✅ KORREKT: 'truly_connected' Event nach Authentifizierung");
    console.log(`👤 User ID: ${data.userId}`);
    console.log("🎉 Test erfolgreich - Success Messages nur nach echter Auth!");
    
    setTimeout(() => {
        process.exit(0);
    }, 2000);
});

// Timeout für Test
setTimeout(() => {
    console.log("\n⏰ Test-Timeout - prüfe Logs:");
    console.log("✅ Wenn KEINE 'erfolgreich verbunden' Nachricht vor QR-Scan: FIX FUNKTIONIERT");
    console.log("❌ Wenn 'erfolgreich verbunden' vor QR-Scan: FIX FEHLGESCHLAGEN");
    process.exit(0);
}, 30000);

try {
    await client.connect();
} catch (error) {
    console.error("❌ Connection Error:", error.message);
}