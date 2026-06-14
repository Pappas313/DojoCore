namespace DojoCore.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string UserCode { get; set; } = string.Empty;
    public short Role { get; set; }
    public string? Address { get; set; }
    public short? Gender { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfileImage { get; set; }
    public string? Phone { get; set; }
    public string? Description { get; set; }
    public short Status { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
