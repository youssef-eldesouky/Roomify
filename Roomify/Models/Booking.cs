using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Roomify.Models
{
    public enum BookingStatus
    {
        Pending = 0,     // waiting for payment or confirmation
        Confirmed = 1,   // paid / confirmed
        Cancelled = 2,
        Expired = 3
    }

    public class Booking
    {
        public int Id { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        public int GuestId { get; set; }
        public User? Guest { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalPrice { get; set; }

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        // Hold expiration timestamp (required)
        public DateTime HoldExpiresAt { get; set; } = DateTime.UtcNow;

        // optional payment reference when payment flow is added
        public string? PaymentRef { get; set; }
    }
}
