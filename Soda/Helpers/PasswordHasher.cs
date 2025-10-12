using System.Security.Cryptography;
using System.Text;

namespace Soda.Helpers
{
    public static class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            var hashedBytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        public static bool VerifyPassword(string password, string hash)
        {
            var hashOfInput = HashPassword(password);
            Console.WriteLine(hashOfInput);
            Console.WriteLine(hash);
            return hashOfInput == hash;
        }
    }
}