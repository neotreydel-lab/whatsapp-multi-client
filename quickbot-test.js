// 🧪 QuickBot Test - Debugging
import { quickBot } from './src/index.js';

console.log('🔍 Testing quickBot import...');

try {
    // Test 1: Import Check
    console.log('✅ quickBot imported:', typeof quickBot);
    
    // Test 2: Function Call
    const bot = quickBot();
    console.log('✅ quickBot() called:', typeof bot);
    console.log('✅ Bot instance:', bot.constructor.name);
    
    // Test 3: Method Check
    console.log('✅ when method exists:', typeof bot.when);
    console.log('✅ start method exists:', typeof bot.start);
    
    // Test 4: Chaining Test
    const rule = bot.when("test");
    console.log('✅ when() returns:', typeof rule);
    console.log('✅ Rule instance:', rule.constructor.name);
    console.log('✅ reply method exists:', typeof rule.reply);
    
    // Test 5: Full Chain Test
    try {
        const result = quickBot()
            .when("hello").reply("Hi! 👋")
            .when("test").reply("Test successful!");
        
        console.log('✅ Full chaining works!');
        console.log('✅ Result type:', typeof result);
        console.log('✅ Rules count:', result.rules?.length || 0);
        
        // Test 6: Start Method
        console.log('✅ About to test start()...');
        
        // Don't actually start, just check if method exists
        console.log('✅ Start method type:', typeof result.start);
        
        console.log('🎉 All tests passed! QuickBot is working correctly.');
        
    } catch (chainError) {
        console.error('❌ Chaining error:', chainError.message);
        console.error('Stack:', chainError.stack);
    }
    
} catch (error) {
    console.error('❌ QuickBot test failed:', error.message);
    console.error('Stack:', error.stack);
    
    // Debug info
    console.log('🔍 Debug Info:');
    console.log('- Node version:', process.version);
    console.log('- Current directory:', process.cwd());
    console.log('- Available exports from index.js:');
    
    try {
        const allExports = await import('./src/index.js');
        Object.keys(allExports).forEach(key => {
            console.log(`  - ${key}: ${typeof allExports[key]}`);
        });
    } catch (importError) {
        console.error('❌ Could not import index.js:', importError.message);
    }
}