# Debug Authorization Issue

## Problem:
User role ORGANIZER is not authorized to access /api/events route

## Recent Fixes Applied:
✅ Fixed normalizeRole to keep uppercase format
✅ Updated super admin role to SUPER_ADMIN  
✅ Added debugging to frontend createEvent function
✅ Added debugging to backend authorization middleware

## To Debug:

1. **Check Browser Console** for these logs:
   - "Creating event with user role: [ROLE]"
   - "User token: exists/missing"  
   - "Response status: 403"
   - "Error response: {...}"

2. **Check Backend Console** for these logs:
   - "Authorization check - User role: [ROLE]"
   - "Authorization check - Required roles: [ORGANIZER, ADMIN]"
   - "Authorization check - Includes role: true/false"

## Expected Behavior:
- Frontend should send role as "ORGANIZER" (uppercase)
- Backend should receive role as "ORGANIZER" 
- Authorization should pass since ORGANIZER is in allowed roles

## If Still Failing:
The issue might be:
1. User not logged in properly (token missing)
2. Role being converted to lowercase somewhere
3. Backend not restarted with new debugging code

## Next Steps:
1. Try logging out and logging back in
2. Check browser console for role format
3. Check backend console for authorization logs
