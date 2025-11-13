using Microsoft.EntityFrameworkCore;
using Soda.Data;
using Soda.Helpers;
using Soda.Models.DTOs;
using Soda.Models.Entities;
using Soda.Services.Interface;
using System.Security.Cryptography;

namespace Soda.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtHelper _jwtHelper;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;
        private readonly IConfiguration _configuration;
        private readonly bool _emailVerificationEnabled;

        public AuthService(
            ApplicationDbContext context,
            JwtHelper jwtHelper,
            IEmailService emailService,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _context = context;
            _jwtHelper = jwtHelper;
            _emailService = emailService;
            _configuration = configuration;
            _logger = logger;

            _emailVerificationEnabled = _configuration.GetValue<bool>("FeatureFlags:EnableEmailVerification");
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
                Address = request.Address,
                IsActive = true,
                IsEmailVerified = !_emailVerificationEnabled,
                CreatedAt = DateTime.UtcNow.ToTaipeiTimeString(),
            };

            if (_emailVerificationEnabled)
            {
                // 產生驗證 Token
                var verificationToken = GenerateVerificationToken();
                user.EmailVerificationToken = verificationToken;
                user.EmailVerificationTokenExpiry = 
                    DateTime.UtcNow.AddHours(24).ToTaipeiTimeString();

                var emailSent = await _emailService.SendVerificationEmailAsync(
                    user.Email, user.Username, verificationToken);

                if (!emailSent)
                {
                    _logger.LogWarning($"驗證郵件發送失敗: {user.Email}");
                }
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            string? token = null;
            if (!_emailVerificationEnabled)
            {
                // 功能關閉時，註冊即可登入
                token = _jwtHelper.GenerateToken(user.Id, user.Username, user.Email, user.Role.ToString());
            }

            return new AuthResponse
            {
                Success = true,
                Message = _emailVerificationEnabled
                    ? "註冊成功！請檢查您的電子郵件以驗證帳號。"
                    : "註冊成功！",
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

            if (!user.IsEmailVerified)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "請先驗證您的電子郵件。如未收到驗證郵件，請點擊「重新發送驗證郵件」。"
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

        public async Task<AuthResponse> VerifyEmailAsync(string token)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.EmailVerificationToken == token);

            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "無效的驗證連結"
                };
            }

            if (user.EmailVerificationTokenExpiry < DateTime.UtcNow.ToTaipeiTimeString())
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "驗證連結已過期，請重新發送驗證郵件"
                };
            }

            if (user.IsEmailVerified)
            {
                return new AuthResponse
                {
                    Success = true,
                    Message = "電子郵件已經驗證過了，您可以直接登入"
                };
            }

            // 驗證成功
            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow.ToTaipeiTimeString();

            await _context.SaveChangesAsync();

            // 發送歡迎郵件
            await _emailService.SendWelcomeEmailAsync(user.Email, user.Username);

            return new AuthResponse
            {
                Success = true,
                Message = "電子郵件驗證成功！現在您可以登入了。",
                User = MapToUserResponse(user)
            };
        }

        public async Task<AuthResponse> ResendVerificationEmailAsync(string email)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                // 為了安全，不透露使用者是否存在
                return new AuthResponse
                {
                    Success = true,
                    Message = "如果該電子郵件已註冊且未驗證，驗證郵件將會發送。"
                };
            }

            if (user.IsEmailVerified)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "此電子郵件已經驗證過了"
                };
            }

            // 產生新的驗證 Token
            var verificationToken = GenerateVerificationToken();
            user.EmailVerificationToken = verificationToken;
            user.EmailVerificationTokenExpiry = 
                DateTime.UtcNow.AddHours(24).ToTaipeiTimeString();
            user.UpdatedAt = DateTime.UtcNow.ToTaipeiTimeString();

            await _context.SaveChangesAsync();

            // 發送驗證郵件
            var emailSent = await _emailService.SendVerificationEmailAsync(
                user.Email,
                user.Username,
                verificationToken);

            if (!emailSent)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "發送郵件失敗，請稍後再試"
                };
            }

            return new AuthResponse
            {
                Success = true,
                Message = "驗證郵件已重新發送，請檢查您的收件匣"
            };
        }

        // ========== 忘記密碼：發送重設郵件 ==========
        public async Task<PasswordResetResponse> ForgotPasswordAsync(string email)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == email);

                // 為了安全，無論是否找到用戶都返回相同訊息
                if (user == null)
                {
                    _logger.LogWarning($"密碼重設請求：Email 不存在 - {email}");
                    return new PasswordResetResponse
                    {
                        Success = true,
                        Message = "如果該電子郵件已註冊，您將收到密碼重設信件。"
                    };
                }

                // 檢查帳號是否啟用
                if (!user.IsActive)
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "此帳號已被停用"
                    };
                }

                // 產生重設 Token
                var resetToken = GenerateVerificationToken();
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1).ToTaipeiTimeString(); 
                user.UpdatedAt = DateTime.UtcNow.ToTaipeiTimeString();

                await _context.SaveChangesAsync();

                // 發送重設密碼郵件
                var emailSent = await _emailService.SendPasswordResetEmailAsync(
                    user.Email,
                    user.Username,
                    resetToken);

                if (!emailSent)
                {
                    _logger.LogError($"發送密碼重設郵件失敗: {email}");
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "發送郵件失敗，請稍後再試"
                    };
                }

                _logger.LogInformation($"密碼重設郵件已發送: {email}");

                return new PasswordResetResponse
                {
                    Success = true,
                    Message = "密碼重設信件已發送，請檢查您的收件匣。"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"處理密碼重設請求時發生錯誤: {email}");
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "處理請求時發生錯誤，請稍後再試"
                };
            }
        }

        // ========== 驗證重設 Token 是否有效 ==========
        public async Task<PasswordResetResponse> ValidateResetTokenAsync(string token)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.PasswordResetToken == token);

                if (user == null)
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "無效的重設連結"
                    };
                }

                if (user.PasswordResetTokenExpiry < DateTime.UtcNow.ToTaipeiTimeString())
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "重設連結已過期，請重新申請"
                    };
                }

                return new PasswordResetResponse
                {
                    Success = true,
                    Message = "Token 有效"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "驗證重設 Token 時發生錯誤");
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "驗證失敗"
                };
            }
        }

        // ========== 重設密碼 ==========
        public async Task<PasswordResetResponse> ResetPasswordAsync(ResetPasswordRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token);

                if (user == null)
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "無效的重設連結"
                    };
                }

                if (user.PasswordResetTokenExpiry < DateTime.UtcNow.ToTaipeiTimeString())
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "重設連結已過期，請重新申請密碼重設"
                    };
                }

                // 檢查新密碼是否與舊密碼相同
                if (PasswordHasher.VerifyPassword(request.NewPassword, user.PasswordHash))
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "新密碼不能與舊密碼相同"
                    };
                }

                // 更新密碼
                user.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
                user.PasswordResetToken = null;  // 清除 Token
                user.PasswordResetTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow.ToTaipeiTimeString();

                await _context.SaveChangesAsync();

                _logger.LogInformation($"用戶 {user.Username} 已成功重設密碼");

                return new PasswordResetResponse
                {
                    Success = true,
                    Message = "密碼重設成功！現在您可以使用新密碼登入。"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "重設密碼時發生錯誤");
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "重設密碼失敗，請稍後再試"
                };
            }
        }

        // 產生隨機驗證 Token
        private string GenerateVerificationToken()
        {
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes)
                .Replace("+", "")
                .Replace("/", "")
                .Replace("=", "");
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
                Address = user.Address,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                IsEmailVerified = user.IsEmailVerified,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };
        }
    }
}