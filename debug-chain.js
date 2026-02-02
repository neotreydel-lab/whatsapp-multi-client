// Debug der EasyChain direkt
import { EasyBot } from './src/easy-bot.js';

console.log('🔍 Debug EasyChain direkt...');

try {
    const bot = new EasyBot();
    console.log('✅ EasyBot Instanz erstellt');
    console.log('🔍 Bot has chain:', !!bot.chain);
    console.log('🔍 Chain type:', typeof bot.chain);
    
    if (bot.chain) {
        console.log('🔍 Chain constructor:', bot.chain.constructor.name);
        console.log('🔍 Chain has when:', typeof bot.chain.when);
        console.log('🔍 Chain has start:', typeof bot.chain.start);
    }
    
    // Teste create() direkt
    const result = EasyBot.create();
    console.log('✅ EasyBot.create() aufgerufen');
    console.log('🔍 Result type:', typeof result);
    console.log('🔍 Result constructor:', result.constructor.name);
    console.log('🔍 Result has when:', typeof result.when);
    console.log('🔍 Result has start:', typeof result.start);
    
} catch (error) {
    console.error('❌ Debug Fehler:', error.message);
    console.error('Stack:', error.stack);
}