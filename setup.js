#!/usr/bin/env node

/**
 * Setup script for Avery's Shopping Guide
 * This script helps create the initial admin user and test the deployment
 */

const readline = require('readline');
const https = require('https');
const http = require('http');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https');
        const client = isHttps ? https : http;
        
        const req = client.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function createAdminUser(baseUrl) {
    console.log('\n🔧 Creating Admin User...\n');
    
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    
    const userData = {
        username,
        email,
        password
    };
    
    try {
        const response = await makeRequest(`${baseUrl}/api/auth/setup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.status === 200) {
            console.log('✅ Admin user created successfully!');
            console.log(`Username: ${username}`);
            console.log(`Email: ${email}`);
            console.log('\nYou can now login to the admin dashboard.');
        } else {
            console.log('❌ Failed to create admin user:');
            console.log(response.data);
        }
    } catch (error) {
        console.log('❌ Error creating admin user:', error.message);
    }
}

async function testAPI(baseUrl) {
    console.log('\n🧪 Testing API...\n');
    
    try {
        // Test health endpoint
        const healthResponse = await makeRequest(`${baseUrl}/api/health`);
        console.log('Health Check:', healthResponse.status === 200 ? '✅ OK' : '❌ Failed');
        
        // Test products endpoint
        const productsResponse = await makeRequest(`${baseUrl}/api/products`);
        console.log('Products API:', productsResponse.status === 200 ? '✅ OK' : '❌ Failed');
        
        // Test top picks endpoint
        const topPicksResponse = await makeRequest(`${baseUrl}/api/products/top-picks`);
        console.log('Top Picks API:', topPicksResponse.status === 200 ? '✅ OK' : '❌ Failed');
        
    } catch (error) {
        console.log('❌ Error testing API:', error.message);
    }
}

async function main() {
    console.log('🚀 Avery\'s Shopping Guide Setup\n');
    console.log('This script will help you:');
    console.log('1. Test your API endpoints');
    console.log('2. Create an admin user');
    console.log('3. Verify your deployment\n');
    
    const baseUrl = await question('Enter your backend URL (e.g., https://your-app.onrender.com): ');
    
    if (!baseUrl) {
        console.log('❌ Please provide a valid URL');
        rl.close();
        return;
    }
    
    // Remove trailing slash
    const cleanUrl = baseUrl.replace(/\/$/, '');
    
    console.log(`\n📍 Using backend URL: ${cleanUrl}`);
    
    // Test API first
    await testAPI(cleanUrl);
    
    // Ask if user wants to create admin
    const createAdmin = await question('\nDo you want to create an admin user? (y/n): ');
    
    if (createAdmin.toLowerCase() === 'y' || createAdmin.toLowerCase() === 'yes') {
        await createAdminUser(cleanUrl);
    }
    
    console.log('\n🎉 Setup complete!');
    console.log('\nNext steps:');
    console.log(`1. Visit your main website: ${cleanUrl}`);
    console.log(`2. Visit your admin dashboard: ${cleanUrl}/admin`);
    console.log('3. Login with your admin credentials');
    console.log('4. Start adding products!');
    
    rl.close();
}

// Handle script termination
process.on('SIGINT', () => {
    console.log('\n\n👋 Setup cancelled. Goodbye!');
    rl.close();
    process.exit(0);
});

// Run the setup
main().catch(error => {
    console.error('❌ Setup failed:', error);
    rl.close();
    process.exit(1);
}); 