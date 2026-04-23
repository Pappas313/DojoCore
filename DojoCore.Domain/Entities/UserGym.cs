namespace DojoCore.Domain.Entities;

public class UserGym
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid GymId { get; set; }
    public short Role { get; set; }
    public short Status { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
