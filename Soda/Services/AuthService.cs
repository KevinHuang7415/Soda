using Microsoft.EntityFrameworkCore;
using Soda.Data;
using Soda.Helpers;
using Soda.Models.DTOs;
using Soda.Models.Entities;
using Soda.Services.Interface;

namespace Soda.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public AuthService(ApplicationDbContext context, JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "使用者名稱已被使用"
                };
            }

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "電子郵件已被註冊"
                };
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = PasswordHasher.HashPassword(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToTaipeiTimeString()
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtHelper.GenerateToken(user.Id, user.Username, user.Email, user.Role.ToString());

            return new AuthResponse
            {
                Success = true,
                Message = "註冊成功",
                Token = token,
                User = MapToUserResponse(user)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Username == request.UsernameOrEmail ||
                    u.Email == request.UsernameOrEmail);

            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "使用者名稱或密碼錯誤"
                };
            }

            if (!PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "使用者名稱或密碼錯誤"
                };
            }

            if (!user.IsActive)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "帳號已被停用"
                };
            }

            user.LastLoginAt = DateTime.UtcNow.ToTaipeiTimeString();
            await _context.SaveChangesAsync();

            var token = _jwtHelper.GenerateToken(user.Id, user.Username, user.Email, user.Role.ToString());

            return new AuthResponse
            {
                Success = true,
                Message = "登入成功",
                Token = token,
                User = MapToUserResponse(user)
            };
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