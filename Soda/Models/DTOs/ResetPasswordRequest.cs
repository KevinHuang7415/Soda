using System.ComponentModel.DataAnnotations;

namespace Soda.Models.DTOs
{
    public class ResetPasswordRequest
    {
        [Required(ErrorMessage = "Token 不可為空")]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = "請輸入新密碼")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "密碼長度必須在 6 到 100 個字元之間")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "請確認新密碼")]
        [Compare("NewPassword", ErrorMessage = "密碼與確認密碼不符")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}