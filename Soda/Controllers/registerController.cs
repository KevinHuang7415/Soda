using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Soda.Helpers;
using Soda.Models.DTOs;
using Soda.Models.Entities;

namespace SodaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CreateUsersController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=SodaDB;Trusted_Connection=True;TrustServerCertificate=True;";

        [HttpPost]
        public IActionResult AddUser([FromBody] UserRegisterDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "請輸入完整資料" });           
            if (!TryValidateModel(dto))
                return BadRequest(ModelState);

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    
                    string checkSql = "SELECT COUNT(*) FROM Users WHERE Username=@Username OR Email=@Email";
                    using (SqlCommand checkCmd = new SqlCommand(checkSql, conn))
                    {
                        checkCmd.Parameters.AddWithValue("@Username", dto.Username);
                        checkCmd.Parameters.AddWithValue("@Email", dto.Email);
                        int count = (int)checkCmd.ExecuteScalar();
                        if (count > 0)
                            return Conflict(new { message = "使用者名稱或電子郵件已存在" });
                    }

                   
                    string hashedPassword = PasswordHasher.HashPassword(dto.Password);

                    
                    string sql = @"
                        INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName)
                        VALUES (@Username, @Email, @PasswordHash, @FirstName, @LastName)";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@Username", dto.Username);
                        cmd.Parameters.AddWithValue("@Email", dto.Email);
                        cmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);
                        cmd.Parameters.AddWithValue("@FirstName", dto.FirstName);
                        cmd.Parameters.AddWithValue("@LastName", dto.LastName);

                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                            return Ok(new { message = "建立帳號成功 三秒後跳轉到註冊頁面" });
                        else
                            return BadRequest(new { message = "建立帳號失敗" });
                    }
                }
            }
            catch (SqlException ex)
            {
                
                return StatusCode(500, new { message = "資料庫錯誤", detail = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "伺服器發生錯誤", detail = ex.Message });
            }
        }
    }
}
