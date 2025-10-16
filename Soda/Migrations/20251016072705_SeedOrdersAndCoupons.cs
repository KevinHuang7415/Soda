using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Soda.Migrations
{
    public partial class SeedOrdersAndCoupons : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 插入 Coupon 資料
            migrationBuilder.InsertData(
                table: "Coupons",
                columns: new[] { "Id", "Code", "Discount", "DiscountType", "Status" },
                values: new object[,]
                {
                    { 1, "DISCOUNT10", 60m, "P", "active" },
                    { 2, "DISCOUNT20", 600m, "A", "active" }
                }
            );

            // 插入 Order 資料
            migrationBuilder.InsertData(
                table: "Orders",
                columns: new[]
                {
                    "OrderID", "UserID", "ProductList", "TotalAmount", "Status", "OrderDate",
                    "PaymentMethod", "PaymentStatus", "ShippingAddress", "ShippingMethod",
                    "ShippingStatus", "ReceiverName", "OrderItems", "Notes"
                },
                values: new object[]
                {
                    1,
                    1,
                    "[{\"ProductName\":\"紅茶\",\"Size\":\"4*355\",\"Quantity\":2,\"UnitPrice\":199.00},{\"ProductName\":\"綠茶\",\"Size\":\"12*355\",\"Quantity\":1,\"UnitPrice\":499.00}]",
                    897.00m,
                    "Paid",
                    new DateTime(2025, 10, 15, 14, 31, 3),
                    "Credit Card",
                    "Paid",
                    "123 Test St",
                    "Express",
                    "Shipped",
                    "John Doe",
                    "[{\"ProductName\":\"紅茶\",\"Size\":\"4*355\",\"Quantity\":2},{\"ProductName\":\"綠茶\",\"Size\":\"12*355\",\"Quantity\":1}]",
                    "測試訂單"
                }
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 刪除 Order 資料
            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "OrderID",
                keyValue: 1
            );

            // 刪除 Coupon 資料
            migrationBuilder.DeleteData(
                table: "Coupons",
                keyColumn: "Id",
                keyValue: 1
            );

            migrationBuilder.DeleteData(
                table: "Coupons",
                keyColumn: "Id",
                keyValue: 2
            );
        }
    }
}
