namespace Roomify.DTOs.Listings
{
    public class CreateListingRequest
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal PricePerNight { get; set; }
        public string? City { get; set; }
        public int MaxGuests { get; set; }
        public string? CheckInTime { get; set; } // Format: "HH:mm"
        public string? CheckOutTime { get; set; } // Format: "HH:mm"
        public List<string>? Amenities { get; set; }
        public List<string>? PropertyTypes { get; set; }
        public List<string>? PhotoUrls { get; set; }
    }
}
