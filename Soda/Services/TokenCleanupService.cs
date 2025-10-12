using Soda.Services.Interface;

namespace Soda.Services
{
    public class TokenCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TokenCleanupService> _logger;
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(1); // 每小時清理一次

        public TokenCleanupService(
            IServiceProvider serviceProvider,
            ILogger<TokenCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Token 清理服務已啟動");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(_cleanupInterval, stoppingToken);

                    using var scope = _serviceProvider.CreateScope();
                    var tokenService = scope.ServiceProvider.GetRequiredService<ITokenService>();

                    await tokenService.CleanupExpiredTokensAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Token 清理服務發生錯誤");
                }
            }

            _logger.LogInformation("Token 清理服務已停止");
        }
    }
}