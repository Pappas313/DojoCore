namespace DojoCore.Application.DTOs.Competition;

/// <summary>A single athlete result row returned from the grid API.</summary>
public class CompetitionResultDto
{
    /// <summary>Result identifier.</summary>
    public Guid Id { get; set; }

    /// <summary>Import identifier.</summary>
    public Guid ImportId { get; set; }

    /// <summary>Full category label, e.g. "ΑΝΔΡΩΝ ( 54- )".</summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>Gender group: "ΑΝΔΡΩΝ" or "ΓΥΝΑΙΚΩΝ".</summary>
    public string Gender { get; set; } = string.Empty;

    /// <summary>Weight class, e.g. "54-", "87+".</summary>
    public string WeightClass { get; set; } = string.Empty;

    /// <summary>Medal placement: 1, 2 or 3.</summary>
    public short Placement { get; set; }

    /// <summary>Placement label, e.g. "1ος", "2ος", "3ος".</summary>
    public string PlacementLabel { get; set; } = string.Empty;

    /// <summary>Full athlete name.</summary>
    public string AthleteName { get; set; } = string.Empty;

    /// <summary>ISO country code, e.g. "GRE".</summary>
    public string CountryCode { get; set; } = string.Empty;

    /// <summary>Club / association name.</summary>
    public string ClubName { get; set; } = string.Empty;
}
