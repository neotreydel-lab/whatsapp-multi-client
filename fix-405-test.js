// Fix für 405 Error - Verschiedene Browser Configs testen
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import pino from "pino";

const browserConfigs = [
    ["Chrome", "121.0.0", ""],
    ["Firefox", "120.0", ""],
    ["Safari", "17.0", ""],
    ["Edge", "120.0.0", ""],
    ["WhatsApp", "2.2412.54", ""],
    ["Ubuntu", "20.04", "Chrome"],
    ["Windows", "10", "Chrome"]
];

async function test405Fix() {
    console.log("🔧 Teste verschiedene Browser Configs für 405 Fix...");
    
    for (let i = 0; i < browserConfigs.length; i++) {
        const browser = browserConfigs[i];
        console.log(`\n🧪 Test ${i + 1}/${browserConfigs.length}: ${browser.join(' ')}`);
        
        try {
            const { state, saveCreds } = await useMultiFileAuthState('./auth');
            
            // Versuche mit fetchLatestBaileysVersion
            let socketConfig;
            try {
                const { version } = await fetchLatestBaileysVersion();
                socketConfig = {
                    version,
                    auth: state,
                    printQRInTerminal: true,
                    logger: pino({ level: 'silent' }),
                    browser: browser,
                    syncFullHistory: false,
                    generateHighQualityLinkPreview: true,
                    markOnlineOnConnect: false
                };
            } catch (versionError) {
                console.log("⚠️ fetchLatestBaileysVersion failed, using default");
                socketConfig = {
                    auth: state,
                    printQRInTerminal: true,
                    logger: pino({ level: 'silent' }),
                    browser: browser,
                    syncFullHistory: false,
                    generateHighQualityLinkPreview: true,
                    markOnlineOnConnect: false
                };
            }
            
            const sock = makeWASocket(socketConfig);
            
            const testPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    resolve({ success: false, reason: 'timeout' });
                }, 10000); // 10 Sekunden Timeout
                
                sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
                    if (connection === 'open') {
                        clearTimeout(timeout);
                        resolve({ success: true, browser });
                    } else if (connection === 'close') {
                        const statusCode = lastDisconnect?.error?.output?.statusCode;
                        const errorData = lastDisconnect?.error?.data;
                        
                        clearTimeout(timeout);
                        resolve({ 
                            success: false, 
                            reason: 'connection_failed',
                            statusCode,
                            errorData,
                            browser
                        });
                    }
                });
            });
            
            const result = await testPromise;
            
            if (result.success) {
                console.log(`✅ SUCCESS mit Browser: ${browser.join(' ')}`);
                console.log("🎉 Dieser Browser Config funktioniert!");
                sock.end();
                return browser;
            } else {
                console.log(`❌ FAILED: ${result.reason}`);
                if (result.statusCode) {
                    console.log(`   Status Code: ${result.statusCode}`);
                }
                if (result.errorData) {
                    console.log(`   Error Data:`, result.errorData);
                }
            }
            
            sock.end();
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
        }
        
        // Kurze Pause zwischen Tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log("\n❌ Alle Browser Configs fehlgeschlagen");
    console.log("💡 Mögliche Lösungen:");
    console.log("   1. Baileys auf 6.7.8 downgraden");
    console.log("   2. Auth-Daten löschen und neu authentifizieren");
    console.log("   3. VPN verwenden (falls IP blockiert)");
    console.log("   4. Warten (WhatsApp Server Problem)");
}

test405Fix().catch(console.error);