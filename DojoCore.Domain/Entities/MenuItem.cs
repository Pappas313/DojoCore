namespace DojoCore.Domain.Entities;

public class MenuItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string PageCode { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 0;
    public string? Url { get; set; }
    public string? Icon { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
