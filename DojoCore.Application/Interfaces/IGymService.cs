using DojoCore.Application.DTOs.Athlete;
using DojoCore.Application.DTOs.Coach;
using DojoCore.Application.DTOs.Gym;
using DojoCore.Application.DTOs.Manager;

namespace DojoCore.Application.Interfaces;

public interface IGymService
{
    Task<List<GymDto>> GetAllAsync(CancellationToken ct = default);
    Task<GymDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<CoachDto>> GetCoachesByGymAsync(Guid gymId, CancellationToken ct = default);
    Task<List<ManagerDto>> GetManagersByGymAsync(Guid gymId, CancellationToken ct = default);
    Task<List<AthleteDto>> GetAthletesByGymAsync(Guid gymId, CancellationToken ct = default);
    Task<GymWithMembersDto?> GetWithMembersAsync(Guid gymId, CancellationToken ct = default);
    Task<List<GymWithMembersDto>> GetAllWithMembersAsync(CancellationToken ct = default);

    /// <summary>
    /// Returns the members visible to the given user based on their role and gym membership.
    /// Managers, coaches and athletes belonging to a gym only see members of their own gym(s).
    /// Freelancer athletes (no gym membership) see managers and coaches of all gyms (no athletes).
    /// </summary>
    Task<MyMembersDto> GetMyMembersAsync(Guid userId, short role, CancellationToken ct = default);
}
