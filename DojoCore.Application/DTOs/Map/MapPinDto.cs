namespace DojoCore.Application.DTOs.Map;

/// <summary>A single map marker (pin) representing any entity with coordinates.</summary>
public class MapPinDto
{
    /// <summary>Unique identifier of the entity.</summary>
    public Guid Id { get; set; }

    /// <summary>Display name of the entity.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Entity type: "Gym", "Athlete", "Coach", or "Manager".</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Latitude coordinate.</summary>
    public double? Latitude { get; set; }

    /// <summary>Longitude coordinate.</summary>
    public double? Longitude { get; set; }
}
