const testEventCreation = async () => {
  try {
    console.log('=== Testing Event Creation ===');
    
    // First, register an organizer user
    console.log('1. Registering organizer user...');
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Organizer',
        email: 'testorganizer2@college.edu',
        password: 'Organizer@2026',
        role: 'ORGANIZER',
        department: 'CSE',
        year: 'N/A'
      }),
    });

    let loginData;
    if (registerResponse.ok) {
      console.log('✓ Organizer registered successfully');
      const registerData = await registerResponse.json();
      loginData = registerData;
    } else {
      console.log('Organizer might already exist, trying to login...');
      // Try to login if registration failed (user might already exist)
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testorganizer2@college.edu',
          password: 'Organizer@2026'
        }),
      });

      if (!loginResponse.ok) {
        console.log('❌ Login failed. Status:', loginResponse.status);
        const loginError = await loginResponse.text();
        console.log('Error:', loginError);
        return;
      }

      loginData = await loginResponse.json();
      console.log('✓ Login successful');
    }

    const token = loginData.token;
    console.log('✓ Token received');

    // Test creating an event
    console.log('2. Creating event...');
    const eventData = {
      eventName: 'Test External Event',
      category: 'TECHNICAL',
      description: 'This is a test external event for debugging',
      institution: 'Test College',
      startDate: '2024-02-01',
      endDate: '2024-02-02',
      registrationDeadline: '2024-01-30',
      date: '2024-02-01',
      time: '09:00',
      eligibility: ['CSE', 'IT'],
      registrationLink: 'https://example.com/register',
      mode: 'ONLINE',
      venue: 'Online Platform',
      maxParticipants: 50,
      creditPoints: 2,
      websiteLink: 'https://example.com',
      isExternal: true,
      status: 'PENDING'
    };

    console.log('Event data being sent:', JSON.stringify(eventData, null, 2));

    const createResponse = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    console.log('3. Checking response...');
    console.log('Status:', createResponse.status);
    console.log('OK:', createResponse.ok);
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Event created successfully!');
      console.log('Event ID:', result.data._id);
      console.log('Event Name:', result.data.eventName);
      console.log('Status:', result.data.status);
    } else {
      const error = await createResponse.text();
      console.log('❌ Error creating event:');
      console.log('Status:', createResponse.status);
      console.log('Response:', error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

testEventCreation();
