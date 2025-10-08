namespace Soda.Services
{
    public static class DateTimeExtensions
    {
        // 轉換時區 UTC 至台北時區
        public static DateTime ToTaipeiTimeString(this DateTime utcTime)
        {
            var taipeiZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(utcTime, taipeiZone);
        }
    }
}
