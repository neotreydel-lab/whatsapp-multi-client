// 🔥 STRESS TEST - 24h Dauerlauf
// Testet Stabilität unter Last

import { WhatsAppClient, globalResourceManager } from './src/index.js';

console.log('🔥 STRESS TEST - 24h Dauerlauf');
console.log('='.repeat(60));

const DURATION = process.argv.includes('--duration=24h') ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // Default 1h
const MESSAGE_INTERVAL = 5000; // 5 Sekunden

let messageCount = 0;
let errorCount = 0;
let recoveryCount = 0;

async function stressTest() {
    const client = new WhatsAppClient({
        authDir: './auth',
        maxRecoveryRetries: 10,
        healthCheckInterval: 30000,
        maxAuthBackups: 5,
        autoBackupInterval: 3600000,
        autoRestart: true,
        autoCleanup: true,
        logLevel: 'silent'
    });
    
    console.log(`\n⏱️ Duration: ${DURATION / 1000 / 60} minutes`);
    console.log(`📨 Message Interval: ${MESSAGE_INTERVAL / 1000} seconds`);
    console.log('');
    
    const startTime = Date.now();
    
    // Stats Timer
    const statsInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = DURATION - elapsed;
        const progress = (elapsed / DURATION * 100).toFixed(1);
        
        console.log('\n📊 STRESS TEST STATS');
        console.log('-'.repeat(60));
        console.log(`   Progress: ${progress}%`);
        console.log(`   Elapsed: ${Math.floor(elapsed / 1000 / 60)} minutes`);
        console.log(`   Remaining: ${Math.floor(remaining / 1000 / 60)} minutes`);
        console.log(`   Messages: ${messageCount}`);
        console.log(`   Errors: ${errorCount}`);
        console.log(`   Recoveries: ${recoveryCount}`);
        
        const resourceStats = globalResourceManager.getStats();
        console.log(`   Active Resources: ${resourceStats.active.timers + resourceStats.active.intervals}`);
        console.log(`   Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
        
        const leaks = globalResourceManager.findLeaks();
        const totalLeaks = Object.values(leaks).reduce((sum, arr) => sum + arr.length, 0);
        console.log(`   Leaks: ${totalLeaks}`);
        
    }, 60000); // Jede Minute
    
    try {
        await client.connect();
        console.log('✅ Connected - Starting stress test...\n');
        
        // Message Handler
        client.on('message', async (msg) => {
            messageCount++;
            
            if (msg.text === '!stop') {
                console.log('\n🛑 Stop command received');
                clearInterval(statsInterval);
                await client.disconnect();
                process.exit(0);
            }
        });
        
        // Recovery Handler
        client.connectionRecovery.on = (event, handler) => {
            if (event === 'recovery_started') {
                recoveryCount++;
            }
        };
        
        // Error Handler
        client.on('error', (error) => {
            errorCount++;
            console.error(`❌ Error ${errorCount}:`, error.message);
        });
        
        // Wait for duration
        await new Promise(resolve => setTimeout(resolve, DURATION));
        
        // Final Stats
        console.log('\n' + '='.repeat(60));
        console.log('🏁 STRESS TEST COMPLETE');
        console.log('='.repeat(60));
        console.log(`   Duration: ${DURATION / 1000 / 60} minutes`);
        console.log(`   Messages: ${messageCount}`);
        console.log(`   Errors: ${errorCount}`);
        console.log(`   Recoveries: ${recoveryCount}`);
        console.log(`   Success Rate: ${((1 - errorCount / messageCount) * 100).toFixed(2)}%`);
        
        const finalResourceStats = globalResourceManager.getStats();
        console.log(`   Final Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
        console.log(`   Resources Created: ${finalResourceStats.created}`);
        console.log(`   Resources Cleaned: ${finalResourceStats.cleaned}`);
        console.log(`   Resource Leaks: ${finalResourceStats.created - finalResourceStats.cleaned}`);
        
        clearInterval(statsInterval);
        await client.disconnect();
        
    } catch (error) {
        console.error('❌ Stress test failed:', error);
        clearInterval(statsInterval);
        process.exit(1);
    }
}

stressTest();
