using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Roomify.Data;
using Roomify.DTOs.Listings;
using Roomify.DTOs.Search;
using Roomify.DTOs.Blocked;
using Roomify.DTOs.Rooms;
using Roomify.Models;
using Roomify.Services.Interfaces;

namespace Roomify.Services.Implementations
{
    public class ListingService : IListingService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        private readonly IAvailabilityService _availability;

        public ListingService(ApplicationDbContext db, IMapper mapper, IAvailabilityService availability)
        {
            _db = db;
            _mapper = mapper;
            _availability = availability;
        }

        // existing methods (GetAllAsync, GetByIdAsync, CreateAsync) remain same...

        public async Task<IEnumerable<SearchResultDto>> SearchAsync(Roomify.DTOs.Search.SearchRequest req)
        {
            var q = _db.Listings.AsQueryable();

            if (!string.IsNullOrWhiteSpace(req.Location))
                q = q.Where(l => l.City != null && l.City.ToLower().Contains(req.Location.ToLower()));

            if (req.MinPrice.HasValue) q = q.Where(l => l.PricePerNight >= req.MinPrice.Value);
            if (req.MaxPrice.HasValue) q = q.Where(l => l.PricePerNight <= req.MaxPrice.Value);

            // pagination
            q = q.OrderBy(l => l.Id)
                 .Skip((req.Page - 1) * req.PageSize)
                 .Take(req.PageSize);

            var list = await q.ToListAsync();

            var results = new List<SearchResultDto>();
            foreach (var l in list)
            {
                // if date provided, check availability
                if (req.CheckIn.HasValue && req.CheckOut.HasValue)
                {
                    var available = await _availability.IsAvailableAsync(l.Id, req.CheckIn.Value, req.CheckOut.Value);
                    if (!available) continue;
                }

                var price = l.PricePerNight;
                var rooms = await _db.Rooms.Where(r => r.ListingId == l.Id).ToListAsync();
                if (rooms.Any()) price = rooms.Min(r => r.PricePerNight);

                results.Add(new SearchResultDto
                {
                    ListingId = l.Id,
                    Title = l.Title,
                    City = l.City,
                    PricePerNight = price,
                    ShortDescription = l.Description
                });
            }

            return results;
        }

        public async Task<IEnumerable<BlockedRangeDto>> GetAvailabilityAsync(int listingId, DateTime from, DateTime to)
        {
            return await _availability.GetAvailabilityAsync(listingId, from, to);
        }

        public async Task<ListingDto> UpdateAsync(int listingId, CreateListingRequest req)
        {
            var listing = await _db.Listings
                .Include(l => l.Images)
                .FirstOrDefaultAsync(l => l.Id == listingId);
            
            if (listing == null) throw new ApplicationException("Listing not found.");

            listing.Title = req.Title;
            listing.Description = req.Description;
            listing.PricePerNight = req.PricePerNight;
            listing.City = req.City;
            listing.MaxGuests = req.MaxGuests;
            listing.CheckInTime = req.CheckInTime;
            listing.CheckOutTime = req.CheckOutTime;
            listing.AmenitiesJson = req.Amenities != null ? System.Text.Json.JsonSerializer.Serialize(req.Amenities) : null;
            listing.PropertyTypesJson = req.PropertyTypes != null ? System.Text.Json.JsonSerializer.Serialize(req.PropertyTypes) : null;

            // Update images if provided
            if (req.PhotoUrls != null)
            {
                // Remove existing images
                var existingImages = await _db.Images.Where(img => img.ListingId == listingId).ToListAsync();
                _db.Images.RemoveRange(existingImages);

                // Add new images
                var newImages = req.PhotoUrls.Select(url => new ListingImage
                {
                    ListingId = listingId,
                    Url = url,
                    AltText = listing.Title
                }).ToList();

                _db.Images.AddRange(newImages);
            }

            await _db.SaveChangesAsync();
            return await GetByIdAsync(listingId) ?? throw new ApplicationException("Failed to update listing");
        }

        public async Task DeleteAsync(int listingId)
        {
            var listing = await _db.Listings.FindAsync(listingId);
            if (listing == null) throw new ApplicationException("Listing not found.");
            _db.Listings.Remove(listing);
            await _db.SaveChangesAsync();
        }

