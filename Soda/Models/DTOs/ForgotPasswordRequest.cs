using System.ComponentModel.DataAnnotations;

namespace Soda.Models.DTOs
{
    public class ForgotPasswordRequest
    {
        [Required(ErrorMessage = "請輸入電子郵件")]
        [EmailAddress(ErrorMessage = "電子郵件格式不正確")]
        public string Email { get; set; } = string.Empty;
    }
}