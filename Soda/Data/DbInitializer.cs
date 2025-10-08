using Soda.Models;
using Soda.Services;

namespace Soda.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context, IPasswordService passwordService)
        {
            context.Database.EnsureCreated();

            // 檢查是否已有資料
            if (context.Users.Any())
            {
                return;   // 資料庫已有資料
            }

            // 建立預設管理員帳號
            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@example.com",
                PasswordHash = passwordService.HashPassword("admin123"),
                FirstName = "Admin",
                LastName = "User",
                Role = "Admin",
                EmailConfirmed = true,
                CreatedAt = DateTimeExtensions.ToTaipeiTimeString(DateTime.UtcNow)
            };

            context.Users.Add(adminUser);
            context.SaveChanges();
        }
    }
}