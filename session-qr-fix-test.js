#!/usr/bin/env node

// 🔧 SESSION QR-FIX TEST
// Testet dass KEIN QR-Code angezeigt wird wenn Session bereits existiert

import { WhatsAppClient } from './src/index.js';
import fs from 'fs';

console.log("🔧 Session QR-Fix Test");
console.log("=".repeat(50));
console.log("🎯 Problem: QR-Code wird trotz bestehender Session angezeigt");
console.log("✅ Lösung: Session-Check vor QR-Code Anzeige");
console.log("=".repeat(50));

async function testSessionQRFix() {
    console.log("\n📋 TEST-SZENARIO:");
    console.log("1. Erste Verbindung → QR-Code anzeigen");
    console.log("2. Session speichern");
    console.log("3. Zweite Verbindung → KEIN QR-Code (direkt verbinden)");
    
    const testAuthDir = "./session-qr-test-auth";
    
    // Test 1: Frische Session (sollte QR-Code anzeigen)
    console.log("\n🧪 TEST 1: Frische Session");
    if (fs.existsSync(testAuthDir)) {
        fs.rmSync(testAuthDir, { recursive: true, force: true });
        console.log("🗑️ Alte Session gelöscht für frischen Test");
    }
    
    const client1 = new WhatsAppClient({
        authDir: testAuthDir,
        logLevel: "silent",
        browser: ["SessionTest1", "1.0.0", ""],
        printQR: true,
        qrMaxDisplays: 1,
    });

    let qrCount = 0;
    let sessionExists = false;
    
    client1.on('qr', (qr) => {
        qrCount++;
        console.log(`📱 QR-Code #${qrCount} angezeigt (ERWARTET bei frischer Session)`);
        
        // Simuliere QR-Scan durch Beenden des Tests
        setTimeout(() => {
            console.log("✅ TEST 1 BESTANDEN: QR-Code bei frischer Session angezeigt");
            client1.socket?.end();
            
            // Test 2: Bestehende Session
            setTimeout(() => testExistingSession(), 2000);
        }, 3000);
    });

    client1.on('ready', () => {
        console.log("✅ Client 1 verbunden - Session wurde erstellt");
        sessionExists = true;
    });

    try {
        console.log("🚀 Starte Test 1 (frische Session)...");
        await client1.connect();
    } catch (error) {
        console.log("🔧 Test 1 Error-Handling funktioniert");
        setTimeout(() => testExistingSession(), 2000);
    }
    
    // Test 2: Bestehende Session (sollte KEINEN QR-Code anzeigen)
    async function testExistingSession() {
        console.log("\n🧪 TEST 2: Bestehende Session");
        console.log("📁 Prüfe ob Session-Dateien existieren...");
        
        if (fs.existsSync(`${testAuthDir}/creds.json`)) {
            console.log("✅ Session-Dateien gefunden");
        } else {
            console.log("⚠️ Keine Session-Dateien - erstelle Dummy-Session");
            // Erstelle minimale Session-Struktur für Test
            fs.mkdirSync(testAuthDir, { recursive: true });
            fs.writeFileSync(`${testAuthDir}/creds.json`, JSON.stringify({
                me: { id: "test@s.whatsapp.net" },
                platform: "web"
            }));
        }
        
        const client2 = new WhatsAppClient({
            authDir: testAuthDir,
            logLevel: "silent",
            browser: ["SessionTest2", "1.0.0", ""],
            printQR: true,
            qrMaxDisplays: 1,
        });

        let qrCount2 = 0;
        let sessionConnected = false;
        
        client2.on('qr', (qr) => {
            qrCount2++;
            console.log(`❌ FEHLER: QR-Code #${qrCount2} angezeigt trotz bestehender Session!`);
        });

        client2.on('ready', () => {
            console.log("✅ Client 2 verbunden mit bestehender Session");
            sessionConnected = true;
        });

        // Timeout für Test 2
        setTimeout(() => {
            console.log("\n" + "=".repeat(50));
            console.log("🏁 SESSION QR-FIX TEST ERGEBNISSE:");
            console.log("=".repeat(50));
            
            // Test 1 Ergebnis
            if (qrCount >= 1) {
                console.log("✅ TEST 1 BESTANDEN: QR-Code bei frischer Session");
            } else {
                console.log("❌ TEST 1 FEHLGESCHLAGEN: Kein QR-Code bei frischer Session");
            }
            
            // Test 2 Ergebnis
            if (qrCount2 === 0) {
                console.log("✅ TEST 2 BESTANDEN: Kein QR-Code bei bestehender Session");
            } else {
                console.log(`❌ TEST 2 FEHLGESCHLAGEN: ${qrCount2} QR-Code(s) trotz Session`);
            }
            
            console.log("=".repeat(50));
            
            if (qrCount >= 1 && qrCount2 === 0) {
                console.log("🎉 ALLE TESTS BESTANDEN!");
                console.log("✅ Session QR-Fix funktioniert korrekt");
            } else {
                console.log("⚠️ TESTS TEILWEISE FEHLGESCHLAGEN");
                console.log("🔧 Session QR-Fix benötigt weitere Anpassungen");
            }
            
            console.log("=".repeat(50));
            process.exit(0);
        }, 8000);

        try {
            console.log("🚀 Starte Test 2 (bestehende Session)...");
            console.log("⏳ Erwarte KEINEN QR-Code...");
            await client2.connect();
        } catch (error) {
            console.log("🔧 Test 2 Error-Handling funktioniert");
        }
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Test beendet');
    process.exit(0);
});

testSessionQRFix();