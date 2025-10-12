namespace Soda.Services.Interface
{
    public interface ITokenService
    {
        Task RevokeTokenAsync(string token, int userId, string? reason = null);
        Task<bool> IsTokenRevokedAsync(string token);
        Task CleanupExpiredTokensAsync();
    }
}