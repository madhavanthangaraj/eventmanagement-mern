// Simple test without database first
console.log('Testing role string comparison...');

const testRole = 'ORGANIZER';
const testRoles = ['ORGANIZER', 'ADMIN'];

console.log('Test role:', testRole);
console.log('Test roles:', testRoles);
console.log('Includes test:', testRoles.includes(testRole));
console.log('String length:', testRole.length);
console.log('Char codes:', [...testRole].map(c => c.charCodeAt(0)));

// Test the actual comparison logic
const userRole = 'ORGANIZER'; // Simulating what comes from DB
console.log('User role from DB:', userRole);
console.log('Comparison result:', testRoles.includes(userRole));
