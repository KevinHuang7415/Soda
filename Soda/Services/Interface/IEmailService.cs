namespace Soda.Services.Interface
{
    public interface IEmailService
    {
        Task<bool> SendVerificationEmailAsync(string toEmail, string username, string verificationToken);
        Task<bool> SendWelcomeEmailAsync(string toEmail, string username);
        Task<bool> SendPasswordResetEmailAsync(string toEmail, string username, string resetToken);
    }
}