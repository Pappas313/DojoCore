using DojoCore.Domain.Entities;

namespace DojoCore.Domain.Interfaces;

public interface ICompetitionImportRepository
{
    Task<IEnumerable<CompetitionImport>> GetAllAsync(CancellationToken ct = default);
    Task<CompetitionImport?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Guid> InsertAsync(CompetitionImport import, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);
}
