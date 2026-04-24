using DojoCore.Application.DTOs.Menu;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public class MenuService : IMenuService
{
    private readonly IUnitOfWork _uow;

    public MenuService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    // ---------------------------------------------------------------
    // GET /api/menu  →  full tree
    // ---------------------------------------------------------------
    public async Task<List<MenuItemDto>> GetTreeAsync(CancellationToken ct = default)
    {
        var all = (await _uow.MenuItems.GetAllAsync(ct)).ToList();
        return BuildTree(all);
    }

    // ---------------------------------------------------------------
    // POST /api/menu
    // ---------------------------------------------------------------
    public async Task<MenuItemDto> CreateAsync(CreateMenuItemRequest request, CancellationToken ct = default)
    {
        var pageCode = request.PageCode.Trim();

        // Validate PageCode uniqueness
        if (await _uow.MenuItems.PageCodeExistsAsync(pageCode, ct))
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["PageCode"] = [$"PageCode '{pageCode}' already exists."]
            });

        // Validate hierarchy: parent must exist unless this is a root (length == 1)
        if (pageCode.Length > 1)
        {
            var parentCode = pageCode[..^1];
            if (!await _uow.MenuItems.PageCodeExistsAsync(parentCode, ct))
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["PageCode"] = [$"Parent with PageCode '{parentCode}' does not exist. You cannot create a child without its parent."]
                });
        }

        var item = new MenuItem
        {
            Title = request.Title.Trim(),
            PageCode = pageCode,
            OrderIndex = request.OrderIndex,
            Url = request.Url?.Trim(),
            Icon = request.Icon?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var id = await _uow.MenuItems.AddAsync(item, ct);
        item.Id = id;

        return ToDto(item);
    }

    // ---------------------------------------------------------------
    // PUT /api/menu/{id}
    // ---------------------------------------------------------------
    public async Task<MenuItemDto> UpdateAsync(int id, UpdateMenuItemRequest request, CancellationToken ct = default)
    {
        var item = await _uow.MenuItems.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"MenuItem with id {id} not found.");

        item.Title = request.Title.Trim();
        item.OrderIndex = request.OrderIndex;
        item.Url = request.Url?.Trim();
        item.Icon = request.Icon?.Trim();
        item.UpdatedAt = DateTime.UtcNow;

        await _uow.MenuItems.UpdateAsync(item, ct);
        return ToDto(item);
    }

    // ---------------------------------------------------------------
    // DELETE /api/menu/{id}
    // ---------------------------------------------------------------
    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var item = await _uow.MenuItems.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"MenuItem with id {id} not found.");

        // Delete the item and all descendants (PageCode LIKE 'prefix%')
        await _uow.MenuItems.DeleteByPageCodePrefixAsync(item.PageCode, ct);
    }

    // ---------------------------------------------------------------
    // Tree-building  (pure PageCode prefix logic, no ParentId)
    // ---------------------------------------------------------------
    private static List<MenuItemDto> BuildTree(List<MenuItem> all)
    {
        // Sort so parents always appear before their children
        var sorted = all.OrderBy(x => x.PageCode.Length).ThenBy(x => x.PageCode).ToList();

        // Map for quick lookup
        var map = sorted.ToDictionary(x => x.PageCode, ToDto);

        var roots = new List<MenuItemDto>();

        foreach (var dto in map.Values.OrderBy(x => x.PageCode.Length).ThenBy(x => x.PageCode))
        {
            if (dto.PageCode.Length == 1)
            {
                roots.Add(dto);
            }
            else
            {
                var parentCode = dto.PageCode[..^1];
                if (map.TryGetValue(parentCode, out var parent))
                    parent.Children.Add(dto);
                // Orphan nodes (parent missing) are silently promoted to root
                else
                    roots.Add(dto);
            }
        }

        // Sort children at every level by OrderIndex then PageCode
        SortChildren(roots);

        return roots.OrderBy(x => x.OrderIndex).ThenBy(x => x.PageCode).ToList();
    }

    private static void SortChildren(List<MenuItemDto> nodes)
    {
        foreach (var node in nodes)
        {
            node.Children = node.Children
                .OrderBy(c => c.OrderIndex)
                .ThenBy(c => c.PageCode)
                .ToList();

            SortChildren(node.Children);
        }
    }

    private static MenuItemDto ToDto(MenuItem m) => new()
    {
        Id = m.Id,
        Title = m.Title,
        PageCode = m.PageCode,
        OrderIndex = m.OrderIndex,
        Url = m.Url,
        Icon = m.Icon
    };
}
