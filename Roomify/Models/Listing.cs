using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Roomify.Models
{
    public class Listing
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerNight { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        public int? MaxGuests { get; set; }

        [MaxLength(10)]
        public string? CheckInTime { get; set; } // Format: "HH:mm"

        [MaxLength(10)]
        public string? CheckOutTime { get; set; } // Format: "HH:mm"

        // Store as JSON string for simplicity, or could be separate table
        public string? AmenitiesJson { get; set; }

        // Store as JSON string for simplicity, or could be separate table
        public string? PropertyTypesJson { get; set; }

        public int HostId { get; set; }
        public User? Host { get; set; }

        // Navigation property for images
        public List<ListingImage>? Images { get; set; }
    }
}
