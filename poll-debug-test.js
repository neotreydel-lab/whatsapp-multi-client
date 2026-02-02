// Poll Debug Test - Identifiziert das Umfrage-Problem
import { WhatsAppClient } from "./src/client.js";

console.log("🔍 POLL DEBUG TEST - Identifiziert Umfrage-Problem");
console.log("=" .repeat(60));

const client = new WhatsAppClient({
    printQR: true,
    silent: false,
    verbose: true,
    connectionTimeout: 30000,
    autoRestart: false
});

client.on('connected', async () => {
    console.log("🎉 Bot verbunden - starte Poll-Tests...");
    
    // Simuliere eine Test-Message für Poll-Tests
    const testMessage = {
        from: '1234567890@s.whatsapp.net',
        text: 'test poll',
        isGroup: false,
        getSender: () => '1234567890@s.whatsapp.net',
        reply: async (text) => {
            console.log(`📤 Reply: ${text}`);
            return { key: { id: 'test123' } };
        },
        sendPoll: async (question, options) => {
            console.log(`📊 sendPoll aufgerufen: "${question}", Optionen:`, options);
            
            try {
                // Test 1: Standard Baileys Format
                console.log("🧪 Test 1: Standard Baileys Format");
                const standardFormat = {
                    poll: {
                        name: question,
                        values: options
                    }
                };
                console.log("📋 Standard Format:", JSON.stringify(standardFormat, null, 2));
                
                const result1 = await client.socket.sendMessage(testMessage.from, standardFormat);
                console.log("✅ Standard Format erfolgreich:", result1?.key?.id);
                return result1;
                
            } catch (error1) {
                console.log("❌ Standard Format fehlgeschlagen:", error1.message);
                
                try {
                    // Test 2: Mit selectableCount
                    console.log("🧪 Test 2: Mit selectableCount");
                    const formatWithCount = {
                        poll: {
                            name: question,
                            values: options,
                            selectableCount: 1
                        }
                    };
                    console.log("📋 Format mit Count:", JSON.stringify(formatWithCount, null, 2));
                    
                    const result2 = await client.socket.sendMessage(testMessage.from, formatWithCount);
                    console.log("✅ Format mit Count erfolgreich:", result2?.key?.id);
                    return result2;
                    
                } catch (error2) {
                    console.log("❌ Format mit Count fehlgeschlagen:", error2.message);
                    
                    try {
                        // Test 3: pollCreationMessage Format
                        console.log("🧪 Test 3: pollCreationMessage Format");
                        const creationFormat = {
                            pollCreationMessage: {
                                name: question,
                                options: options.map(option => ({ optionName: option })),
                                selectableOptionsCount: 1
                            }
                        };
                        console.log("📋 Creation Format:", JSON.stringify(creationFormat, null, 2));
                        
                        const result3 = await client.socket.sendMessage(testMessage.from, creationFormat);
                        console.log("✅ Creation Format erfolgreich:", result3?.key?.id);
                        return result3;
                        
                    } catch (error3) {
                        console.log("❌ Creation Format fehlgeschlagen:", error3.message);
                        
                        // Test 4: Fallback
                        console.log("🧪 Test 4: Fallback zu Text");
                        let fallbackText = `📊 **${question}**\n\n`;
                        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
                        
                        options.forEach((option, index) => {
                            fallbackText += `${emojis[index]} ${option}\n`;
                        });
                        
                        fallbackText += `\n_Reagiere mit dem entsprechenden Emoji!_`;
                        
                        const result4 = await client.socket.sendMessage(testMessage.from, {
                            text: fallbackText
                        });
                        console.log("✅ Fallback erfolgreich:", result4?.key?.id);
                        return result4;
                    }
                }
            }
        }
    };
    
    // Test verschiedene Poll-Formate
    console.log("\n🔬 POLL FORMAT TESTS");
    console.log("-".repeat(40));
    
    try {
        await testMessage.sendPoll("Lieblings Farbe?", ["Rot", "Blau", "Grün"]);
    } catch (error) {
        console.error("❌ Poll Test komplett fehlgeschlagen:", error.message);
    }
    
    // Teste auch direkt über socket
    console.log("\n🔬 DIREKTE SOCKET TESTS");
    console.log("-".repeat(40));
    
    const testFormats = [
        {
            name: "Einfaches Poll Format",
            message: {
                poll: {
                    name: "Test Frage?",
                    values: ["Option A", "Option B"]
                }
            }
        },
        {
            name: "Poll mit selectableCount",
            message: {
                poll: {
                    name: "Test Frage 2?",
                    values: ["Option 1", "Option 2", "Option 3"],
                    selectableCount: 1
                }
            }
        },
        {
            name: "pollCreationMessage Format",
            message: {
                pollCreationMessage: {
                    name: "Test Frage 3?",
                    options: [
                        { optionName: "Ja" },
                        { optionName: "Nein" },
                        { optionName: "Vielleicht" }
                    ],
                    selectableOptionsCount: 1
                }
            }
        }
    ];
    
    for (const format of testFormats) {
        try {
            console.log(`🧪 Teste: ${format.name}`);
            console.log("📋 Format:", JSON.stringify(format.message, null, 2));
            
            const result = await client.socket.sendMessage(testMessage.from, format.message);
            console.log(`✅ ${format.name} erfolgreich:`, result?.key?.id);
            
        } catch (error) {
            console.log(`❌ ${format.name} fehlgeschlagen:`, error.message);
            console.log("🔍 Error Details:", error.stack?.split('\n')[0]);
        }
        
        // Pause zwischen Tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("\n📊 POLL DEBUG TEST ABGESCHLOSSEN");
    console.log("🎯 Schaue in die Logs um zu sehen welches Format funktioniert!");
});

client.on('message', (message) => {
    console.log(`📨 Nachricht: "${message.text}" von ${message.getSender()}`);
    
    if (message.text === '!polltest') {
        console.log("🧪 Manueller Poll-Test gestartet...");
        message.sendPoll("Manuelle Test Frage?", ["A", "B", "C"]);
    }
});

console.log("🔄 Starte Verbindung für Poll-Debug...");

try {
    await client.connect();
    console.log("🎯 Bot läuft! Sende '!polltest' für manuellen Test.");
    
} catch (error) {
    console.error("❌ Verbindungsfehler:", error.message);
}