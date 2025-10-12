namespace soda.Models
{

    // Models/Order.cs
    public class Order //訂單
    {
        public Guid OrderId { get; set; } = Guid.NewGuid();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 簡化：先只做基本欄位
        public string CustomerName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Phone { get; set; } = "";
        public string ShippingAddress { get; set; } = "";

        public List<OrderItem> Items { get; set; } = new();
        public decimal Total => Items.Sum(i => i.Subtotal);
    }

    public class OrderItem
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = "";
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal => UnitPrice * Quantity;
    }

}




