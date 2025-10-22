using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Soda.Models.DTOs;
using System.Diagnostics;
using WebApplication1.Models;


namespace SodaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=sodaDB;Trusted_Connection=True;TrustServerCertificate=True;";
        [HttpGet]
        public IActionResult GetAll()
        {
            var Users = new List<UserResponse>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string sql = "SELECT * FROM Users";
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Users.Add(new UserResponse
                        {
                            Id = reader.GetInt32(0),
                            Username = reader.GetString(1),
                            Email = reader.GetString(2),
                            FirstName = reader.IsDBNull(4) ? null : reader.GetString(4),
                            LastName = reader.IsDBNull(5) ? null : reader.GetString(5),
                            IsActive = reader.GetBoolean(7),
                            PhoneNumber = reader.IsDBNull(8) ? null : reader.GetString(8),
                            CreatedAt = reader.GetDateTime(9),
                            IsEmailVerified = reader.GetBoolean(15),
                        });
                    }
                }
            }

            return Ok(Users);
        }
    }
}
