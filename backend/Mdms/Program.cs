using Mdms.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .WithExposedHeaders("X-Total-Count"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    // Development only: create/upgrade the tables, then fill them from db.json if empty.
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    var dbJson = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", "..", "db.json"));
    await DbSeeder.SeedAsync(db, dbJson, app.Logger);
}

app.UseCors("Frontend");
app.MapControllers();

// Quick check: open http://localhost:5000/health in the browser.
app.MapGet("/health", async (AppDbContext db) =>
    await db.Database.CanConnectAsync()
        ? Results.Ok(new { status = "ok", database = "connected" })
        : Results.Problem("Cannot connect to the database."));

app.Run();