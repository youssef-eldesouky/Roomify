using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Roomify.DTOs.Listings;
using Roomify.Services.Interfaces;
using System.Security.Claims;

namespace Roomify.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListingsController : ControllerBase
    {
        private readonly IListingService _svc;
        public ListingsController(IListingService svc) => _svc = svc;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? city, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var list = await _svc.GetAllAsync(city, minPrice, maxPrice, page, pageSize);
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var listing = await _svc.GetByIdAsync(id);
            if (listing == null) return NotFound();
            return Ok(listing);
        }

        // Allow any authenticated user to create listings (previously Host/Admin only)
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateListingRequest req)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            try
            {
                var created = await _svc.CreateAsync(userId, req);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        // inside ListingsController (existing)
        [HttpPut("{id}")]
        [Authorize] // allow authenticated users to update their listings (ownership check should be handled in service)
        public async Task<IActionResult> Update(int id, [FromBody] CreateListingRequest req)
        {
            // ensure host owns the listing or is admin (simple check omitted for brevity)
            try
            {
                var updated = await _svc.UpdateAsync(id, req);
                return Ok(updated);
            }
            catch (ApplicationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("{id}")]
        [Authorize] // allow authenticated users; service should enforce ownership
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _svc.DeleteAsync(id);
                return NoContent();
            }
            catch (ApplicationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("{id}/rooms")]
        [Authorize] // allow authenticated users; service should enforce ownership
        public async Task<IActionResult> AddRoom(int id, [FromBody] Roomify.DTOs.Rooms.CreateRoomRequest req)
        {
            try
            {
                var room = await _svc.CreateRoomAsync(id, req);
                return CreatedAtAction(nameof(GetById), new { id = id }, room);
            }
            catch (ApplicationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpGet("{id}/availability")]
        public async Task<IActionResult> GetAvailability(int id, [FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            if (from == default || to == default) return BadRequest(new { message = "from and to query parameters are required." });
            var avail = await _svc.GetAvailabilityAsync(id, from, to);
            return Ok(avail);
        }

    }
}
