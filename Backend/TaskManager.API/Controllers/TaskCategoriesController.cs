using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TaskCategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TaskCategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetCategories()
    {
        var categories = await _context.TaskCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Görev adı boş olamaz" });
        }

        // Check if already exists
        if (await _context.TaskCategories.AnyAsync(c => c.Name == request.Name && c.IsActive))
        {
            return BadRequest(new { message = "Bu görev adı zaten mevcut" });
        }

        var category = new TaskCategory
        {
            Name = request.Name.Trim()
        };

        _context.TaskCategories.Add(category);
        await _context.SaveChangesAsync();

        return Ok(category);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteCategory(int id)
    {
        var category = await _context.TaskCategories.FindAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        category.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Görev silindi" });
    }
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
}
