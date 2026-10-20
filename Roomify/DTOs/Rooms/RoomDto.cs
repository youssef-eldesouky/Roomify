namespace Roomify.DTOs.Rooms
{
    public class RoomDto
    {
        public int Id { get; set; }
        public int ListingId { get; set; }
        public string Name { get; set; } = null!;
        public int Capacity { get; set; }
        public decimal PricePerNight { get; set; }
    }
}
