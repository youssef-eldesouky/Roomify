namespace Roomify.DTOs.Blocked
{
    public class BlockedRangeDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsHold { get; set; }
    }
}
