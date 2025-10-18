using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TrackingBusSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateScheduleAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DepartureTimes");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "AfternoonArrival",
                table: "ScheduleAssignments",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "AfternoonDeparture",
                table: "ScheduleAssignments",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "MorningArrival",
                table: "ScheduleAssignments",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "MorningDeparture",
                table: "ScheduleAssignments",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AfternoonArrival",
                table: "ScheduleAssignments");

            migrationBuilder.DropColumn(
                name: "AfternoonDeparture",
                table: "ScheduleAssignments");

            migrationBuilder.DropColumn(
                name: "MorningArrival",
                table: "ScheduleAssignments");

            migrationBuilder.DropColumn(
                name: "MorningDeparture",
                table: "ScheduleAssignments");

            migrationBuilder.CreateTable(
                name: "DepartureTimes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScheduleAssignmentId = table.Column<int>(type: "int", nullable: false),
                    DepartureTimeValue = table.Column<TimeSpan>(type: "time", nullable: false),
                    Direction = table.Column<int>(type: "int", nullable: false),
                    EstimatedArrivalTime = table.Column<TimeSpan>(type: "time", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DepartureTimes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DepartureTimes_ScheduleAssignments_ScheduleAssignmentId",
                        column: x => x.ScheduleAssignmentId,
                        principalTable: "ScheduleAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DepartureTimes_ScheduleAssignmentId",
                table: "DepartureTimes",
                column: "ScheduleAssignmentId");
        }
    }
}
