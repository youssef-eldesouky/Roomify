# Fix for HTTP 500 Error on Login/Register

## Problem
Getting HTTP 500 error when trying to login or register. This is caused by the database schema not matching the updated model (missing Phone and Country columns in Users table, and missing new Listing fields).

## Solution

### Option 1: Restart the Application (Recommended)
The migration will be applied automatically on startup since `Program.cs` has `db.Database.Migrate()`.

**Steps:**
1. Stop the running application (if it's running)
2. Restart it with `dotnet run`
3. The migration will be applied automatically
4. Try login/register again

### Option 2: Apply Migration Manually
If the automatic migration doesn't work, apply it manually:

```bash
cd Roomify
dotnet ef database update
```

## What Was Fixed

1. **Created Migration File**: `20250104000000_AddUserPhoneAndCountryAndListingFields.cs`
   - Adds `Phone` and `Country` columns to Users table
   - Adds `MaxGuests`, `CheckInTime`, `CheckOutTime`, `AmenitiesJson`, `PropertyTypesJson` to Listings table

2. **Updated Error Handling**: 
   - AuthController now catches all exceptions, not just ApplicationException
   - Returns proper error messages instead of generic 500 errors
   - Logs errors to console for debugging

3. **Fixed RefreshToken Response**: 
   - RefreshTokenAsync now returns all user fields (FullName, Phone, Country, Role)

## Testing

After restarting the application:

1. **Try Registration:**
   - Go to login page
   - Click "Register" tab
   - Fill in: Name, Email, Password (8+ chars), Phone, Country
   - Submit
   - Should succeed and redirect to home page

2. **Try Login:**
   - Use the email/password you just registered
   - Should succeed and redirect to home page

## If Still Getting Errors

Check the console output for detailed error messages. Common issues:

1. **Database Connection**: Make sure SQL Server is running and connection string is correct
2. **Migration Failed**: Check if migration was applied - look for migration errors in console
3. **Null Values**: Make sure all required fields are provided

## Files Modified

- `Roomify/Controllers/AuthController.cs` - Improved error handling
- `Roomify/Services/Implementations/AuthService.cs` - Fixed RefreshToken response
- `Roomify/Migrations/20250104000000_AddUserPhoneAndCountryAndListingFields.cs` - NEW migration file
- `Roomify/Migrations/ApplicationDbContextModelSnapshot.cs` - Updated to reflect new model

