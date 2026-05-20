using DojoCore.Application.DTOs.Competition;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public partial class CompetitionService : ICompetitionService
{
    private readonly IUnitOfWork _uow;
    private readonly IExcelCompetitionParser _parser;

    public CompetitionService(IUnitOfWork uow, IExcelCompetitionParser parser)
    {
        _uow    = uow;
        _parser = parser;
    }

    public async Task<ImportCompetitionResponseDto> ImportAsync(
        Stream fileStream,
        string fileName,
        string title,
        Guid? importedBy,
        CancellationToken ct = default)
    {
        var (tournament, results) = _parser.Parse(fileStream, fileName);

        var import = new CompetitionImport
        {
            Title      = title,
            Tournament = tournament,
            FileName   = fileName,
            ImportedBy = importedBy
        };

        await _uow.BeginTransactionAsync(ct);
        var importId = await _uow.CompetitionImports.InsertAsync(import, ct);

        foreach (var r in results)
            r.ImportId = importId;

        await _uow.CompetitionResults.BulkInsertAsync(results, ct);
        await _uow.CommitAsync(ct);

        return new ImportCompetitionResponseDto
        {
            ImportId     = importId,
            RowsImported = results.Count,
            Categories   = results.Select(r => r.Category).Distinct().OrderBy(c => c).ToList()
        };
    }

    public async Task<List<CompetitionImportListItemDto>> GetAllImportsAsync(CancellationToken ct = default)
    {
        var imports = await _uow.CompetitionImports.GetAllAsync(ct);
        return imports.Select(i => new CompetitionImportListItemDto
        {
            Id         = i.Id,
            Title      = i.Title,
            Tournament = i.Tournament,
            FileName   = i.FileName,
            RowCount   = i.RowCount,
            CreatedAt  = i.CreatedAt
        }).ToList();
    }

    public async Task<CompetitionResultsResponseDto?> GetResultsAsync(Guid importId, CancellationToken ct = default)
    {
        var import = await _uow.CompetitionImports.GetByIdAsync(importId, ct);
        if (import is null) return null;

        var rows = await _uow.CompetitionResults.GetByImportIdAsync(importId, ct);

        return new CompetitionResultsResponseDto
        {
            ImportId   = import.Id,
            Title      = import.Title,
            Tournament = import.Tournament,
            Results    = rows
                .OrderBy(r => r.Gender)
                .ThenBy(r => r.WeightClass)
                .ThenBy(r => r.Placement)
                .Select(MapToDto)
                .ToList()
        };
    }

    public async Task DeleteImportAsync(Guid importId, CancellationToken ct = default)
    {
        if (!await _uow.CompetitionImports.ExistsAsync(importId, ct))
            throw new KeyNotFoundException($"Competition import '{importId}' was not found.");

        await _uow.CompetitionImports.DeleteAsync(importId, ct);
    }

    public async Task<List<CompetitionResultWithImportDto>> GetAllResultsAsync(CancellationToken ct = default)
    {
        var rows = await _uow.CompetitionResults.GetAllWithImportAsync(ct);
        return rows.Select(r => new CompetitionResultWithImportDto
        {
            Id             = r.Id,
            ImportId       = r.ImportId,
            ImportTitle    = r.ImportTitle,
            Tournament     = r.Tournament,
            Category       = r.Category,
            Gender         = r.Gender,
            WeightClass    = r.WeightClass,
            Placement      = r.Placement,
            PlacementLabel = PlacementLabel(r.Placement, r.Gender),
            AthleteName    = r.AthleteName,
            CountryCode    = r.CountryCode,
            ClubName       = r.ClubName
        }).ToList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string PlacementLabel(short placement, string gender) => placement switch
    {
        1 => gender == "ΓΥΝΑΙΚΩΝ" ? "1η" : "1ος",
        2 => gender == "ΓΥΝΑΙΚΩΝ" ? "2η" : "2ος",
        3 => gender == "ΓΥΝΑΙΚΩΝ" ? "3η" : "3ος",
        _ => placement.ToString()
    };

    private static CompetitionResultDto MapToDto(CompetitionResult r) => new()
    {
        Id             = r.Id,
        ImportId       = r.ImportId,
        Category       = r.Category,
        Gender         = r.Gender,
        WeightClass    = r.WeightClass,
        Placement      = r.Placement,
        PlacementLabel = PlacementLabel(r.Placement, r.Gender),
        AthleteName    = r.AthleteName,
        CountryCode    = r.CountryCode,
        ClubName       = r.ClubName
    };
}
