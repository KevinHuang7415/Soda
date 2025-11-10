using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Soda.Data;
using System.Data;
using System.Linq;
using WebApplication1.Models;

namespace SodaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        //private readonly string connectionString = "Server=localhost;Database=SodaDB;Trusted_Connection=True;TrustServerCertificate=True;";
        private readonly ApplicationDbContext _context;
        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders.ToListAsync();
            return Ok(orders);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult>GetById(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound(new { message = "找不到指定的訂單" });
            return Ok(order);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order orderRequest)
        {
            if (orderRequest == null)
                return BadRequest(new { message = "無效的訂單" });
            if (orderRequest.UserID <= 0)
                return BadRequest(new { success = false, message = "UserID 為必填欄位且必須大於 0，目前值：" + orderRequest.UserID });

            if (string.IsNullOrEmpty(orderRequest.ProductList))
                return BadRequest(new { success = false, message = "ProductList 為必填欄位" });

            if (orderRequest.TotalAmount <= 0)
                return BadRequest(new { success = false, message = "TotalAmount 必須大於 0，目前值：" + orderRequest.TotalAmount });
            _context.Orders.Add(orderRequest);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                success = true,
                message = "Orders created successfully!",
                orderId = orderRequest.OrderID,
                data = orderRequest
            });
        }

        //[HttpPost]
        //public IActionResult Create([FromBody] Order orderRequest)
        //{
        //    try
        //    {
        //        // 檢查模型綁定是否成功
        //        if (orderRequest == null)
        //            return BadRequest(new { success = false, message = "請求資料為空，請檢查 JSON 格式" });

        //        // 檢查模型驗證狀態
        //        if (!ModelState.IsValid)
        //        {
        //            var errors = ModelState
        //                .Where(x => x.Value.Errors.Count > 0)
        //                .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
        //                .ToList();

        //            return BadRequest(new
        //            {
        //                success = false,
        //                message = "資料驗證失敗",
        //                errors = errors
        //            });
        //        }

        //        // 驗證必要的欄位
        //        if (orderRequest.UserID <= 0)
        //            return BadRequest(new { success = false, message = "UserID 為必填欄位且必須大於 0，目前值：" + orderRequest.UserID });

        //        if (string.IsNullOrEmpty(orderRequest.ProductList))
        //            return BadRequest(new { success = false, message = "ProductList 為必填欄位" });

        //        if (orderRequest.TotalAmount <= 0)
        //            return BadRequest(new { success = false, message = "TotalAmount 必須大於 0，目前值：" + orderRequest.TotalAmount });

        //        // 插入新訂單到資料庫
        //        using (SqlConnection conn = new SqlConnection(connectionString))
        //        {
        //            conn.Open();
        //            string sql = @"INSERT INTO Orders 
        //                           (UserID, ProductList, TotalAmount, Status, OrderDate, 
        //                            PaymentMethod, PaymentStatus, ShippingAddress, 
        //                            ShippingMethod, ShippingStatus, ReceiverName, OrderItems, Notes)
        //                           OUTPUT INSERTED.OrderID
        //                           VALUES 
        //                           (@UserID, @ProductList, @TotalAmount, @Status, @OrderDate, 
        //                            @PaymentMethod, @PaymentStatus, @ShippingAddress, 
        //                            @ShippingMethod, @ShippingStatus, @ReceiverName, @OrderItems, @Notes)";

        //            using (SqlCommand cmd = new SqlCommand(sql, conn))
        //            {
        //                cmd.Parameters.AddWithValue("@UserID", orderRequest.UserID);
        //                cmd.Parameters.AddWithValue("@ProductList", orderRequest.ProductList ?? string.Empty);
        //                cmd.Parameters.AddWithValue("@TotalAmount", orderRequest.TotalAmount);
        //                cmd.Parameters.AddWithValue("@Status", orderRequest.Status ?? "Pending");
        //                cmd.Parameters.AddWithValue("@OrderDate", DateTime.UtcNow);
        //                cmd.Parameters.AddWithValue("@PaymentMethod", orderRequest.PaymentMethod ?? string.Empty);
        //                cmd.Parameters.AddWithValue("@PaymentStatus", orderRequest.PaymentStatus ?? "Unpaid");
        //                cmd.Parameters.AddWithValue("@ShippingAddress", orderRequest.ShippingAddress ?? string.Empty);
        //                cmd.Parameters.AddWithValue("@ShippingMethod", orderRequest.ShippingMethod ?? "宅配");
        //                cmd.Parameters.AddWithValue("@ShippingStatus", orderRequest.ShippingStatus ?? "Pending");
        //                cmd.Parameters.AddWithValue("@ReceiverName", orderRequest.ReceiverName ?? string.Empty);
        //                cmd.Parameters.AddWithValue("@OrderItems", orderRequest.OrderItems ?? string.Empty);
        //                cmd.Parameters.AddWithValue("@Notes", orderRequest.Notes ?? string.Empty);

        //                // 執行插入並獲取新創建的 OrderID
        //                int newOrderId = (int)cmd.ExecuteScalar();

        //                // 返回成功響應
        //                return Ok(new
        //                {
        //                    success = true,
        //                    message = "訂單建立成功",
        //                    orderId = newOrderId
        //                });
        //            }
        //        }
        //    }
        //    catch (SqlException sqlEx)
        //    {
        //        // SQL 錯誤的詳細處理
        //        return StatusCode(500, new
        //        {
        //            success = false,
        //            message = "資料庫操作失敗",
        //            error = sqlEx.Message,
        //            sqlError = sqlEx.Number.ToString()
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        // 一般錯誤處理
        //        return StatusCode(500, new
        //        {
        //            success = false,
        //            message = "建立訂單時發生錯誤",
        //            error = ex.Message,
        //            stackTrace = ex.StackTrace
        //        });
        //    }
        //}
    }
}
