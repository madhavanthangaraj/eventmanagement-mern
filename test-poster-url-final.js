async function testPosterUrlStorage() {
    try {
        console.log('Testing poster URL storage...');
        
        const testData = {
            eventName: 'Test Event with Poster URL',
            category: 'Technical',
            description: 'This is a test event for poster URL storage',
            institution: 'Test College',
            startDate: '2026-02-01',
            endDate: '2026-02-02',
            eligibility: ['CSE', 'EEE'],
            registrationLink: 'https://example.com/register',
            mode: 'ONLINE',
            venue: 'Test Venue',
            maxParticipants: 100,
            creditPoints: 5,
            websiteLink: 'https://example.com',
            posterUrl: 'https://drive.google.com/uc?id=test123', // Test poster URL
            isCollegeEvent: false
        };

        // Simple HTTP request without using fetch
        const http = require('http');
        
        const response = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/events',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer fake-token-for-testing'
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk.toString();
                });

                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log('Response status:', res.statusCode);
                        console.log('Response data:', jsonData);
                        
                        if (res.statusCode === 201) {
                            console.log('✅ SUCCESS: Event created successfully');
                            console.log('Event ID:', jsonData.data?._id);
                            console.log('Poster URL:', jsonData.data?.posterUrl);
                            resolve(jsonData);
                        } else {
                            console.log('❌ FAILED: Failed to create event');
                            console.log('Error:', jsonData);
                            reject(new Error(`HTTP ${res.statusCode}: ${jsonData.message || 'Unknown error'}`));
                        }
                    } catch (parseError) {
                        console.log('❌ ERROR: Invalid JSON response');
                        reject(new Error(`Parse error: ${parseError.message}`));
                    }
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.write(JSON.stringify(testData));
            req.end();
        });

        const result = await response;
        console.log('Test completed:', result);
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
}

testPosterUrlStorage();
