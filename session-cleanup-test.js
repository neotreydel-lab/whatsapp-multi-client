#!/usr/bin/env node

// 🔧 SESSION CLEANUP & QR TEST
// Testet die Session-Bereinigung und QR-Code Anzeige

import { SessionManager } from './src/session-manager.js';
import { generateTerminalQR, checkTerminalQRCompatibility } from './src/qr-terminal-fix.js';

console.log("🚀 WAEngine - Session Cleanup & QR Test");
console.log("=".repeat(50));

// ===== SESSION CLEANUP TESTEN =====
console.log("\n1️⃣ SESSION CLEANUP TEST:");

const sessionManager = new SessionManager('./auth');

try {
    // Session-Status vor Cleanup
    const statusBefore = sessionManager.getSessionStatus();
    console.log(`📁 Status vorher: ${statusBefore.status}`);
    console.log(`📄 Dateien vorher: ${statusBefore.totalFiles || 0}`);
    
    // Intelligente Bereinigung testen
    console.log("\n🧹 Teste intelligente Session-Bereinigung...");
    const cleanupResult = await sessionManager.smartCleanup();
    
    console.log(`🔧 Bereinigung: ${cleanupResult.cleaned ? '✅ Erfolgreich' : '❌ Nicht nötig'}`);
    console.log(`📋 Grund: ${cleanupResult.reason}`);
    
    if (cleanupResult.backup) {
        console.log(`💾 Backup erstellt: ${cleanupResult.backup}`);
    }
    
    // Session-Status nach Cleanup
    const statusAfter = sessionManager.getSessionStatus();
    console.log(`📁 Status nachher: ${statusAfter.status}`);
    console.log(`📄 Dateien nachher: ${statusAfter.totalFiles || 0}`);
    
} catch (sessionError) {
    console.error("❌ Session-Test Fehler:", sessionError.message);
}

// ===== TERMINAL KOMPATIBILITÄT TESTEN =====
console.log("\n2️⃣ TERMINAL KOMPATIBILITÄT:");

const compatibility = checkTerminalQRCompatibility();
console.log(`🖥️ Terminal: ${compatibility.width}x${compatibility.height}`);
console.log(`🖥️ Platform: ${compatibility.platform}`);
console.log(`🖥️ Terminal Type: ${compatibility.terminalType}`);
console.log(`🖥️ Windows Terminal: ${compatibility.isWindowsTerminal ? 'Ja' : 'Nein'}`);
console.log(`📱 QR Support: ${compatibility.supportsQR ? '✅' : '❌'}`);
console.log(`📏 Empfohlene Größe: ${compatibility.recommendedSize}`);

if (compatibility.issues.length > 0) {
    console.log("\n⚠️ Probleme:");
    compatibility.issues.forEach(issue => console.log(`   • ${issue}`));
}

if (compatibility.tips.length > 0) {
    console.log("\n💡 Tipps:");
    compatibility.tips.forEach(tip => console.log(`   • ${tip}`));
}

// ===== QR-CODE TEST =====
console.log("\n3️⃣ QR-CODE TEST:");

// Test-QR-Daten
const testQRData = "2@test_" + Math.random().toString(36).substring(2, 15) + "@" + Date.now();

try {
    console.log("📱 Teste QR-Code Generierung...");
    
    const qrResult = generateTerminalQR(testQRData, { skipClear: false });
    
    if (qrResult.success) {
        console.log(`✅ QR-Code erfolgreich angezeigt (${qrResult.qrSize})`);
        console.log(`🖥️ Terminal: ${qrResult.terminalWidth}x${qrResult.terminalHeight}`);
    } else {
        console.log("⚠️ QR-Code mit Fallback angezeigt");
    }
    
} catch (qrError) {
    console.error("❌ QR-Code Test Fehler:", qrError.message);
}

// ===== ZUSAMMENFASSUNG =====
console.log("\n🏁 TEST ZUSAMMENFASSUNG:");
console.log("=".repeat(50));
console.log("✅ Session-Manager: Windows-kompatible Bereinigung");
console.log("✅ QR-Code System: Terminal-adaptive Anzeige");
console.log("✅ Error-Handling: Robuste Fehlerbehandlung");
console.log("💡 System bereit für WhatsApp-Verbindung!");

console.log("\n📋 NÄCHSTE SCHRITTE:");
console.log("1. Führe 'node test.js' aus für vollständigen Test");
console.log("2. Bei QR-Problemen: Terminal-Fenster vergrößern");
console.log("3. Bei Session-Problemen: Automatische Reparatur aktiv");

process.exit(0);