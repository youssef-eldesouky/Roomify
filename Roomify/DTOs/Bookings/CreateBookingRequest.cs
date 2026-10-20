namespace Roomify.DTOs.Bookings
{
    public class CreateBookingRequest
    {
        public int ListingId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
