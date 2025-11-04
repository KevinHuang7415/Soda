using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Security.Claims;
using WebApplication1.Models;

namespace SodaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserOrdersController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=SodaDB;Trusted_Connection=True;TrustServerCertificate=True;";

        /// <summary>
        /// 取得當前登入使用者的所有訂單
        /// </summary>
        [HttpGet]
        public IActionResult GetMyOrders()
        {
            try
            {
                // 從 JWT Claims 中取得 UserID
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "無法識別使用者身份，請重新登入" });
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return BadRequest(new { message = "使用者 ID 格式錯誤" });
                }

                var orders = new List<Order>();

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string sql = @"SELECT OrderID, UserID, ProductList, TotalAmount, Status, 
                                          OrderDate, PaymentMethod, PaymentStatus, 
                                          ShippingAddress, ShippingMethod, ShippingStatus,
                                          ReceiverName, OrderItems, Notes
                                   FROM Orders
                                   WHERE UserID = @UserID
                                   ORDER BY OrderDate DESC";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);

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
                }

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
        public IActionResult GetMyOrderById(int id)
        {
            try
            {
                // 從 JWT Claims 中取得 UserID
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                
                if (userIdClaim == null)
                {
                    return Unauthorized(new { message = "無法識別使用者身份，請重新登入" });
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return BadRequest(new { message = "使用者 ID 格式錯誤" });
                }

                Order? order = null;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string sql = @"SELECT OrderID, UserID, ProductList, TotalAmount, Status, 
                                          OrderDate, PaymentMethod, PaymentStatus, 
                                          ShippingAddress, ShippingMethod, ShippingStatus,
                                          ReceiverName, OrderItems, Notes
                                   FROM Orders
                                   WHERE OrderID = @OrderID AND UserID = @UserID";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@OrderID", id);
                        cmd.Parameters.AddWithValue("@UserID", userId);

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

