// test-login.js
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testSuperAdminAccess() {
    try {
        // Step 1: Login as superadmin
        console.log('Logging in as superadmin...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'superadmin@gmail.com',
            password: 'Super@2026'
        });

        const { token } = loginResponse.data;
        console.log('Login successful! Token:', token);
        
        if (!token) {
            throw new Error('No token received from login');
        }
        
        // Step 2: Use the token to access the dashboard stats
        console.log('\nFetching dashboard stats...');
        const statsResponse = await axios.get(`${API_URL}/superadmin/dashboard-stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('\nDashboard Stats:');
        console.log(JSON.stringify(statsResponse.data, null, 2));
        
    } catch (error) {
        console.error('\nError:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            if (error.response.data && error.response.data.error) {
                console.error('Error details:', error.response.data.error);
            }
        }
    }
}

testSuperAdminAccess();