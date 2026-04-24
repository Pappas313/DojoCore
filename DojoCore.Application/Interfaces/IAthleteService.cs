using DojoCore.Application.DTOs.Athlete;

namespace DojoCore.Application.Interfaces;

public interface IAthleteService
{
    Task<List<AthleteDto>> GetAllAsync(CancellationToken ct = default);
    Task<AthleteDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AthleteDto> UpdateAsync(Guid id, UpdateAthleteRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
