const testWithSuperAdmin = async () => {
  try {
    console.log('=== Test with Super Admin ===');
    
    // 1. Login as super admin
    console.log('1. Logging in as super admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@gmail.com',
        password: 'Super@2026'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Super admin login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const superAdminToken = loginData.token;
    console.log('✓ Super admin login successful');

    // 2. Create an organizer user
    console.log('2. Creating organizer user...');
    const organizerEmail = `testorg${Date.now()}@college.edu`;
    const createOrgResponse = await fetch('http://localhost:5000/api/auth/register', {
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

    if (!createOrgResponse.ok) {
      console.log('❌ Failed to create organizer');
      return;
    }

    const orgData = await createOrgResponse.json();
    console.log('✓ Organizer created:', orgData.data.email);

    // 3. Approve the organizer using super admin
    console.log('3. Approving organizer...');
    const approveResponse = await fetch(`http://localhost:5000/api/superadmin/approve-user/${orgData.data._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
    });

    if (!approveResponse.ok) {
      console.log('❌ Failed to approve organizer');
      console.log('Status:', approveResponse.status);
      const error = await approveResponse.text();
      console.log('Error:', error);
      return;
    }

    console.log('✓ Organizer approved');

    // 4. Login as the organizer
    console.log('4. Logging in as organizer...');
    const orgLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: organizerEmail,
        password: 'Organizer@2026'
      }),
    });

    if (!orgLoginResponse.ok) {
      console.log('❌ Organizer login failed');
      console.log('Status:', orgLoginResponse.status);
      const error = await orgLoginResponse.text();
      console.log('Error:', error);
      return;
    }

    const orgLoginData = await orgLoginResponse.json();
    const organizerToken = orgLoginData.token;
    console.log('✓ Organizer login successful');

    // 5. Create an event
    console.log('5. Creating event...');
    const eventData = {
      eventName: 'Test Event via Super Admin',
      category: 'TECHNICAL',
      description: 'This event was created after proper approval',
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

    const createEventResponse = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${organizerToken}`,
      },
      body: JSON.stringify(eventData),
    });

    console.log('6. Checking event creation response...');
    console.log('Status:', createEventResponse.status);
    console.log('OK:', createEventResponse.ok);
    
    if (createEventResponse.ok) {
      const result = await createEventResponse.json();
      console.log('🎉 SUCCESS! Event created successfully!');
      console.log('Event ID:', result.data._id);
      console.log('Event Name:', result.data.eventName);
      console.log('Status:', result.data.status);
      console.log('Organizer:', result.data.organizerEmail);
    } else {
      const error = await createEventResponse.text();
      console.log('❌ Error creating event:');
      console.log('Status:', createEventResponse.status);
      console.log('Response:', error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

testWithSuperAdmin();
