using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Roomify.Models
{
    public class Room
    {
        public int Id { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        [Required, MaxLength(150)]
        public string Name { get; set; } = null!;

        public int Capacity { get; set; } = 1;

        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerNight { get; set; }
    }
}
