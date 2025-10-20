using Soda.Helpers;
using Soda.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Soda.Models.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? FirstName { get; set; }

        [MaxLength(50)]
        public string? LastName { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        [Phone]
        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        public UserRole Role { get; set; } = UserRole.User;

        public bool IsActive { get; set; } = true;

        public bool IsEmailVerified { get; set; } = false;

        [MaxLength(100)]
        public string? EmailVerificationToken { get; set; }

        public DateTime? EmailVerificationTokenExpiry { get; set; }

        [MaxLength(100)]
        public string? PasswordResetToken { get; set; }

        public DateTime? PasswordResetTokenExpiry { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow.ToTaipeiTimeString();

        public DateTime? UpdatedAt { get; set; }

        public DateTime? LastLoginAt { get; set; }
    }
}