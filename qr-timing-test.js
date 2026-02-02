// QR Timing Test - Misst wie schnell QR-Code angezeigt wird
import { WhatsAppClient } from "./src/client.js";

console.log("⏱️ QR TIMING TEST");
console.log("=" .repeat(40));

const startTime = Date.now();
let qrTime = null;

const client = new WhatsAppClient({
    printQR: true,            // Terminal QR für Test
    silent: false,
    qrSpamPrevention: false,  // Kein Anti-Spam
    connectionTimeout: 10000  // 10 Sekunden Timeout für Test
});

client.on('qr', (qr) => {
    qrTime = Date.now() - startTime;
    console.log(`⚡ QR-CODE ANGEZEIGT NACH: ${qrTime}ms`);
    
    if (qrTime < 1000) {
        console.log("🚀 EXCELLENT! QR unter 1 Sekunde!");
    } else if (qrTime < 2000) {
        console.log("✅ GUT! QR unter 2 Sekunden!");
    } else {
        console.log("❌ LANGSAM! QR über 2 Sekunden!");
    }
    
    // Test beenden nach QR-Anzeige
    setTimeout(() => {
        console.log("🏁 Test beendet");
        process.exit(0);
    }, 1000);
});

console.log("🔄 Starte QR-Timing Test...");

try {
    await client.connect();
} catch (error) {
    console.log(`⏱️ QR-Zeit: ${qrTime || 'nicht gemessen'}ms`);
    console.log("✅ Test abgeschlossen (Timeout erwartet)");
    process.exit(0);
}