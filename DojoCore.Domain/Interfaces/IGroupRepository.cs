using DojoCore.Domain.Entities;

namespace DojoCore.Domain.Interfaces;

public interface IGroupRepository
{
    Task<IEnumerable<Group>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<Group>> GetByGymIdAsync(Guid gymId, CancellationToken ct = default);
    Task<Group?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Group group, CancellationToken ct = default);
    Task UpdateAsync(Group group, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);

    Task<IEnumerable<Guid>> GetCoachIdsAsync(Guid groupId, CancellationToken ct = default);
    Task<IEnumerable<Guid>> GetAthleteIdsAsync(Guid groupId, CancellationToken ct = default);
    Task ReplaceCoachesAsync(Guid groupId, IEnumerable<Guid> coachIds, CancellationToken ct = default);
    Task ReplaceAthletesAsync(Guid groupId, IEnumerable<Guid> athleteIds, CancellationToken ct = default);
}
