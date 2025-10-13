using Microsoft.EntityFrameworkCore;
using Soda.Data;
using Soda.Helpers;
using Soda.Models.DTOs;
using Soda.Models.Entities;
using Soda.Services.Interface;

namespace Soda.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserResponse?> GetUserByIdAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return null;

            return MapToUserResponse(user);
        }

        public async Task<List<UserResponse>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Where(u => u.IsActive)
                .ToListAsync();

            return users.Select(MapToUserResponse).ToList();
        }

        public async Task<bool> UpdateUserAsync(int userId, UserResponse userUpdate)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return false;

            user.FirstName = userUpdate.FirstName;
            user.LastName = userUpdate.LastName;
            user.Email = userUpdate.Email;
            user.PhoneNumber = userUpdate.PhoneNumber;
            user.UpdatedAt = DateTime.UtcNow.ToTaipeiTimeString();

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return false;

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow.ToTaipeiTimeString();

            await _context.SaveChangesAsync();
            return true;
        }

        private static UserResponse MapToUserResponse(User user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };
        }
    }
}