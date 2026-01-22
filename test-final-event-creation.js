const testFinalEventCreation = async () => {
  try {
    console.log('=== Final Event Creation Test ===');
    
    // Use a completely new email to avoid conflicts
    const organizerEmail = `testorg${Date.now()}@college.edu`;
    console.log('1. Registering new organizer user with email:', organizerEmail);
    
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Organizer',
        email: organizerEmail,
        password: 'Organizer@2026',
        role: 'ORGANIZER',
        department: 'CSE',
        year: 'N/A'
      }),
    });

    let token;
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✓ Organizer registered successfully');
      console.log('Registration response:', JSON.stringify(registerData, null, 2));
      
      // Use token from registration if available
      token = registerData.token;
      if (!token) {
        console.log('No token in registration response, trying login...');
        // Try login if no token in registration
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: organizerEmail,
            password: 'Organizer@2026'
          }),
        });

        if (!loginResponse.ok) {
          console.log('❌ Login failed. Status:', loginResponse.status);
          const loginError = await loginResponse.text();
          console.log('Error:', loginError);
          return;
        }

        const loginData = await loginResponse.json();
        token = loginData.token;
        console.log('✓ Login successful');
      }
    } else {
      console.log('❌ Registration failed. Status:', registerResponse.status);
      const registerError = await registerResponse.text();
      console.log('Error:', registerError);
      return;
    }

    console.log('✓ Token received:', token ? 'YES' : 'NO');

    // Test creating an event
    console.log('2. Creating event...');
    const eventData = {
      eventName: 'Test External Event - Final',
      category: 'TECHNICAL',
      description: 'This is a final test external event',
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

    console.log('Event data being sent...');

    const createResponse = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    console.log('3. Checking event creation response...');
    console.log('Status:', createResponse.status);
    console.log('OK:', createResponse.ok);
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('🎉 SUCCESS! Event created successfully!');
      console.log('Event ID:', result.data._id);
      console.log('Event Name:', result.data.eventName);
      console.log('Status:', result.data.status);
      console.log('Organizer:', result.data.organizerEmail);
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

testFinalEventCreation();
