using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soda.Models.DTOs;
using Soda.Services.Interface;
using System.Security.Claims;

namespace Soda.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ITokenService _tokenService;

        public AuthController(IAuthService authService, ITokenService tokenService)
        {
            _authService = authService;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _authService.RegisterAsync(request);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _authService.LoginAsync(request);

            if (!response.Success)
                return Unauthorized(response);

            return Ok(response);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult> Logout()
        {
            try
            {
                // 取得當前使用者 ID
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { message = "無效的使用者" });

                // 取得 Token
                var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                if (string.IsNullOrEmpty(token))
                    return BadRequest(new { message = "Token 不存在" });

                // 撤銷 Token
                await _tokenService.RevokeTokenAsync(token, userId, "使用者登出");

                return Ok(new
                {
                    success = true,
                    message = "登出成功"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "登出時發生錯誤",
                    error = ex.Message
                });
            }
        }

        [HttpPost("logout-all")]
        [Authorize]
        public async Task<ActionResult> LogoutAll()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { message = "無效的使用者" });

                var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                if (string.IsNullOrEmpty(token))
                    return BadRequest(new { message = "Token 不存在" });

                await _tokenService.RevokeTokenAsync(token, userId, "登出所有裝置");

                return Ok(new
                {
                    success = true,
                    message = "已登出所有裝置"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "登出時發生錯誤",
                    error = ex.Message
                });
            }
        }

        [HttpGet("verify-email")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> VerifyEmail([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest(new AuthResponse { Success = false, Message = "Token 不可為空" });

            var response = await _authService.VerifyEmailAsync(token);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("resend-verification")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> ResendVerification([FromBody] ResendVerificationRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _authService.ResendVerificationEmailAsync(request.Email);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<ActionResult<PasswordResetResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _authService.ForgotPasswordAsync(request.Email);

            // 即使失敗也返回 200（安全考量，不透露用戶是否存在）
            return Ok(response);
        }

        [HttpGet("validate-reset-token")]
        [AllowAnonymous]
        public async Task<ActionResult<PasswordResetResponse>> ValidateResetToken([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest(new PasswordResetResponse
                {
                    Success = false,
                    Message = "Token 不可為空"
                });

            var response = await _authService.ValidateResetTokenAsync(token);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<ActionResult<PasswordResetResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _authService.ResetPasswordAsync(request);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}