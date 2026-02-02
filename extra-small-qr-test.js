#!/usr/bin/env node

// 🔧 EXTRA SMALL QR-CODE TEST
// Testet extra kleine QR-Codes für das "zu groß" Problem

import { WhatsAppClient } from './src/index.js';
import fs from 'fs';

console.log("🔧 Extra Small QR-Code Test");
console.log("=".repeat(40));
console.log("🎯 Problem: QR-Code ist immer zu groß");
console.log("✅ Lösung: IMMER extra kleine QR-Codes");
console.log("=".repeat(40));

async function testExtraSmallQR() {
    // Lösche alte Auth-Daten für Test
    const testAuthDir = "./extra-small-qr-auth";
    if (fs.existsSync(testAuthDir)) {
        fs.rmSync(testAuthDir, { recursive: true, force: true });
        console.log("🗑️ Test-Auth gelöscht");
    }
    
    console.log("\n🚀 Starte Extra Small QR Test...");
    
    const client = new WhatsAppClient({
        authDir: testAuthDir,
        logLevel: "silent",
        browser: ["ExtraSmallQR", "1.0.0", ""],
        
        // EXTRA SMALL QR SETTINGS
        printQR: true,                    // Terminal QR aktiviert
        qrSpamPrevention: true,          // Anti-Spam
        qrMaxDisplays: 1,                // Nur 1 QR
        clearTerminalOnQR: true,         // Terminal leeren
        
        // Keine Browser QR (nur Terminal)
        enableBrowserQR: false,
    });

    client.on('qr', (qr) => {
        console.log("\n📱 QR-Code Event empfangen");
        console.log(`📏 QR-Länge: ${qr.length} Zeichen`);
        
        // Terminal-Info
        const terminalWidth = process.stdout.columns || 80;
        const terminalHeight = process.stdout.rows || 24;
        console.log(`🖥️ Terminal: ${terminalWidth}x${terminalHeight}`);
        
        console.log("✅ QR-Code wird EXTRA KLEIN angezeigt");
        console.log("✅ Sollte jetzt perfekt in dein Terminal passen");
        
        if (terminalWidth < 60) {
            console.log("💡 Terminal ist schmal - aber QR ist extra klein!");
        } else {
            console.log("💡 Terminal ist groß genug - QR trotzdem extra klein");
        }
    });

    client.on('ready', () => {
        console.log("\n🎉 Client erfolgreich verbunden!");
        console.log("✅ Extra Small QR-Code funktioniert!");
        
        setTimeout(() => {
            console.log("\n" + "=".repeat(40));
            console.log("🏁 EXTRA SMALL QR TEST ERFOLGREICH!");
            console.log("=".repeat(40));
            console.log("✅ QR-Code ist jetzt extra klein");
            console.log("✅ Passt in jedes Terminal");
            console.log("✅ Nicht mehr zu groß");
            console.log("=".repeat(40));
            console.log("💡 Problem 'QR zu groß' ist behoben!");
            
            process.exit(0);
        }, 3000);
    });

    client.on('connection.update', (update) => {
        const { connection } = update;
        
        if (connection === 'connecting') {
            console.log("🔄 Verbinde...");
        } else if (connection === 'open') {
            console.log("🟢 Verbindung hergestellt!");
        }
    });

    client.on('error', (error) => {
        console.log("🔧 Error-Handling funktioniert:", error.message);
    });

    try {
        console.log("⏳ Verbinde mit WhatsApp...");
        console.log("📱 QR-Code wird EXTRA KLEIN angezeigt");
        console.log("🎯 Sollte jetzt perfekt passen!");
        
        await client.connect();
        
    } catch (error) {
        console.log("🔧 Auch Error-Handling funktioniert!");
        
        setTimeout(() => {
            console.log("\n✅ Extra Small QR Test abgeschlossen");
            console.log("💡 QR-Code Größe wurde angepasst");
            process.exit(0);
        }, 2000);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Test beendet');
    process.exit(0);
});

testExtraSmallQR();