using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soda.Services.Interface;
using System.Security.Claims;
using WebApplication1.Models;

namespace SodaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserOrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public UserOrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        /// <summary>
        /// 取得當前登入使用者的所有訂單
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<Order>>> GetMyOrders()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "無法識別使用者身份，請重新登入" });
            }

            try
            {
                var orders = await _orderService.GetUserOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "載入訂單時發生錯誤",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// 取得當前登入使用者的特定訂單詳情
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetMyOrderById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "無法識別使用者身份，請重新登入" });
            }

            try
            {
                var order = await _orderService.GetUserOrderByIdAsync(userId, id);

                if (order == null)
                {
                    return NotFound(new { message = "找不到指定的訂單，或您沒有權限查看此訂單" });
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "載入訂單詳情時發生錯誤",
                    error = ex.Message
                });
            }
        }
    }
}

