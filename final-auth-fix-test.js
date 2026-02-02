// Finaler Test für Session-Authentifizierung Fix
// Testet speziell das Problem mit "Device erfolgreich authentifiziert" vor QR-Scan

import { WhatsAppClient } from './src/client.js';
import fs from 'fs';

console.log("🧪 FINALER SESSION-AUTHENTIFIZIERUNG TEST");
console.log("=========================================");
console.log("PROBLEM: 'Device erfolgreich authentifiziert' erscheint vor QR-Scan");
console.log("LÖSUNG: Alle Success-Messages nur nach echter Authentifizierung");

// Cleanup alte Sessions
const authDirs = ['./auth', './waengine-data'];
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
console.log("ERWARTUNG: KEINE 'Device erfolgreich authentifiziert' Nachricht vor QR-Scan");

const client = new WhatsAppClient({
    printQR: true,
    silent: false,
    verbose: false,
    autoRestart: false
});

let qrReceived = false;
let prematureDeviceSuccessDetected = false;
let authenticatedDeviceSuccessReceived = false;

// Monitor für premature Device Success Messages
const originalLog = console.log;
console.log = (...args) => {
    const message = args.join(' ');
    
    // Prüfe auf premature Device Success Messages (das spezifische Problem)
    if (message.includes('Device \'main-bot\' erfolgreich authentifiziert') && !qrReceived) {
        prematureDeviceSuccessDetected = true;
        originalLog("❌ FEHLER: Premature Device Success Message erkannt OHNE QR-Scan!");
        originalLog("❌ NACHRICHT:", message);
    }
    
    // Prüfe auf korrekte Device Success Messages NACH QR-Scan
    if (message.includes('Device \'main-bot\' erfolgreich authentifiziert') && qrReceived) {
        authenticatedDeviceSuccessReceived = true;
        originalLog("✅ KORREKT: Device Success Message NACH QR-Scan:", message);
    }
    
    // Prüfe auf andere premature Success Messages
    if ((message.includes('erfolgreich verbunden') || 
         message.includes('successfully connected') ||
         message.includes('Load Balancing: Aktiv')) && 
        !qrReceived) {
        prematureDeviceSuccessDetected = true;
        originalLog("❌ FEHLER: Andere premature Success Message:", message);
    }
    
    originalLog(...args);
};

// Event Listener für Tests
client.on('qr', (qr) => {
    qrReceived = true;
    console.log("\n✅ QR-Code Event empfangen");
    console.log("📱 QR-Code bereit - warte 5 Sekunden für weitere Messages...");
    
    // Warte 5 Sekunden um zu sehen ob weitere premature Messages kommen
    setTimeout(() => {
        if (!prematureDeviceSuccessDetected) {
            console.log("✅ KORREKT: Keine premature Device Success Messages in 5 Sekunden");
        }
        showTestResults();
    }, 5000);
});

client.on('truly_connected', (data) => {
    console.log("\n✅ KORREKT: 'truly_connected' Event nach Authentifizierung");
    console.log(`👤 User ID: ${data.userId}`);
    authenticatedDeviceSuccessReceived = true;
    
    setTimeout(() => {
        showTestResults();
    }, 1000);
});

// Test-Ergebnisse anzeigen
function showTestResults() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 FINALER TEST-ERGEBNISSE");
    console.log("=".repeat(60));
    
    console.log(`📱 QR-Code Event: ${qrReceived ? '✅ BESTANDEN' : '❌ FEHLGESCHLAGEN'}`);
    console.log(`⚠️ Premature Device Success: ${!prematureDeviceSuccessDetected ? '✅ BESTANDEN (keine gefunden)' : '❌ FEHLGESCHLAGEN (gefunden!)'}`);
    console.log(`🎉 Auth Device Success: ${authenticatedDeviceSuccessReceived ? '✅ BESTANDEN' : '⏳ WARTE AUF QR-SCAN'}`);
    
    const mainTestPassed = qrReceived && !prematureDeviceSuccessDetected;
    
    console.log("\n" + "=".repeat(60));
    if (mainTestPassed) {
        console.log("🎉 HAUPTTEST BESTANDEN!");
        console.log("✅ KEINE 'Device erfolgreich authentifiziert' vor QR-Scan");
        console.log("✅ Problem ist behoben!");
    } else {
        console.log("❌ HAUPTTEST FEHLGESCHLAGEN!");
        console.log("🔧 'Device erfolgreich authentifiziert' erscheint immer noch vor QR-Scan");
        console.log("🔧 Weitere Fixes benötigt");
    }
    console.log("=".repeat(60));
    
    if (qrReceived && !authenticatedDeviceSuccessReceived) {
        console.log("\n📱 Scanne jetzt den QR-Code um den vollständigen Test abzuschließen");
        return; // Warte auf QR-Scan
    }
    
    setTimeout(() => {
        process.exit(mainTestPassed ? 0 : 1);
    }, 2000);
}

// Timeout für automatischen Test-Abschluss
setTimeout(() => {
    console.log("\n⏰ Test-Timeout erreicht");
    if (!qrReceived) {
        console.log("⚠️ QR-Code nicht empfangen - möglicherweise Connection-Problem");
    }
    showTestResults();
}, 20000);

// Starte Connection Test
try {
    console.log("🚀 Starte Client Connection...");
    await client.connect();
} catch (error) {
    console.error("❌ Connection Error:", error.message);
    showTestResults();
}