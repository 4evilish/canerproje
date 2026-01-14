using Microsoft.EntityFrameworkCore;
using TaskManager.API.Models;

namespace TaskManager.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<WorkTask> WorkTasks { get; set; }
    public DbSet<TaskNote> TaskNotes { get; set; }
    public DbSet<TaskAlarm> TaskAlarms { get; set; }
    public DbSet<TaskCategory> TaskCategories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // WorkTask configuration
        modelBuilder.Entity<WorkTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PartnerName).HasMaxLength(200);
            entity.Property(e => e.Scope).HasMaxLength(500);
            entity.Property(e => e.Fee).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Cost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.ResponsibleInstitution).HasMaxLength(200);

            entity.HasOne(e => e.ResponsibleUser)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(e => e.ResponsibleUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.TaskCategory)
                .WithMany()
                .HasForeignKey(e => e.TaskCategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // TaskCategory configuration
        modelBuilder.Entity<TaskCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        // TaskNote configuration
        modelBuilder.Entity<TaskNote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired().HasMaxLength(2000);

            entity.HasOne(e => e.WorkTask)
                .WithMany(t => t.Notes)
                .HasForeignKey(e => e.WorkTaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // TaskAlarm configuration
        modelBuilder.Entity<TaskAlarm>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.WorkTask)
                .WithMany(t => t.Alarms)
                .HasForeignKey(e => e.WorkTaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed default admin user
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Email = "admin@taskmanager.com",
                PasswordHash = "$2a$11$xQZ5yH3qN1Z5QZ5QZ5QZ5OZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5QZ5QO", // Admin123!
                FullName = "System Administrator",
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
