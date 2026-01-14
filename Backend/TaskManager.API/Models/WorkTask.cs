namespace TaskManager.API.Models;

public class WorkTask
{
    public int Id { get; set; }
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
    public TaskStatus Status { get; set; } = TaskStatus.Open;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User ResponsibleUser { get; set; } = null!;
    public TaskCategory? TaskCategory { get; set; }
    public ICollection<TaskNote> Notes { get; set; } = new List<TaskNote>();
    public ICollection<TaskAlarm> Alarms { get; set; } = new List<TaskAlarm>();
}

public enum TaskStatus
{
    Open = 0,
    InProgress = 1,
    Completed = 2,
    OnHold = 3,
    Cancelled = 4
}
