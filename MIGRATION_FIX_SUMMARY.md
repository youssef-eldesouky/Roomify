# Database Migration Fix Summary

## Problem Identified
The database schema was missing several columns that the code expects:
1. **Users table**: Missing `Phone` and `Country` columns
2. **Listings table**: Missing `MaxGuests`, `CheckInTime`, `CheckOutTime`, `AmenitiesJson`, `PropertyTypesJson`
3. **Bookings table**: Missing `Status`, `HoldExpiresAt`, `PaymentRef` columns

## Solution Implemented

### 1. Updated Migration File
**File**: `Roomify/Migrations/20250104000000_AddUserPhoneAndCountryAndListingFields.cs`

**Added columns:**
- **Users**: `Phone` (nvarchar(50), nullable), `Country` (nvarchar(100), nullable)
- **Listings**: `MaxGuests` (int, default 0), `CheckInTime` (nvarchar(10)), `CheckOutTime` (nvarchar(10)), `AmenitiesJson` (nvarchar(max)), `PropertyTypesJson` (nvarchar(max))
- **Bookings**: `Status` (int, default 0), `HoldExpiresAt` (datetime2, nullable), `PaymentRef` (nvarchar(max), nullable)

### 2. Model Snapshot Already Updated
The `ApplicationDbContextModelSnapshot.cs` already contains all the new fields, so it's in sync.

## How to Apply the Migration

### Step 1: Stop the Running Application
**IMPORTANT**: The application must be stopped before applying migrations, otherwise you'll get file lock errors.

1. Stop the application (Ctrl+C in the terminal where it's running)
2. Or close Visual Studio/VS Code if running from there

### Step 2: Apply the Migration
Open PowerShell or Command Prompt in the project root and run:

```powershell
cd Roomify
dotnet ef database update
```

**Expected output:**
```
Applying migration '20250104000000_AddUserPhoneAndCountryAndListingFields'.
Done.
```

### Step 3: Verify Migration Applied
You can verify by checking the database:

```sql
-- Check Users table
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users' AND COLUMN_NAME IN ('Phone', 'Country');

-- Check Listings table
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Listings' 
AND COLUMN_NAME IN ('MaxGuests', 'CheckInTime', 'CheckOutTime', 'AmenitiesJson', 'PropertyTypesJson');

-- Check Bookings table
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Bookings' 
AND COLUMN_NAME IN ('Status', 'HoldExpiresAt', 'PaymentRef');
```

### Step 4: Restart the Application
```powershell
dotnet run
```

The application will:
- Verify database connection
- Log migration status (should show "Database migrations applied successfully")
- Start normally

## Testing Registration

After applying the migration:

1. **Open browser** and navigate to the login page
2. **Open DevTools** (F12) → Console tab
3. **Fill registration form**:
   - Name: Test User
   - Email: test@example.com
   - Password: Test1234!
   - Phone: +1234567890
   - Country: US
4. **Submit** and check:
   - Browser console should show success
   - Backend console should show: `[REGISTER] Success - UserId: X`
   - No database errors

## Troubleshooting

### Error: "Migration already applied"
If you see this, the migration was already applied. Check the database to verify columns exist.

### Error: "File locked"
- Make sure the application is completely stopped
- Check Task Manager for any `Roomify.exe` processes and kill them
- Try again

### Error: "Connection failed"
- Verify SQL Server is running
- Check `appsettings.json` connection string
- Ensure database `RoomifyDb` exists

### Error: "Invalid column name" after migration
- The migration might not have applied correctly
- Check migration history: `SELECT * FROM __EFMigrationsHistory`
- If migration is listed but columns don't exist, you may need to manually add them or drop/recreate the database (development only!)

## Files Modified

1. ✅ `Roomify/Migrations/20250104000000_AddUserPhoneAndCountryAndListingFields.cs` - Added Booking columns
2. ✅ `Roomify/Migrations/ApplicationDbContextModelSnapshot.cs` - Already updated (no changes needed)

## Next Steps

After successful migration:
1. ✅ Registration should work
2. ✅ Login should work  
3. ✅ HoldExpiryService should work (no more Status/HoldExpiresAt errors)
4. ✅ Listing creation should work with all new fields

## Verification Commands

**Test database connection:**
```bash
curl http://localhost:5120/api/auth/test-db
```

**Verify user was saved:**
```bash
curl http://localhost:5120/api/auth/verify-user/test@example.com
```

