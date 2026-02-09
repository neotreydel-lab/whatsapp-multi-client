#!/usr/bin/env node

/**
 * Simple test to verify the support website is working
 */

import http from 'http';

const PORT = 3001;
const HOST = 'localhost';

function testEndpoint(path, expectedStatus = 200) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === expectedStatus) {
                    console.log(`✅ ${path} - Status: ${res.statusCode}`);
                    resolve({ status: res.statusCode, data });
                } else {
                    console.log(`❌ ${path} - Expected: ${expectedStatus}, Got: ${res.statusCode}`);
                    reject(new Error(`Unexpected status code: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.log(`❌ ${path} - Error: ${err.message}`);
            reject(err);
        });

        req.setTimeout(5000, () => {
            console.log(`❌ ${path} - Timeout`);
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing WAEngine Support Website...\n');
    
    try {
        // Test main page
        await testEndpoint('/');
        
        // Test CSS
        await testEndpoint('/css/style-clean.css');
        
        // Test JavaScript
        await testEndpoint('/js/main.js');
        
        // Test API endpoints
        await testEndpoint('/api/tickets');
        await testEndpoint('/api/users');
        await testEndpoint('/api/stats');
        
        console.log('\n🎉 All tests passed! Website is working correctly.');
        console.log(`🌐 Visit: http://${HOST}:${PORT}/`);
        console.log(`🔧 Admin: http://${HOST}:${PORT}/#admin (admin/waengine2024)`);
        
    } catch (error) {
        console.log('\n❌ Some tests failed:', error.message);
        process.exit(1);
    }
}

runTests();