#!/usr/bin/env node

/**
 * Simple script to check the IP address being used for outbound connections
 */

const https = require('https');

console.log('🔍 Checking IP address...\n');

// Method 1: Check using ipify API
https.get('https://api.ipify.org?format=json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('✅ Your server\'s public IP address:');
            console.log(`   ${result.ip}`);
            console.log('\n📝 Add this IP to MongoDB Atlas Network Access:');
            console.log(`   ${result.ip}/32`);
        } catch (e) {
            console.log('❌ Could not parse IP response');
        }
    });
}).on('error', (err) => {
    console.log('❌ Error getting IP:', err.message);
});

// Method 2: Check using ipinfo API
https.get('https://ipinfo.io/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('\n🌍 IP Information:');
            console.log(`   IP: ${result.ip}`);
            console.log(`   Location: ${result.city}, ${result.region}, ${result.country}`);
            console.log(`   ISP: ${result.org}`);
        } catch (e) {
            // Ignore parsing errors
        }
    });
}).on('error', (err) => {
    // Ignore errors
}); 