using System.ComponentModel.DataAnnotations;

namespace Soda.Models.ViewModels
{
    public class Register
    {
        [Required(ErrorMessage = "請輸入用戶名稱")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "用戶名稱長度必須在3-50字元之間")]
        [Display(Name = "用戶名稱")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "請輸入電子郵件")]
        [EmailAddress(ErrorMessage = "請輸入有效的電子郵件格式")]
        [Display(Name = "電子郵件")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "請輸入密碼")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "密碼長度必須至少6個字元")]
        [DataType(DataType.Password)]
        [Display(Name = "密碼")]
        public string Password { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        [Display(Name = "確認密碼")]
        [Compare("Password", ErrorMessage = "密碼和確認密碼不相符")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Display(Name = "姓")]
        public string? FirstName { get; set; }

        [Display(Name = "名")]
        public string? LastName { get; set; }

        [Phone]
        [Display(Name = "電話號碼")]
        public string? PhoneNumber { get; set; }
    }
}