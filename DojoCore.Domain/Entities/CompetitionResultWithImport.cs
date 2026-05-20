namespace DojoCore.Domain.Entities;

/// <summary>Flat projection of competition_results joined with competition_imports — used for the all-results list query.</summary>
public class CompetitionResultWithImport
{
    public Guid Id { get; set; }
    public Guid ImportId { get; set; }
    public string ImportTitle { get; set; } = string.Empty;
    public string Tournament { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string WeightClass { get; set; } = string.Empty;
    public short Placement { get; set; }
    public string AthleteName { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public string ClubName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
