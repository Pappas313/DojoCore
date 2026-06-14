namespace DojoCore.Domain.Entities;

public class Gym
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string GymCode { get; set; } = string.Empty;
    public Guid CreatedBy { get; set; }
    public string? LogoImage { get; set; }
    public string? Phone { get; set; }
    public string? ContactEmail { get; set; }
    public string? Description { get; set; }
    public short Status { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
