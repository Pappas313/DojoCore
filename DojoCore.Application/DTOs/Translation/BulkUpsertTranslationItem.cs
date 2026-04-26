namespace DojoCore.Application.DTOs.Translation;

public class BulkUpsertTranslationItem
{
    public string Language { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
