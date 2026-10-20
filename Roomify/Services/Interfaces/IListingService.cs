using Roomify.DTOs.Blocked;
using Roomify.DTOs.Listings;
using Roomify.DTOs.Rooms;
using Roomify.DTOs.Search;

namespace Roomify.Services.Interfaces
{
    public interface IListingService
    {
        Task<IEnumerable<ListingDto>> GetAllAsync(string? city, decimal? minPrice, decimal? maxPrice, int page = 1, int pageSize = 20);
        Task<ListingDto?> GetByIdAsync(int id);
        Task<ListingDto> CreateAsync(int hostUserId, CreateListingRequest req);
        Task<ListingDto> UpdateAsync(int listingId, CreateListingRequest req); // reusing Create DTO for simplicity
        Task DeleteAsync(int listingId);
        Task<IEnumerable<SearchResultDto>> SearchAsync(Roomify.DTOs.Search.SearchRequest req);
        Task<IEnumerable<BlockedRangeDto>> GetAvailabilityAsync(int listingId, DateTime from, DateTime to);
        Task<RoomDto> CreateRoomAsync(int listingId, Roomify.DTOs.Rooms.CreateRoomRequest req);
    }
}
