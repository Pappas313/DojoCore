using DojoCore.Application.DTOs.Translation;

namespace DojoCore.Application.Interfaces;

public interface ITranslationService
{
    Task<Dictionary<string, string>> GetFlatAsync(string language, string page, CancellationToken ct = default);
    Task<IEnumerable<string>> GetLanguagesAsync(CancellationToken ct = default);
    Task<BulkUpsertResult> BulkUpsertAsync(IEnumerable<BulkUpsertTranslationItem> items, CancellationToken ct = default);
    Task<PagedTranslationsResult> GetPagedAsync(string? language, string? page, int pageNumber, int pageSize, CancellationToken ct = default);
    Task<TranslationDto> UpsertAsync(string language, string page, string key, string value, CancellationToken ct = default);
    Task<bool> DeleteAsync(string language, string page, string key, CancellationToken ct = default);
}
