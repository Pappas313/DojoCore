namespace DojoCore.Application.DTOs.Competition;

/// <summary>Summary of a competition import shown in the imports list.</summary>
public class CompetitionImportListItemDto
{
    /// <summary>Import identifier.</summary>
    public Guid Id { get; set; }

    /// <summary>User-provided grouping title.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Tournament name extracted from the Excel header.</summary>
    public string Tournament { get; set; } = string.Empty;

    /// <summary>Original file name.</summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>Total number of athlete results in this import.</summary>
    public int RowCount { get; set; }

    /// <summary>When the import was created.</summary>
    public DateTime CreatedAt { get; set; }
}
