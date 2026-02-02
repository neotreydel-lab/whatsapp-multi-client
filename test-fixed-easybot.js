// Test der reparierten EasyBot API
import { EasyBot } from './src/easy-bot-fixed.js';

console.log('🧪 Teste reparierte EasyBot Chain-API...');

try {
    const result = EasyBot.create()
        .when('hi').reply('Hello! 👋')
        .when('test').reply('✅ Working!')
        .when('ping').reply('pong! 🏓')
        .when('help').reply('Commands: hi, test, ping, help');
    
    console.log('✅ Chain-API funktioniert!');
    console.log('🔍 Result type:', typeof result);
    console.log('🔍 Has start method:', typeof result.start);
    
    // Teste start() Methode
    if (typeof result.start === 'function') {
        console.log('✅ start() Methode verfügbar!');
        // result.start(); // Würde Bot tatsächlich starten
    } else {
        console.log('❌ start() Methode fehlt!');
    }
    
} catch (error) {
    console.error('❌ Chain-API Fehler:', error.message);
}