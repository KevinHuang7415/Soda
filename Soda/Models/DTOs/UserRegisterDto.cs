using System.ComponentModel.DataAnnotations;

namespace Soda.Models.DTOs
{
    public class UserRegisterDto
    {
        [Required(ErrorMessage = "使用者名稱 必填")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email 必填")]
        [EmailAddress(ErrorMessage = "Email 格式不正確")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "密碼 必填")]
        public string Password { get; set; } = string.Empty;
        [Required(ErrorMessage = "姓氏 必填")]
        public string? FirstName { get; set; }
        [Required(ErrorMessage = "名字 必填")]
        public string? LastName { get; set; }
    }
}
