namespace Roomify.DTOs.Search
{
    public class SearchResultDto
    {
        public int ListingId { get; set; }
        public string Title { get; set; } = null!;
        public string? City { get; set; }
        public decimal PricePerNight { get; set; } // cheapest available room price
        public string? ShortDescription { get; set; }
    }
}
