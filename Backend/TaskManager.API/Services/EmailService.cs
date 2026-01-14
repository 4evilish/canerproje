using System.Net;
using System.Net.Mail;

namespace TaskManager.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var senderName = _configuration["EmailSettings:SenderName"];
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"];

            using var smtpClient = new SmtpClient(smtpServer, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(username, password)
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail ?? "", senderName ?? "Task Manager"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(to);

            await smtpClient.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
            throw;
        }
    }

    public async Task SendAlarmEmailAsync(string to, string taskName, DateTime alarmDate, string message)
    {
        var subject = $"⏰ Task Alarm: {taskName}";
        var body = $@"
            <html>
            <body>
                <h2>Task Alarm Notification</h2>
                <p><strong>Task:</strong> {taskName}</p>
                <p><strong>Alarm Date:</strong> {alarmDate:dd/MM/yyyy HH:mm}</p>
                <p><strong>Message:</strong> {message}</p>
                <hr>
                <p style='color: gray; font-size: 12px;'>This is an automated message from Task Manager System.</p>
            </body>
            </html>
        ";

        await SendEmailAsync(to, subject, body);
    }
}
