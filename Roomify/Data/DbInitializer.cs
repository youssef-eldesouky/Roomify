using Microsoft.EntityFrameworkCore;
using Roomify.Models;
using Roomify.Utilities;

namespace Roomify.Data
{
    public static class DbInitializer
    {
        public static async Task EnsureSeedDataAsync(ApplicationDbContext db, IServiceProvider services)
        {
            // Simple seeded data: create admin/host user and a sample listing
            if (!await db.Users.AnyAsync())
            {
                // Resolve password hasher from services
                var hasher = services.GetService<IPasswordHasher>() ?? new PasswordHasher();

                var host = new User
                {
                    FullName = "Demo Host",
                    Email = "host@roomify.local",
                    PasswordHash = hasher.Hash("Password123!"),
                    Role = "Host"
                };
                db.Users.Add(host);
                await db.SaveChangesAsync();

                var listing = new Listing
                {
                    Title = "Cozy Cairo Apartment",
                    Description = "A small but cozy apartment near downtown.",
                    City = "Cairo",
                    PricePerNight = 25.5m,
                    HostId = host.Id
                };
                db.Listings.Add(listing);
                await db.SaveChangesAsync();
            }
        }
    }
}
