using DojoCore.Domain.Entities;

namespace DojoCore.Domain.Interfaces;

public interface ITranslationRepository
{
    Task<IEnumerable<Translation>> GetByLanguageAndPageAsync(string language, string page, CancellationToken ct = default);
    Task<IEnumerable<string>> GetDistinctLanguagesAsync(CancellationToken ct = default);
    Task<(IEnumerable<Translation> Items, int Total)> GetPagedAsync(string? language, string? page, int pageNumber, int pageSize, CancellationToken ct = default);
    Task<Translation?> GetByKeyAsync(string language, string page, string key, CancellationToken ct = default);
    Task<Translation> UpsertAsync(string language, string page, string key, string value, CancellationToken ct = default);
    Task<(int Inserted, int Updated)> BulkUpsertAsync(IEnumerable<Translation> translations, CancellationToken ct = default);
    Task<bool> DeleteAsync(string language, string page, string key, CancellationToken ct = default);
}
