using DojoCore.Application.DTOs.Athlete;

namespace DojoCore.Application.Interfaces;

public interface IAthleteService
{
    Task<List<AthleteDto>> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Returns athletes visible to the given caller. Admins see all athletes; managers, coaches
    /// and athletes see only athletes of the gym(s) they belong to. Freelancer athletes
    /// (no gym membership) do not see other athletes.
    /// </summary>
    Task<List<AthleteDto>> GetVisibleAsync(Guid callerId, short callerRole, CancellationToken ct = default);
    Task<AthleteDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AthleteDto> UpdateAsync(Guid id, UpdateAthleteRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
