using System.ComponentModel.DataAnnotations;

namespace Soda.Models.DTOs
{
    public class VerifyEmailRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;
    }
}