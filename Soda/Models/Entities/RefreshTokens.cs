using Soda.Helpers;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Soda.Models.Entities
{
    [Table("RevokedTokens")]
    public class RevokedToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Token { get; set; } = string.Empty;

        [Required]
        public int UserId { get; set; }

        public DateTime RevokedAt { get; set; } = DateTime.UtcNow.ToTaipeiTimeString();

        public DateTime ExpiresAt { get; set; }

        [MaxLength(50)]
        public string? Reason { get; set; }
    }
}