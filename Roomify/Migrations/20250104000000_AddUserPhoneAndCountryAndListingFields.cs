using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Roomify.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPhoneAndCountryAndListingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add User columns
            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            // Add Listing columns
            migrationBuilder.AddColumn<int>(
                name: "MaxGuests",
                table: "Listings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CheckInTime",
                table: "Listings",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CheckOutTime",
                table: "Listings",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AmenitiesJson",
                table: "Listings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PropertyTypesJson",
                table: "Listings",
                type: "nvarchar(max)",
                nullable: true);

            // Add Booking columns
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Bookings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "HoldExpiresAt",
                table: "Bookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentRef",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove Booking columns
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "HoldExpiresAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PaymentRef",
                table: "Bookings");

            // Remove Listing columns
            migrationBuilder.DropColumn(
                name: "MaxGuests",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "CheckInTime",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "CheckOutTime",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "AmenitiesJson",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "PropertyTypesJson",
                table: "Listings");

            // Remove User columns
            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Users");
        }
    }
}

