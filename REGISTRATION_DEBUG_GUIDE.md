# Registration Debug Guide

## Issue
Registration is not saving users to the database.

## Debugging Steps Added

### 1. Enhanced Logging
- **AuthController**: Added detailed console logging for registration requests
- **AuthService**: Added validation and error handling with detailed messages
- **Frontend**: Added console logging to track API calls

### 2. Database Connection Test Endpoint
Added `/api/auth/test-db` endpoint to verify database connectivity.

**Test it:**
```bash
curl http://localhost:5120/api/auth/test-db
```

### 3. Enhanced Error Handling
- Better error messages that show actual error details
- Database errors are now caught and reported properly
- Frontend shows actual error messages from backend

## How to Debug

### Step 1: Check Console Logs
When you try to register, check:
1. **Browser Console** (F12 → Console tab):
   - Should see: "API Service loaded and ready"
   - Should see: "Calling api.register with: {name, email, phone, country}"
   - Should see: "Registration response: {...}"

2. **Backend Console** (where you ran `dotnet run`):
   - Should see: `[REGISTER] Received request - Email: ...`
   - Should see: `[REGISTER] Calling RegisterAsync service...`
   - Should see: `[REGISTER] Success - UserId: X, Email: ...`

### Step 2: Test Database Connection
Visit: `http://localhost:5120/api/auth/test-db`

Should return: `{"message":"Database connection successful","userCount":X}`

### Step 3: Check Database Migration
The migration should be applied automatically on startup. Check backend console for:
- Migration messages
- Any database errors

If migration fails, you'll see errors in the console.

### Step 4: Verify Database Schema
Check if the Users table has Phone and Country columns:

```sql
-- In SQL Server Management Studio or Azure Data Studio
USE RoomifyDb;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users';
```

Should see:
- Phone (nvarchar(50), nullable)
- Country (nvarchar(100), nullable)

## Common Issues and Fixes

### Issue 1: Migration Not Applied
**Symptom**: Database error about missing columns

**Fix**: 
1. Stop the application
2. Run: `dotnet ef database update`
3. Restart application

### Issue 2: Database Connection Failed
**Symptom**: Connection timeout or authentication error

**Fix**: 
1. Check `appsettings.json` connection string
2. Verify SQL Server is running
3. Check database exists: `RoomifyDb`

### Issue 3: API Not Being Called
**Symptom**: No network requests in browser DevTools → Network tab

**Fix**:
1. Check browser console for errors
2. Verify `api.js` is loaded (check Network tab)
3. Check if `api` object exists: type `api` in browser console

### Issue 4: CORS Error
**Symptom**: CORS error in browser console

**Fix**: Already configured in `Program.cs` with `AllowAll` policy

## Testing Registration Flow

1. **Open Browser DevTools** (F12)
2. **Go to Network tab** - filter by "register"
3. **Fill registration form**:
   - Name: Test User
   - Email: test@example.com
   - Password: Test1234!
   - Phone: +1234567890
   - Country: US
4. **Submit form**
5. **Check Network tab**:
   - Should see POST request to `/api/auth/register`
   - Status should be 200 (not 500)
   - Response should contain token and user data
6. **Check Console tab**:
   - Should see success logs
   - No errors
7. **Verify in Database**:
   ```sql
   SELECT * FROM Users WHERE Email = 'test@example.com';
   ```
   Should return the new user with Phone and Country populated.

## Files Modified

- `Roomify/Controllers/AuthController.cs` - Added logging and test endpoint
- `Roomify/Services/Implementations/AuthService.cs` - Enhanced validation and error handling
- `Roomify/wwwroot/Roomify-Frontend/js/api.js` - Made api globally available
- `Roomify/wwwroot/Roomify-Frontend/Roomify-login/script.js` - Added debugging logs
- `Roomify/Program.cs` - Enabled detailed database logging

## Next Steps

1. **Restart the application** to apply changes
2. **Open browser DevTools** before testing
3. **Try registration** and check both browser and backend console logs
4. **Share the logs** if issue persists - they will show exactly where it's failing

