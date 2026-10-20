using Microsoft.EntityFrameworkCore;
using Roomify.Models;

namespace Roomify.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> opts) : base(opts) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Listing> Listings { get; set; } = null!;
        public DbSet<Room> Rooms { get; set; } = null!;
        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<BlockedRange> BlockedRanges { get; set; } = null!;
        public DbSet<ListingImage> Images { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<Listing>()
                .HasOne(l => l.Host)
                .WithMany()
                .HasForeignKey(l => l.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Room>()
                .HasOne(r => r.Listing)
                .WithMany()
                .HasForeignKey(r => r.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BlockedRange>()
                .HasOne(b => b.Listing)
                .WithMany()
                .HasForeignKey(b => b.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BlockedRange>()
                .HasOne(b => b.Room)
                .WithMany()
                .HasForeignKey(b => b.RoomId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Listing)
                .WithMany()
                .HasForeignKey(b => b.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Guest)
                .WithMany()
                .HasForeignKey(b => b.GuestId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ListingImage>()
                .HasOne(img => img.Listing)
                .WithMany(l => l.Images)
                .HasForeignKey(img => img.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            // Make sure Listings have index on City and Price
            modelBuilder.Entity<Listing>().HasIndex(l => l.City);
            modelBuilder.Entity<Listing>().HasIndex(l => l.PricePerNight);
        }
    }
}
