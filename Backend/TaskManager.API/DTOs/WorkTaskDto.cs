using TaskManager.API.Models;

namespace TaskManager.API.DTOs;

public class WorkTaskDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int? TaskCategoryId { get; set; }
    public string? TaskCategoryName { get; set; }
    public string PartnerName { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public decimal Fee { get; set; }
    public decimal Cost { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime OpenDate { get; set; }
    public DateTime? CloseDate { get; set; }
    public int ResponsibleUserId { get; set; }
    public string ResponsibleUserName { get; set; } = string.Empty;
    public string ResponsibleInstitution { get; set; } = string.Empty;
    public Models.TaskStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateWorkTaskRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public int? TaskCategoryId { get; set; }
    public string PartnerName { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public decimal Fee { get; set; }
    public decimal Cost { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime OpenDate { get; set; }
    public DateTime? CloseDate { get; set; }
    public int ResponsibleUserId { get; set; }
    public string ResponsibleInstitution { get; set; } = string.Empty;
    public Models.TaskStatus Status { get; set; } = Models.TaskStatus.Open;
}
