using DojoCore.Application.DTOs.Group;

namespace DojoCore.Application.Interfaces;

public interface IGroupService
{
    Task<List<GroupDto>> GetAllAsync(CancellationToken ct = default);
    Task<List<GroupDto>> GetByGymIdAsync(Guid gymId, CancellationToken ct = default);
    Task<List<GroupDto>> GetVisibleAsync(Guid callerId, short callerRole, CancellationToken ct = default);
    Task<GroupDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<GroupDto> CreateAsync(CreateGroupRequest request, CancellationToken ct = default);
    Task<GroupDto> UpdateAsync(Guid id, UpdateGroupRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<GroupDto> UpdateCoachesAsync(Guid id, UpdateGroupCoachesRequest request, CancellationToken ct = default);
    Task<GroupDto> UpdateAthletesAsync(Guid id, UpdateGroupAthletesRequest request, CancellationToken ct = default);
}
