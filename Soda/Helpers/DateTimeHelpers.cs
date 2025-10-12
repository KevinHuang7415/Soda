namespace Soda.Helpers
{
    public static class DateTimeHelpers
    {
        // 轉換時區 UTC 至台北時區
        public static DateTime ToTaipeiTimeString(this DateTime utcTime)
        {
            var taipeiZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(utcTime, taipeiZone);
        }
    }
}
