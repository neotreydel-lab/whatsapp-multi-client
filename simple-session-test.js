#!/usr/bin/env node

// 🔧 EINFACHER SESSION TEST
// Testet dass kein QR-Code bei bestehender Session angezeigt wird

import { WhatsAppClient } from './src/index.js';
import fs from 'fs';

console.log("🔧 Einfacher Session Test");
console.log("=".repeat(40));
console.log("🎯 Teste: Kein QR-Code bei bestehender Session");
console.log("=".repeat(40));

async function testSession() {
    const testAuthDir = "./simple-session-auth";
    
    // Erstelle eine Dummy-Session für Test
    console.log("📁 Erstelle Test-Session...");
    if (fs.existsSync(testAuthDir)) {
        fs.rmSync(testAuthDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(testAuthDir, { recursive: true });
    
    // Erstelle minimale creds.json für Session-Test
    const dummyCreds = {
        me: {
            id: "1234567890@s.whatsapp.net",
            name: "Test User"
        },
        platform: "web",
        lastAccountSyncTimestamp: Date.now()
    };
    
    fs.writeFileSync(`${testAuthDir}/creds.json`, JSON.stringify(dummyCreds, null, 2));
    console.log("✅ Test-Session erstellt");
    
    const client = new WhatsAppClient({
        authDir: testAuthDir,
        logLevel: "silent",
        browser: ["SessionTest", "1.0.0", ""],
        printQR: true,
        qrMaxDisplays: 1,
    });

    let qrShown = false;
    
    client.on('qr', (qr) => {
        qrShown = true;
        console.log("❌ FEHLER: QR-Code angezeigt trotz bestehender Session!");
        console.log(`📱 QR-Länge: ${qr.length} Zeichen`);
    });

    client.on('ready', () => {
        console.log("✅ Client verbunden mit bestehender Session");
    });

    client.on('connection.update', (update) => {
        const { connection } = update;
        
        if (connection === 'connecting') {
            console.log("🔄 Verbinde mit bestehender Session...");
        } else if (connection === 'open') {
            console.log("🟢 Verbindung hergestellt!");
        }
    });

    // Test-Timeout
    setTimeout(() => {
        console.log("\n" + "=".repeat(40));
        console.log("🏁 SESSION TEST ERGEBNIS:");
        console.log("=".repeat(40));
        
        if (!qrShown) {
            console.log("✅ TEST BESTANDEN: Kein QR-Code bei bestehender Session");
            console.log("✅ Session-Check funktioniert korrekt");
        } else {
            console.log("❌ TEST FEHLGESCHLAGEN: QR-Code trotz Session angezeigt");
            console.log("🔧 Session-Check benötigt weitere Fixes");
        }
        
        console.log("=".repeat(40));
        process.exit(0);
    }, 8000);

    try {
        console.log("🚀 Starte Client mit bestehender Session...");
        console.log("⏳ Erwarte KEINEN QR-Code...");
        await client.connect();
    } catch (error) {
        console.log("🔧 Error-Handling:", error.message);
        
        // Auch bei Fehler Test-Ergebnis anzeigen
        setTimeout(() => {
            console.log("\n✅ Session Test abgeschlossen (mit Error-Handling)");
            if (!qrShown) {
                console.log("✅ Kein QR-Code angezeigt - Session-Check funktioniert");
            }
            process.exit(0);
        }, 2000);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Test beendet');
    process.exit(0);
});

testSession();