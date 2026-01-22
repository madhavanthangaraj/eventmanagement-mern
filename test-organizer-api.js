const fetch = require('node-fetch');

async function testOrganizerAPI() {
    try {
        console.log('Testing organizer dashboard API...');
        
        // Test with a sample token (you'll need to replace this with a real token)
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDJhZjFmYzEzZmQzMGU5ZmRkM2Y2Iiwicm9sZSI6Ik9SR0FOSVpFUiIsImRlcGFydG1lbnQiOiJDU0UiLCJpYXQiOjE3MzIyNTY1NzksImV4cCI6MTczMjg2MDk3OX0.sample';
        
        const response = await fetch('http://localhost:5000/api/organizer/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${testToken}`,
                'Content-Type': 'application/json',
            },
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.raw());
        
        const text = await response.text();
        console.log('Response body:', text);
        
        if (response.ok) {
            const data = JSON.parse(text);
            console.log('Success! Data:', data);
        } else {
            console.error('API call failed with status:', response.status);
        }
        
    } catch (error) {
        console.error('Error testing API:', error.message);
    }
}

testOrganizerAPI();
