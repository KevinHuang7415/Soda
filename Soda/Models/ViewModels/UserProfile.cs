using System.ComponentModel.DataAnnotations;

namespace Soda.Models.ViewModels
{
    public class UserProfile
    {
        public int Id { get; set; }

        [Required]
        [Display(Name = "用戶名稱")]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [Display(Name = "電子郵件")]
        public string Email { get; set; } = string.Empty;

        [Display(Name = "姓")]
        public string? FirstName { get; set; }

        [Display(Name = "名")]
        public string? LastName { get; set; }

        [Phone]
        [Display(Name = "電話號碼")]
        public string? PhoneNumber { get; set; }

        [Display(Name = "註冊時間")]
        public DateTime CreatedAt { get; set; }

        [Display(Name = "最後登入時間")]
        public DateTime? LastLoginAt { get; set; }
    }
}