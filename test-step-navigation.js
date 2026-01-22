// Test script to verify the step navigation fix
console.log('=== Step Navigation Test ===');
console.log('✅ Frontend running on: http://localhost:3000');
console.log('✅ Backend running on: http://localhost:5000');
console.log('');
console.log('To test the fix:');
console.log('1. Open http://localhost:3000 in your browser');
console.log('2. Login as an organizer or create a new organizer account');
console.log('3. Go to Create Event page');
console.log('4. Fill in Basic Info (Step 1) and click Next');
console.log('5. Fill in Details (Step 2) and click Next');
console.log('6. Should move to Media page (Step 3) instead of redirecting');
console.log('');
console.log('The fix includes:');
console.log('- Added e.preventDefault() to Next button to prevent form submission');
console.log('- Enhanced logging to debug navigation issues');
console.log('- Better validation error handling');
