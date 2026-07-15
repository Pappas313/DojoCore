namespace DojoCore.Application.DTOs.Group;

/// <summary>Payload for replacing the athletes assigned to a group.</summary>
public class UpdateGroupAthletesRequest
{
    /// <summary>Full list of athlete ids that should be assigned to the group.</summary>
    public List<Guid> AthleteIds { get; set; } = [];
}
