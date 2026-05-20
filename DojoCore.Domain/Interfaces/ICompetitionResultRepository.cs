using DojoCore.Domain.Entities;

namespace DojoCore.Domain.Interfaces;

public interface ICompetitionResultRepository
{
    Task<IEnumerable<CompetitionResult>> GetByImportIdAsync(Guid importId, CancellationToken ct = default);
    Task<IEnumerable<CompetitionResultWithImport>> GetAllWithImportAsync(CancellationToken ct = default);
    Task BulkInsertAsync(IEnumerable<CompetitionResult> results, CancellationToken ct = default);
}
