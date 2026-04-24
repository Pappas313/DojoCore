using System.ComponentModel.DataAnnotations;

namespace DojoCore.Application.DTOs.Menu;

/// <summary>Payload for creating a new menu item.</summary>
public class CreateMenuItemRequest
{
    /// <summary>Display label. Required, max 100 characters.</summary>
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Unique hierarchical code. Required, max 50 characters.<br/>
    /// Single character = root (e.g. <c>"1"</c>).<br/>
    /// Each additional character = one level deeper (e.g. <c>"11"</c> is a child of <c>"1"</c>).<br/>
    /// Parent must already exist before creating a child.
    /// </summary>
    /// <example>11</example>
    [Required]
    [StringLength(50)]
    public string PageCode { get; set; } = string.Empty;

    /// <summary>Sort weight within the same parent level. Default is 0.</summary>
    /// <example>0</example>
    public int OrderIndex { get; set; } = 0;

    /// <summary>Optional navigation URL.</summary>
    /// <example>https://example.com/dashboard</example>
    [StringLength(255)]
    public string? Url { get; set; }

    /// <summary>Optional icon identifier (CSS class, emoji, etc.).</summary>
    /// <example>fa-home</example>
    [StringLength(100)]
    public string? Icon { get; set; }
}
