using System.ComponentModel.DataAnnotations;

namespace DojoCore.Application.DTOs.Group;

/// <summary>Payload for updating an existing group's profile fields.</summary>
public class UpdateGroupRequest
{
    /// <summary>Group name (2–200 characters).</summary>
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Optional description.</summary>
    [StringLength(2000)]
    public string? Description { get; set; }

    /// <summary>Status (0 = active, etc.).</summary>
    public short Status { get; set; }
}
