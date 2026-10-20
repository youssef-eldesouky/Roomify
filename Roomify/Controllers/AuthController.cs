using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Roomify.Data;

namespace Roomify.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly Roomify.Services.Interfaces.IAuthService _svc;
        private readonly ApplicationDbContext _db;
        
        public AuthController(Roomify.Services.Interfaces.IAuthService svc, ApplicationDbContext db)
        {
            _svc = svc;
            _db = db;
        }

        [HttpGet("test-db")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                var userCount = await _db.Users.CountAsync();
                var users = await _db.Users.Select(u => new { u.Id, u.Email, u.FullName, u.Phone, u.Country }).ToListAsync();
                return Ok(new { message = "Database connection successful", userCount, users });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Database error: {ex.Message}", stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("verify-user/{email}")]
        public async Task<IActionResult> VerifyUser(string email)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                    return NotFound(new { message = "User not found" });
                
                return Ok(new { 
                    id = user.Id, 
                    email = user.Email, 
                    fullName = user.FullName,
                    phone = user.Phone,
                    country = user.Country,
                    role = user.Role
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error: {ex.Message}" });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Roomify.DTOs.Auth.RegisterRequest req)
        {
            try
            {
                // Log incoming request for debugging
                Console.WriteLine($"[REGISTER] Received request - Email: {req?.Email}, FullName: {req?.FullName}, HasPhone: {!string.IsNullOrEmpty(req?.Phone)}, HasCountry: {!string.IsNullOrEmpty(req?.Country)}");

                if (req == null)
                {
                    Console.WriteLine("[REGISTER] Request body is null");
                    return BadRequest(new { message = "Request body is required." });
                }

                if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password) || string.IsNullOrWhiteSpace(req.FullName))
                {
                    Console.WriteLine($"[REGISTER] Validation failed - Email: {req.Email}, Password: {!string.IsNullOrEmpty(req.Password)}, FullName: {req.FullName}");
                    return BadRequest(new { message = "Email, password, and full name are required." });
                }

                Console.WriteLine("[REGISTER] Calling RegisterAsync service...");
                var res = await _svc.RegisterAsync(req);
                Console.WriteLine($"[REGISTER] Success - UserId: {res.UserId}, Email: {res.Email}");
                
                return Ok(res);
            }
            catch (ApplicationException ex)
            {
                Console.WriteLine($"[REGISTER] ApplicationException: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Log the exception (in production, use proper logging)
                Console.WriteLine($"[REGISTER] Exception: {ex.Message}");
                Console.WriteLine($"[REGISTER] Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[REGISTER] Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = $"An error occurred during registration: {ex.Message}" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Roomify.DTOs.Auth.LoginRequest req)
        {
            try
            {
                if (req == null)
                    return BadRequest(new { message = "Request body is required." });

                if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                    return BadRequest(new { message = "Email and password are required." });

                var res = await _svc.LoginAsync(req);
                return Ok(res);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Log the exception (in production, use proper logging)
                Console.WriteLine($"Login error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "An error occurred during login. Please try again." });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] Roomify.DTOs.Auth.RefreshRequest req)
        {
            try
            {
                var res = await _svc.RefreshTokenAsync(req);
                return Ok(res);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("revoke")]
        public async Task<IActionResult> Revoke([FromBody] Roomify.DTOs.Auth.RevokeRequest req)
        {
            await _svc.RevokeRefreshTokenAsync(req);
            return NoContent();
        }
    }
}
