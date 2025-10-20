using RestSharp;
using RestSharp.Authenticators;
using Soda.Helpers;
using Soda.Services.Interface;

namespace Soda.Services
{
    public class MailgunEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<MailgunEmailService> _logger;
        private readonly string _apiKey;
        private readonly string _domain;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _baseUrl;

        public MailgunEmailService(IConfiguration configuration, ILogger<MailgunEmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            _apiKey = _configuration["Mailgun:ApiKey"] ?? throw new ArgumentNullException("Mailgun:ApiKey");
            _domain = _configuration["Mailgun:Domain"] ?? throw new ArgumentNullException("Mailgun:Domain");
            _fromEmail = _configuration["Mailgun:FromEmail"] ?? "noreply@example.com";
            _fromName = _configuration["Mailgun:FromName"] ?? "會員系統";
            _baseUrl = _configuration["AppSettings:BaseUrl"] ?? "https://localhost:7085";
        }

        public async Task<bool> SendVerificationEmailAsync(string toEmail, string username, string verificationToken)
        {
            try
            {
                var verificationUrl = $"{_baseUrl}/api/auth/verify-email?token={verificationToken}";

                var subject = "請驗證您的電子郵件 - 會員系統";
                var htmlBody = GetVerificationEmailTemplate(username, verificationUrl);
                var textBody = $"歡迎 {username}！請點擊以下連結驗證您的電子郵件：{verificationUrl}";

                var result = await SendEmailAsync(toEmail, subject, htmlBody, textBody);

                if (result)
                {
                    _logger.LogInformation($"驗證郵件已發送至: {toEmail}");
                }
                else
                {
                    _logger.LogWarning($"驗證郵件發送失敗: {toEmail}");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"發送驗證郵件時發生錯誤: {toEmail}");
                return false;
            }
        }

        public async Task<bool> SendWelcomeEmailAsync(string toEmail, string username)
        {
            try
            {
                var subject = "歡迎加入會員系統！";
                var htmlBody = GetWelcomeEmailTemplate(username);
                var textBody = $"歡迎 {username}！您的帳號已成功啟用。";

                var result = await SendEmailAsync(toEmail, subject, htmlBody, textBody);

                if (result)
                {
                    _logger.LogInformation($"歡迎郵件已發送至: {toEmail}");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"發送歡迎郵件時發生錯誤: {toEmail}");
                return false;
            }
        }

        public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string username, string resetToken)
        {
            try
            {
                var resetUrl = $"{_baseUrl}/api/auth/reset-password?token={resetToken}";

                var subject = "重設密碼 - 會員系統";
                var htmlBody = GetPasswordResetEmailTemplate(username, resetUrl);
                var textBody = $"您好 {username}，請點擊以下連結重設密碼：{resetUrl}";

                var result = await SendEmailAsync(toEmail, subject, htmlBody, textBody);

                if (result)
                {
                    _logger.LogInformation($"密碼重設郵件已發送至: {toEmail}");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"發送密碼重設郵件時發生錯誤: {toEmail}");
                return false;
            }
        }

        // ========== 核心：使用 Mailgun API 發送郵件 ==========
        private async Task<bool> SendEmailAsync(string to, string subject, string htmlBody, string textBody)
        {
            try
            {
                var options = new RestClientOptions($"https://api.mailgun.net/v3/{_domain}")
                {
                    Authenticator = new HttpBasicAuthenticator("api", _apiKey)
                };

                var client = new RestClient(options);
                var request = new RestRequest("messages", Method.Post);

                request.AddParameter("from", $"{_fromName} <{_fromEmail}>");
                request.AddParameter("to", to);
                request.AddParameter("subject", subject);
                request.AddParameter("html", htmlBody);
                request.AddParameter("text", textBody);

                var response = await client.ExecuteAsync(request);

                if (response.IsSuccessful)
                {
                    _logger.LogInformation($"Mailgun API 回應成功: {response.StatusCode}");
                    return true;
                }
                else
                {
                    _logger.LogError($"Mailgun API 回應失敗: {response.StatusCode} - {response.Content}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Mailgun API 呼叫失敗");
                return false;
            }
        }

        // ========== Email 模板 ==========
        private string GetVerificationEmailTemplate(string username, string verificationUrl)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; }}
        .button {{ display: inline-block; padding: 15px 40px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
        .button:hover {{ background: #5568d3; }}
        .footer {{ text-align: center; margin-top: 30px; padding: 20px; font-size: 12px; color: #999; }}
        .link {{ word-break: break-all; background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='margin: 0;'>🔐 會員系統</h1>
            <p style='margin: 10px 0 0 0; opacity: 0.9;'>Email 認證</p>
        </div>
        <div class='content'>
            <h2 style='color: #667eea; margin-top: 0;'>歡迎加入，{username}！</h2>
            <p>感謝您註冊我們的會員系統。</p>
            <p>為了確保您的帳號安全，請點擊下方按鈕驗證您的電子郵件地址：</p>
            
            <div style='text-align: center;'>
                <a href='{verificationUrl}' class='button'>✓ 驗證我的電子郵件</a>
            </div>
            
            <p style='margin-top: 30px;'>如果按鈕無法點擊，請複製以下連結到瀏覽器：</p>
            <div class='link'>{verificationUrl}</div>
            
            <div style='margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;'>
                <p style='margin: 0; color: #856404;'><strong>⚠️ 注意事項：</strong></p>
                <ul style='margin: 10px 0 0 0; padding-left: 20px; color: #856404;'>
                    <li>此連結將在 <strong>24 小時</strong>後失效</li>
                    <li>如果您沒有註冊此帳號，請忽略此郵件</li>
                    <li>請勿將此連結分享給他人</li>
                </ul>
            </div>
        </div>
        <div class='footer'>
            <p>此郵件由系統自動發送，請勿直接回覆。</p>
            <p>© {DateTime.UtcNow.ToTaipeiTimeString().Year} 會員系統. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
        }

        private string GetWelcomeEmailTemplate(string username)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; }}
        .footer {{ text-align: center; margin-top: 30px; padding: 20px; font-size: 12px; color: #999; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='margin: 0;'>🎉 歡迎加入！</h1>
        </div>
        <div class='content'>
            <h2 style='color: #28a745; margin-top: 0;'>嗨，{username}！</h2>
            <p>您的電子郵件已成功驗證！</p>
            <p>現在您可以開始使用會員系統的所有功能了。</p>
            <p style='margin-top: 30px;'>如有任何問題，請隨時聯繫我們。</p>
        </div>
        <div class='footer'>
            <p>© {DateTime.UtcNow.ToTaipeiTimeString().Year} 會員系統. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
        }


        private string GetPasswordResetEmailTemplate(string username, string resetUrl)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; }}
        .button {{ display: inline-block; padding: 15px 40px; background: #dc3545; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
        .footer {{ text-align: center; margin-top: 30px; padding: 20px; font-size: 12px; color: #999; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='margin: 0;'>🔒 重設密碼</h1>
        </div>
        <div class='content'>
            <h2 style='color: #dc3545; margin-top: 0;'>您好，{username}</h2>
            <p>我們收到了重設密碼的請求。</p>
            <div style='text-align: center;'>
                <a href='{resetUrl}' class='button'>重設我的密碼</a>
            </div>
            <p style='margin-top: 30px;'><strong>注意：</strong>此連結將在 1 小時後失效。</p>
        </div>
        <div class='footer'>
            <p>© {DateTime.UtcNow.ToTaipeiTimeString().Year} 會員系統. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}