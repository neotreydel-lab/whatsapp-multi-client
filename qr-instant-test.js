// QR-Code Instant Display Test - Keine Verzögerungen!
import { WhatsAppClient } from "./src/client.js";

console.log("🚀 QR-Code Instant Test - Zeigt QR sofort an!");
console.log("=" .repeat(60));

const client = new WhatsAppClient({
    // QR-Code Einstellungen für sofortige Anzeige
    printQR: false,           // Browser QR verwenden
    silent: false,            // Console-Ausgaben aktiviert
    verbose: true,            // Detaillierte Logs
    
    // Anti-Spam deaktiviert für Test
    qrSpamPrevention: false,  // Kein Anti-Spam
    qrDisplayInterval: 0,     // Sofort anzeigen
    qrMaxDisplays: 999,       // Unbegrenzt
    clearTerminalOnQR: true,  // Terminal leeren
    
    // Robuste Connection Settings
    maxReconnectAttempts: 10,
    reconnectInterval: 2000,
    connectionTimeout: 60000,
    
    // Auto-Restart aktiviert
    autoRestart: true,
    restartDelay: 3000,
    autoCleanup: true
});

// Event Listeners für Debugging
client.on('qr', (qr) => {
    console.log("✅ QR-Event empfangen!");
    console.log("📱 QR-Code sollte jetzt im Browser UND Terminal sichtbar sein!");
});

client.on('connected', () => {
    console.log("🎉 Bot erfolgreich verbunden!");
    console.log("📱 QR-Code wurde erfolgreich gescannt!");
});

client.on('disconnected', (reason) => {
    console.log("🔌 Bot getrennt:", reason);
});

// Verbindung starten
console.log("🔄 Starte Verbindung...");
console.log("⏱️ QR-Code sollte SOFORT erscheinen (keine 2+ Sekunden Wartezeit)!");

try {
    await client.connect();
    
    // Test Message Handler
    client.on('message', (message) => {
        console.log(`📨 Nachricht: "${message.text}" von ${message.getSender()}`);
        
        // Test Command
        if (message.text === '!test') {
            message.reply('✅ QR-Fix funktioniert! Bot ist bereit!');
        }
    });
    
    console.log("🎯 Bot läuft! Sende '!test' um zu testen.");
    
} catch (error) {
    console.error("❌ Verbindungsfehler:", error.message);
    console.log("🔄 Versuche es erneut...");
}