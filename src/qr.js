import { chromium } from "playwright";
import qrcode from "qrcode-terminal";

let browser = null;
let page = null;

export async function generateQRCode(qrData = null) {
    try {
        // Browser öffnen falls noch nicht offen
        if (!browser) {
            console.log("🌐 Öffne Microsoft Edge...");
            browser = await chromium.launch({
                channel: "msedge",
                headless: false
            });
        }

        // Neue Seite öffnen falls noch nicht vorhanden
        if (!page) {
            page = await browser.newPage();
            await page.goto("https://web.whatsapp.com");
            console.log("🌐 Microsoft Edge mit WhatsApp Web geöffnet");
        }

        // QR-Code anzeigen falls vorhanden
        if (qrData) {
            console.log("\n📱 QR-CODE GENERIERT!");
            console.log("👆 Scanne den QR-Code im Edge Browser ODER hier im Terminal:");
            console.log("─".repeat(50));
            
            // QR-Code im Terminal anzeigen
            qrcode.generate(qrData, { small: true });
            
            console.log("─".repeat(50));
            console.log("📲 Öffne WhatsApp auf deinem Handy:");
            console.log("   1. Gehe zu Einstellungen");
            console.log("   2. Tippe auf 'Verknüpfte Geräte'");
            console.log("   3. Tippe auf 'Gerät verknüpfen'");
            console.log("   4. Scanne den QR-Code");
            console.log("⏳ Warte auf QR-Scan...");
        }

        return { browser, page };
        
    } catch (error) {
        console.error("❌ Fehler beim Öffnen von Edge:", error);
        
        // Fallback: QR nur im Terminal
        if (qrData) {
            console.log("📱 Fallback - QR-Code im Terminal:");
            qrcode.generate(qrData, { small: true });
        }
        
        throw error;
    }
}

export async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
        page = null;
        console.log("🔴 Browser geschlossen");
    }
}
