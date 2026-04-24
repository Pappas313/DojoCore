using DojoCore.Application.DTOs.Menu;

namespace DojoCore.Application.Interfaces;

public interface IMenuService
{
    Task<List<MenuItemDto>> GetTreeAsync(CancellationToken ct = default);
    Task<MenuItemDto> CreateAsync(CreateMenuItemRequest request, CancellationToken ct = default);
    Task<MenuItemDto> UpdateAsync(int id, UpdateMenuItemRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
