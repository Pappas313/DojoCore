namespace DojoCore.Domain.Entities;

public class Group
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GymId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public short Status { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
