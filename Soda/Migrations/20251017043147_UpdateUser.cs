using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Soda.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailVerificationToken",
                schema: "dbo",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailVerificationTokenExpiry",
                schema: "dbo",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsEmailVerified",
                schema: "dbo",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailVerificationToken",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmailVerificationTokenExpiry",
                schema: "dbo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsEmailVerified",
                schema: "dbo",
                table: "Users");
        }
    }
}
