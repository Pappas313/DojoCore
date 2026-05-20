using DojoCore.Application.DTOs.Competition;

namespace DojoCore.Application.Interfaces;

public interface ICompetitionService
{
    Task<ImportCompetitionResponseDto> ImportAsync(Stream fileStream, string fileName, string title, Guid? importedBy, CancellationToken ct = default);
    Task<List<CompetitionImportListItemDto>> GetAllImportsAsync(CancellationToken ct = default);
    Task<CompetitionResultsResponseDto?> GetResultsAsync(Guid importId, CancellationToken ct = default);
    Task<List<CompetitionResultWithImportDto>> GetAllResultsAsync(CancellationToken ct = default);
    Task DeleteImportAsync(Guid importId, CancellationToken ct = default);
}
