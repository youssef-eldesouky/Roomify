using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Roomify.Data;
using Microsoft.EntityFrameworkCore;

namespace Roomify.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public AdminController(ApplicationDbContext db) => _db = db;

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var users = await _db.Users.CountAsync();
            var listings = await _db.Listings.CountAsync();
            var bookings = await _db.Bookings.CountAsync();

            return Ok(new { users, listings, bookings });
        }

        [HttpPost("users/{id}/ban")]
        public async Task<IActionResult> BanUser(int id)
        {
            var u = await _db.Users.FindAsync(id);
            if (u == null) return NotFound();
            u.Role = "Banned";
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
