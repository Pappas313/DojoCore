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
}
