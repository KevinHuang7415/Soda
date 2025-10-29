//using Microsoft.EntityFrameworkCore.Migrations;

//#nullable disable

//#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

//namespace Soda.Migrations
//{
//    /// <inheritdoc />
//    public partial class delhasdata : Migration
//    {
//        /// <inheritdoc />
//        protected override void Up(MigrationBuilder migrationBuilder)
//        {
//            migrationBuilder.DeleteData(
//                schema: "dbo",
//                table: "Coupons",
//                keyColumn: "Id",
//                keyValue: 1);

//            migrationBuilder.DeleteData(
//                schema: "dbo",
//                table: "Coupons",
//                keyColumn: "Id",
//                keyValue: 2);

//            migrationBuilder.DeleteData(
//                schema: "dbo",
//                table: "Products",
//                keyColumn: "Id",
//                keyValue: 1);

//            migrationBuilder.DeleteData(
//                schema: "dbo",
//                table: "Products",
//                keyColumn: "Id",
//                keyValue: 2);

//            migrationBuilder.DeleteData(
//                schema: "dbo",
//                table: "Products",
//                keyColumn: "Id",
//                keyValue: 3);

//            migrationBuilder.DeleteData(
//                schema: "dbo",
//                table: "Products",
//                keyColumn: "Id",
//                keyValue: 4);

//            migrationBuilder.DeleteData(
//                schema: "dbo",
//                table: "Products",
//                keyColumn: "Id",
//                keyValue: 5);

//            migrationBuilder.DeleteData(
//                schema: "dbo",
//                table: "Products",
//                keyColumn: "Id",
//                keyValue: 6);
//        }

//        /// <inheritdoc />
//        protected override void Down(MigrationBuilder migrationBuilder)
//        {
//            migrationBuilder.InsertData(
//                schema: "dbo",
//                table: "Coupons",
//                columns: new[] { "Id", "Code", "Discount", "DiscountType", "Status" },
//                values: new object[,]
//                {
//                    { 1, "DISCOUNT10", 60m, "P", "active" },
//                    { 2, "DISCOUNT20", 600m, "A", "active" }
//                });

//            migrationBuilder.InsertData(
//                schema: "dbo",
//                table: "Products",
//                columns: new[] { "Id", "ImageUrl", "Name", "Price", "Size", "Stock" },
//                values: new object[,]
//                {
//                    { 1, "test.com", "紅茶", 25m, "4*355", 100 },
//                    { 2, "test.com", "紅茶", 30m, "12*355", 80 },
//                    { 3, "test.com", "綠茶", 35m, "4*355", 60 },
//                    { 4, "test.com", "綠茶", 35m, "12*355", 60 },
//                    { 5, "test.com", "清茶", 40m, "4*355", 60 },
//                    { 6, "test.com", "清茶", 35m, "12*355", 60 }
//                });
//        }
//    }
//}
