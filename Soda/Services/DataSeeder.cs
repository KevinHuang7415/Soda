using Microsoft.EntityFrameworkCore;
using Soda.Data;
using Soda.Helpers;
using Soda.Models.Entities;
using Soda.Models.Enums;
using Soda.Services.Interface;

namespace Soda.Services
{
    public class DataSeeder : IDataSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<DataSeeder> _logger;

        public DataSeeder(
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<DataSeeder> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            try
            {
                // 確保資料庫已建立
                await _context.Database.EnsureCreatedAsync();

                // 檢查是否已有管理員
                var adminExists = await _context.Users.AnyAsync(u => u.Role == UserRole.Admin);

                if (!adminExists)
                {
                    _logger.LogInformation("未找到管理員帳號，開始建立預設管理員...");

                    // 從設定檔讀取管理員資訊
                    var adminUsername = _configuration["DefaultAdmin:Username"] ?? "admin";
                    var adminEmail = _configuration["DefaultAdmin:Email"] ?? "admin@example.com";
                    var adminPassword = _configuration["DefaultAdmin:Password"] ?? "admin123";
                    var adminFirstName = _configuration["DefaultAdmin:FirstName"] ?? "系統";
                    var adminLastName = _configuration["DefaultAdmin:LastName"] ?? "管理員";

                    var admin = new User
                    {
                        Username = adminUsername,
                        Email = adminEmail,
                        PasswordHash = PasswordHasher.HashPassword(adminPassword),
                        FirstName = adminFirstName,
                        LastName = adminLastName,
                        Role = UserRole.Admin,
                        IsEmailVerified = true,
                        CreatedAt = DateTime.UtcNow.ToTaipeiTimeString()
                    };

                    _context.Users.Add(admin);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("預設管理員建立成功！");
                    _logger.LogInformation($"管理員帳號: {adminUsername}");
                    _logger.LogInformation($"管理員信箱: {adminEmail}");
                    _logger.LogWarning("請記得修改預設管理員密碼！");
                }
                else
                {
                    _logger.LogInformation("管理員帳號已存在，跳過初始化。");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "初始化管理員資料時發生錯誤");
                throw;
            }
        }
    }
}