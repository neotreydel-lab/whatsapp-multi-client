// 🧪 MEMORY LEAK TEST
// Prüft auf Memory Leaks über Zeit

import { WhatsAppClient, globalResourceManager } from './src/index.js';

console.log('🧪 MEMORY LEAK TEST');
console.log('='.repeat(60));

const ITERATIONS = 100;
const DELAY = 1000; // 1 Sekunde zwischen Iterationen

async function memoryLeakTest() {
    console.log(`\n🔬 Testing ${ITERATIONS} iterations...`);
    console.log('');
    
    const memorySnapshots = [];
    
    for (let i = 0; i < ITERATIONS; i++) {
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        
        const memBefore = process.memoryUsage();
        
        // Create and destroy client
        const client = new WhatsAppClient({
            authDir: './auth_test_' + i,
            logLevel: 'silent'
        });
        
        // Simulate some operations
        client.setPrefix('!');
        client.addCommand('test', () => {});
        
        // Cleanup
        await client.sessionManager.cancelAllOperations();
        
        const memAfter = process.memoryUsage();
        
        const snapshot = {
            iteration: i + 1,
            heapUsed: Math.round(memAfter.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memAfter.heapTotal / 1024 / 1024),
            external: Math.round(memAfter.external / 1024 / 1024),
            rss: Math.round(memAfter.rss / 1024 / 1024),
            delta: Math.round((memAfter.heapUsed - memBefore.heapUsed) / 1024)
        };
        
        memorySnapshots.push(snapshot);
        
        // Progress
        if ((i + 1) % 10 === 0) {
            console.log(`   Iteration ${i + 1}/${ITERATIONS}`);
            console.log(`   Heap Used: ${snapshot.heapUsed} MB`);
            console.log(`   Delta: ${snapshot.delta} KB`);
            console.log('');
        }
        
        await new Promise(resolve => setTimeout(resolve, DELAY));
    }
    
    // Analysis
    console.log('\n' + '='.repeat(60));
    console.log('📊 MEMORY LEAK ANALYSIS');
    console.log('='.repeat(60));
    
    const firstSnapshot = memorySnapshots[0];
    const lastSnapshot = memorySnapshots[memorySnapshots.length - 1];
    
    const totalGrowth = lastSnapshot.heapUsed - firstSnapshot.heapUsed;
    const avgGrowthPerIteration = totalGrowth / ITERATIONS;
    
    console.log(`\n📈 Memory Growth:`);
    console.log(`   Initial: ${firstSnapshot.heapUsed} MB`);
    console.log(`   Final: ${lastSnapshot.heapUsed} MB`);
    console.log(`   Total Growth: ${totalGrowth} MB`);
    console.log(`   Avg Growth/Iteration: ${avgGrowthPerIteration.toFixed(3)} MB`);
    
    // Leak Detection
    const leakThreshold = 0.1; // 100 KB per iteration
    const hasLeak = avgGrowthPerIteration > leakThreshold;
    
    console.log(`\n🔍 Leak Detection:`);
    console.log(`   Threshold: ${leakThreshold} MB/iteration`);
    console.log(`   Actual: ${avgGrowthPerIteration.toFixed(3)} MB/iteration`);
    
    if (hasLeak) {
        console.log(`   ❌ MEMORY LEAK DETECTED!`);
        console.log(`   💡 Memory grows by ${avgGrowthPerIteration.toFixed(3)} MB per iteration`);
    } else {
        console.log(`   ✅ NO MEMORY LEAK DETECTED`);
    }
    
    // Resource Stats
    const resourceStats = globalResourceManager.getStats();
    console.log(`\n🧹 Resource Stats:`);
    console.log(`   Created: ${resourceStats.created}`);
    console.log(`   Cleaned: ${resourceStats.cleaned}`);
    console.log(`   Leaked: ${resourceStats.created - resourceStats.cleaned}`);
    
    if (resourceStats.created > resourceStats.cleaned) {
        console.log(`   ⚠️ ${resourceStats.created - resourceStats.cleaned} resources not cleaned!`);
    } else {
        console.log(`   ✅ All resources cleaned`);
    }
    
    // Find Leaks
    const leaks = globalResourceManager.findLeaks(0); // All resources
    const totalLeaks = Object.values(leaks).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalLeaks > 0) {
        console.log(`\n⚠️ Found ${totalLeaks} leaked resources:`);
        if (leaks.timers.length > 0) console.log(`   - Timers: ${leaks.timers.length}`);
        if (leaks.intervals.length > 0) console.log(`   - Intervals: ${leaks.intervals.length}`);
        if (leaks.eventListeners.length > 0) console.log(`   - Event Listeners: ${leaks.eventListeners.length}`);
    }
    
    // Final Verdict
    console.log('\n' + '='.repeat(60));
    if (!hasLeak && resourceStats.created === resourceStats.cleaned && totalLeaks === 0) {
        console.log('✅ MEMORY LEAK TEST PASSED');
    } else {
        console.log('❌ MEMORY LEAK TEST FAILED');
    }
    console.log('='.repeat(60));
}

// Run with --expose-gc flag
if (!global.gc) {
    console.log('⚠️ Warning: Run with --expose-gc flag for accurate results');
    console.log('   node --expose-gc memory-leak-test.js\n');
}

memoryLeakTest().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
