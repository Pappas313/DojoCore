namespace DojoCore.Application.DTOs.Coach;

/// <summary>Represents a coach (role = 1) returned from the API.</summary>
public class CoachDto
{
    /// <summary>Unique identifier.</summary>
    public Guid Id { get; set; }

    /// <summary>Username.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Email address.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Public user code.</summary>
    public string UserCode { get; set; } = string.Empty;

    /// <summary>Address.</summary>
    public string? Address { get; set; }

    /// <summary>Gender (0 = unspecified, 1 = male, 2 = female).</summary>
    public short? Gender { get; set; }

    /// <summary>Date of birth.</summary>
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>Latitude.</summary>
    public double? Latitude { get; set; }

    /// <summary>Longitude.</summary>
    public double? Longitude { get; set; }

    /// <summary>Status (0 = pending, 1 = active, 2 = inactive).</summary>
    public short Status { get; set; }

    /// <summary>Created at (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Updated at (UTC).</summary>
    public DateTime UpdatedAt { get; set; }
}
