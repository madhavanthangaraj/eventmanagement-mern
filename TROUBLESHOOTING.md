# Organizer Dashboard API Troubleshooting Guide

## Issue: "Failed to fetch organizer dashboard data"

### Common Causes and Solutions:

### 1. Backend Server Not Running
**Symptoms**: Network error, connection refused
**Solution**:
```bash
cd Backend
npm start
```

### 2. MongoDB Not Running
**Symptoms**: Server starts but database connection fails
**Solution**:
- Make sure MongoDB is installed and running
- Check if MongoDB service is active: `mongod`
- Verify connection string in `.env` file

### 3. Authentication Issues
**Symptoms**: 401 Unauthorized error
**Solutions**:
- Check if user is logged in with valid token
- Verify token format in Authorization header
- Ensure user role is 'ORGANIZER'

### 4. CORS Issues
**Symptoms**: CORS policy errors in browser console
**Solution**: Verify CORS configuration in `server.js` includes your frontend URL

### 5. Database Collection Issues
**Symptoms**: 500 Internal Server Error
**Solutions**:
- Check if Event and Registration collections exist
- Verify database indexes are properly created

## Debugging Steps:

### Step 1: Check Server Health
```bash
curl http://localhost:5000/api/health
```
Expected: `{"success": true, "message": "Server is running"}`

### Step 2: Test Authentication
1. Login as an organizer user
2. Check browser's Network tab for the dashboard API call
3. Verify Authorization header contains valid Bearer token

### Step 3: Check Database Connection
Look for these messages in server console:
- `Connected to MongoDB` ✅
- `MongoDB connection error` ❌

### Step 4: Test API Directly
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/organizer/dashboard
```

## Frontend Fallback
The dashboard now includes a fallback to localStorage if the API fails, so it should still display data even when the backend is unavailable.

## Common Error Messages:

### "Not authorized to access this route"
- User is not logged in
- Token is expired or invalid
- User role is not 'ORGANIZER'

### "User not found"
- Token references a user that doesn't exist in database
- User was deleted after token was issued

### "Account is not active"
- User status is not 'ACTIVE'
- Contact admin to activate account

## Quick Fix Checklist:
- [ ] Backend server is running on port 5000
- [ ] MongoDB is running and accessible
- [ ] User is logged in as ORGANIZER
- [ ] Token is valid and not expired
- [ ] CORS is properly configured
- [ ] Database collections exist

## Development Tips:
1. Always check browser console for detailed error messages
2. Use the Network tab in browser dev tools to inspect API requests
3. Check server console for backend error logs
4. Test with Postman or curl for API debugging
