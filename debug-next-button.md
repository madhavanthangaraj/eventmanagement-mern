# Debug Next Button Issue

## Steps to Debug:

1. **Open Browser Console** (F12 → Console tab)

2. **Fill out Step 0 fields:**
   - Event Name: "Test Event"
   - Category: Select "TECHNICAL"
   - Description: "Test description"
   - Institution: "Test College"
   - Start Date: Pick tomorrow's date
   - End Date: Pick day after tomorrow
   - Registration Deadline: Pick today
   - Eligibility: Select at least one department

3. **Click Next Button** and check console for:
   - "handleNext called, activeStep: 0"
   - "Current formData: {...}"
   - "Validating step: 0"
   - "Validation errors: {}" (should be empty object)
   - "Validation result: true"
   - "Setting activeStep from 0 to 1"

4. **Common Issues:**
   - **Date validation failing**: Make sure dates are selected correctly
   - **Empty fields**: All required fields must be filled
   - **Eligibility not selected**: Must select at least one department
   - **Category mismatch**: Should be one of the predefined categories

## Recent Fixes Applied:
✅ Fixed onChange handlers for all input fields
✅ Added debugging logs to track validation
✅ Fixed date validation logic
✅ Updated EVENT_CATEGORIES to match backend

## If Still Not Working:
Check console for specific error messages and share them for further debugging.
