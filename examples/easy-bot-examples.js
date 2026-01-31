import { EasyBot, createBot, quickBot, multiBot } from "../src/index.js";

// ===== BEISPIEL 1: SUPER EINFACH =====

async function superEinfach() {
    console.log("🚀 Super einfacher Bot");
    
    const bot = quickBot()
        .when("hallo").reply("Hi! 👋")
        .when("ping").reply("Pong! 🏓")
        .command("zeit", () => new Date().toLocaleString())
        .start();
}

// ===== BEISPIEL 2: MIT CHAINING =====

async function mitChaining() {
    console.log("🔗 Bot mit Action Chaining");
    
    const bot = createBot()
        .when("wichtig").react("⚠️").type(2).reply("Das ist wichtig!")
        .when("lustig").react("😂").reply("Haha, das ist witzig!")
        .start();
}

// ===== BEISPIEL 3: MULTI-DEVICE =====

async function multiDevice() {
    console.log("🔧 Multi-Device Bot");
    
    const bot = multiBot(2)
        .when("test").reply("Multi-Device Test!")
        .command("status", "📊 Multi-Device läuft!")
        .start();
}

// ===== BEISPIEL 4: ERWEITERTE TEMPLATES =====

async function erweiterteTempates() {
    console.log("📝 Bot mit erweiterten Templates");
    
    const bot = createBot()
        .template("begrüßung", "Hallo {name}! Heute ist {day}, {time}")
        .template("info", "Chat: {chat} | Sender: {sender} | Datum: {date}")
        .when("info").useTemplate("info")
        .when("hallo").useTemplate("begrüßung")
        .start();
}

// ===== BEISPIEL 5: ACTION CHAINING =====

async function actionChaining() {
    console.log("🔗 Perfektes Action Chaining");
    
    const bot = createBot()
        .when("wichtig")
            .react("⚠️")
            .type(2)
            .reply("Das ist eine wichtige Nachricht!")
            .react("✅")
            .done() // Zurück zum Bot
        .when("party")
            .react("🎉")
            .type(1)
            .reply("Party Zeit!")
            .react("🥳")
            .done()
        .start();
}

// ===== BEISPIEL 6: CONDITIONAL LOGIC =====

async function conditionalLogic() {
    console.log("🤔 Bot mit Conditional Logic");
    
    const bot = createBot()
        .if("contains hallo").then("reply Hallo zurück!")
        .if("starts with !").then("reply Das ist ein Command!")
        .if("is group").then("reply Hallo Gruppe!")
        .if("is private").then("reply Hallo im Privat-Chat!")
        .if("has media").then("react 📷")
        .start();
}

// ===== BEISPIEL 7: VOLLSTÄNDIGER BOT =====

async function vollständigerBot() {
    console.log("🤖 Vollständiger EasyBot");
    
    const bot = createBot()
        // Templates
        .template("willkommen", "Willkommen {name}! Heute ist {day}")
        .template("status", "Bot läuft seit {time} | Chat: {chat}")
        
        // Auto Responses
        .autoReply("hallo", "Hi! 👋")
        .autoReply("tschüss", "Bye! 👋")
        
        // Rules mit Chaining
        .when("wichtig")
            .react("⚠️")
            .type(2)
            .reply("Wichtige Nachricht erkannt!")
            .done()
            
        .when("willkommen")
            .useTemplate("willkommen")
            .react("🎉")
            .done()
        
        // Commands
        .command("hilfe", "🤖 Verfügbare Commands:\n!hilfe, !ping, !status, !zeit")
        .command("ping", "Pong! 🏓")
        .command("status", () => {
            const status = bot.status();
            return `📊 Bot Status: ${status.running ? 'Läuft' : 'Gestoppt'}`;
        })
        
        // Conditional Logic
        .if("is group").then("react 👥")
        .if("contains bot").then("reply Ja, ich bin ein Bot! 🤖")
        
        // Settings
        .enableTyping(true)
        .enableReactions(true)
        .addQuickCommands()
        
        .start();
}

// ===== BEISPIEL 8: MULTI-DEVICE ADVANCED =====

async function multiDeviceAdvanced() {
    console.log("🔧 Advanced Multi-Device Bot");
    
    const bot = multiBot(3)
        .when("test")
            .react("🧪")
            .type(1)
            .reply("Multi-Device Test erfolgreich!")
            .done()
            
        .command("devices", () => {
            const status = bot.status();
            return `🔧 ${status.activeDevices}/${status.totalDevices} Devices aktiv`;
        })
        
        .template("multi", "Nachricht von Device via Load Balancing! Zeit: {time}")
        .when("multi").useTemplate("multi")
        
        .start();
}

// Beispiele ausführen
if (import.meta.url === `file://${process.argv[1]}`) {
    const example = process.argv[2] || 'vollständig';
    
    switch (example) {
        case 'einfach':
            superEinfach();
            break;
        case 'chaining':
            mitChaining();
            break;
        case 'multi':
            multiDevice();
            break;
        case 'templates':
            erweiterteTempates();
            break;
        case 'actions':
            actionChaining();
            break;
        case 'conditional':
            conditionalLogic();
            break;
        case 'vollständig':
            vollständigerBot();
            break;
        case 'multi-advanced':
            multiDeviceAdvanced();
            break;
        default:
            console.log("Verfügbare Beispiele: einfach, chaining, multi, templates, actions, conditional, vollständig, multi-advanced");
    }
}