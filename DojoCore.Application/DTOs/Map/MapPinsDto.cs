namespace DojoCore.Application.DTOs.Map;

/// <summary>Combined map pins for all entity types.</summary>
public class MapPinsDto
{
    /// <summary>Gym pins.</summary>
    public List<MapPinDto> Gyms { get; set; } = [];

    /// <summary>Athlete pins.</summary>
    public List<MapPinDto> Athletes { get; set; } = [];

    /// <summary>Coach pins.</summary>
    public List<MapPinDto> Coaches { get; set; } = [];

    /// <summary>Manager pins.</summary>
    public List<MapPinDto> Managers { get; set; } = [];
}
