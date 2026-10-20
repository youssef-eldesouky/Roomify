using System.Text.Json.Serialization;

namespace Roomify.DTOs.Auth
{
    public class RegisterRequest
    {
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = null!;
        
        [JsonPropertyName("email")]
        public string Email { get; set; } = null!;
        
        [JsonPropertyName("password")]
        public string Password { get; set; } = null!;
        
        [JsonPropertyName("phone")]
        public string? Phone { get; set; }
        
        [JsonPropertyName("country")]
        public string? Country { get; set; }
    }
}
