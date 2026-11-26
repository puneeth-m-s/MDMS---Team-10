using Mdms.Data;
using Mdms.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Mdms.Controllers;

[ApiController]
[Route("demoSession")]
public class DemoSessionController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DemoSession>> Get()
    {
        var session = await db.DemoSession.AsNoTracking().FirstOrDefaultAsync();
        if (session is null) return NotFound();
        return session;
    }
}

[ApiController]
[Route("enterpriseSettings")]
public class EnterpriseSettingsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<EnterpriseSettings>> Get()
    {
        var settings = await db.EnterpriseSettings.AsNoTracking().FirstOrDefaultAsync();
        if (settings is null) return NotFound();
        return settings;
    }
}