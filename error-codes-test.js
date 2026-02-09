// Error-Code System Test für WAEngine v1.7.5
import { ERROR_CODES, getErrorDescription, createError, getErrorCategory } from './src/error-codes.js';
import { ErrorHandler } from './src/error-handler.js';

console.log('🔍 WAEngine Error-Code System Test\n');
console.log('='.repeat(60));

// Test 1: Error-Codes anzeigen
console.log('\n📋 TEST 1: Error-Code Kategorien');
console.log('-'.repeat(60));

const categories = [
    { name: 'Connection', codes: ERROR_CODES.CONNECTION },
    { name: 'Authentication', codes: ERROR_CODES.AUTH },
    { name: 'File System', codes: ERROR_CODES.FILE },
    { name: 'Message', codes: ERROR_CODES.MESSAGE },
    { name: 'Group', codes: ERROR_CODES.GROUP },
    { name: 'Media', codes: ERROR_CODES.MEDIA },
    { name: 'Command', codes: ERROR_CODES.COMMAND },
    { name: 'Plugin', codes: ERROR_CODES.PLUGIN },
    { name: 'System', codes: ERROR_CODES.SYSTEM },
    { name: 'QR Code', codes: ERROR_CODES.QR },
    { name: 'Mobile', codes: ERROR_CODES.MOBILE },
    { name: 'Recovery', codes: ERROR_CODES.RECOVERY },
    { name: 'Database', codes: ERROR_CODES.DATABASE },
    { name: 'Network', codes: ERROR_CODES.NETWORK },
    { name: 'Security', codes: ERROR_CODES.SECURITY }
];

categories.forEach(cat => {
    console.log(`\n${cat.name}:`);
    Object.entries(cat.codes).forEach(([key, code]) => {
        console.log(`  ${code}: ${getErrorDescription(code)}`);
    });
});

// Test 2: Error-Code Funktionen
console.log('\n\n🔧 TEST 2: Error-Code Funktionen');
console.log('-'.repeat(60));

const testCode = ERROR_CODES.CONNECTION.FAILED;
console.log(`\nTest Code: ${testCode}`);
console.log(`Description: ${getErrorDescription(testCode)}`);
console.log(`Category: ${getErrorCategory(testCode)}`);

// Test 3: Custom Error erstellen
console.log('\n\n⚠️ TEST 3: Custom Error erstellen');
console.log('-'.repeat(60));

try {
    throw createError(
        ERROR_CODES.MESSAGE.SEND_FAILED,
        'Test-Nachricht konnte nicht gesendet werden',
        { recipient: '491234567890@s.whatsapp.net' }
    );
} catch (error) {
    console.log(`\nError Code: ${error.code}`);
    console.log(`Message: ${error.message}`);
    console.log(`Context:`, error.context);
}

// Test 4: Error-Handler mit Codes
console.log('\n\n🛡️ TEST 4: Error-Handler mit Codes');
console.log('-'.repeat(60));

const errorHandler = new ErrorHandler({
    supportEmail: 'Liaia@outlook.de',
    showSupportInfo: false, // Für Test deaktiviert
    logErrors: true
});

// Simuliere verschiedene Fehler
const testErrors = [
    { code: ERROR_CODES.CONNECTION.FAILED, message: 'Verbindung fehlgeschlagen' },
    { code: ERROR_CODES.AUTH.SESSION_CORRUPTED, message: 'Session korrupt' },
    { code: ERROR_CODES.QR.GENERATION_FAILED, message: 'QR-Code Generierung fehlgeschlagen' },
    { code: ERROR_CODES.MESSAGE.SEND_FAILED, message: 'Nachricht senden fehlgeschlagen' },
    { code: ERROR_CODES.PLUGIN.LOAD_FAILED, message: 'Plugin laden fehlgeschlagen' }
];

testErrors.forEach(testError => {
    const error = createError(testError.code, testError.message);
    errorHandler.handleError(error, { action: 'test', errorCode: testError.code });
});

// Test 5: Error-Statistiken
console.log('\n\n📊 TEST 5: Error-Statistiken');
console.log('-'.repeat(60));

const stats = errorHandler.getErrorStats();
console.log(`\nTotal Errors: ${stats.totalErrors}`);
console.log(`\nMost Common Error:`);
if (stats.mostCommonError) {
    console.log(`  Code: ${stats.mostCommonError.code}`);
    console.log(`  Count: ${stats.mostCommonError.count}`);
    console.log(`  Description: ${stats.mostCommonError.description}`);
}

console.log(`\nErrors by Code:`);
Object.entries(stats.errorsByCode).forEach(([code, info]) => {
    console.log(`  ${code}: ${info.count}x - ${info.description}`);
});

// Test 6: Quick-Fixes
console.log('\n\n💡 TEST 6: Quick-Fixes für Error-Codes');
console.log('-'.repeat(60));

const testCodesForFixes = [
    ERROR_CODES.CONNECTION.FAILED,
    ERROR_CODES.AUTH.SESSION_CORRUPTED,
    ERROR_CODES.QR.GENERATION_FAILED,
    ERROR_CODES.FILE.PERMISSION_DENIED,
    ERROR_CODES.PLUGIN.LOAD_FAILED
];

testCodesForFixes.forEach(code => {
    console.log(`\n${code}: ${getErrorDescription(code)}`);
    const fixes = errorHandler.getQuickFixForErrorCode(code);
    if (fixes.length > 0) {
        console.log('Quick Fixes:');
        fixes.forEach(fix => console.log(`  → ${fix}`));
    }
});

// Test 7: Error-Code Erkennung
console.log('\n\n🔍 TEST 7: Automatische Error-Code Erkennung');
console.log('-'.repeat(60));

const testMessages = [
    { message: 'Connection failed', expected: 'WAE-1001' },
    { message: 'Connection timeout', expected: 'WAE-1002' },
    { message: 'Auth failed', expected: 'WAE-2001' },
    { message: 'Session corrupted', expected: 'WAE-2003' },
    { message: 'File not found ENOENT', expected: 'WAE-3001' },
    { message: 'Permission denied EPERM', expected: 'WAE-3002' },
    { message: 'QR generation failed', expected: 'WAE-10001' }
];

testMessages.forEach(test => {
    const error = new Error(test.message);
    const detectedCode = errorHandler.detectErrorCode(error, {});
    const match = detectedCode === test.expected ? '✅' : '❌';
    console.log(`${match} "${test.message}" → ${detectedCode} (expected: ${test.expected})`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ Error-Code System Test abgeschlossen!');
console.log('='.repeat(60));
console.log('\n📖 Siehe ERROR-CODES.md für vollständige Dokumentation\n');
