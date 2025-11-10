using Microsoft.EntityFrameworkCore;
using Soda.Data;
using Soda.Services.Interface;
using WebApplication1.Models;

namespace Soda.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrderService> _logger;

        public OrderService(ApplicationDbContext context, ILogger<OrderService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<Order>> GetUserOrdersAsync(int userId)
        {
            try
            {
                var orders = await _context.Orders
                    .Where(o => o.UserID == userId)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();

                return orders;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"取得使用者 {userId} 的訂單時發生錯誤");
                throw;
            }
        }

        public async Task<Order?> GetUserOrderByIdAsync(int userId, int orderId)
        {
            try
            {
                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.OrderID == orderId && o.UserID == userId);

                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"取得訂單 {orderId} 時發生錯誤");
                throw;
            }
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            try
            {
                // 設定預設值
                order.OrderDate = DateTime.UtcNow;
                
                if (string.IsNullOrEmpty(order.Status))
                    order.Status = "Pending";
                
                if (string.IsNullOrEmpty(order.PaymentStatus))
                    order.PaymentStatus = "Unpaid";
                
                if (string.IsNullOrEmpty(order.ShippingStatus))
                    order.ShippingStatus = "Pending";

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"成功建立訂單 {order.OrderID}，使用者 {order.UserID}");

                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"建立訂單時發生錯誤，使用者 {order.UserID}");
                throw;
            }
        }
    }
}

