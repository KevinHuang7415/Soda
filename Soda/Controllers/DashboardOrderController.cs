using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Linq;
using WebApplication1.Models;

namespace SodaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=SodaDB;Trusted_Connection=True;TrustServerCertificate=True;";

        
        [HttpGet]
        public IActionResult GetAll()
        {
            var orders = new List<Order>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string sql = @"SELECT OrderID, UserID, ProductList, TotalAmount, Status, 
                                      OrderDate, PaymentMethod, PaymentStatus, 
                                      ShippingAddress, ShippingMethod, ShippingStatus,
                                      ReceiverName, OrderItems, Notes
                               FROM Orders";

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        orders.Add(new Order
                        {
                            OrderID = reader.GetInt32(reader.GetOrdinal("OrderID")),
                            UserID = reader.GetInt32(reader.GetOrdinal("UserID")),
                            ProductList = reader.GetString(reader.GetOrdinal("ProductList")),
                            TotalAmount = reader.GetDecimal(reader.GetOrdinal("TotalAmount")),
                            Status = reader.GetString(reader.GetOrdinal("Status")),
                            OrderDate = reader.GetDateTime(reader.GetOrdinal("OrderDate")),
                            PaymentMethod = reader["PaymentMethod"] as string ?? string.Empty,
                            PaymentStatus = reader["PaymentStatus"] as string ?? string.Empty,
                            ShippingAddress = reader["ShippingAddress"] as string ?? string.Empty,
                            ShippingMethod = reader["ShippingMethod"] as string ?? string.Empty,
                            ShippingStatus = reader["ShippingStatus"] as string ?? string.Empty,
                            ReceiverName = reader["ReceiverName"] as string ?? string.Empty,
                            OrderItems = reader["OrderItems"] as string ?? string.Empty,
                            Notes = reader["Notes"] as string ?? string.Empty
                        });
                    }
                }
            }

            return Ok(orders);
        }

        
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            Order? order = null;

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string sql = @"SELECT OrderID, UserID, ProductList, TotalAmount, Status, 
                                      OrderDate, PaymentMethod, PaymentStatus, 
                                      ShippingAddress, ShippingMethod, ShippingStatus,
                                      ReceiverName, OrderItems, Notes
                               FROM Orders
                               WHERE OrderID = @OrderID";

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@OrderID", id);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            order = new Order
                            {
                                OrderID = reader.GetInt32(reader.GetOrdinal("OrderID")),
                                UserID = reader.GetInt32(reader.GetOrdinal("UserID")),
                                ProductList = reader.GetString(reader.GetOrdinal("ProductList")),
                                TotalAmount = reader.GetDecimal(reader.GetOrdinal("TotalAmount")),
                                Status = reader.GetString(reader.GetOrdinal("Status")),
                                OrderDate = reader.GetDateTime(reader.GetOrdinal("OrderDate")),
                                PaymentMethod = reader["PaymentMethod"] as string ?? string.Empty,
                                PaymentStatus = reader["PaymentStatus"] as string ?? string.Empty,
                                ShippingAddress = reader["ShippingAddress"] as string ?? string.Empty,
                                ShippingMethod = reader["ShippingMethod"] as string ?? string.Empty,
                                ShippingStatus = reader["ShippingStatus"] as string ?? string.Empty,
                                ReceiverName = reader["ReceiverName"] as string ?? string.Empty,
                                OrderItems = reader["OrderItems"] as string ?? string.Empty,
                                Notes = reader["Notes"] as string ?? string.Empty
                            };
                        }
                    }
                }
            }

            if (order == null)
                return NotFound(new { message = "找不到指定的訂單" });

            return Ok(order);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Order orderRequest)
        {
            try
            {
                // 檢查模型綁定是否成功
                if (orderRequest == null)
                    return BadRequest(new { success = false, message = "請求資料為空，請檢查 JSON 格式" });

                // 檢查模型驗證狀態
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value.Errors.Count > 0)
                        .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
                        .ToList();
                    
                    return BadRequest(new 
                    { 
                        success = false,
                        message = "資料驗證失敗",
                        errors = errors 
                    });
                }

                // 驗證必要的欄位
                if (orderRequest.UserID <= 0)
                    return BadRequest(new { success = false, message = "UserID 為必填欄位且必須大於 0，目前值：" + orderRequest.UserID });

                if (string.IsNullOrEmpty(orderRequest.ProductList))
                    return BadRequest(new { success = false, message = "ProductList 為必填欄位" });

                if (orderRequest.TotalAmount <= 0)
                    return BadRequest(new { success = false, message = "TotalAmount 必須大於 0，目前值：" + orderRequest.TotalAmount });

                // 插入新訂單到資料庫
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string sql = @"INSERT INTO Orders 
                                   (UserID, ProductList, TotalAmount, Status, OrderDate, 
                                    PaymentMethod, PaymentStatus, ShippingAddress, 
                                    ShippingMethod, ShippingStatus, ReceiverName, OrderItems, Notes)
                                   OUTPUT INSERTED.OrderID
                                   VALUES 
                                   (@UserID, @ProductList, @TotalAmount, @Status, @OrderDate, 
                                    @PaymentMethod, @PaymentStatus, @ShippingAddress, 
                                    @ShippingMethod, @ShippingStatus, @ReceiverName, @OrderItems, @Notes)";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserID", orderRequest.UserID);
                        cmd.Parameters.AddWithValue("@ProductList", orderRequest.ProductList ?? string.Empty);
                        cmd.Parameters.AddWithValue("@TotalAmount", orderRequest.TotalAmount);
                        cmd.Parameters.AddWithValue("@Status", orderRequest.Status ?? "Pending");
                        cmd.Parameters.AddWithValue("@OrderDate", DateTime.UtcNow);
                        cmd.Parameters.AddWithValue("@PaymentMethod", orderRequest.PaymentMethod ?? string.Empty);
                        cmd.Parameters.AddWithValue("@PaymentStatus", orderRequest.PaymentStatus ?? "Unpaid");
                        cmd.Parameters.AddWithValue("@ShippingAddress", orderRequest.ShippingAddress ?? string.Empty);
                        cmd.Parameters.AddWithValue("@ShippingMethod", orderRequest.ShippingMethod ?? "宅配");
                        cmd.Parameters.AddWithValue("@ShippingStatus", orderRequest.ShippingStatus ?? "Pending");
                        cmd.Parameters.AddWithValue("@ReceiverName", orderRequest.ReceiverName ?? string.Empty);
                        cmd.Parameters.AddWithValue("@OrderItems", orderRequest.OrderItems ?? string.Empty);
                        cmd.Parameters.AddWithValue("@Notes", orderRequest.Notes ?? string.Empty);

                        // 執行插入並獲取新創建的 OrderID
                        int newOrderId = (int)cmd.ExecuteScalar();

                        // 返回成功響應
                        return Ok(new 
                        { 
                            success = true,
                            message = "訂單建立成功",
                            orderId = newOrderId
                        });
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                // SQL 錯誤的詳細處理
                return StatusCode(500, new 
                { 
                    success = false,
                    message = "資料庫操作失敗",
                    error = sqlEx.Message,
                    sqlError = sqlEx.Number.ToString()
                });
            }
            catch (Exception ex)
            {
                // 一般錯誤處理
                return StatusCode(500, new 
                { 
                    success = false,
                    message = "建立訂單時發生錯誤",
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}
