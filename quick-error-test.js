import { WhatsAppClient } from "./src/index.js";

console.log("🧪 Quick Error Test\n");

const client = new WhatsAppClient();

// Simuliere verschiedene Fehler-Typen
console.log("1️⃣ QR-Code Fehler:");
client.errorHandler.handleError(
    new Error("QR-Code konnte nicht generiert werden"), 
    { action: 'qr_generation' }
);

console.log("\n2️⃣ Connection Fehler:");
client.errorHandler.handleConnectionError(
    new Error("Verbindung fehlgeschlagen"), 
    1
);

console.log("\n3️⃣ Sharp/Sticker Fehler:");
client.errorHandler.handleError(
    new Error("Sharp module not found"), 
    { action: 'sticker_creation' }
);

console.log("\n✅ FERTIG! Deine Email wird bei JEDEM Fehler angezeigt! 🎉");