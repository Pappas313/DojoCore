namespace DojoCore.Application.DTOs.Group;

/// <summary>Represents a training group belonging to a gym.</summary>
public class GroupDto
{
    /// <summary>Unique identifier.</summary>
    public Guid Id { get; set; }

    /// <summary>Id of the gym this group belongs to.</summary>
    public Guid GymId { get; set; }

    /// <summary>Group name.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Optional description.</summary>
    public string? Description { get; set; }

    /// <summary>Status (0 = active, etc.).</summary>
    public short Status { get; set; }

    /// <summary>Ids of coaches assigned to this group.</summary>
    public List<Guid> CoachIds { get; set; } = [];

    /// <summary>Ids of athletes assigned to this group.</summary>
    public List<Guid> AthleteIds { get; set; } = [];

    /// <summary>Creation timestamp.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Last update timestamp.</summary>
    public DateTime UpdatedAt { get; set; }
}
