namespace DojoCore.Application.DTOs.Gym;

/// <summary>
/// Members visible to the current caller, categorized by gym.
/// Freelancer athletes (no gym membership) see managers and coaches of all gyms, without athletes.
/// </summary>
public class MyMembersDto
{
    /// <summary>True when the caller is an athlete with no gym membership.</summary>
    public bool IsFreelancer { get; set; }

    /// <summary>Gyms (with their members grouped by role) visible to the caller.</summary>
    public List<GymWithMembersDto> Gyms { get; set; } = [];
}
