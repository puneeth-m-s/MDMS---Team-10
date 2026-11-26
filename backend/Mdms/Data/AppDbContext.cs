using Mdms.Models;
using Microsoft.EntityFrameworkCore;

namespace Mdms.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Zone> Zones => Set<Zone>();
    public DbSet<ZoneSummary> ZoneSummaries => Set<ZoneSummary>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Meter> Meters => Set<Meter>();
    public DbSet<Bill> Bills => Set<Bill>();
    public DbSet<BillDay> BillDays => Set<BillDay>();
    public DbSet<MeterReading> Readings => Set<MeterReading>();
    public DbSet<HourlyReading> HourlyReadings => Set<HourlyReading>();
    public DbSet<ConsumptionSeries> ConsumptionSeries => Set<ConsumptionSeries>();
    public DbSet<ZoneComparison> ZoneComparison => Set<ZoneComparison>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<AppNotification> Notifications => Set<AppNotification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ZoneSettings> ZoneSettings => Set<ZoneSettings>();
    public DbSet<EnterpriseSettings> EnterpriseSettings => Set<EnterpriseSettings>();
    public DbSet<DemoSession> DemoSession => Set<DemoSession>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // Nested objects and lists live in one jsonb column each.
        b.Entity<AppUser>().OwnsOne(u => u.NotificationPrefs, o => o.ToJson());
        b.Entity<ConsumptionSeries>().OwnsMany(s => s.Points, o => o.ToJson());
        b.Entity<ZoneComparison>().OwnsMany(c => c.Points, o => o.ToJson());
        b.Entity<ZoneSettings>().OwnsOne(s => s.Channels, o => o.ToJson());
        b.Entity<EnterpriseSettings>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            e.OwnsOne(x => x.Policies, o => o.ToJson());
            e.OwnsOne(x => x.Localisation, o => o.ToJson());
            e.OwnsOne(x => x.NotificationDefaults, o => o.ToJson());
        });
        b.Entity<DemoSession>().Property(x => x.Id).ValueGeneratedNever();

        // Foreign keys. Zone.AdminId is deliberately NOT one: zones and users point at
        // each other, and a two-way link makes inserting the first row impossible.
        b.Entity<AppUser>().HasOne<Zone>().WithMany().HasForeignKey(u => u.ZoneId);

        b.Entity<Meter>().HasOne<AppUser>().WithMany().HasForeignKey(m => m.OwnerId);
        b.Entity<Meter>().HasOne<Zone>().WithMany().HasForeignKey(m => m.ZoneId);

        b.Entity<Bill>().HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId);
        b.Entity<Bill>().HasOne<Meter>().WithMany().HasForeignKey(x => x.MeterId);
        b.Entity<Bill>().HasOne<Zone>().WithMany().HasForeignKey(x => x.ZoneId);

        b.Entity<BillDay>().HasOne<Bill>().WithMany().HasForeignKey(x => x.BillId);
        b.Entity<MeterReading>().HasOne<Meter>().WithMany().HasForeignKey(x => x.MeterId);
        b.Entity<HourlyReading>().HasOne<Meter>().WithMany().HasForeignKey(x => x.MeterId);

        b.Entity<Alert>().HasOne<Zone>().WithMany().HasForeignKey(x => x.ZoneId);
        b.Entity<Alert>().HasOne<Meter>().WithMany().HasForeignKey(x => x.MeterId);

        b.Entity<AppNotification>().HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId);

        b.Entity<ZoneSummary>().HasOne<Zone>().WithMany().HasForeignKey(x => x.ZoneId);
        b.Entity<ZoneComparison>().HasOne<Zone>().WithMany().HasForeignKey(x => x.ZoneId);
        b.Entity<ZoneSettings>().HasOne<Zone>().WithMany().HasForeignKey(x => x.ZoneId);
    }
}