namespace Roomify.DTOs.Bookings
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int ListingId { get; set; }
        public int GuestId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
