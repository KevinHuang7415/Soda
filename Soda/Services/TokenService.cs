using Microsoft.EntityFrameworkCore;
using Soda.Data;
using Soda.Helpers;
using Soda.Models.Entities;
using Soda.Services.Interface;
using System.IdentityModel.Tokens.Jwt;

namespace Soda.Services
{
    public class TokenService : ITokenService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TokenService> _logger;

        public TokenService(ApplicationDbContext context, ILogger<TokenService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task RevokeTokenAsync(string token, int userId, string? reason = null)
        {
            try
            {
                // 解析 Token 取得過期時間
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var expiresAt = jwtToken.ValidTo;

                var revokedToken = new RevokedToken
                {
                    Token = token,
                    UserId = userId,
                    RevokedAt = DateTime.UtcNow.ToTaipeiTimeString(),
                    ExpiresAt = expiresAt,
                    Reason = reason
                };

                _context.RevokedTokens.Add(revokedToken);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Token 已撤銷 - 使用者 ID: {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "撤銷 Token 時發生錯誤");
                throw;
            }
        }

        public async Task<bool> IsTokenRevokedAsync(string token)
        {
            var taipeiNow = DateTime.UtcNow.ToTaipeiTimeString();
            return await _context.RevokedTokens
                .AnyAsync(rt => rt.Token == token && rt.ExpiresAt > taipeiNow);
        }

        public async Task CleanupExpiredTokensAsync()
        {
            try
            {
                var taipeiNow = DateTime.UtcNow.ToTaipeiTimeString();
                var expiredTokens = await _context.RevokedTokens
                    .Where(rt => rt.ExpiresAt <= taipeiNow)
                    .ToListAsync();

                if (expiredTokens.Count != 0)
                {
                    _context.RevokedTokens.RemoveRange(expiredTokens);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"已清理 {expiredTokens.Count} 個過期的撤銷 Token");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "清理過期 Token 時發生錯誤");
            }
        }
    }
}