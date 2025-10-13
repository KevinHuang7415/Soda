namespace WebApplication1.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public decimal Price { get; set; }
        public int Stock { get; set; }
    }
    public class OrderItem
    {
        public string Name { get; set; } = "";
    }

    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public List<OrderItem> Items { get; set; } = new();
        public decimal Total { get; set; }
        public string Status { get; set; } = "pending";

    }
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Status { get; set; } = "active";
    }
    public class Coupon
    {
        public int Id { get; set; }
        public string Code { get; set; } = "";
        public int Discount { get; set; }
        public string Status { get; set; } = "active";
    }
    
}
