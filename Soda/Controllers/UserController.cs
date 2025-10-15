using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soda.Models.DTOs;
using Soda.Services.Interface;
using System.Security.Claims;

namespace Soda.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserResponse>> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // 只有管理員可以查看所有使用者
        [HttpGet("Users")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<UserResponse>>> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(int id, [FromBody] UserResponse userUpdate)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // 管理員可以更新任何人，一般使用者只能更新自己
            if (currentUserRole != "Admin" && currentUserId != id)
                return Forbid();

            var success = await _userService.UpdateUserAsync(id, userUpdate);

            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // 管理員可以刪除任何人（除了自己），一般使用者只能刪除自己
            if (currentUserRole != "Admin" && currentUserId != id)
                return Forbid();

            // 防止管理員刪除自己
            if (currentUserRole == "Admin" && currentUserId == id)
                return BadRequest(new { message = "管理員不能刪除自己的帳號" });

            var success = await _userService.DeleteUserAsync(id);

            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpPost("change-password")]
        public async Task<ActionResult<ChangePasswordResponse>> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new ChangePasswordResponse
                {
                    Success = false,
                    Message = "無效的使用者"
                });

            var response = await _userService.ChangePasswordAsync(userId, request);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}