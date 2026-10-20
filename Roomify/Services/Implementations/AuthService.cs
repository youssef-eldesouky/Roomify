using Microsoft.EntityFrameworkCore;
using Roomify.Data;
using Roomify.Models;
using Roomify.Services.Interfaces;
using Roomify.Utilities;
using System.Security.Cryptography;

namespace Roomify.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IPasswordHasher _hasher;
        private readonly IJwtTokenGenerator _jwt;
        private readonly IConfiguration _config;
        private readonly int _refreshTokenDays = 30;

        public AuthService(ApplicationDbContext db, IPasswordHasher hasher, IJwtTokenGenerator jwt, IConfiguration config)
        {
            _db = db;
            _hasher = hasher;
            _jwt = jwt;
            _config = config;
        }

        public async Task<Roomify.DTOs.Auth.AuthResponse> RegisterAsync(Roomify.DTOs.Auth.RegisterRequest req)
        {
            // Validate input
            if (req == null)
                throw new ArgumentNullException(nameof(req), "Registration request cannot be null.");

            if (string.IsNullOrWhiteSpace(req.Email))
                throw new ApplicationException("Email is required.");

            if (string.IsNullOrWhiteSpace(req.Password))
                throw new ApplicationException("Password is required.");

            if (string.IsNullOrWhiteSpace(req.FullName))
                throw new ApplicationException("Full name is required.");

            // Check if email already exists
            if (await _db.Users.AnyAsync(u => u.Email == req.Email))
                throw new ApplicationException("Email already taken.");

            // Create new user
            var user = new User
            {
                FullName = req.FullName.Trim(),
                Email = req.Email.Trim().ToLowerInvariant(),
                PasswordHash = _hasher.Hash(req.Password),
                Phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim(),
                Country = string.IsNullOrWhiteSpace(req.Country) ? null : req.Country.Trim(),
                Role = "User"
            };

            // Add to database
            Console.WriteLine($"[AUTH SERVICE] Adding user to database - Email: {user.Email}, FullName: {user.FullName}");
            _db.Users.Add(user);
            
            try
            {
                Console.WriteLine("[AUTH SERVICE] Calling SaveChangesAsync...");
                var rowsAffected = await _db.SaveChangesAsync();
                Console.WriteLine($"[AUTH SERVICE] SaveChangesAsync completed. Rows affected: {rowsAffected}, User ID: {user.Id}");
                
                // Verify the user was saved
                if (user.Id == 0)
                {
                    Console.WriteLine("[AUTH SERVICE] ERROR: User ID is still 0 after save!");
                    throw new ApplicationException("Failed to save user to database - user ID not generated.");
                }
                
                // Double-check by querying the database
                var savedUser = await _db.Users.FindAsync(user.Id);
                if (savedUser == null)
                {
                    Console.WriteLine("[AUTH SERVICE] ERROR: User not found in database after save!");
                    throw new ApplicationException("User was not found in database after save operation.");
                }
                Console.WriteLine($"[AUTH SERVICE] User verified in database - ID: {savedUser.Id}, Email: {savedUser.Email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH SERVICE] Database save error: {ex.Message}");
                Console.WriteLine($"[AUTH SERVICE] Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[AUTH SERVICE] Inner exception: {ex.InnerException.Message}");
                }
                throw new ApplicationException($"Database error: {ex.Message}", ex);
            }

            var secret = _config["Jwt:Secret"] ?? throw new ApplicationException("JWT secret not configured.");
            var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60");

            var accessToken = _jwt.GenerateToken(user.Id, user.Email, user.Role, secret, expiryMinutes);
            var refreshToken = CreateRefreshToken();
            var refresh = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenDays),
                IsRevoked = false
            };
            _db.RefreshTokens.Add(refresh);
            await _db.SaveChangesAsync();

            return new Roomify.DTOs.Auth.AuthResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                Country = user.Country,
                Role = user.Role,
                Token = accessToken,
                RefreshToken = refreshToken
            };
        }

        public async Task<Roomify.DTOs.Auth.AuthResponse> LoginAsync(Roomify.DTOs.Auth.LoginRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null || !_hasher.Verify(req.Password, user.PasswordHash))
                throw new ApplicationException("Invalid credentials.");

            var secret = _config["Jwt:Secret"] ?? throw new ApplicationException("JWT secret not configured.");
            var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60");

            var accessToken = _jwt.GenerateToken(user.Id, user.Email, user.Role, secret, expiryMinutes);
            var refreshToken = CreateRefreshToken();
            var refresh = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenDays),
                IsRevoked = false
            };
            _db.RefreshTokens.Add(refresh);
            await _db.SaveChangesAsync();

            return new Roomify.DTOs.Auth.AuthResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                Country = user.Country,
                Role = user.Role,
                Token = accessToken,
                RefreshToken = refreshToken
            };
        }

        public async Task<Roomify.DTOs.Auth.AuthResponse> RefreshTokenAsync(Roomify.DTOs.Auth.RefreshRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.RefreshToken))
                throw new ApplicationException("Refresh token required.");

            var existing = await _db.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == req.RefreshToken);

            if (existing == null || existing.IsRevoked || existing.ExpiresAt <= DateTime.UtcNow)
                throw new ApplicationException("Invalid refresh token.");

            // rotate: revoke old, create new
            existing.IsRevoked = true;

            var newRefreshToken = CreateRefreshToken();
            var refresh = new RefreshToken
            {
                UserId = existing.UserId,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenDays),
                IsRevoked = false
            };
            _db.RefreshTokens.Add(refresh);

            var secret = _config["Jwt:Secret"] ?? throw new ApplicationException("JWT secret not configured.");
            var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60");

            // issue new access token
            var accessToken = _jwt.GenerateToken(existing.UserId, existing.User!.Email, existing.User.Role, secret, expiryMinutes);

            await _db.SaveChangesAsync();

            return new Roomify.DTOs.Auth.AuthResponse
            {
                UserId = existing.UserId,
                Email = existing.User!.Email,
                FullName = existing.User!.FullName,
                Phone = existing.User!.Phone,
                Country = existing.User!.Country,
                Role = existing.User!.Role,
                Token = accessToken,
                RefreshToken = newRefreshToken
            };
        }

        public async Task RevokeRefreshTokenAsync(Roomify.DTOs.Auth.RevokeRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.RefreshToken))
                return;

            var existing = await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == req.RefreshToken);
            if (existing == null) return;

            existing.IsRevoked = true;
            await _db.SaveChangesAsync();
        }

        private string CreateRefreshToken()
        {
            var randomNumber = new byte[64];
            RandomNumberGenerator.Fill(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
