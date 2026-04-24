using DojoCore.Application.DTOs.Athlete;
using DojoCore.Application.DTOs.Coach;
using DojoCore.Application.DTOs.Manager;

namespace DojoCore.Application.DTOs.Gym;

/// <summary>A gym together with all its members grouped by role.</summary>
public class GymWithMembersDto
{
    /// <summary>Gym details.</summary>
    public GymDto Gym { get; set; } = null!;

    /// <summary>Coaches assigned to this gym.</summary>
    public List<CoachDto> Coaches { get; set; } = [];

    /// <summary>Managers assigned to this gym.</summary>
    public List<ManagerDto> Managers { get; set; } = [];

    /// <summary>Athletes assigned to this gym.</summary>
    public List<AthleteDto> Athletes { get; set; } = [];
}
