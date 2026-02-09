#!/usr/bin/env node

/**
 * Mobile Support Test
 * Tests mobile environment detection and optimizations
 */

import { MobileSupport } from './src/mobile-support.js';

console.log('🧪 Testing Mobile Support...\n');

// Mock client for testing
const mockClient = {
    info: { wid: 'test@c.us' },
    pupPage: null
};

async function testMobileSupport() {
    try {
        console.log('📱 Initializing Mobile Support...');
        const mobileSupport = new MobileSupport(mockClient);
        
        // Test environment detection
        console.log('\n🔍 Environment Detection:');
        console.log('- Is Mobile:', mobileSupport.isMobileEnvironment());
        console.log('- Mobile Type:', mobileSupport.getMobileType());
        console.log('- Environment:', mobileSupport.environment);
        
        // Test mobile info
        console.log('\n📊 Mobile Info:');
        const mobileInfo = mobileSupport.getMobileInfo();
        console.log(JSON.stringify(mobileInfo, null, 2));
        
        // Test mobile capabilities
        console.log('\n⚡ Mobile Capabilities:');
        const capabilities = mobileSupport.getMobileCapabilities();
        console.log(JSON.stringify(capabilities, null, 2));
        
        // Test mobile paths
        console.log('\n📁 Mobile Paths:');
        console.log('- Storage Path:', mobileSupport.getMobileStoragePath());
        console.log('- Download Path:', mobileSupport.getMobileDownloadPath());
        
        // Test QR config
        console.log('\n📱 Mobile QR Config:');
        const qrConfig = mobileSupport.getMobileQRConfig();
        if (qrConfig) {
            console.log(JSON.stringify(qrConfig, null, 2));
        } else {
            console.log('Not a mobile environment');
        }
        
        // Test session config
        console.log('\n💾 Mobile Session Config:');
        const sessionConfig = mobileSupport.getMobileSessionConfig();
        console.log(JSON.stringify(sessionConfig, null, 2));
        
        // Test optimizations
        console.log('\n⚡ Applying Mobile Optimizations...');
        mobileSupport.optimizeForMobile();
        
        // Test dependency installation (only show what would be installed)
        if (mobileSupport.isMobileEnvironment()) {
            console.log('\n📦 Mobile Dependencies Check:');
            console.log('Would install dependencies for:', mobileSupport.getMobileType());
            
            if (mobileSupport.environment.isTermux) {
                console.log('Termux packages:', mobileSupport.termuxPackages);
            }
        }
        
        console.log('\n✅ Mobile Support test completed successfully!');
        
    } catch (error) {
        console.error('❌ Mobile Support test failed:', error);
        process.exit(1);
    }
}

// Test specific mobile features
async function testMobileFeatures() {
    console.log('\n🧪 Testing Mobile Features...');
    
    const mobileSupport = new MobileSupport(mockClient);
    
    // Test environment detection methods
    console.log('\n🔍 Environment Detection Methods:');
    console.log('- isTermux():', mobileSupport.isTermux());
    console.log('- isAndroid():', mobileSupport.isAndroid());
    console.log('- isIOS():', mobileSupport.isIOS());
    console.log('- isISH():', mobileSupport.isISH());
    console.log('- isAcode():', mobileSupport.isAcode());
    
    // Test mobile QR width calculation
    console.log('\n📱 Mobile QR Width:');
    console.log('- QR Width:', mobileSupport.getMobileQRWidth());
    
    // Test Termux specific features
    if (mobileSupport.environment.isTermux) {
        console.log('\n📱 Termux Features:');
        console.log('- Storage Permission:', mobileSupport.checkTermuxStoragePermission());
        console.log('- Camera Permission:', mobileSupport.checkTermuxCameraPermission());
        console.log('- Microphone Permission:', mobileSupport.checkTermuxMicrophonePermission());
    }
}

// Run tests
async function runTests() {
    await testMobileSupport();
    await testMobileFeatures();
    
    console.log('\n🎉 All mobile support tests completed!');
}

runTests().catch(console.error);