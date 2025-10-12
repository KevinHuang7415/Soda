namespace soda.Models
{
    // Models/CartItem.cs
    public class CartItem //購物車項目
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = "";
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; } //數量
        public decimal Subtotal => UnitPrice * Quantity; //小計
    }

}




