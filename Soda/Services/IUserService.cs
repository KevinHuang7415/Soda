using Soda.Models;
using Soda.Models.ViewModels;

namespace Soda.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByUsernameOrEmailAsync(string usernameOrEmail);
        Task<User> CreateUserAsync(Register model);
        Task<bool> UpdateUserAsync(User user);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<bool> ValidateUserAsync(string usernameOrEmail, string password);
        Task UpdateLastLoginAsync(int userId);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<bool> IsUsernameAvailableAsync(string username);
        Task<bool> IsEmailAvailableAsync(string email);
    }
}