using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;
using TaskManager.API.Services;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, ITokenService tokenService, ILogger<AuthController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new { message = "User account is deactivated" });
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role.ToString()
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("create-user")]
    public async Task<ActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { message = "Bu email adresi zaten kullanılıyor" });
        }

        // Parse role string to enum
        if (!Enum.TryParse<UserRole>(request.Role, true, out var userRole))
        {
            return BadRequest(new { message = "Geçersiz rol değeri" });
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Role = userRole,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("New user created: {Email} with role {Role}", user.Email, user.Role);

        return Ok(new { message = "Kullanıcı başarıyla oluşturuldu", userId = user.Id });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<ActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FullName,
                u.Role,
                u.IsActive,
                u.CreatedAt,
                u.LastLoginAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("users/{id}")]
    public async Task<ActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        _logger.LogInformation("UpdateUser request - ID: {Id}, FullName: {FullName}, Role: {Role}, HasPassword: {HasPassword}", 
            id, request.FullName, request.Role, !string.IsNullOrWhiteSpace(request.Password));

        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Kullanıcı bulunamadı" });
        }

        bool changed = false;

        // Update full name
        if (!string.IsNullOrWhiteSpace(request.FullName) && user.FullName != request.FullName)
        {
            _logger.LogInformation("Changing FullName from {Old} to {New}", user.FullName, request.FullName);
            user.FullName = request.FullName;
            changed = true;
        }

        // Update role
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            if (Enum.TryParse<UserRole>(request.Role, true, out var userRole))
            {
                if (user.Role != userRole)
                {
                    _logger.LogInformation("Changing Role from {Old} to {New}", user.Role, userRole);
                    user.Role = userRole;
                    changed = true;
                }
            }
            else
            {
                _logger.LogWarning("Failed to parse role: {Role}", request.Role);
            }
        }

        // Update password if provided
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            _logger.LogInformation("Updating password for user {Email}", user.Email);
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            changed = true;
        }

        if (changed)
        {
            _context.Entry(user).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
            await _context.SaveChangesAsync();
            _logger.LogInformation("User successfully updated: {Email}", user.Email);
        }
        else
        {
            _logger.LogInformation("No changes detected for user: {Email}", user.Email);
        }

        return Ok(new { message = "Kullanıcı güncellendi" });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("users/{id}/toggle-active")]
    public async Task<ActionResult> ToggleUserActive(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully" });
    }

    // TEMPORARY: Fix admin password
    [HttpPost("fix-admin")]
    public async Task<ActionResult> FixAdminPassword()
    {
        var admin = await _context.Users.FirstOrDefaultAsync(u => u.Email == "admin@taskmanager.com");
        if (admin == null)
        {
            // Create admin if not exists
            admin = new User
            {
                Email = "admin@taskmanager.com",
                FullName = "System Administrator",
                Role = UserRole.Admin,
                IsActive = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!")
            };
            _context.Users.Add(admin);
        }
        else
        {
            // Update password
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
        }
        
        await _context.SaveChangesAsync();
        return Ok(new { message = "Admin password fixed successfully" });
    }
}
