using Soda.Models.DTOs;

namespace Soda.Services.Interface
{
    public interface IUserService
    {
        Task<UserResponse?> GetUserByIdAsync(int userId);
        Task<List<UserResponse>> GetAllUsersAsync();
        Task<bool> UpdateUserAsync(int userId, UserResponse userUpdate);
        Task<bool> DeleteUserAsync(int userId);
    }
}