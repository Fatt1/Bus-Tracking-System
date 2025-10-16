using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TrackingBusSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Drivers_BusId",
                table: "Drivers");

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_BusId",
                table: "Drivers",
                column: "BusId",
                unique: true,
                filter: "[BusId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Drivers_BusId",
                table: "Drivers");

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_BusId",
                table: "Drivers",
                column: "BusId");
        }
    }
}
