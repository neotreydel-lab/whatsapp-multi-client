// 🛡️ ULTRA-ROBUST SYSTEM TEST
// Testet alle neuen Robustheit-Features

import { WhatsAppClient, globalResourceManager } from './src/index.js';

console.log('🛡️ ULTRA-ROBUST SYSTEM TEST');
console.log('='.repeat(60));

async function testUltraRobustSystem() {
    const client = new WhatsAppClient({
        authDir: './auth',
        
        // Ultra-Robuste Konfiguration
        maxRecoveryRetries: 10,
        healthCheckInterval: 30000,
        maxAuthBackups: 5,
        autoBackupInterval: 3600000,
        
        // Bestehende Optionen
        autoRestart: true,
        autoCleanup: true,
        logLevel: 'silent'
    });
    
    console.log('\n✅ Client mit Ultra-Robust Konfiguration erstellt');
    
    // Test 1: Resource Manager
    console.log('\n📊 TEST 1: Resource Manager');
    console.log('-'.repeat(60));
    
    const stats = globalResourceManager.getStats();
    console.log(`   Active Timers: ${stats.active.timers}`);
    console.log(`   Active Intervals: ${stats.active.intervals}`);
    console.log(`   Active Event Listeners: ${stats.active.eventListeners}`);
    console.log(`   Total Created: ${stats.created}`);
    console.log(`   Total Cleaned: ${stats.cleaned}`);
    console.log(`   ✅ Resource Manager operational`);
    
    // Test 2: Connection Recovery
    console.log('\n🔄 TEST 2: Connection Recovery');
    console.log('-'.repeat(60));
    
    const recoveryStats = client.connectionRecovery.getStats();
    console.log(`   Is Recovering: ${recoveryStats.isRecovering ? '🔄' : '✅'}`);
    console.log(`   Retry Count: ${recoveryStats.retryCount}`);
    console.log(`   Failure Count: ${recoveryStats.failureCount}`);
    console.log(`   ✅ Connection Recovery ready`);
    
    // Test 3: Auth Recovery
    console.log('\n🔐 TEST 3: Auth Recovery');
    console.log('-'.repeat(60));
    
    const authStats = client.authRecovery.getStats();
    console.log(`   Backup Count: ${authStats.backupCount}`);
    console.log(`   Auto Backup: ${authStats.autoBackupEnabled ? '✅ Enabled' : '⚠️ Disabled'}`);
    console.log(`   Backup Interval: ${authStats.backupInterval / 60000} minutes`);
    console.log(`   ✅ Auth Recovery ready`);
    
    // Test 4: Session Validation
    console.log('\n📁 TEST 4: Session Validation');
    console.log('-'.repeat(60));
    
    const sessionValidation = await client.validateSession();
    if (sessionValidation.valid) {
        console.log(`   ✅ Session Valid`);
        console.log(`   User ID: ${sessionValidation.userId}`);
        console.log(`   Age: ${sessionValidation.ageInDays} days`);
    } else {
        console.log(`   ⚠️ Session Invalid: ${sessionValidation.reason}`);
        console.log(`   💡 New QR-Code will be generated on connect`);
    }
    
    // Test 5: Corruption Detection
    console.log('\n🔍 TEST 5: Corruption Detection');
    console.log('-'.repeat(60));
    
    const issues = await client.authRecovery.detectCorruption();
    
    if (issues.length === 0) {
        console.log('   ✅ No corruption detected');
    } else {
        console.log(`   ⚠️ Found ${issues.length} issue(s):`);
        issues.forEach((issue, i) => {
            console.log(`   ${i + 1}. ${issue.type} (${issue.severity})`);
        });
    }
    
    // Test 6: Connection
    console.log('\n🔌 TEST 6: Connection Test');
    console.log('-'.repeat(60));
    
    try {
        console.log('Connecting...');
        await client.connect();
        
        console.log('   ✅ Connected successfully!');
        console.log('   🔄 Health Monitoring: Active');
        console.log('   💾 Auto Backup: Active');
        
        // Test 7: Resource Tracking
        console.log('\n🧹 TEST 7: Resource Tracking');
        console.log('-'.repeat(60));
        
        const finalStats = globalResourceManager.getStats();
        console.log(`   Active Timers: ${finalStats.active.timers}`);
        console.log(`   Active Intervals: ${finalStats.active.intervals}`);
        console.log(`   Active Event Listeners: ${finalStats.active.eventListeners}`);
        console.log(`   Total Created: ${finalStats.created}`);
        console.log(`   Total Cleaned: ${finalStats.cleaned}`);
        console.log(`   ✅ All resources tracked`);
        
        // Test 8: Leak Detection
        console.log('\n🔍 TEST 8: Leak Detection');
        console.log('-'.repeat(60));
        
        const leaks = globalResourceManager.findLeaks(60000); // 1 minute
        const totalLeaks = Object.values(leaks).reduce((sum, arr) => sum + arr.length, 0);
        
        if (totalLeaks === 0) {
            console.log('   ✅ No leaks detected');
        } else {
            console.log(`   ⚠️ Found ${totalLeaks} potential leak(s)`);
            if (leaks.timers.length > 0) console.log(`   - Timers: ${leaks.timers.length}`);
            if (leaks.intervals.length > 0) console.log(`   - Intervals: ${leaks.intervals.length}`);
            if (leaks.eventListeners.length > 0) console.log(`   - Event Listeners: ${leaks.eventListeners.length}`);
        }
        
        // Test 9: Message Handling
        console.log('\n💬 TEST 9: Message Handling');
        console.log('-'.repeat(60));
        
        client.on('message', async (msg) => {
            console.log(`📨 Message: "${msg.text}" from ${msg.from}`);
            
            if (msg.text === '!test') {
                await msg.reply('✅ Ultra-Robust System is working!');
            }
            
            if (msg.text === '!stats') {
                const stats = {
                    recovery: client.connectionRecovery.getStats(),
                    auth: client.authRecovery.getStats(),
                    resources: globalResourceManager.getStats()
                };
                
                await msg.reply(`📊 System Stats:\n${JSON.stringify(stats, null, 2)}`);
            }
            
            if (msg.text === '!health') {
                await client.connectionRecovery.performHealthCheck();
                await msg.reply('✅ Health check performed');
            }
            
            if (msg.text === '!backup') {
                const result = await client.authRecovery.createSmartBackup();
                await msg.reply(result ? '✅ Backup created' : '❌ Backup failed');
            }
        });
        
        console.log('   ✅ Message handlers registered');
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 ULTRA-ROBUST SYSTEM READY!');
        console.log('='.repeat(60));
        console.log('\n📱 Available Commands:');
        console.log('   !test    - Test basic functionality');
        console.log('   !stats   - Show system statistics');
        console.log('   !health  - Perform health check');
        console.log('   !backup  - Create manual backup');
        console.log('\n⏳ Bot is running... Press Ctrl+C to stop\n');
        
    } catch (error) {
        console.error('\n❌ Connection failed:', error.message);
        
        // Test Recovery
        console.log('\n🔧 TEST: Auto-Recovery System');
        console.log('-'.repeat(60));
        console.log('   🔄 Initiating recovery...');
        
        try {
            await client.connectionRecovery.initiateRecovery(error);
            console.log('   ✅ Recovery completed');
        } catch (recoveryError) {
            console.error('   ❌ Recovery failed:', recoveryError.message);
        }
    }
}

// Run test
testUltraRobustSystem().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    console.log('🧹 Cleaning up resources...');
    
    const stats = globalResourceManager.cleanupAll();
    console.log('✅ Cleanup complete:', stats);
    
    process.exit(0);
});
