using System.ComponentModel.DataAnnotations;

namespace Roomify.Models
{
    public class ListingImage
    {
        public int Id { get; set; }
        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        [Required]
        public string Url { get; set; } = null!;
        public string? AltText { get; set; }
    }
}
