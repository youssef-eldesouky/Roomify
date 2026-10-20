using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Roomify.DTOs.Bookings;
using Roomify.Services.Interfaces;
using System.Security.Claims;

namespace Roomify.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _svc;
        public BookingsController(IBookingService svc) => _svc = svc;

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookingRequest req)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            try
            {
                var booking = await _svc.CreateBookingAsync(userId, req);
                return CreatedAtAction(nameof(GetMyBookings), new { id = booking.Id }, booking);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var bookings = await _svc.GetUserBookingsAsync(userId);
            return Ok(bookings);
        }
    }
}
