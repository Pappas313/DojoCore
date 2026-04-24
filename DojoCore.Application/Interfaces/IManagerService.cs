using DojoCore.Application.DTOs.Manager;

namespace DojoCore.Application.Interfaces;

public interface IManagerService
{
    Task<List<ManagerDto>> GetAllAsync(CancellationToken ct = default);
    Task<ManagerDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ManagerDto> UpdateAsync(Guid id, UpdateManagerRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
