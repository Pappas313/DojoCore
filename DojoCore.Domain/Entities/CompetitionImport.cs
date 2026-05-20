namespace DojoCore.Domain.Entities;

public class CompetitionImport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Tournament { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public Guid? ImportedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Populated by the list query via COUNT join — not stored as a column.</summary>
    public int RowCount { get; set; }
}
