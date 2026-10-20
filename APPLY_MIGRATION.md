# Quick Guide: Apply Database Migration

## ⚠️ IMPORTANT: Stop the Application First!

Before applying the migration, you **MUST** stop the running application, otherwise you'll get file lock errors.

## Steps to Fix

### 1. Stop the Application
- Press `Ctrl+C` in the terminal where the app is running
- OR close Visual Studio/VS Code if running from there
- Verify it's stopped (no process using port 5120 or 7044)

### 2. Apply Migration
Open PowerShell in the project root and run:

```powershell
cd Roomify
dotnet ef database update
```

**Expected Output:**
```
Build started...
Build succeeded.
Applying migration '20250104000000_AddUserPhoneAndCountryAndListingFields'.
Done.
```

### 3. Restart Application
```powershell
dotnet run
```

### 4. Test Registration
1. Open browser → Login page
2. Fill registration form
3. Submit
4. Should work! ✅

## What This Migration Adds

✅ **Users table**: `Phone`, `Country` columns  
✅ **Listings table**: `MaxGuests`, `CheckInTime`, `CheckOutTime`, `AmenitiesJson`, `PropertyTypesJson`  
✅ **Bookings table**: `Status`, `HoldExpiresAt`, `PaymentRef`

## If You Get Errors

**"File locked" error:**
- Make sure app is completely stopped
- Check Task Manager for `Roomify.exe` processes
- Kill any remaining processes

**"Migration already applied":**
- Good! Migration is done
- Just restart the app

**"Connection failed":**
- Check SQL Server is running
- Verify connection string in `appsettings.json`

## Verification

After migration, check backend console on startup:
```
Database migrations applied successfully.
Database connection verified. Current user count: X
```

No more "Invalid column name" errors! 🎉

