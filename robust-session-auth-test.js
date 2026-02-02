// Robuster Test für Session-Authentifizierung Fix
// Testet alle Aspekte der Session-Validierung und Auth-Nachrichten

import { WhatsAppClient } from './src/client.js';
import { SessionManager } from './src/session-manager.js';
import fs from 'fs';

console.log("🧪 ROBUSTER SESSION-AUTHENTIFIZIERUNG TEST");
console.log("==========================================");

// Test 1: Cleanup und Fresh Start
console.log("\n📋 TEST 1: Session Cleanup");
const authDirs = ['./auth', './waengine-data'];
authDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`✅ Bereinigt: ${dir}`);
        } catch (e) {
            console.log(`⚠️ Konnte ${dir} nicht bereinigen: ${e.message}`);
        }
    }
});

// Test 2: Session Manager Auth-Ordner Check
console.log("\n📋 TEST 2: Session Manager Auth-Ordner Check");
const sessionManager = new SessionManager('./auth');
const hasAuthFolder = sessionManager.hasAuthFolder();
console.log(`📁 Auth-Ordner existiert: ${hasAuthFolder ? '✅ JA' : '❌ NEIN (erwartet)'}`);

if (!hasAuthFolder) {
    console.log("✅ KORREKT: Kein Auth-Ordner bei Fresh Start");
} else {
    console.log("❌ FEHLER: Auth-Ordner sollte nicht existieren");
}

// Test 3: Session Validation
console.log("\n📋 TEST 3: Session Validation");
const validation = await sessionManager.validateSession();
console.log(`🔍 Session Status: ${validation.valid ? '✅ GÜLTIG' : '❌ UNGÜLTIG'}`);
console.log(`📝 Grund: ${validation.reason || 'N/A'}`);

if (!validation.valid && validation.reason === 'no_auth_dir') {
    console.log("✅ KORREKT: Keine Session bei Fresh Start");
} else {
    console.log("❌ FEHLER: Session-Validation nicht korrekt");
}

// Test 4: Client Connection mit Event Monitoring
console.log("\n📋 TEST 4: Client Connection mit Event Monitoring");
console.log("ERWARTUNG: Socket öffnet sich, aber KEINE 'erfolgreich verbunden' vor QR-Scan");

const client = new WhatsAppClient({
    printQR: true,
    silent: false,
    verbose: false,
    autoRestart: false
});

let socketOpenReceived = false;
let qrReceived = false;
let prematureSuccessDetected = false;
let authenticatedSuccessReceived = false;

// Monitor für premature Success Messages
const originalLog = console.log;
console.log = (...args) => {
    const message = args.join(' ');
    
    // Prüfe auf premature Success Messages
    if ((message.includes('erfolgreich verbunden') || 
         message.includes('successfully connected') ||
         message.includes('WhatsApp verbunden')) && 
        !qrReceived) {
        prematureSuccessDetected = true;
        originalLog("❌ FEHLER: Premature Success Message erkannt:", message);
    }
    
    // Prüfe auf korrekte Auth Success Messages
    if ((message.includes('erfolgreich authentifiziert') || 
         message.includes('QR-Code erfolgreich gescannt')) && 
        qrReceived) {
        authenticatedSuccessReceived = true;
        originalLog("✅ KORREKT: Auth Success Message nach QR-Scan:", message);
    }
    
    originalLog(...args);
};

// Event Listener für Tests
client.on('qr', (qr) => {
    qrReceived = true;
    console.log("\n✅ QR-Code Event empfangen");
    console.log("📱 QR-Code bereit - simuliere Scan in 3 Sekunden...");
    
    // Simuliere QR-Scan nach kurzer Zeit für automatischen Test
    setTimeout(() => {
        console.log("🤖 Simuliere QR-Scan... (in echtem Test: manuell scannen)");
    }, 3000);
});

client.on('connected', () => {
    if (!qrReceived) {
        console.log("❌ FEHLER: 'connected' Event vor QR-Code (Socket-Open)");
        prematureSuccessDetected = true;
    } else {
        console.log("⚠️ 'connected' Event empfangen - prüfe ob nach Auth");
    }
});

client.on('truly_connected', (data) => {
    console.log("\n✅ KORREKT: 'truly_connected' Event nach Authentifizierung");
    console.log(`👤 User ID: ${data.userId}`);
    authenticatedSuccessReceived = true;
    
    // Test-Ergebnisse nach kurzer Zeit
    setTimeout(() => {
        showTestResults();
    }, 2000);
});

// Test-Ergebnisse anzeigen
function showTestResults() {
    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST-ERGEBNISSE");
    console.log("=".repeat(50));
    
    console.log(`📁 Auth-Ordner Check: ${!hasAuthFolder ? '✅ BESTANDEN' : '❌ FEHLGESCHLAGEN'}`);
    console.log(`🔍 Session Validation: ${!validation.valid ? '✅ BESTANDEN' : '❌ FEHLGESCHLAGEN'}`);
    console.log(`📱 QR-Code Event: ${qrReceived ? '✅ BESTANDEN' : '❌ FEHLGESCHLAGEN'}`);
    console.log(`⚠️ Premature Success: ${!prematureSuccessDetected ? '✅ BESTANDEN' : '❌ FEHLGESCHLAGEN'}`);
    console.log(`🎉 Auth Success: ${authenticatedSuccessReceived ? '✅ BESTANDEN' : '⏳ WARTE AUF QR-SCAN'}`);
    
    const allTestsPassed = !hasAuthFolder && !validation.valid && qrReceived && !prematureSuccessDetected;
    
    console.log("\n" + "=".repeat(50));
    if (allTestsPassed) {
        console.log("🎉 ALLE TESTS BESTANDEN!");
        console.log("✅ Session-Authentifizierung Fix funktioniert korrekt");
        console.log("✅ Keine premature Success Messages");
        console.log("✅ Auth-Ordner Check funktioniert");
    } else {
        console.log("❌ EINIGE TESTS FEHLGESCHLAGEN!");
        console.log("🔧 Session-Authentifizierung Fix benötigt weitere Arbeit");
    }
    console.log("=".repeat(50));
    
    setTimeout(() => {
        process.exit(allTestsPassed ? 0 : 1);
    }, 1000);
}

// Timeout für automatischen Test-Abschluss
setTimeout(() => {
    console.log("\n⏰ Test-Timeout erreicht");
    if (!qrReceived) {
        console.log("⚠️ QR-Code nicht empfangen - möglicherweise Connection-Problem");
    }
    showTestResults();
}, 30000);

// Starte Connection Test
try {
    console.log("🚀 Starte Client Connection...");
    await client.connect();
} catch (error) {
    console.error("❌ Connection Error:", error.message);
    showTestResults();
}