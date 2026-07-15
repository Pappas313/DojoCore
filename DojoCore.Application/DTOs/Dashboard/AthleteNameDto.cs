namespace DojoCore.Application.DTOs.Dashboard;

/// <summary>Minimal athlete information used in the dashboard stats list.</summary>
public class AthleteNameDto
{
    /// <summary>Unique identifier.</summary>
    public Guid Id { get; set; }

    /// <summary>Full display name (FirstName + LastName or Username).</summary>
    public string Name { get; set; } = string.Empty;
}
