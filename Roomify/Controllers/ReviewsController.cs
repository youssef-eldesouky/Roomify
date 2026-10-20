// Controllers/ReviewsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Roomify.Data;
using Roomify.Models;

namespace Roomify.Controllers
{
    [ApiController]
    [Route("api/listings/{listingId}/reviews")]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ReviewsController(ApplicationDbContext db)
        {
            _db = db;
        }

        // POST api/listings/{listingId}/reviews
        [HttpPost]
        public async Task<IActionResult> PostReview(int listingId, [FromBody] Review req)
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            // ensure user has a confirmed booking for the listing and the stay ended in the past
            var hasBooking = await _db.Bookings.AnyAsync(b =>
                b.ListingId == listingId &&
                b.GuestId == userId &&
                b.Status == BookingStatus.Confirmed &&
                b.EndDate < DateTime.UtcNow);

            if (!hasBooking)
                return BadRequest(new { message = "You can only review after completing a confirmed stay." });

            var review = new Review
            {
                ListingId = listingId,
                UserId = userId,
                Rating = req.Rating,
                Comment = req.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();

            return Ok(review);
        }
    }
}
