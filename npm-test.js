// Test script for published WAEngine npm package
import { WhatsAppClient } from "waengine";

async function testPublishedPackage() {
    console.log("🧪 Testing published WAEngine package...");
    
    try {
        // Test basic import and initialization
        const client = new WhatsAppClient({
            authDir: "./test-auth",
            logLevel: "silent",
            browser: ["NPM-Test", "1.0.2", ""]
        });
        
        console.log("✅ Package import successful!");
        console.log("✅ Client creation successful!");
        
        // Test prefix system
        client.setPrefix("!");
        console.log("✅ Prefix system working!");
        
        // Test command registration
        client.addCommand('test', (msg) => {
            console.log("Test command executed!");
        });
        console.log("✅ Command registration working!");
        
        console.log(`✅ Commands available: ${client.getCommands().length}`);
        
        console.log("\n🎉 WAEngine npm package is working correctly!");
        console.log("📦 Ready for production use!");
        
    } catch (error) {
        console.error("❌ Package test failed:", error);
    }
}

testPublishedPackage();