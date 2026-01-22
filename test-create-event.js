const testCreateEvent = async () => {
  try {
    // First, login as an organizer to get token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'organizer@college.edu', // You may need to create this user first
        password: 'Organizer@2026'
      }),
    });

    if (!loginResponse.ok) {
      console.log('Login failed. You may need to create an organizer user first.');
      console.log('Status:', loginResponse.status);
      const loginError = await loginResponse.text();
      console.log('Error:', loginError);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Login successful, token received');

    // Test creating an event
    const eventData = {
      eventName: 'Test External Event',
      category: 'Technical',
      description: 'This is a test external event',
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

    const createResponse = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    console.log('Create event response status:', createResponse.status);
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('Event created successfully:', result);
    } else {
      const error = await createResponse.json();
      console.log('Error creating event:', error);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testCreateEvent();
