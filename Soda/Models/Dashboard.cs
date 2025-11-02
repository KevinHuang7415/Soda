using System;
using Soda.Helpers;
using Soda.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    [Table("Products")]
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Size { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Required]
        public int Stock { get; set; }

        [MaxLength(255)]
        public string? ImageUrl { get; set; }

    }

    [Table("Orders")]
    public class Order
    {
        [Key]
        public int OrderID { get; set; }             

        [Required]
        public int UserID { get; set; }             

        [Required]
        public string ProductList { get; set; } = string.Empty;  

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }    

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; 

        public DateTime OrderDate { get; set; } = DateTime.UtcNow; 

        [MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty; 

        [MaxLength(20)]
        public string PaymentStatus { get; set; } = "Unpaid"; 

        [MaxLength(200)]
        public string ShippingAddress { get; set; } = string.Empty; 

        [MaxLength(50)]
        public string ShippingMethod { get; set; } = string.Empty; 

        [MaxLength(20)]
        public string ShippingStatus { get; set; } = "Pending"; 

        [MaxLength(50)]
        public string ReceiverName { get; set; } = string.Empty; 

        // OrderItems 儲存 JSON 字串，可能很長，所以使用 max 長度
        // 或者設定一個足夠大的長度（如 2000 或 4000）
        [MaxLength(4000)]
        public string OrderItems { get; set; } = string.Empty; 

        [MaxLength(500)]
        public string Notes { get; set; } = string.Empty; 

    }

    

    [Table("Coupons")]
    public class Coupon
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Discount { get; set; }

        // A 表示金額折扣，P 表示百分比折扣
        [Required]
        [MaxLength(1)]
        public string DiscountType { get; set; } = "A";

        [Required]
        [MaxLength(10)]
        public string Status { get; set; } = "active";


    }
}
