using Roomify.DTOs.Blocked;

namespace Roomify.Services.Interfaces
{
    public interface IAvailabilityService
    {
        Task<IEnumerable<BlockedRangeDto>> GetAvailabilityAsync(int listingId, DateTime from, DateTime to);
        Task<bool> IsAvailableAsync(int listingId, DateTime start, DateTime end);
        Task ReserveHoldAsync(int bookingId, int listingId, DateTime start, DateTime end, TimeSpan holdDuration);
        Task ReleaseHoldAsync(int bookingId);
    }
}
