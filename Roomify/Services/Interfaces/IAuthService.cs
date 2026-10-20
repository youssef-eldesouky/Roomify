namespace Roomify.Services.Interfaces
{
    public interface IAuthService
    {
        Task<Roomify.DTOs.Auth.AuthResponse> RegisterAsync(Roomify.DTOs.Auth.RegisterRequest req);
        Task<Roomify.DTOs.Auth.AuthResponse> LoginAsync(Roomify.DTOs.Auth.LoginRequest req);
        Task<Roomify.DTOs.Auth.AuthResponse> RefreshTokenAsync(Roomify.DTOs.Auth.RefreshRequest req);
        Task RevokeRefreshTokenAsync(Roomify.DTOs.Auth.RevokeRequest req);
    }
}
