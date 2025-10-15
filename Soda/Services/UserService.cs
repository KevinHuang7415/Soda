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
        private readonly ILogger<UserService> _logger;

        public UserService(ApplicationDbContext context, ILogger<UserService> logger)
        {
            _context = context;
            _logger = logger;
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

        public async Task<ChangePasswordResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    return new ChangePasswordResponse
                    {
                        Success = false,
                        Message = "找不到使用者"
                    };
                }

                // 驗證舊密碼
                if (!PasswordHasher.VerifyPassword(request.OldPassword, user.PasswordHash))
                {
                    _logger.LogWarning($"使用者 {userId} 嘗試變更密碼但舊密碼錯誤");
                    return new ChangePasswordResponse
                    {
                        Success = false,
                        Message = "舊密碼錯誤"
                    };
                }

                // 檢查新密碼是否與舊密碼相同
                if (PasswordHasher.VerifyPassword(request.NewPassword, user.PasswordHash))
                {
                    return new ChangePasswordResponse
                    {
                        Success = false,
                        Message = "新密碼不能與舊密碼相同"
                    };
                }

                // 更新密碼
                user.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
                user.UpdatedAt = DateTime.UtcNow.ToTaipeiTimeString();

                await _context.SaveChangesAsync();

                _logger.LogInformation($"使用者 {userId} 成功變更密碼");

                return new ChangePasswordResponse
                {
                    Success = true,
                    Message = "密碼變更成功"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"使用者 {userId} 變更密碼時發生錯誤");
                return new ChangePasswordResponse
                {
                    Success = false,
                    Message = "密碼變更失敗，請稍後再試"
                };
            }
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