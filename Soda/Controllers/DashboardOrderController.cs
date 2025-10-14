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
                string sql = "SELECT OrderID, UserID, ProductList, TotalAmount, Status, OrderDate FROM Orders";

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
                            OrderDate = reader.GetDateTime(reader.GetOrdinal("OrderDate"))
                        });
                    }
                }
            }

            return Ok(orders);
        }
    }
}
