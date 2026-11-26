using Mdms.Data;
using Mdms.Models;
using Microsoft.AspNetCore.Mvc;

namespace Mdms.Controllers;

[Route("zones")]
public class ZonesController(AppDbContext db) : ResourceController<Zone>(db) { }

[Route("zoneSummaries")]
public class ZoneSummariesController(AppDbContext db) : ResourceController<ZoneSummary>(db) { }

[Route("users")]
public class UsersController(AppDbContext db) : ResourceController<AppUser>(db) { }

[Route("meters")]
public class MetersController(AppDbContext db) : ResourceController<Meter>(db) { }

[Route("bills")]
public class BillsController(AppDbContext db) : ResourceController<Bill>(db) { }

[Route("billDays")]
public class BillDaysController(AppDbContext db) : ResourceController<BillDay>(db) { }

[Route("readings")]
public class ReadingsController(AppDbContext db) : ResourceController<MeterReading>(db) { }

[Route("hourlyReadings")]
public class HourlyReadingsController(AppDbContext db) : ResourceController<HourlyReading>(db) { }

[Route("consumptionSeries")]
public class ConsumptionSeriesController(AppDbContext db) : ResourceController<ConsumptionSeries>(db) { }

[Route("zoneComparison")]
public class ZoneComparisonController(AppDbContext db) : ResourceController<ZoneComparison>(db) { }

[Route("alerts")]
public class AlertsController(AppDbContext db) : ResourceController<Alert>(db) { }

[Route("notifications")]
public class NotificationsController(AppDbContext db) : ResourceController<AppNotification>(db) { }

[Route("auditLogs")]
public class AuditLogsController(AppDbContext db) : ResourceController<AuditLog>(db) { }

[Route("zoneSettings")]
public class ZoneSettingsController(AppDbContext db) : ResourceController<ZoneSettings>(db) { }