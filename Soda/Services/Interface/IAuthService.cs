using Soda.Models.DTOs;

namespace Soda.Services.Interface
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
    }
}