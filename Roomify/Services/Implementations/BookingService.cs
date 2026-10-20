using Microsoft.EntityFrameworkCore;
using Roomify.Data;
using Roomify.DTOs.Bookings;
using Roomify.Models;
using Roomify.Services.Interfaces;

namespace Roomify.Services.Implementations
{
    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _db;
        private readonly IAvailabilityService _availability;
        private readonly TimeSpan _defaultHold = TimeSpan.FromMinutes(15); // configurable

        public BookingService(ApplicationDbContext db, IAvailabilityService availability)
        {
            _db = db;
            _availability = availability;
        }

        public async Task<BookingDto> CreateBookingAsync(int guestUserId, CreateBookingRequest req)
        {
            if (req.EndDate <= req.StartDate)
                throw new ApplicationException("End date must be after start date.");

            var listing = await _db.Listings.FindAsync(req.ListingId);
            if (listing == null) throw new ApplicationException("Listing not found.");

            // compute nights and total price (use Listing.PricePerNight or cheapest room if rooms exist)
            decimal pricePerNight = listing.PricePerNight;
            // If rooms exist, choose cheapest available room price (simple approach)
            var rooms = await _db.Rooms.Where(r => r.ListingId == listing.Id).OrderBy(r => r.PricePerNight).ToListAsync();
            if (rooms.Any())
            {
                pricePerNight = rooms.Min(r => r.PricePerNight);
            }

            var nights = (decimal)(req.EndDate.Date - req.StartDate.Date).TotalDays;
            if (nights <= 0) throw new ApplicationException("Booking must be at least one night.");

            var total = nights * pricePerNight;

            // Create booking in pending state, set HoldExpiresAt
            var booking = new Booking
            {
                ListingId = req.ListingId,
                GuestId = guestUserId,
                StartDate = req.StartDate.Date,
                EndDate = req.EndDate.Date,
                TotalPrice = total,
                Status = BookingStatus.Pending,
                HoldExpiresAt = DateTime.UtcNow.Add(_defaultHold)
            };

            // Add booking first so we can reference its id in BlockedRange
            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();

            try
            {
                // Reserve a hold (transactional inside availability service)
                await _availability.ReserveHoldAsync(booking.Id, req.ListingId, booking.StartDate, booking.EndDate, _defaultHold);
            }
            catch
            {
                // rollback booking if unable to reserve
                _db.Bookings.Remove(booking);
                await _db.SaveChangesAsync();
                throw;
            }

            return new BookingDto
            {
                Id = booking.Id,
                ListingId = booking.ListingId,
                GuestId = booking.GuestId,
                StartDate = booking.StartDate,
                EndDate = booking.EndDate,
                TotalPrice = booking.TotalPrice
            };
        }

        public async Task<IEnumerable<BookingDto>> GetUserBookingsAsync(int userId)
        {
            var bookings = await _db.Bookings
                .Where(b => b.GuestId == userId)
                .OrderByDescending(b => b.StartDate)
                .ToListAsync();

            return bookings.Select(b => new BookingDto
            {
                Id = b.Id,
                ListingId = b.ListingId,
                GuestId = b.GuestId,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                TotalPrice = b.TotalPrice
            });
        }

        public async Task ConfirmBookingAsync(int bookingId)
        {
            var booking = await _db.Bookings.FindAsync(bookingId);
            if (booking == null) throw new ApplicationException("Booking not found.");
            booking.Status = BookingStatus.Confirmed;
            // keep hold timestamp for audit; ensure it is set
            booking.HoldExpiresAt = booking.HoldExpiresAt == default ? DateTime.UtcNow : booking.HoldExpiresAt;
            // held BlockedRanges should remain (they are the confirmed block)
            await _db.SaveChangesAsync();
        }

        public async Task ExpireBookingAsync(int bookingId)
        {
            var booking = await _db.Bookings.FindAsync(bookingId);
            if (booking == null) return;
            booking.Status = BookingStatus.Expired;
            await _db.SaveChangesAsync();

            // release holds
            await _availability.ReleaseHoldAsync(bookingId);
        }
    }
}
