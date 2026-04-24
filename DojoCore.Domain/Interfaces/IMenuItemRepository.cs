using DojoCore.Domain.Entities;

namespace DojoCore.Domain.Interfaces;

public interface IMenuItemRepository
{
    Task<IEnumerable<MenuItem>> GetAllAsync(CancellationToken ct = default);
    Task<MenuItem?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<MenuItem?> GetByPageCodeAsync(string pageCode, CancellationToken ct = default);
    Task<bool> PageCodeExistsAsync(string pageCode, CancellationToken ct = default);
    Task<int> AddAsync(MenuItem item, CancellationToken ct = default);
    Task UpdateAsync(MenuItem item, CancellationToken ct = default);
    Task DeleteByPageCodePrefixAsync(string pageCode, CancellationToken ct = default);
}
