// Poll Visibility Test - Testet warum Polls nicht im Chat ankommen
import { WhatsAppClient } from "./src/client.js";

console.log("👁️ POLL VISIBILITY TEST - Warum kommen Polls nicht an?");
console.log("=" .repeat(60));

const client = new WhatsAppClient({
    printQR: true,
    silent: false,
    verbose: true,
    connectionTimeout: 30000,
    autoRestart: false
});

client.on('connected', () => {
    console.log("🎉 Bot verbunden!");
    console.log("👁️ Teste verschiedene Poll-Ansätze...");
    console.log("\n🎯 Test-Commands:");
    console.log("   - !testpoll1 → Basic Poll (ohne selectableCount)");
    console.log("   - !testpoll2 → Poll mit messageSecret");
    console.log("   - !testpoll3 → Button-Fallback");
    console.log("   - !testpoll4 → Emoji-Fallback");
    console.log("   - !compare → Vergleiche mit normaler Nachricht");
});

client.on('message', async (message) => {
    console.log(`📨 Nachricht: "${message.text}" von ${message.getSender()}`);
    
    try {
        // Test 1: Basic Poll ohne selectableCount
        if (message.text === '!testpoll1') {
            console.log("🧪 Test 1: Basic Poll ohne selectableCount");
            await message.reply("🧪 Teste Basic Poll...");
            
            try {
                const basicPoll = {
                    poll: {
                        name: "Basic Poll Test - Siehst du diese Umfrage?",
                        values: ["✅ Ja, ich sehe sie", "❌ Nein, nicht sichtbar"]
                    }
                };
                
                const result = await client.socket.sendMessage(message.from, basicPoll);
                console.log("📊 Basic Poll gesendet:", result?.key?.id);
                
                await message.reply(`✅ Basic Poll gesendet (ID: ${result?.key?.id})\n⏳ Ist die Umfrage sichtbar?`);
                
            } catch (error) {
                console.error("❌ Basic Poll Fehler:", error);
                await message.reply(`❌ Basic Poll fehlgeschlagen: ${error.message}`);
            }
        }
        
        // Test 2: Poll mit messageSecret
        if (message.text === '!testpoll2') {
            console.log("🧪 Test 2: Poll mit messageSecret");
            await message.reply("🧪 Teste Poll mit messageSecret...");
            
            try {
                const secretPoll = {
                    poll: {
                        name: "Secret Poll Test - Siehst du diese Umfrage?",
                        values: ["✅ Ja, sichtbar", "❌ Nicht sichtbar"],
                        selectableCount: 1,
                        messageSecret: Buffer.from(Array(32).fill(0).map(() => Math.floor(Math.random() * 256)))
                    }
                };
                
                const result = await client.socket.sendMessage(message.from, secretPoll);
                console.log("📊 Secret Poll gesendet:", result?.key?.id);
                
                await message.reply(`✅ Secret Poll gesendet (ID: ${result?.key?.id})\n⏳ Ist diese Umfrage sichtbar?`);
                
            } catch (error) {
                console.error("❌ Secret Poll Fehler:", error);
                await message.reply(`❌ Secret Poll fehlgeschlagen: ${error.message}`);
            }
        }
        
        // Test 3: Button-Fallback
        if (message.text === '!testpoll3') {
            console.log("🧪 Test 3: Button-Fallback");
            await message.reply("🧪 Teste Button-Fallback...");
            
            try {
                const buttonMessage = {
                    text: `📊 **Button Poll Test**\n\n_Siehst du die Buttons?_`,
                    buttons: [
                        {
                            buttonId: 'poll_0',
                            buttonText: { displayText: '✅ Ja, Buttons sichtbar' },
                            type: 1
                        },
                        {
                            buttonId: 'poll_1', 
                            buttonText: { displayText: '❌ Keine Buttons' },
                            type: 1
                        }
                    ],
                    headerType: 1
                };
                
                const result = await client.socket.sendMessage(message.from, buttonMessage);
                console.log("📊 Button Message gesendet:", result?.key?.id);
                
                await message.reply(`✅ Button Message gesendet (ID: ${result?.key?.id})\n⏳ Siehst du die Buttons?`);
                
            } catch (error) {
                console.error("❌ Button Message Fehler:", error);
                await message.reply(`❌ Button Message fehlgeschlagen: ${error.message}`);
            }
        }
        
        // Test 4: Emoji-Fallback (sollte immer funktionieren)
        if (message.text === '!testpoll4') {
            console.log("🧪 Test 4: Emoji-Fallback");
            await message.reply("🧪 Teste Emoji-Fallback...");
            
            const emojiPoll = `📊 **Emoji Poll Test**\n\n` +
                             `1️⃣ Siehst du diese Nachricht?\n` +
                             `2️⃣ Sind die Emojis sichtbar?\n` +
                             `3️⃣ Funktioniert alles?\n\n` +
                             `_Reagiere mit dem entsprechenden Emoji!_`;
            
            const result = await message.reply(emojiPoll);
            
            // Auto-Reactions hinzufügen
            setTimeout(async () => {
                try {
                    const emojis = ['1️⃣', '2️⃣', '3️⃣'];
                    for (let i = 0; i < emojis.length; i++) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                        await client.socket.sendMessage(message.from, {
                            react: {
                                text: emojis[i],
                                key: result.key
                            }
                        });
                    }
                    console.log("✅ Emoji-Reactions hinzugefügt");
                } catch (reactError) {
                    console.log("⚠️ Reactions fehlgeschlagen:", reactError.message);
                }
            }, 500);
        }
        
        // Test 5: Vergleich mit normaler Nachricht
        if (message.text === '!compare') {
            console.log("🧪 Test 5: Vergleich mit normaler Nachricht");
            
            // Normale Nachricht
            await message.reply("📝 Das ist eine normale Nachricht - siehst du sie?");
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Poll direkt danach
            try {
                const comparePoll = {
                    poll: {
                        name: "Vergleichs-Poll - Siehst du diese Umfrage?",
                        values: ["✅ Ja", "❌ Nein"]
                    }
                };
                
                const result = await client.socket.sendMessage(message.from, comparePoll);
                console.log("📊 Vergleichs-Poll gesendet:", result?.key?.id);
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await message.reply("📝 Das ist wieder eine normale Nachricht nach der Poll.");
                
            } catch (error) {
                console.error("❌ Vergleichs-Poll Fehler:", error);
                await message.reply(`❌ Vergleichs-Poll fehlgeschlagen: ${error.message}`);
            }
        }
        
        // Help
        if (message.text === '!help' || message.text === '!pollhelp') {
            const helpText = `👁️ **POLL VISIBILITY TESTS**\n\n` +
                           `!testpoll1 - Basic Poll ohne selectableCount\n` +
                           `!testpoll2 - Poll mit messageSecret\n` +
                           `!testpoll3 - Button-Fallback Test\n` +
                           `!testpoll4 - Emoji-Fallback Test\n` +
                           `!compare - Vergleich mit normaler Nachricht\n` +
                           `!help - Diese Hilfe\n\n` +
                           `🎯 **Ziel:** Herausfinden warum Polls nicht ankommen\n` +
                           `📊 Teste alle Commands und berichte welche sichtbar sind!`;
            
            await message.reply(helpText);
        }
        
    } catch (error) {
        console.error("❌ Test-Fehler:", error);
        await message.reply(`❌ Test-Fehler: ${error.message}`);
    }
});

console.log("🔄 Starte Verbindung für Poll-Visibility Test...");

try {
    await client.connect();
    console.log("🎯 Bot läuft! Sende '!help' für alle Tests.");
    
} catch (error) {
    console.error("❌ Verbindungsfehler:", error.message);
}