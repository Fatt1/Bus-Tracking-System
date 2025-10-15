using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TrackingBusSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedDataRoute : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Routes",
                columns: new[] { "Id", "RouteName" },
                values: new object[,]
                {
                    { 1, "Tuyến Trường Chinh - Âu Cơ" },
                    { 2, "Tuyến Quốc lộ 52" },
                    { 3, "Tuyến Nguyễn Hữu Thọ - Khánh Hội" }
                });

            migrationBuilder.InsertData(
                table: "Points",
                columns: new[] { "Id", "Latitude", "Longitude", "PointName", "RouteId" },
                values: new object[,]
                {
                    { 1, 10.819554999999999, 106.630731, "Trạm kcn Tân Bình", 1 },
                    { 2, 10.782951000000001, 106.642635, "Trạm bệnh viện Tân Phú", 1 },
                    { 3, 10.759917099999999, 106.6796834, "Đại học sài gòn", 1 },
                    { 4, 10.87335, 106.808025, "Trạm đại học quốc gia", 2 },
                    { 5, 10.849184899999999, 106.7543493, "Trạm ngã tư Thủ Đức", 2 },
                    { 6, 10.759917099999999, 106.6796834, "Đại học sài gòn", 2 },
                    { 7, 10.741214100000001, 106.69534280000001, "Trạm lotte mart q7", 3 },
                    { 8, 10.758583, 106.699443, "Trạm công viên khánh hội", 3 },
                    { 9, 10.759917099999999, 106.6796834, "Đại học sài gòn", 3 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Points",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Points",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Points",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Points",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Points",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Points",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Points",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Points",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Points",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
