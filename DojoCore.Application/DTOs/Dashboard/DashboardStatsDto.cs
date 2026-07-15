namespace DojoCore.Application.DTOs.Dashboard;

/// <summary>Aggregated statistics returned by the dashboard endpoint.</summary>
public class DashboardStatsDto
{
    /// <summary>Total number of athletes.</summary>
    public int AthleteCount { get; set; }

    /// <summary>Total number of coaches.</summary>
    public int CoachCount { get; set; }

    /// <summary>Total number of managers.</summary>
    public int ManagerCount { get; set; }

    /// <summary>Total number of gyms.</summary>
    public int GymCount { get; set; }

    /// <summary>List of all athlete display names.</summary>
    public List<AthleteNameDto> Athletes { get; set; } = [];
}
