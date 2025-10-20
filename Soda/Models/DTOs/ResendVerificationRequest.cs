using System.ComponentModel.DataAnnotations;

namespace Soda.Models.DTOs
{
    public class ResendVerificationRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}