using DojoCore.Application.DTOs.Manager;

namespace DojoCore.Application.Interfaces;

public interface IManagerService
{
    Task<List<ManagerDto>> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Returns managers visible to the given caller. Admins see all managers; managers, coaches
    /// and athletes belonging to a gym see only managers of their own gym(s). Freelancer athletes
    /// (no gym membership) see managers of all gyms.
    /// </summary>
    Task<List<ManagerDto>> GetVisibleAsync(Guid callerId, short callerRole, CancellationToken ct = default);
    Task<ManagerDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ManagerDto> UpdateAsync(Guid id, UpdateManagerRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
