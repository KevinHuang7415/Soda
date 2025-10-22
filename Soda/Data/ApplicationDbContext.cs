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
            modelBuilder.HasDefaultSchema("dbo");
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

            //modelBuilder.Entity<Product>().HasData(
            //    new Product { Id = 1, Name = "紅茶", Price = 25, Stock = 100 , ImageUrl="test.com",Size="4*355"},
            //    new Product { Id = 2, Name = "紅茶", Price = 30, Stock = 80, ImageUrl = "test.com", Size = "12*355" },
            //    new Product { Id = 3, Name = "綠茶", Price = 35, Stock = 60, ImageUrl = "test.com", Size = "4*355" },
            //    new Product { Id = 4, Name = "綠茶", Price = 35, Stock = 60, ImageUrl = "test.com", Size = "12*355" },
            //    new Product { Id = 5, Name = "清茶", Price = 40, Stock = 60, ImageUrl = "test.com", Size = "4*355" },
            //    new Product { Id = 6, Name = "清茶", Price = 35, Stock = 60, ImageUrl = "test.com", Size = "12*355" }
            //);

            

            //modelBuilder.Entity<Coupon>().HasData(
            //    new Coupon { Id = 1, Code = "DISCOUNT10", Discount = 60, DiscountType = "P", Status = "active" },
            //    new Coupon { Id = 2, Code = "DISCOUNT20", Discount = 600, DiscountType = "A", Status = "active" }
            //);


        }
    }
}