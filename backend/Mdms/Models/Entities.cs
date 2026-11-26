using Microsoft.EntityFrameworkCore;

namespace Mdms.Models;

// One class per table. Property names are PascalCase here; the API sends them
// to the frontend as camelCase automatically (zoneId, ownerName, ...).
// Dates use DateOnly ("2026-11-24"); date+time uses DateTime in UTC.

public class Zone
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Location { get; set; } = "";
    public string Pincode { get; set; } = "";
    public string Description { get; set; } = "";
    public string AdminId { get; set; } = "";   // the zone admin (a user); no database link, see AppDbContext
    public string Status { get; set; } = "active";  // active | deactivated
}

public class ZoneSummary
{
    public string Id { get; set; } = "";
    public string ZoneId { get; set; } = "";
    public int TotalMeters { get; set; }
    public int ActiveMeters { get; set; }
    public int TotalConsumers { get; set; }
    public double LastMonthKwh { get; set; }
    public double AvgKwhPerMeter { get; set; }
}

public class NotificationPrefs
{
    public bool Email { get; set; }
    public bool Sms { get; set; }
}

public class NotificationChannels
{
    public bool Email { get; set; }
    public bool Sms { get; set; }
    public bool Push { get; set; }
}

public class AppUser
{
    public string Id { get; set; } = "";
    public string Role { get; set; } = "consumer";   // enterprise_admin | zone_admin | consumer
    public string? ZoneId { get; set; }              // null for enterprise admins
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Status { get; set; } = "active";
    public DateOnly JoinedOn { get; set; }
    public int MeterCount { get; set; }
    public NotificationPrefs NotificationPrefs { get; set; } = new();
}

public class Meter
{
    public string Id { get; set; } = "";
    public string OwnerId { get; set; } = "";
    public string OwnerName { get; set; } = "";
    public string ZoneId { get; set; } = "";
    public string Address { get; set; } = "";
    public string Status { get; set; } = "active";
    public string TariffCategory { get; set; } = "residential"; // residential | commercial | industrial
    public DateOnly InstalledOn { get; set; }
    public double LastReading { get; set; }
    public DateTime LastReadingAt { get; set; }
}

public class Bill
{
    public string Id { get; set; } = "";
    public string UserId { get; set; } = "";
    public string MeterId { get; set; } = "";
    public string ZoneId { get; set; } = "";
    public string Month { get; set; } = "";          // "2026-10"
    public double Units { get; set; }
    [Precision(12, 2)] public decimal EnergyCharge { get; set; }
    [Precision(12, 2)] public decimal FixedCharge { get; set; }
    [Precision(12, 2)] public decimal Amount { get; set; }
    public DateOnly IssuedOn { get; set; }
    public DateOnly DueDate { get; set; }
    public string Status { get; set; } = "pending";  // paid | pending | overdue
    public DateOnly? PaidOn { get; set; }
}

public class BillDay
{
    public string Id { get; set; } = "";
    public string BillId { get; set; } = "";
    public DateOnly Date { get; set; }
    public double Reading { get; set; }
    public double Consumption { get; set; }
    [Precision(12, 2)] public decimal Cost { get; set; }
}

public class MeterReading
{
    public string Id { get; set; } = "";
    public string MeterId { get; set; } = "";
    public DateOnly Date { get; set; }
    public double Reading { get; set; }
    public double Consumption { get; set; }
    public string Note { get; set; } = "";
}

public class HourlyReading
{
    public string Id { get; set; } = "";
    public string MeterId { get; set; } = "";
    public DateOnly Date { get; set; }
    public int Hour { get; set; }
    public double Reading { get; set; }
    public double Consumption { get; set; }
}

public class SeriesPoint
{
    public string Label { get; set; } = "";
    public double Value { get; set; }
}

public class ConsumptionSeries
{
    public string Id { get; set; } = "";
    public string Scope { get; set; } = "";          // user | zone | enterprise
    public string ScopeId { get; set; } = "";        // user id, zone id, or "ALL"
    public string Range { get; set; } = "";          // day | week | month | year
    public string PeriodLabel { get; set; } = "";
    public string Unit { get; set; } = "kWh";
    public List<SeriesPoint> Points { get; set; } = [];
}

public class ZoneComparison
{
    public string Id { get; set; } = "";
    public string ZoneId { get; set; } = "";
    public string Period { get; set; } = "";         // 4w | 6m | 12m
    public List<SeriesPoint> Points { get; set; } = [];
}

public class Alert
{
    public string Id { get; set; } = "";
    public string ZoneId { get; set; } = "";
    public string MeterId { get; set; } = "";
    public string Severity { get; set; } = "info";   // critical | warning | info
    public string Type { get; set; } = "";
    public string Message { get; set; } = "";
    public string Status { get; set; } = "open";     // open | resolved
    public DateTime CreatedAt { get; set; }
}

public class AppNotification
{
    public string Id { get; set; } = "";
    public string UserId { get; set; } = "";
    public string Type { get; set; } = "";
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public bool Read { get; set; }
}

public class AuditLog
{
    public string Id { get; set; } = "";
    public DateTime Timestamp { get; set; }
    public string UserId { get; set; } = "";
    public string UserName { get; set; } = "";
    public string Action { get; set; } = "";
    public string Resource { get; set; } = "";
    public string Status { get; set; } = "success";  // success | failed
}

public class ZoneSettings
{
    public string Id { get; set; } = "";
    public string ZoneId { get; set; } = "";
    public double HighConsumptionKwh { get; set; }
    public double LowConsumptionKwh { get; set; }
    public int AbnormalReadingsPerDay { get; set; }
    public int InactiveMeterDays { get; set; }
    public NotificationChannels Channels { get; set; } = new();
}

public class EnterprisePolicies
{
    public int AutoLogoutMinutes { get; set; }
    public int AuditLogRetentionMonths { get; set; }
}

public class Localisation
{
    public string TimeZone { get; set; } = "";
    public string DefaultLanguage { get; set; } = "";
    public string Currency { get; set; } = "";
}

// Exactly one row (Id = 1). The API returns it as a single object, not a list.
public class EnterpriseSettings
{
    public int Id { get; set; } = 1;
    public int DataRetentionMonths { get; set; }
    public EnterprisePolicies Policies { get; set; } = new();
    public Localisation Localisation { get; set; } = new();
    public NotificationChannels NotificationDefaults { get; set; } = new();
}

// Exactly one row (Id = 1). Phase 1 has no real login; this says who the role switcher "is".
public class DemoSession
{
    public int Id { get; set; } = 1;
    public string ConsumerId { get; set; } = "";
    public string ConsumerMeterId { get; set; } = "";
    public string ZoneId { get; set; } = "";
    public string ZoneAdminId { get; set; } = "";
    public string EnterpriseAdminId { get; set; } = "";
}