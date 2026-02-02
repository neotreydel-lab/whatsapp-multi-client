// 🔧 ROBUSTE QR-CODE TERMINAL LÖSUNG - VERBESSERT!
// Behebt abgeschnittene QR-Codes und Terminal-Probleme

import qrcode from "qrcode-terminal";
import os from "os";

// QR-Code mit automatischer Terminal-Anpassung - VERBESSERT!
export function generateTerminalQR(qrData, options = {}) {
    try {
        // Terminal-Informationen sammeln
        const terminalWidth = process.stdout.columns || 80;
        const terminalHeight = process.stdout.rows || 24;
        const platform = os.platform();
        
        // Terminal leeren für saubere Anzeige (falls gewünscht)
        if (!options.skipClear) {
            console.clear();
        }
        
        // Dynamische QR-Größe basierend auf Terminal - EXTRA KLEIN!
        let qrOptions = { small: true }; // IMMER klein wegen "zu groß" Problem
        let borderSize = 40;
        let qrSize = "extra klein";
        
        // Auch bei großen Terminals klein halten
        if (terminalWidth >= 120 && terminalHeight >= 35) {
            // Großes Terminal - trotzdem kleine QR-Größe
            qrOptions = { small: true }; // War: { small: false }
            borderSize = 50;
            qrSize = "klein (angepasst)";
        } else if (terminalWidth >= 80 && terminalHeight >= 25) {
            // Mittleres Terminal - kleine QR-Größe
            qrOptions = { small: true };
            borderSize = 45;
            qrSize = "klein";
        } else {
            // Kleines Terminal - extra kleine QR-Größe
            qrOptions = { small: true };
            borderSize = Math.min(terminalWidth - 4, 35);
            qrSize = "extra klein";
            
            if (terminalWidth < 50) {
                console.log("⚠️ WARNUNG: Terminal ist sehr schmal!");
                console.log("💡 QR-Code wird extra klein angezeigt");
                console.log("");
            }
        }
        
        // Header mit dynamischer Breite
        const border = "=".repeat(Math.min(borderSize, terminalWidth - 2));
        console.log("\n" + border);
        console.log("📱 WAEngine QR-Code - Einmal scannen und fertig!");
        console.log(border);
        console.log(`🖥️ Terminal: ${terminalWidth}x${terminalHeight} (${platform})`);
        console.log(`📏 QR-Größe: ${qrSize}`);
        console.log("");
        
        // QR-Code generieren mit Fehlerbehandlung
        try {
            qrcode.generate(qrData, qrOptions);
            console.log("");
            console.log("✅ QR-Code erfolgreich angezeigt");
        } catch (qrError) {
            console.error("❌ QR-Code Generierung fehlgeschlagen:", qrError.message);
            
            // Fallback: QR-Daten als Text
            console.log("📋 QR-Daten (für externe QR-Apps):");
            console.log(qrData);
            console.log("💡 Kopiere die Daten in eine QR-Generator App oder Website");
            
            return { success: false, fallback: true };
        }
        
        console.log(border);
        console.log("📲 WhatsApp Anleitung:");
        console.log("   1. Öffne WhatsApp auf deinem Handy");
        console.log("   2. Gehe zu Einstellungen (⚙️)");
        console.log("   3. Tippe auf 'Verknüpfte Geräte'");
        console.log("   4. Tippe auf 'Gerät verknüpfen'");
        console.log("   5. Scanne den QR-Code OBEN");
        console.log(border);
        console.log("⏳ Warte auf QR-Scan...");
        
        // Terminal-spezifische Tipps - VERBESSERT!
        if (terminalWidth < 60) {
            console.log("");
            console.log("💡 TERMINAL-TIPPS:");
            console.log("   • Vergrößere das Terminal-Fenster");
            console.log("   • Verwende Vollbild-Modus");
            console.log("   • Reduziere die Schriftgröße");
            console.log("   • Nutze Browser QR als Alternative");
        }
        
        return { 
            success: true, 
            qrSize: qrSize,
            terminalSize: `${terminalWidth}x${terminalHeight}`,
            platform: platform
        };
        
    } catch (error) {
        console.error("❌ Terminal QR-Code Fehler:", error.message);
        
        // Fallback: Minimale QR-Anzeige
        try {
            console.log("🔄 Versuche Fallback QR-Code...");
            qrcode.generate(qrData, { small: true });
            console.log("✅ Fallback QR-Code angezeigt");
            return { success: true, fallback: true };
        } catch (fallbackError) {
            console.log("❌ Auch Fallback fehlgeschlagen");
            console.log("📋 QR-Daten:", qrData);
            return { success: false, error: error.message };
        }
    }
}

