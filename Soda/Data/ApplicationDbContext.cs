using Microsoft.EntityFrameworkCore;
using Soda.Models.Entities;
using Soda.Models.Enums;
using WebApplication1.Models;

namespace Soda.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<RevokedToken> RevokedTokens { get; set; }

        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 設定唯一索引
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // 設定預設值
            modelBuilder.Entity<User>()
                .Property(u => u.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<User>()
                .Property(u => u.IsActive)
                .HasDefaultValue(true);

            // 設定角色預設值
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasDefaultValue(UserRole.User);

            // RevokedTokens 設定
            modelBuilder.Entity<RevokedToken>()
                .HasIndex(rt => rt.Token);

            modelBuilder.Entity<RevokedToken>()
                .HasIndex(rt => rt.ExpiresAt);
        }
    }
}