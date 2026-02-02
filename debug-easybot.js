// Debug der EasyBot Chain-API
import { EasyBot } from 'waengine';

console.log('🔍 Debug EasyBot Chain-API...');

try {
    const result = EasyBot.create();
    console.log('✅ EasyBot.create() funktioniert');
    console.log('🔍 Result type:', typeof result);
    console.log('🔍 Result constructor:', result.constructor.name);
    console.log('🔍 Has when method:', typeof result.when);
    
    if (typeof result.when === 'function') {
        const afterWhen = result.when('test');
        console.log('✅ .when() funktioniert');
        console.log('🔍 After when type:', typeof afterWhen);
        console.log('🔍 After when constructor:', afterWhen.constructor.name);
        console.log('🔍 Has reply method:', typeof afterWhen.reply);
        
        if (typeof afterWhen.reply === 'function') {
            const afterReply = afterWhen.reply('Hello');
            console.log('✅ .reply() funktioniert');
            console.log('🔍 After reply type:', typeof afterReply);
            console.log('🔍 After reply constructor:', afterReply.constructor.name);
            console.log('🔍 Has when method:', typeof afterReply.when);
            console.log('🔍 Has start method:', typeof afterReply.start);
        }
    }
    
} catch (error) {
    console.error('❌ Debug Fehler:', error.message);
    console.error('Stack:', error.stack);
}