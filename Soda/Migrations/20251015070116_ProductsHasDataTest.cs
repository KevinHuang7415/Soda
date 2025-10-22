using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Soda.Migrations
{
    /// <inheritdoc />
    public partial class ProductsHasDataTest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "dbo",
                table: "Products",
                columns: new[] { "Id", "ImageUrl", "Name", "Price", "Size", "Stock" },
                values: new object[,]
                {
                    { 1, "./images/lemon-lime_mockup.png", "檸檬能量飲", 199m, "6*355", 100 },
                    { 2, "./images/lemon-lime_mockup.png", "檸檬能量飲", 599m, "24*355", 80 },
                    { 3, "./images/grape_mockup.png", "葡萄能量飲", 199m, "6*355", 60 },
                    { 4, "./images/grape_mockup.png", "葡萄能量飲", 599m, "24*355", 60 },
                    { 5, "./images/strawberry-lemonade_mockup.png", "草莓能量飲", 199m, "6*355", 60 },
                    { 6, "./images/strawberry-lemonade_mockup.png", "草莓能量飲", 599m, "24*355", 60 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "Products",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "Products",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "Products",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "Products",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "Products",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "Products",
                keyColumn: "Id",
                keyValue: 6);
        }
    }
}
