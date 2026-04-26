namespace DojoCore.Application.DTOs.Translation;

public class TranslationDto
{
    public int Id { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
