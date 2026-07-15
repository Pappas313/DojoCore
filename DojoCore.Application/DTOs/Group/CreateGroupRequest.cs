using System.ComponentModel.DataAnnotations;

namespace DojoCore.Application.DTOs.Group;

/// <summary>Payload for creating a new group within a gym.</summary>
public class CreateGroupRequest
{
    /// <summary>Id of the gym this group belongs to.</summary>
    [Required]
    public Guid GymId { get; set; }

    /// <summary>Group name (2–200 characters).</summary>
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Optional description.</summary>
    [StringLength(2000)]
    public string? Description { get; set; }

    /// <summary>Initial coach ids assigned to the group.</summary>
    public List<Guid> CoachIds { get; set; } = [];

    /// <summary>Initial athlete ids assigned to the group.</summary>
    public List<Guid> AthleteIds { get; set; } = [];
}
