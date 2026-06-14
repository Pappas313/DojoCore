namespace DojoCore.Application.DTOs.Gym;

/// <summary>Represents a gym returned from the API.</summary>
public class GymDto
{
    /// <summary>Unique identifier.</summary>
    public Guid Id { get; set; }

    /// <summary>Gym name.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Address.</summary>
    public string Address { get; set; } = string.Empty;

    /// <summary>Latitude.</summary>
    public decimal? Latitude { get; set; }

    /// <summary>Longitude.</summary>
    public decimal? Longitude { get; set; }

    /// <summary>Unique gym code.</summary>
    public string GymCode { get; set; } = string.Empty;

    /// <summary>Id of the user who created this gym.</summary>
    public Guid CreatedBy { get; set; }

    /// <summary>Logo image filename.</summary>
    public string? LogoImage { get; set; }

    /// <summary>Phone number.</summary>
    public string? Phone { get; set; }

    /// <summary>Contact e-mail address.</summary>
    public string? ContactEmail { get; set; }

    /// <summary>Short description of the gym.</summary>
    public string? Description { get; set; }

    /// <summary>Status (0 = pending, 1 = active, 2 = inactive).</summary>
    public short Status { get; set; }

    /// <summary>Created at (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Updated at (UTC).</summary>
    public DateTime UpdatedAt { get; set; }
}
