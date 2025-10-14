using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
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
    }
}