// QR-Code mit Retry-Mechanismus - VERBESSERT!
export async function generateQRWithRetry(qrData, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 QR-Code Versuch ${attempt}/${maxRetries}...`);
            
            const result = generateTerminalQR(qrData, { 
                skipClear: attempt > 1 // Nur beim ersten Mal Terminal leeren
            });
            
            if (result.success) {
                console.log(`✅ QR-Code erfolgreich beim ${attempt}. Versuch`);
                return result;
            }
            
            if (attempt < maxRetries) {
                console.log(`⚠️ Versuch ${attempt} fehlgeschlagen, versuche erneut...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
        } catch (error) {
            console.error(`❌ QR-Code Versuch ${attempt} Fehler:`, error.message);
            
            if (attempt === maxRetries) {
                throw new Error(`QR-Code nach ${maxRetries} Versuchen fehlgeschlagen: ${error.message}`);
            }
        }
    }
    
    throw new Error(`QR-Code nach ${maxRetries} Versuchen fehlgeschlagen`);
}

// Terminal-Kompatibilität prüfen - VERBESSERT!
export function checkTerminalQRCompatibility() {
    const terminalWidth = process.stdout.columns || 80;
    const terminalHeight = process.stdout.rows || 24;
    const platform = os.platform();
    const nodeVersion = process.version;
    
    const compatibility = {
        platform: platform,
        terminalSize: `${terminalWidth}x${terminalHeight}`,
        nodeVersion: nodeVersion,
        issues: [],
        recommendations: [],
        score: 100
    };
    
    // Terminal-Größe prüfen
    if (terminalWidth < 50) {
        compatibility.issues.push("Terminal zu schmal für QR-Code");
        compatibility.recommendations.push("Vergrößere das Terminal-Fenster");
        compatibility.score -= 30;
    } else if (terminalWidth < 80) {
        compatibility.issues.push("Terminal schmal - QR könnte abgeschnitten sein");
        compatibility.recommendations.push("Vergrößere das Terminal für bessere Anzeige");
        compatibility.score -= 15;
    }
    
    if (terminalHeight < 20) {
        compatibility.issues.push("Terminal zu niedrig für QR-Code");
        compatibility.recommendations.push("Vergrößere das Terminal vertikal");
        compatibility.score -= 20;
    }
    
    // Plattform-spezifische Checks
    switch (platform) {
        case 'win32':
            if (process.env.TERM_PROGRAM !== 'vscode') {
                compatibility.recommendations.push("Verwende Windows Terminal oder VS Code Terminal");
            }
            break;
            
        case 'darwin':
            compatibility.recommendations.push("iTerm2 oder Terminal.app funktionieren optimal");
            break;
            
        case 'linux':
            compatibility.recommendations.push("Gnome Terminal oder Konsole empfohlen");
            break;
    }
    
    // Node.js Version prüfen
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    if (majorVersion < 16) {
        compatibility.issues.push("Node.js Version könnte zu alt sein");
        compatibility.recommendations.push("Aktualisiere auf Node.js 16+");
        compatibility.score -= 10;
    }
    
    return compatibility;
}

// Debug-Informationen für QR-System - VERBESSERT!
export function debugQRSystem() {
    const compatibility = checkTerminalQRCompatibility();
    
    console.log("🔍 QR-SYSTEM DEBUG INFO:");
    console.log("=".repeat(40));
    console.log(`🖥️ Plattform: ${compatibility.platform}`);
    console.log(`📏 Terminal: ${compatibility.terminalSize}`);
    console.log(`📦 Node.js: ${compatibility.nodeVersion}`);
    console.log(`⭐ Score: ${compatibility.score}/100`);
    
    if (compatibility.issues.length > 0) {
        console.log("\n⚠️ GEFUNDENE PROBLEME:");
        compatibility.issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
    }
    
    if (compatibility.recommendations.length > 0) {
        console.log("\n💡 EMPFEHLUNGEN:");
        compatibility.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
    }
    
    console.log("=".repeat(40));
    
    return compatibility;
}