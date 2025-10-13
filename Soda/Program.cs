using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
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
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<IDataSeeder, DataSeeder>();

// 設定 JWT 驗證
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
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
builder.Services.AddEndpointsApiExplorer();

// ============ Swagger 完整設定 ============
builder.Services.AddSwaggerGen(options =>
{
    // API 基本資訊
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "會員系統 API",
        Version = "v1",
        Description = "ASP.NET Core 會員系統 RESTful API - 支援 JWT 驗證",
        Contact = new OpenApiContact
        {
            Name = "開發團隊",
            Email = "dev@example.com"
        }
    });

    // 加入 JWT Bearer 驗證設定
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = @"請輸入 JWT Token。
                        
使用方式：
1. 呼叫 /api/auth/login 取得 Token
2. 點擊右上角 'Authorize' 按鈕
3. 在彈出視窗中輸入 Token（不需要加 'Bearer ' 前綴）
4. 點擊 'Authorize' 確認
5. 現在所有 API 都會自動帶上 Token"
    });

    // 讓所有需要驗證的 API 都套用這個安全要求
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
// ==========================================

var app = builder.Build();

// 初始化資料
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<IDataSeeder>();
    await seeder.SeedAsync();
}

// 設定 HTTP 請求管道
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "會員系統 API v1");
        options.RoutePrefix = "swagger";

        // 可選：設定 UI 主題
        options.DefaultModelsExpandDepth(-1);  // 隱藏 Models 區塊
        options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);  // 預設收合所有端點
        options.DisplayRequestDuration();  // 顯示請求時間
    });
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.UseJwtMiddleware();

app.MapControllers();

app.MapGet("/", () => Results.Redirect("/swagger"));  // 預設開啟 Swagger

app.Run();