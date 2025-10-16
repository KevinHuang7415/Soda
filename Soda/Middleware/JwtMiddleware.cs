using Soda.Helpers;
using Soda.Services.Interface;

namespace Soda.Middleware
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, JwtHelper jwtHelper, ITokenService tokenService)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (token != null)
            {
                // 檢查 Token 是否被撤銷
                var isRevoked = await tokenService.IsTokenRevokedAsync(token);

                if (!isRevoked)
                {
                    var principal = jwtHelper.ValidateToken(token);
                    if (principal != null)
                    {
                        context.User = principal;
                    }
                }
            }

            await _next(context);
        }
    }

    public static class JwtMiddlewareExtensions
    {
        public static IApplicationBuilder UseJwtMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<JwtMiddleware>();
        }
    }
}