namespace DojoCore.Application.DTOs.Competition;

/// <summary>Results list response with import metadata.</summary>
public class CompetitionResultsResponseDto
{
    /// <summary>Import identifier.</summary>
    public Guid ImportId { get; set; }

    /// <summary>User-provided grouping title (used as page / grid title).</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Tournament name from the Excel header.</summary>
    public string Tournament { get; set; } = string.Empty;

    /// <summary>All athlete result rows, ordered by category then placement.</summary>
    public List<CompetitionResultDto> Results { get; set; } = [];
}
