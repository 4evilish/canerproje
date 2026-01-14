namespace TaskManager.API.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendAlarmEmailAsync(string to, string taskName, DateTime alarmDate, string message);
}
