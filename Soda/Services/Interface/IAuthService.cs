using Soda.Models.DTOs;

namespace Soda.Services.Interface
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> VerifyEmailAsync(string token);
        Task<AuthResponse> ResendVerificationEmailAsync(string email);
        Task<PasswordResetResponse> ForgotPasswordAsync(string email);
        Task<PasswordResetResponse> ResetPasswordAsync(ResetPasswordRequest request);
        Task<PasswordResetResponse> ValidateResetTokenAsync(string token);
    }
}