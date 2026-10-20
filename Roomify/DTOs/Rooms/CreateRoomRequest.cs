namespace Roomify.DTOs.Rooms
{
    public class CreateRoomRequest
    {
        public string Name { get; set; } = null!;
        public int Capacity { get; set; } = 1;
        public decimal PricePerNight { get; set; }
    }
}
