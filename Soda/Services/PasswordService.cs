namespace Soda.Services
{
    using BCrypt.Net;

    public class PasswordService : IPasswordService
    {
        public string HashPassword(string password)
        {
            return BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Verify(password, hashedPassword);
        }
    }
}