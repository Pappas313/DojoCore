namespace DojoCore.Application.DTOs.Competition;

/// <summary>Response returned after a successful import.</summary>
public class ImportCompetitionResponseDto
{
    /// <summary>New import identifier.</summary>
    public Guid ImportId { get; set; }

    /// <summary>Number of athlete rows imported.</summary>
    public int RowsImported { get; set; }

    /// <summary>Distinct categories found in the file.</summary>
    public List<string> Categories { get; set; } = [];
}
