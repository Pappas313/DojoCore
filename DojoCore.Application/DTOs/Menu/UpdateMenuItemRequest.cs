using System.ComponentModel.DataAnnotations;

namespace DojoCore.Application.DTOs.Menu;

/// <summary>
/// Payload for updating an existing menu item.
/// <c>PageCode</c> is intentionally excluded — it is immutable after creation.
/// </summary>
public class UpdateMenuItemRequest
{
    /// <summary>Display label. Required, max 100 characters.</summary>
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    /// <summary>Sort weight within the same parent level.</summary>
    /// <example>1</example>
    public int OrderIndex { get; set; } = 0;

    /// <summary>Optional navigation URL.</summary>
    /// <example>https://example.com/profile</example>
    [StringLength(255)]
    public string? Url { get; set; }

    /// <summary>Optional icon identifier (CSS class, emoji, etc.).</summary>
    /// <example>fa-user</example>
    [StringLength(100)]
    public string? Icon { get; set; }
}
