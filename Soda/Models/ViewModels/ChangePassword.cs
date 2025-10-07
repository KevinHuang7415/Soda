using System.ComponentModel.DataAnnotations;

namespace Soda.Models.ViewModels
{
    public class ChangePassword
    {
        [Required(ErrorMessage = "請輸入目前密碼")]
        [DataType(DataType.Password)]
        [Display(Name = "目前密碼")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "請輸入新密碼")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "密碼長度必須至少6個字元")]
        [DataType(DataType.Password)]
        [Display(Name = "新密碼")]
        public string NewPassword { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        [Display(Name = "確認新密碼")]
        [Compare("NewPassword", ErrorMessage = "新密碼和確認密碼不相符")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}