        public async Task<RoomDto> CreateRoomAsync(int listingId, CreateRoomRequest req)
        {
            var listing = await _db.Listings.FindAsync(listingId);
            if (listing == null) throw new ApplicationException("Listing not found.");

            var r = new Room
            {
                ListingId = listingId,
                Name = req.Name,
                Capacity = req.Capacity,
                PricePerNight = req.PricePerNight
            };
            _db.Rooms.Add(r);
            await _db.SaveChangesAsync();
            return new RoomDto
            {
                Id = r.Id,
                ListingId = r.ListingId,
                Name = r.Name,
                Capacity = r.Capacity,
                PricePerNight = r.PricePerNight
            };
        }

        public async Task<IEnumerable<ListingDto>> GetAllAsync(string? city, decimal? minPrice, decimal? maxPrice, int page = 1, int pageSize = 20)
        {
            var query = _db.Listings.Include(l => l.Images).AsQueryable();

            if (!string.IsNullOrWhiteSpace(city))
                query = query.Where(l => l.City != null && l.City.ToLower().Contains(city.ToLower()));

            if (minPrice.HasValue)
                query = query.Where(l => l.PricePerNight >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(l => l.PricePerNight <= maxPrice.Value);

            var listings = await query
                .OrderByDescending(l => l.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return listings.Select(l => new ListingDto
            {
                Id = l.Id,
                Title = l.Title,
                Description = l.Description,
                PricePerNight = l.PricePerNight,
                City = l.City,
                HostId = l.HostId,
                MaxGuests = (int)l.MaxGuests,
                CheckInTime = l.CheckInTime,
                CheckOutTime = l.CheckOutTime,
                Amenities = l.AmenitiesJson != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(l.AmenitiesJson) : null,
                PropertyTypes = l.PropertyTypesJson != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(l.PropertyTypesJson) : null,
                PhotoUrls = l.Images?.Select(img => img.Url).ToList() ?? new List<string>()
            });
        }

        public async Task<ListingDto?> GetByIdAsync(int id)
        {
            var listing = await _db.Listings
                .Include(l => l.Images)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (listing == null) return null;

            return new ListingDto
            {
                Id = listing.Id,
                Title = listing.Title,
                Description = listing.Description,
                PricePerNight = listing.PricePerNight,
                City = listing.City,
                HostId = listing.HostId,
                MaxGuests = (int)listing.MaxGuests,
                CheckInTime = listing.CheckInTime,
                CheckOutTime = listing.CheckOutTime,
                Amenities = listing.AmenitiesJson != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(listing.AmenitiesJson) : null,
                PropertyTypes = listing.PropertyTypesJson != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(listing.PropertyTypesJson) : null,
                PhotoUrls = listing.Images?.Select(img => img.Url).ToList() ?? new List<string>()
            };
        }

        public async Task<ListingDto> CreateAsync(int hostUserId, CreateListingRequest req)
        {
            var listing = new Listing
            {
                Title = req.Title,
                Description = req.Description,
                PricePerNight = req.PricePerNight,
                City = req.City,
                MaxGuests = req.MaxGuests,
                CheckInTime = req.CheckInTime,
                CheckOutTime = req.CheckOutTime,
                AmenitiesJson = req.Amenities != null ? System.Text.Json.JsonSerializer.Serialize(req.Amenities) : null,
                PropertyTypesJson = req.PropertyTypes != null ? System.Text.Json.JsonSerializer.Serialize(req.PropertyTypes) : null,
                HostId = hostUserId
            };

            _db.Listings.Add(listing);
            await _db.SaveChangesAsync();

            // Handle photo URLs if provided
            if (req.PhotoUrls != null && req.PhotoUrls.Any())
            {
                var images = req.PhotoUrls.Select(url => new ListingImage
                {
                    ListingId = listing.Id,
                    Url = url,
                    AltText = listing.Title
                }).ToList();

                _db.Images.AddRange(images);
                await _db.SaveChangesAsync();
            }

            return await GetByIdAsync(listing.Id) ?? throw new ApplicationException("Failed to create listing");
        }
    }
}
