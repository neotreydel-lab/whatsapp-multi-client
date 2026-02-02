import { createBot } from "./src/index.js";

console.log("🚀 EasyBot Mention Test startet...");

// EasyBot mit erweiterten Mention-Features
createBot()
    .when("hello")
        .slowTypeWithMention("Hallo @user! Schön dich zu sehen! 👋")
        .done()
        
    .when("quick")
        .quickTypeWithMention("Hey @user! 🚀")
        .done()
        
    .when("normal")
        .normalTypeWithMention("Hi @user, wie geht's? 😊")
        .done()
        
    .when("demo")
        .react("🎬")
        .type(1)
        .reply("Mention Demo startet...")
        .wait(1000)
        .slowTypeWithMention("Das ist @user - unser Testuser!")
        .wait(500)
        .quickTypeWithMention("Schnelle Mention für @user! ⚡")
        .wait(500)
        .normalTypeWithMention("Normale Mention für @user 😊")
        .react("✅")
        .done()
        
    .command("mention", "Teste die Mention-Features mit: hello, quick, normal, demo")
    
    .start()
    .then(() => {
        console.log("✅ EasyBot Mention Test läuft!");
        console.log("💬 Teste: 'hello', 'quick', 'normal', 'demo', '!mention'");
    })
    .catch(error => {
        console.error("❌ Fehler:", error);
    });