namespace DojoCore.Application.DTOs.Group;

/// <summary>Payload for replacing the coaches assigned to a group.</summary>
public class UpdateGroupCoachesRequest
{
    /// <summary>Full list of coach ids that should be assigned to the group.</summary>
    public List<Guid> CoachIds { get; set; } = [];
}
