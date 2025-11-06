using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Soda.Data;
using Soda.Helpers;
using Soda.Middleware;
using Soda.Services;
using Soda.Services.Interface;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 設定資料庫連線
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 註冊服務
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, MailgunEmailService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<IDataSeeder, DataSeeder>();

// 設定 JWT 驗證
// 優先從環境變數讀取，如果沒有則從設定檔讀取
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
    ?? builder.Configuration["Jwt:Secret"] 
    ?? throw new InvalidOperationException("JWT Secret not configured. Please set JWT_SECRET environment variable or add Jwt:Secret to appsettings.json");
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = System.Security.Claims.ClaimTypes.Role
    };
});

builder.Services.AddAuthorization();

// 設定 CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

builder.Services.AddHostedService<TokenCleanupService>();
builder.Services.AddControllers();

// 加入健康檢查
builder.Services.AddHealthChecks();

var app = builder.Build();

// 初始化資料
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<IDataSeeder>();
    await seeder.SeedAsync();
}

// 設定 HTTP 請求管道
// HTTPS 重定向（生產環境建議啟用）
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.UseJwtMiddleware();

app.MapControllers();

// 健康檢查端點
app.MapHealthChecks("/health");

// 根路徑
app.MapGet("/", () => Results.Json(new { message = "Soda API is running", status = "healthy" }));

app.Run();