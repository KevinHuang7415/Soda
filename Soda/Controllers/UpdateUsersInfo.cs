using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Soda.Models.DTOs;

[ApiController]
[Route("api/[controller]")]
public class UpdateUserInfoController : ControllerBase
{
    private readonly string connectionString = "Server=localhost;Database=sodaDB;Trusted_Connection=True;TrustServerCertificate=True;";

    [HttpPut("{id}")]
    public IActionResult UpdateUser(int id, [FromBody] UpdateUserDto updatedUser)
    {
        if (updatedUser == null)
        {
            return BadRequest(new { message = "無效的使用者資料" });
        }

        if (string.IsNullOrWhiteSpace(updatedUser.Username) ||
            string.IsNullOrWhiteSpace(updatedUser.FirstName) ||
            string.IsNullOrWhiteSpace(updatedUser.LastName) ||
            string.IsNullOrWhiteSpace(updatedUser.Address))
        {
            return BadRequest(new { message = "所有欄位都必須填寫" });
        }

        using (SqlConnection conn = new SqlConnection(connectionString))
        {
            conn.Open();

            string sql = @"UPDATE Users 
                           SET Username = @Username, 
                               FirstName = @FirstName, 
                               LastName = @LastName, 
                               Address = @Address 
                           WHERE Id = @Id";

            using (SqlCommand cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@Username", updatedUser.Username);
                cmd.Parameters.AddWithValue("@FirstName", updatedUser.FirstName);
                cmd.Parameters.AddWithValue("@LastName", updatedUser.LastName);
                cmd.Parameters.AddWithValue("@Address", updatedUser.Address);
                cmd.Parameters.AddWithValue("@Id", id);

                int rows = cmd.ExecuteNonQuery();
                if (rows == 0)
                    return NotFound(new { message = "找不到該使用者" });
            }
        }

        return Ok(new { message = "使用者資料更新成功" });
    }
}
