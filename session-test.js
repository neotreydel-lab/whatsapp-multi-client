// Test für Session-Management v1.0.6
import { WhatsAppClient } from "./src/index.js";

load.Plugins("moderation")

async function sessionTest() {
    console.log("🧪 Session-Management Test v1.0.6...");
    
    const client = new WhatsAppClient({
        authDir: "./session-test-auth",
        logLevel: "silent",
        browser: ["SessionTest", "1.0.6", ""],
        printQR: true,
        autoCleanup: true // Automatische Bereinigung bei Logout
    });

    // Session-Status vor Verbindung
    console.log("\n📋 Session-Status vor Verbindung:");
    const statusBefore = await client.getSessionStatus();
    console.log(statusBefore);

    // Session-Validierung
    console.log("\n🔍 Session-Validierung:");
    const validation = await client.validateSession();
    console.log(validation);

    client.setPrefix("!");

    // Test Commands für Session-Management
    client.addCommand('status', async (msg) => {
        const status = await client.getSessionStatus();
        await msg.reply(`📋 Session Status:\n${JSON.stringify(status, null, 2)}`);
    });

    client.addCommand('validate', async (msg) => {
        const validation = await client.validateSession();
        await msg.reply(`🔍 Session Validation:\n${JSON.stringify(validation, null, 2)}`);
    });

    client.addCommand('cleanup', async (msg) => {
        await msg.reply('🧹 Bereinige Session...');
        const success = await client.cleanupSession();
        await msg.reply(success ? '✅ Session bereinigt!' : '❌ Cleanup fehlgeschlagen');
    });

    client.addCommand('logout', async (msg) => {
        await msg.reply('👋 Logout wird durchgeführt...');
        await client.logout();
    });

    client.addCommand('repair', async (msg) => {
        await msg.reply('🔧 Repariere Session...');
        const result = await client.repairSession();
        await msg.reply(`🔧 Repair Result: ${JSON.stringify(result, null, 2)}`);
    });

    client.addCommand('backup', async (msg) => {
        await msg.reply('💾 Erstelle Session-Backup...');
        const backupPath = await client.backupSession();
        await msg.reply(backupPath ? `✅ Backup: ${backupPath}` : '❌ Backup fehlgeschlagen');
    });

    // Events
    client.on('connected', async () => {
        console.log("✅ Session-Test verbunden!");
        
        // Session-Status nach Verbindung
        console.log("\n📋 Session-Status nach Verbindung:");
        const statusAfter = await client.getSessionStatus();
        console.log(statusAfter);
    });

    client.on('disconnected', (data) => {
        console.log(`🔴 Disconnected: ${data.reason}`);
        if (data.cleaned) {
            console.log("🧹 Session wurde automatisch bereinigt");
        }
    });

    client.on('message', async (msg) => {
        if (msg.text === 'session') {
            const status = await client.getSessionStatus();
            await msg.reply(`📋 Session: ${status.status}, Files: ${status.totalFiles || 0}`);
        }
    });

    try {
        console.log("\n🔄 Starte Session-Test...");
        await client.connect();
        
        console.log("\n🎯 Session-Test bereit!");
        console.log("📋 Test-Commands:");
        console.log("   - !status → Session-Status");
        console.log("   - !validate → Session-Validierung");
        console.log("   - !cleanup → Session bereinigen");
        console.log("   - !logout → Ausloggen (mit Auto-Cleanup)");
        console.log("   - !repair → Session reparieren");
        console.log("   - !backup → Session-Backup");
        console.log("   - 'session' → Quick-Status");
        
    } catch (error) {
        console.error("❌ Session-Test Fehler:", error);
        
        // Versuche Session-Reparatur
        console.log("\n🔧 Versuche automatische Reparatur...");
        const repairResult = await client.repairSession();
        console.log("Repair Result:", repairResult);
        
        if (repairResult.repaired) {
            console.log("🔄 Versuche erneut nach Reparatur...");
            try {
                await client.connect();
                console.log("✅ Verbindung nach Reparatur erfolgreich!");
            } catch (retryError) {
                console.error("❌ Auch nach Reparatur fehlgeschlagen:", retryError);
            }
        }
    }
}

sessionTest();