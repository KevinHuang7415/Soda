using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Soda.Models.DTOs;
using System.Diagnostics;
using WebApplication1.Models;


namespace SodaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=sodaDB;Trusted_Connection=True;TrustServerCertificate=True;";

        [HttpGet]
        public IActionResult GetAll()
        {
            var coupons = new List<Coupon>();
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string sql = "SELECT * FROM Coupons";
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        coupons.Add(new Coupon
                        {
                            Id = reader["Id"] != DBNull.Value ? Convert.ToInt32(reader["Id"]) : 0,
                            Code = reader["Code"] != DBNull.Value ? reader["Code"].ToString()! : string.Empty,
                            Discount = reader["Discount"] != DBNull.Value ? Convert.ToDecimal(reader["Discount"]) : 0m,
                            Status = reader["Status"] != DBNull.Value ? reader["Status"].ToString()! : "active",
                            DiscountType = reader["DiscountType"] != DBNull.Value ? reader["DiscountType"].ToString()! : "A",
                        });
                    }
                }
            }
            return Ok(coupons);
        }

        
        [HttpPut("{id}")]
        public IActionResult UpdateCoupon(int id, [FromBody] Coupon updatedCoupon)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string sql = @"UPDATE Coupons SET Code = @Code, Discount = @Discount, Status = @Status, DiscountType = @DiscountType WHERE Id = @Id";

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@Code", updatedCoupon.Code);
                    cmd.Parameters.AddWithValue("@Discount", updatedCoupon.Discount);
                    cmd.Parameters.AddWithValue("@Status", updatedCoupon.Status);
                    cmd.Parameters.AddWithValue("@DiscountType", updatedCoupon.DiscountType);
                    cmd.Parameters.AddWithValue("@Id", id);

                    int rowsAffected = cmd.ExecuteNonQuery();

                    if (rowsAffected > 0)
                        return Ok(new { message = "優惠券更新成功" });
                    else
                        return NotFound(new { message = "找不到該優惠券" });
                }
            }
        }
    }

}
