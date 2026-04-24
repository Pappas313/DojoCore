using DojoCore.Application.DTOs.Coach;

namespace DojoCore.Application.Interfaces;

public interface ICoachService
{
    Task<List<CoachDto>> GetAllAsync(CancellationToken ct = default);
    Task<CoachDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<CoachDto> UpdateAsync(Guid id, UpdateCoachRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
