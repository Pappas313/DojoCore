using DojoCore.Application.DTOs.Coach;

namespace DojoCore.Application.Interfaces;

public interface ICoachService
{
    Task<List<CoachDto>> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Returns coaches visible to the given caller. Admins see all coaches; managers, coaches
    /// and athletes belonging to a gym see only coaches of their own gym(s). Freelancer athletes
    /// (no gym membership) see coaches of all gyms.
    /// </summary>
    Task<List<CoachDto>> GetVisibleAsync(Guid callerId, short callerRole, CancellationToken ct = default);
    Task<CoachDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<CoachDto> UpdateAsync(Guid id, UpdateCoachRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
