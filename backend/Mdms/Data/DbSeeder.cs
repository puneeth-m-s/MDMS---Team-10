using System.Text.Json;
using Mdms.Models;
using Microsoft.EntityFrameworkCore;

namespace Mdms.Data;

/// <summary>
/// Fills an EMPTY database from db.json (the file made by scripts/generate-db.mjs).
/// If the database already has zones, it does nothing, so it is safe to run on every start.
/// </summary>
public static class DbSeeder
{
    // Mirrors the top-level keys of db.json.
    private class SeedData
    {
        public DemoSession? DemoSession { get; set; }
        public List<Zone> Zones { get; set; } = [];
        public List<ZoneSummary> ZoneSummaries { get; set; } = [];
        public List<AppUser> Users { get; set; } = [];
        public List<Meter> Meters { get; set; } = [];
        public List<Bill> Bills { get; set; } = [];
        public List<BillDay> BillDays { get; set; } = [];
        public List<MeterReading> Readings { get; set; } = [];
        public List<HourlyReading> HourlyReadings { get; set; } = [];
        public List<ConsumptionSeries> ConsumptionSeries { get; set; } = [];
        public List<ZoneComparison> ZoneComparison { get; set; } = [];
        public List<Alert> Alerts { get; set; } = [];
        public List<AppNotification> Notifications { get; set; } = [];
        public List<AuditLog> AuditLogs { get; set; } = [];
        public List<ZoneSettings> ZoneSettings { get; set; } = [];
        public EnterpriseSettings? EnterpriseSettings { get; set; }
    }

    public static async Task SeedAsync(AppDbContext db, string jsonPath, ILogger logger)
    {
        if (await db.Zones.AnyAsync())
        {
            logger.LogInformation("Database already has data - seeding skipped.");
            return;
        }

        if (!File.Exists(jsonPath))
        {
            logger.LogWarning("Seeding skipped: db.json not found at {Path}. Run 'npm run db:generate' first.", jsonPath);
            return;
        }

        await using var stream = File.OpenRead(jsonPath);
        var data = await JsonSerializer.DeserializeAsync<SeedData>(stream, new JsonSerializerOptions(JsonSerializerDefaults.Web))
                   ?? throw new InvalidOperationException("db.json is empty.");

        // One SaveChanges: EF works out the right insert order from the foreign keys,
        // and everything is saved together or not at all.
        db.Zones.AddRange(data.Zones);
        db.ZoneSummaries.AddRange(data.ZoneSummaries);
        db.Users.AddRange(data.Users);
        db.Meters.AddRange(data.Meters);
        db.Bills.AddRange(data.Bills);
        db.BillDays.AddRange(data.BillDays);
        db.Readings.AddRange(data.Readings);
        db.HourlyReadings.AddRange(data.HourlyReadings);
        db.ConsumptionSeries.AddRange(data.ConsumptionSeries);
        db.ZoneComparison.AddRange(data.ZoneComparison);
        db.Alerts.AddRange(data.Alerts);
        db.Notifications.AddRange(data.Notifications);
        db.AuditLogs.AddRange(data.AuditLogs);
        db.ZoneSettings.AddRange(data.ZoneSettings);
        if (data.EnterpriseSettings is not null) db.EnterpriseSettings.Add(data.EnterpriseSettings);
        if (data.DemoSession is not null) db.DemoSession.Add(data.DemoSession);

        var rows = await db.SaveChangesAsync();
        logger.LogInformation("Seeded {Rows} rows from {Path}.", rows, jsonPath);
    }
}