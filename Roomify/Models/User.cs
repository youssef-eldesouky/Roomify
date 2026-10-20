using System.ComponentModel.DataAnnotations;

namespace Roomify.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string FullName { get; set; } = null!;

        [Required, MaxLength(200)]
        public string Email { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;

        [MaxLength(50)]
        public string? Phone { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        // Roles: "User", "Host", "Admin"
        [Required, MaxLength(50)]
        public string Role { get; set; } = "User";
    }
}
