using System.ComponentModel.DataAnnotations;

namespace Roomify.Models
{
    public class Review
    {
        public int Id { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
