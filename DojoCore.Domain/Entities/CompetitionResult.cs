namespace DojoCore.Domain.Entities;

public class CompetitionResult
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ImportId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string WeightClass { get; set; } = string.Empty;
    public short Placement { get; set; }
    public string AthleteName { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public string ClubName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
