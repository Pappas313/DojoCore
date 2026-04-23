using DojoCore.Domain.Entities;

namespace DojoCore.Domain.Interfaces;

public interface IUserGymRepository
{
    Task AddAsync(UserGym userGym, CancellationToken ct = default);
}
