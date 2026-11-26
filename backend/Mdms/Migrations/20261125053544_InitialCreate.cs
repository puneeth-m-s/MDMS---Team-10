using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mdms.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Resource = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConsumptionSeries",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Scope = table.Column<string>(type: "text", nullable: false),
                    ScopeId = table.Column<string>(type: "text", nullable: false),
                    Range = table.Column<string>(type: "text", nullable: false),
                    PeriodLabel = table.Column<string>(type: "text", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    Points = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsumptionSeries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DemoSession",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    ConsumerId = table.Column<string>(type: "text", nullable: false),
                    ConsumerMeterId = table.Column<string>(type: "text", nullable: false),
                    ZoneId = table.Column<string>(type: "text", nullable: false),
                    ZoneAdminId = table.Column<string>(type: "text", nullable: false),
                    EnterpriseAdminId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DemoSession", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EnterpriseSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    DataRetentionMonths = table.Column<int>(type: "integer", nullable: false),
                    Localisation = table.Column<string>(type: "jsonb", nullable: false),
                    NotificationDefaults = table.Column<string>(type: "jsonb", nullable: false),
                    Policies = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnterpriseSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Zones",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    Pincode = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    AdminId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Zones", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    ZoneId = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    JoinedOn = table.Column<DateOnly>(type: "date", nullable: false),
                    MeterCount = table.Column<int>(type: "integer", nullable: false),
                    NotificationPrefs = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Zones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "Zones",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ZoneComparison",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ZoneId = table.Column<string>(type: "text", nullable: false),
                    Period = table.Column<string>(type: "text", nullable: false),
                    Points = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ZoneComparison", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ZoneComparison_Zones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "Zones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ZoneSettings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ZoneId = table.Column<string>(type: "text", nullable: false),
                    HighConsumptionKwh = table.Column<double>(type: "double precision", nullable: false),
                    LowConsumptionKwh = table.Column<double>(type: "double precision", nullable: false),
                    AbnormalReadingsPerDay = table.Column<int>(type: "integer", nullable: false),
                    InactiveMeterDays = table.Column<int>(type: "integer", nullable: false),
                    Channels = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ZoneSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ZoneSettings_Zones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "Zones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ZoneSummaries",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ZoneId = table.Column<string>(type: "text", nullable: false),
                    TotalMeters = table.Column<int>(type: "integer", nullable: false),
                    ActiveMeters = table.Column<int>(type: "integer", nullable: false),
                    TotalConsumers = table.Column<int>(type: "integer", nullable: false),
                    LastMonthKwh = table.Column<double>(type: "double precision", nullable: false),
                    AvgKwhPerMeter = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ZoneSummaries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ZoneSummaries_Zones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "Zones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Meters",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    OwnerId = table.Column<string>(type: "text", nullable: false),
                    OwnerName = table.Column<string>(type: "text", nullable: false),
                    ZoneId = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    TariffCategory = table.Column<string>(type: "text", nullable: false),
                    InstalledOn = table.Column<DateOnly>(type: "date", nullable: false),
                    LastReading = table.Column<double>(type: "double precision", nullable: false),
                    LastReadingAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Meters_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Meters_Zones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "Zones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Read = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Alerts",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ZoneId = table.Column<string>(type: "text", nullable: false),
                    MeterId = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alerts_Meters_MeterId",
                        column: x => x.MeterId,
                        principalTable: "Meters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Alerts_Zones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "Zones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bills",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    MeterId = table.Column<string>(type: "text", nullable: false),
                    ZoneId = table.Column<string>(type: "text", nullable: false),
                    Month = table.Column<string>(type: "text", nullable: false),
                    Units = table.Column<double>(type: "double precision", nullable: false),
                    EnergyCharge = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    FixedCharge = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    IssuedOn = table.Column<DateOnly>(type: "date", nullable: false),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PaidOn = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bills_Meters_MeterId",
                        column: x => x.MeterId,
                        principalTable: "Meters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bills_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bills_Zones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "Zones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HourlyReadings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    MeterId = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Hour = table.Column<int>(type: "integer", nullable: false),
                    Reading = table.Column<double>(type: "double precision", nullable: false),
                    Consumption = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HourlyReadings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HourlyReadings_Meters_MeterId",
                        column: x => x.MeterId,
                        principalTable: "Meters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Readings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    MeterId = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Reading = table.Column<double>(type: "double precision", nullable: false),
                    Consumption = table.Column<double>(type: "double precision", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Readings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Readings_Meters_MeterId",
                        column: x => x.MeterId,
                        principalTable: "Meters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BillDays",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    BillId = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Reading = table.Column<double>(type: "double precision", nullable: false),
                    Consumption = table.Column<double>(type: "double precision", nullable: false),
                    Cost = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillDays_Bills_BillId",
                        column: x => x.BillId,
                        principalTable: "Bills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_MeterId",
                table: "Alerts",
                column: "MeterId");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_ZoneId",
                table: "Alerts",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_BillDays_BillId",
                table: "BillDays",
                column: "BillId");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_MeterId",
                table: "Bills",
                column: "MeterId");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_UserId",
                table: "Bills",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_ZoneId",
                table: "Bills",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_HourlyReadings_MeterId",
                table: "HourlyReadings",
                column: "MeterId");

            migrationBuilder.CreateIndex(
                name: "IX_Meters_OwnerId",
                table: "Meters",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Meters_ZoneId",
                table: "Meters",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Readings_MeterId",
                table: "Readings",
                column: "MeterId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ZoneId",
                table: "Users",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_ZoneComparison_ZoneId",
                table: "ZoneComparison",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_ZoneSettings_ZoneId",
                table: "ZoneSettings",
                column: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_ZoneSummaries_ZoneId",
                table: "ZoneSummaries",
                column: "ZoneId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alerts");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "BillDays");

            migrationBuilder.DropTable(
                name: "ConsumptionSeries");

            migrationBuilder.DropTable(
                name: "DemoSession");

            migrationBuilder.DropTable(
                name: "EnterpriseSettings");

            migrationBuilder.DropTable(
                name: "HourlyReadings");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Readings");

            migrationBuilder.DropTable(
                name: "ZoneComparison");

            migrationBuilder.DropTable(
                name: "ZoneSettings");

            migrationBuilder.DropTable(
                name: "ZoneSummaries");

            migrationBuilder.DropTable(
                name: "Bills");

            migrationBuilder.DropTable(
                name: "Meters");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Zones");
        }
    }
}
