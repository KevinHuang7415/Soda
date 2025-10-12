namespace soda.Models
{
    public class ShoppingCart
    {
        public int Id { get; set; }//宣告id
        public int OrderId { get; set; } //宣告訂單編號
        public int ProductId { get; set; }//宣告商品編號
        public int Product { get; set; }//宣告商品名稱
        public int Quantity { get; set; }//宣告數量
        public int Count { get; set; }//宣告總數
        public string UserId { get; set; }//宣告使用者id
    }
}
