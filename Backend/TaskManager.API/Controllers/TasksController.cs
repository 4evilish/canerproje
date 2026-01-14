using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TasksController> _logger;

    public TasksController(AppDbContext context, ILogger<TasksController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkTaskDto>>> GetTasks(
        [FromQuery] string? status, 
        [FromQuery] int? responsibleUserId,
        [FromQuery] string? customer,
        [FromQuery] int? categoryId)
    {
        var query = _context.WorkTasks
            .Include(t => t.ResponsibleUser)
            .Include(t => t.TaskCategory)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<Models.TaskStatus>(status, out var taskStatus))
        {
            query = query.Where(t => t.Status == taskStatus);
        }

        if (responsibleUserId.HasValue)
        {
            query = query.Where(t => t.ResponsibleUserId == responsibleUserId.Value);
        }

        // Müşteri filtresi
        if (!string.IsNullOrEmpty(customer))
        {
            query = query.Where(t => t.CustomerName == customer);
        }

        // Görev kategorisi filtresi
        if (categoryId.HasValue)
        {
            query = query.Where(t => t.TaskCategoryId == categoryId.Value);
        }

        var tasks = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new WorkTaskDto
            {
                Id = t.Id,
                CustomerName = t.CustomerName,
                TaskCategoryId = t.TaskCategoryId,
                TaskCategoryName = t.TaskCategory != null ? t.TaskCategory.Name : null,
                PartnerName = t.PartnerName,
                Scope = t.Scope,
                Fee = t.Fee,
                Cost = t.Cost,
                Description = t.Description,
                OpenDate = t.OpenDate,
                CloseDate = t.CloseDate,
                ResponsibleUserId = t.ResponsibleUserId,
                ResponsibleUserName = t.ResponsibleUser.FullName,
                ResponsibleInstitution = t.ResponsibleInstitution,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("customers")]
    public async Task<ActionResult<IEnumerable<string>>> GetCustomers()
    {
        var customers = await _context.WorkTasks
            .Select(t => t.CustomerName)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkTaskDto>> GetTask(int id)
    {
        var task = await _context.WorkTasks
            .Include(t => t.ResponsibleUser)
            .Include(t => t.Notes)
            .Include(t => t.Alarms)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return NotFound();
        }

        var taskDto = new WorkTaskDto
        {
            Id = task.Id,
            CustomerName = task.CustomerName,
            PartnerName = task.PartnerName,
            Scope = task.Scope,
            Fee = task.Fee,
            Cost = task.Cost,
            Description = task.Description,
            OpenDate = task.OpenDate,
            CloseDate = task.CloseDate,
            ResponsibleUserId = task.ResponsibleUserId,
            ResponsibleUserName = task.ResponsibleUser.FullName,
            ResponsibleInstitution = task.ResponsibleInstitution,
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };

        return Ok(taskDto);
    }

    [HttpPost]
    public async Task<ActionResult<WorkTaskDto>> CreateTask([FromBody] CreateWorkTaskRequest request)
    {
        var task = new WorkTask
        {
            CustomerName = request.CustomerName,
            TaskCategoryId = request.TaskCategoryId,
            PartnerName = request.PartnerName,
            Scope = request.Scope,
            Fee = request.Fee,
            Cost = request.Cost,
            Description = request.Description,
            OpenDate = request.OpenDate,
            CloseDate = request.CloseDate,
            ResponsibleUserId = request.ResponsibleUserId,
            ResponsibleInstitution = request.ResponsibleInstitution,
            Status = request.Status
        };

        _context.WorkTasks.Add(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("New task created: {CustomerName} by user {UserId}", task.CustomerName, GetCurrentUserId());

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateTask(int id, [FromBody] CreateWorkTaskRequest request)
    {
        var task = await _context.WorkTasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        task.CustomerName = request.CustomerName;
        task.TaskCategoryId = request.TaskCategoryId;
        task.PartnerName = request.PartnerName;
        task.Scope = request.Scope;
        task.Fee = request.Fee;
        task.Cost = request.Cost;
        task.Description = request.Description;
        task.OpenDate = request.OpenDate;
        task.CloseDate = request.CloseDate;
        task.ResponsibleUserId = request.ResponsibleUserId;
        task.ResponsibleInstitution = request.ResponsibleInstitution;
        task.Status = request.Status;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Task updated successfully" });
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdateTaskStatus(int id, [FromBody] Models.TaskStatus status)
    {
        var task = await _context.WorkTasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        task.Status = status;
        task.UpdatedAt = DateTime.UtcNow;

        if (status == Models.TaskStatus.Completed && !task.CloseDate.HasValue)
        {
            task.CloseDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Task status updated successfully" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteTask(int id)
    {
        var task = await _context.WorkTasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        _context.WorkTasks.Remove(task);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Task deleted successfully" });
    }

    [HttpPost("{id}/notes")]
    public async Task<ActionResult> AddNote(int id, [FromBody] string content)
    {
        var task = await _context.WorkTasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        var note = new TaskNote
        {
            WorkTaskId = id,
            Content = content,
            CreatedByUserId = GetCurrentUserId()
        };

        _context.TaskNotes.Add(note);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Note added successfully", noteId = note.Id });
    }

    [HttpGet("{id}/notes")]
    public async Task<ActionResult> GetTaskNotes(int id)
    {
        var notes = await _context.TaskNotes
            .Include(n => n.CreatedBy)
            .Where(n => n.WorkTaskId == id)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id,
                n.Content,
                n.CreatedAt,
                CreatedBy = n.CreatedBy.FullName
            })
            .ToListAsync();

        return Ok(notes);
    }

    [HttpPost("{id}/alarms")]
    public async Task<ActionResult> AddAlarm(int id, [FromBody] TaskAlarm alarm)
    {
        var task = await _context.WorkTasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        alarm.WorkTaskId = id;
        alarm.IsSent = false;

        _context.TaskAlarms.Add(alarm);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Alarm added successfully", alarmId = alarm.Id });
    }

    [HttpGet("{id}/alarms")]
    public async Task<ActionResult> GetTaskAlarms(int id)
    {
        var alarms = await _context.TaskAlarms
            .Where(a => a.WorkTaskId == id)
            .OrderBy(a => a.AlarmDate)
            .ToListAsync();

        return Ok(alarms);
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }
}
