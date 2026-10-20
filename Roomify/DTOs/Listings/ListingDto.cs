namespace Roomify.DTOs.Listings
{
    public class ListingDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal PricePerNight { get; set; }
        public string? City { get; set; }
        public int HostId { get; set; }
        public int MaxGuests { get; set; }
        public string? CheckInTime { get; set; }
        public string? CheckOutTime { get; set; }
        public List<string>? Amenities { get; set; }
        public List<string>? PropertyTypes { get; set; }
        public List<string>? PhotoUrls { get; set; }
    }
}
