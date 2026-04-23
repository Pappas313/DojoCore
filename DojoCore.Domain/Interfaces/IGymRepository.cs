using DojoCore.Domain.Entities;

namespace DojoCore.Domain.Interfaces;

public interface IGymRepository
{
    Task<Gym?> GetByCodeAsync(string gymCode, CancellationToken ct = default);
    Task AddAsync(Gym gym, CancellationToken ct = default);
    Task<bool> GymCodeExistsAsync(string gymCode, CancellationToken ct = default);
}
