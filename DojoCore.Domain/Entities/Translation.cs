namespace DojoCore.Domain.Entities;

public class Translation
{
    public int Id { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
