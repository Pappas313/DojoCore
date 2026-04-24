namespace DojoCore.Application.DTOs.Menu;

/// <summary>Represents a menu item node, with its children nested recursively.</summary>
public class MenuItemDto
{
    /// <summary>Primary key.</summary>
    public int Id { get; set; }

    /// <summary>Display label of the menu item.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Unique hierarchical code. Single character = root (e.g. <c>"1"</c>).
    /// Each additional character represents one level deeper (e.g. <c>"11"</c>, <c>"111"</c>).
    /// </summary>
    public string PageCode { get; set; } = string.Empty;

    /// <summary>Sort weight within the same parent level. Lower values appear first.</summary>
    public int OrderIndex { get; set; }

    /// <summary>Optional navigation URL.</summary>
    public string? Url { get; set; }

    /// <summary>Optional icon identifier (CSS class, emoji, etc.).</summary>
    public string? Icon { get; set; }

    /// <summary>Direct children of this node, ordered by <c>OrderIndex</c> then <c>PageCode</c>.</summary>
    public List<MenuItemDto> Children { get; set; } = [];
}
