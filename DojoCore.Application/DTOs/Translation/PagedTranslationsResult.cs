namespace DojoCore.Application.DTOs.Translation;

public class PagedTranslationsResult
{
    public IEnumerable<TranslationDto> Items { get; set; } = [];
    public int Total { get; set; }
}
