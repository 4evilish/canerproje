namespace TaskManager.API.Models;

public class TaskAlarm
{
    public int Id { get; set; }
    public int WorkTaskId { get; set; }
    public DateTime AlarmDate { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsSent { get; set; } = false;
    public DateTime? SentAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public WorkTask WorkTask { get; set; } = null!;
}
