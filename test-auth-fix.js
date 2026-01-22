// Test to identify the exact authorization issue
const testAuth = async () => {
  try {
    // Test with a direct curl-like request to see what's happening
    const response = await fetch('http://localhost:5000/api/organizer/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
      },
    });

    console.log('Test response status:', response.status);
    console.log('Test response headers:', response.headers);
    
    const data = await response.json();
    console.log('Test response data:', data);
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Instructions:
// 1. Get your actual token from browser localStorage
// 2. Replace YOUR_TOKEN_HERE with the actual token
// 3. Run this test to see what authorization is doing

console.log('Run: testAuth() with your actual token');
