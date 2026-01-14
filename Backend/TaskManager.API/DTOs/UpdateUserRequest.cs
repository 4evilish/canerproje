namespace TaskManager.API.DTOs;

public class UpdateUserRequest
{
    public string? FullName { get; set; }
    public string? Role { get; set; }
    public string? Password { get; set; }
}
