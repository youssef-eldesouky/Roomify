using System.ComponentModel.DataAnnotations;

namespace Roomify.Models
{
    public class BlockedRange
    {
        public int Id { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        // optional: room-specific blocking
        public int? RoomId { get; set; }
        public Room? Room { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public bool IsHold { get; set; } = false; // true when it's a temporary hold for a pending booking

        // If associated with a booking, we can clean it up when booking expires/cancels
        public int? BookingId { get; set; }
    }
}
