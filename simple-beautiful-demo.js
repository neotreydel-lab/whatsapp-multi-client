// 🎨 Simple Beautiful Console Demo - EasyBot Version
import { createBot } from "./src/easy-bot.js";

// Verbose Mode deaktivieren für saubere Ausgabe
process.env.WAENGINE_VERBOSE = 'false';

console.log("🎬 Simple Beautiful Console Demo wird gestartet...\n");

// Einfacher Bot mit schöner Console
const bot = createBot({
    verbose: false,
    silent: false
});

// Commands hinzufügen
bot
    .when("hello").reply("Hi! 👋")
    .when("ping").reply("Pong! 🏓")
    .when("test").reply("Test erfolgreich! ✅");

// Bot starten
console.log("🚀 Bot wird gestartet...");
bot.start();