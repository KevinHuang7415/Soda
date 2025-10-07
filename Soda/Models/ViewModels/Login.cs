using System.ComponentModel.DataAnnotations;

namespace Soda.Models.ViewModels
{
    public class Login
    {
        [Required(ErrorMessage = "請輸入用戶名稱或電子郵件")]
        [Display(Name = "用戶名稱/電子郵件")]
        public string UsernameOrEmail { get; set; } = string.Empty;

        [Required(ErrorMessage = "請輸入密碼")]
        [DataType(DataType.Password)]
        [Display(Name = "密碼")]
        public string Password { get; set; } = string.Empty;

        [Display(Name = "記住我")]
        public bool RememberMe { get; set; }
    }
}