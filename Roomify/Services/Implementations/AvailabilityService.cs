using Microsoft.EntityFrameworkCore;
using Roomify.Data;
using Roomify.DTOs.Blocked;
using Roomify.Models;
using Roomify.Services.Interfaces;

namespace Roomify.Services.Implementations
{
    public class AvailabilityService : IAvailabilityService
    {
        private readonly ApplicationDbContext _db;

        public AvailabilityService(ApplicationDbContext db)
        {
            _db = db;
        }

        // returns all blocked ranges (including holds) overlapping the requested span
        public async Task<IEnumerable<BlockedRangeDto>> GetAvailabilityAsync(int listingId, DateTime from, DateTime to)
        {
            var blocks = await _db.BlockedRanges
                .Where(b => b.ListingId == listingId && !(b.EndDate <= from || b.StartDate >= to))
                .ToListAsync();

            return blocks.Select(b => new BlockedRangeDto
            {
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                IsHold = b.IsHold
            });
        }

        public async Task<bool> IsAvailableAsync(int listingId, DateTime start, DateTime end)
        {
            // available if no blocked range overlaps
            var overlapping = await _db.BlockedRanges.AnyAsync(b =>
                b.ListingId == listingId && !(b.EndDate <= start || b.StartDate >= end));
            return !overlapping;
        }

        public async Task ReserveHoldAsync(int bookingId, int listingId, DateTime start, DateTime end, TimeSpan holdDuration)
        {
            // use Serializable transaction to avoid race conditions (simple approach)
            await using var tx = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            // re-check availability in transaction
            var conflict = await _db.BlockedRanges.AnyAsync(b =>
                b.ListingId == listingId && !(b.EndDate <= start || b.StartDate >= end));
            if (conflict)
            {
                throw new ApplicationException("Listing not available for the requested dates.");
            }

            var blocked = new BlockedRange
            {
                ListingId = listingId,
                StartDate = start,
                EndDate = end,
                IsHold = true,
                BookingId = bookingId
            };
            _db.BlockedRanges.Add(blocked);

            // set hold expiry will be stored in Booking.HoldExpiresAt by caller
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
        }

        public async Task ReleaseHoldAsync(int bookingId)
        {
            var holds = await _db.BlockedRanges
                .Where(b => b.BookingId == bookingId && b.IsHold)
                .ToListAsync();

            if (!holds.Any()) return;

            _db.BlockedRanges.RemoveRange(holds);
            await _db.SaveChangesAsync();
        }
    }
}
