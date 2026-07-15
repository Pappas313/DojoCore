namespace DojoCore.Domain.Interfaces;

public interface IUnitOfWork
{
    IUserRepository Users { get; }
    IGymRepository Gyms { get; }
    IUserGymRepository UserGyms { get; }
    IGroupRepository Groups { get; }
    IDocumentRepository Documents { get; }
    IMenuItemRepository MenuItems { get; }
    IAthleteRepository Athletes { get; }
    IManagerRepository Managers { get; }
    ICoachRepository Coaches { get; }
    ITranslationRepository Translations { get; }
    ICompetitionImportRepository CompetitionImports { get; }
    ICompetitionResultRepository CompetitionResults { get; }

    Task BeginTransactionAsync(CancellationToken ct = default);
    Task CommitAsync(CancellationToken ct = default);
    Task RollbackAsync(CancellationToken ct = default);
}
