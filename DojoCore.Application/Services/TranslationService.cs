using DojoCore.Application.DTOs.Translation;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public class TranslationService : ITranslationService
{
    private readonly IUnitOfWork _uow;

    public TranslationService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Dictionary<string, string>> GetFlatAsync(string language, string page, CancellationToken ct = default)
    {
        var rows = await _uow.Translations.GetByLanguageAndPageAsync(language, page, ct);
        return rows.ToDictionary(r => r.Key, r => r.Value);
    }

    public async Task<IEnumerable<string>> GetLanguagesAsync(CancellationToken ct = default)
    {
        return await _uow.Translations.GetDistinctLanguagesAsync(ct);
    }

    public async Task<BulkUpsertResult> BulkUpsertAsync(IEnumerable<BulkUpsertTranslationItem> items, CancellationToken ct = default)
    {
        var entities = items.Select(i => new Translation
        {
            Language = i.Language,
            Page = i.Page,
            Key = i.Key,
            Value = i.Value
        });

        var (inserted, updated) = await _uow.Translations.BulkUpsertAsync(entities, ct);
        return new BulkUpsertResult { Inserted = inserted, Updated = updated };
    }

    public async Task<PagedTranslationsResult> GetPagedAsync(string? language, string? page, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _uow.Translations.GetPagedAsync(language, page, pageNumber, pageSize, ct);
        return new PagedTranslationsResult
        {
            Items = items.Select(MapDto),
            Total = total
        };
    }

    public async Task<TranslationDto> UpsertAsync(string language, string page, string key, string value, CancellationToken ct = default)
    {
        var row = await _uow.Translations.UpsertAsync(language, page, key, value, ct);
        return MapDto(row);
    }

    public async Task<bool> DeleteAsync(string language, string page, string key, CancellationToken ct = default)
    {
        return await _uow.Translations.DeleteAsync(language, page, key, ct);
    }

    private static TranslationDto MapDto(Translation t) => new()
    {
        Id = t.Id,
        Language = t.Language,
        Page = t.Page,
        Key = t.Key,
        Value = t.Value,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };
}
