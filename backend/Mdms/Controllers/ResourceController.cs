using Mdms.Common;
using Mdms.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Mdms.Controllers;

[ApiController]
public abstract class ResourceController<T>(AppDbContext db) : ControllerBase where T : class
{
    // GET /meters?_page=1&_limit=10&_sort=id&_order=desc&q=pune&status=active
    [HttpGet]
    public async Task<ActionResult<List<T>>> List()
    {
        try
        {
            return await db.Set<T>().AsNoTracking().ToPagedListAsync(Request, Response);
        }
        catch (InvalidQueryException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // GET /meters/MTR-1001
    [HttpGet("{id}")]
    public async Task<ActionResult<T>> GetById(string id)
    {
        var entity = await db.Set<T>().FindAsync(id);
        if (entity is null) return NotFound();
        return entity;
    }
}