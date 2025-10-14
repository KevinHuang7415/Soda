using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using WebApplication1.Models;

namespace SodaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=sodaDB;Trusted_Connection=True;TrustServerCertificate=True;";

        // 顯示所有商品
        [HttpGet]
        public IActionResult GetAll()
        {
            var products = new List<Product>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string sql = "SELECT Id, Name, Price, Stock, ImageUrl, Size FROM Products";
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        products.Add(new Product
                        {
                            Id = reader.GetInt32(0),
                            Name = reader.GetString(1),
                            Price = reader.GetDecimal(2),
                            Stock = reader.GetInt32(3),
                            ImageUrl = reader.GetString(4),
                            Size = reader.GetString(5)
                        });
                    }
                }
            }

            return Ok(products);
        }

        // 更新商品（名稱、價格、庫存）
        [HttpPut("{id}")]
        public IActionResult UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            if (updatedProduct == null)
            {
                return BadRequest(new { message = "無效的商品資料" });
            }

            if (string.IsNullOrWhiteSpace(updatedProduct.Name))
            {
                return BadRequest(new { message = "商品名稱不能為空" });
            }

            if (updatedProduct.Price < 0)
            {
                return BadRequest(new { message = "價格不能小於0" });
            }

            if (updatedProduct.Stock < 0)
            {
                return BadRequest(new { message = "庫存不能小於0" });
            }
            if (updatedProduct.ImageUrl == null)
            {
                return BadRequest(new { message = "無效的連結" });
            }
            if (updatedProduct.Size == null)
            {
                return BadRequest(new { message = "無效的規格" });
            }


            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string sql = "UPDATE Products SET Name = @Name, Price = @Price, Stock = @Stock, ImageUrl= @ImageUrl, Size = @Size WHERE Id = @Id";
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@Name", updatedProduct.Name);
                    cmd.Parameters.AddWithValue("@Price", updatedProduct.Price);
                    cmd.Parameters.AddWithValue("@Stock", updatedProduct.Stock);
                    cmd.Parameters.AddWithValue("@ImageUrl", updatedProduct.ImageUrl);
                    cmd.Parameters.AddWithValue("@Size", updatedProduct.Size);
                    cmd.Parameters.AddWithValue("@Id", id);

                    int rows = cmd.ExecuteNonQuery();
                    if (rows == 0)
                        return NotFound(new { message = "找不到該商品" });
                }
            }

            return Ok(new { message = "商品更新成功" });
        }
    }
}
