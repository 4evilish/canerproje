namespace TaskManager.API.Models;

public class TaskNote
{
    public int Id { get; set; }
    public int WorkTaskId { get; set; }
    public string Content { get; set; } = string.Empty;
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public WorkTask WorkTask { get; set; } = null!;
    public User CreatedBy { get; set; } = null!;
}
