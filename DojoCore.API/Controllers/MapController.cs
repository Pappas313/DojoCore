using DojoCore.Application.DTOs.Map;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DojoCore.API.Controllers;

/// <summary>
/// Map pins for all entity types (Gyms, Athletes, Coaches, Managers).
/// </summary>
[ApiController]
[Route("api/map")]
[Tags("Map")]
[Produces("application/json")]
public class MapController : ControllerBase
{
    private readonly IMapService _mapService;

    public MapController(IMapService mapService)
    {
        _mapService = mapService;
    }

    /// <summary>Returns all map pins grouped by type (Gyms, Athletes, Coaches, Managers).</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Combined map pins for all entity types.</response>
    [HttpGet("pins")]
    [ProducesResponseType(typeof(MapPinsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPins(CancellationToken ct)
    {
        var pins = await _mapService.GetAllPinsAsync(ct);
        return Ok(pins);
    }

    /// <summary>Returns map pins for athletes only.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Athlete map pins.</response>
    [HttpGet("athletes")]
    [ProducesResponseType(typeof(List<MapPinDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAthletePins(CancellationToken ct)
    {
        var pins = await _mapService.GetAthletePinsAsync(ct);
        return Ok(pins);
    }

    /// <summary>Returns map pins for coaches only.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Coach map pins.</response>
    [HttpGet("coaches")]
    [ProducesResponseType(typeof(List<MapPinDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCoachPins(CancellationToken ct)
    {
        var pins = await _mapService.GetCoachPinsAsync(ct);
        return Ok(pins);
    }

    /// <summary>Returns map pins for managers only.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Manager map pins.</response>
    [HttpGet("managers")]
    [ProducesResponseType(typeof(List<MapPinDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetManagerPins(CancellationToken ct)
    {
        var pins = await _mapService.GetManagerPinsAsync(ct);
        return Ok(pins);
    }
}
