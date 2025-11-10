using WebApplication1.Models;

namespace Soda.Services.Interface
{
    public interface IOrderService
    {
        /// <summary>
        /// 取得指定使用者的所有訂單
        /// </summary>
        Task<List<Order>> GetUserOrdersAsync(int userId);

        /// <summary>
        /// 取得指定使用者的特定訂單
        /// </summary>
        Task<Order?> GetUserOrderByIdAsync(int userId, int orderId);

        /// <summary>
        /// 建立新訂單
        /// </summary>
        Task<Order> CreateOrderAsync(Order order);
    }
}

