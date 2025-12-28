using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FleetTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTrackingSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TrackingSessionId",
                table: "GpsPositions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TrackingSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    VehicleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    DriverId = table.Column<Guid>(type: "TEXT", nullable: true),
                    DriverName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    DriverPhone = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    LastLatitude = table.Column<double>(type: "REAL", nullable: true),
                    LastLongitude = table.Column<double>(type: "REAL", nullable: true),
                    LastSpeed = table.Column<double>(type: "REAL", nullable: true),
                    LastHeading = table.Column<double>(type: "REAL", nullable: true),
                    LastPositionAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PositionsCount = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    TotalDistance = table.Column<double>(type: "REAL", nullable: false, defaultValue: 0.0),
                    MissionId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrackingSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrackingSessions_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TrackingSessions_Missions_MissionId",
                        column: x => x.MissionId,
                        principalTable: "Missions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TrackingSessions_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GpsPositions_TrackingSessionId",
                table: "GpsPositions",
                column: "TrackingSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_TrackingSessions_DriverId",
                table: "TrackingSessions",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_TrackingSessions_IsActive",
                table: "TrackingSessions",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TrackingSessions_MissionId",
                table: "TrackingSessions",
                column: "MissionId");

            migrationBuilder.CreateIndex(
                name: "IX_TrackingSessions_StartedAt",
                table: "TrackingSessions",
                column: "StartedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TrackingSessions_VehicleId",
                table: "TrackingSessions",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_TrackingSessions_VehicleId_IsActive",
                table: "TrackingSessions",
                columns: new[] { "VehicleId", "IsActive" });

            migrationBuilder.AddForeignKey(
                name: "FK_GpsPositions_TrackingSessions_TrackingSessionId",
                table: "GpsPositions",
                column: "TrackingSessionId",
                principalTable: "TrackingSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GpsPositions_TrackingSessions_TrackingSessionId",
                table: "GpsPositions");

            migrationBuilder.DropTable(
                name: "TrackingSessions");

            migrationBuilder.DropIndex(
                name: "IX_GpsPositions_TrackingSessionId",
                table: "GpsPositions");

            migrationBuilder.DropColumn(
                name: "TrackingSessionId",
                table: "GpsPositions");
        }
    }
}
