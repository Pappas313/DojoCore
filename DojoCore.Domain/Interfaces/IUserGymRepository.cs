using DojoCore.Domain.Entities;

namespace DojoCore.Domain.Interfaces;

public interface IUserGymRepository
{
    Task AddAsync(UserGym userGym, CancellationToken ct = default);
    Task<IEnumerable<Guid>> GetGymIdsByUserIdAsync(Guid userId, CancellationToken ct = default);
}
