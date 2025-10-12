namespace soda.Models
{
    // Models/Cart.cs
    public class Cart //購物車
    {
        public List<CartItem> Items { get; set; } = new(); //購物車項目清單
        public decimal Total => Items.Sum(i => i.Subtotal); // 總計
    }


}




