const fetch = require('node-fetch');

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

        const response = await fetch('http://localhost:5000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fake-token-for-testing'
            },
            body: JSON.stringify(testData)
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            console.log('✅ SUCCESS: Event created successfully');
            console.log('Event ID:', data.data?._id);
            console.log('Poster URL:', data.data?.posterUrl);
        } else {
            console.log('❌ FAILED: Failed to create event');
            console.log('Error:', data);
        }
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
}

testPosterUrlStorage();
