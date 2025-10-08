using Microsoft.EntityFrameworkCore;
using Soda.Data;
using Soda.Models;
using Soda.Models.ViewModels;

namespace Soda.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordService _passwordService;

        public UserService(ApplicationDbContext context, IPasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserByUsernameOrEmailAsync(string usernameOrEmail)
        {
            return await _context.Users.FirstOrDefaultAsync(u =>
                u.Username == usernameOrEmail || u.Email == usernameOrEmail);
        }

        public async Task<User> CreateUserAsync(Register model)
        {
            var user = new User
            {
                Username = model.Username,
                Email = model.Email,
                PasswordHash = _passwordService.HashPassword(model.Password),
                FirstName = model.FirstName,
                LastName = model.LastName,
                PhoneNumber = model.PhoneNumber,
                CreatedAt = DateTimeExtensions.ToTaipeiTimeString(DateTime.UtcNow)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            try
            {
                user.UpdatedAt = DateTimeExtensions.ToTaipeiTimeString(DateTime.UtcNow);
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await GetUserByIdAsync(userId);
            if (user == null || !_passwordService.VerifyPassword(currentPassword, user.PasswordHash))
            {
                return false;
            }

            user.PasswordHash = _passwordService.HashPassword(newPassword);
            return await UpdateUserAsync(user);
        }

        public async Task<bool> ValidateUserAsync(string usernameOrEmail, string password)
        {
            var user = await GetUserByUsernameOrEmailAsync(usernameOrEmail);
            return user != null && user.IsActive && _passwordService.VerifyPassword(password, user.PasswordHash);
        }

        public async Task UpdateLastLoginAsync(int userId)
        {
            var user = await GetUserByIdAsync(userId);
            if (user != null)
            {
                user.LastLoginAt = DateTimeExtensions.ToTaipeiTimeString(DateTime.UtcNow);
                await UpdateUserAsync(user);
            }
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.OrderBy(u => u.Username).ToListAsync();
        }

        public async Task<bool> IsUsernameAvailableAsync(string username)
        {
            return !await _context.Users.AnyAsync(u => u.Username == username);
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            return !await _context.Users.AnyAsync(u => u.Email == email);
        }
    }
}