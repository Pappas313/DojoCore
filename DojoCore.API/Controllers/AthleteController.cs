using DojoCore.Application.DTOs.Athlete;
using DojoCore.Application.DTOs.Map;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DojoCore.API.Controllers;

/// <summary>
/// CRUD operations for athletes (users with role = 1).
/// </summary>
[ApiController]
[Route("api/athletes")]
[Tags("Athletes")]
[Produces("application/json")]
public class AthleteController : ControllerBase
{
    private readonly IAthleteService _athleteService;
    private readonly IMapService _mapService;

    public AthleteController(IAthleteService athleteService, IMapService mapService)
    {
        _athleteService = athleteService;
        _mapService = mapService;
    }

    /// <summary>
    /// Returns athletes visible to the caller. Managers, coaches and athletes see only athletes
    /// of the gym(s) they belong to.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of athletes.</response>
    /// <response code="401">Caller is not authenticated.</response>
    [Authorize]
    [HttpGet]
    [ProducesResponseType(typeof(List<AthleteDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var sub  = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var role = User.FindFirstValue("role");

        if (sub is null || !Guid.TryParse(sub, out var callerId))
            return Unauthorized();

        var athletes = await _athleteService.GetVisibleAsync(callerId, short.TryParse(role, out var r) ? r : (short)0, ct);
        return Ok(athletes);
    }

    /// <summary>Returns a single athlete by id.</summary>
    /// <param name="id">Athlete identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Athlete found.</response>
    /// <response code="404">Athlete not found.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AthleteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var athlete = await _athleteService.GetByIdAsync(id, ct);
        if (athlete is null)
            return NotFound(new { error = "NotFound", message = $"Athlete '{id}' was not found." });

        return Ok(athlete);
    }

    /// <summary>Updates an existing athlete's profile.</summary>
    /// <param name="id">Athlete identifier.</param>
    /// <param name="request">Updated fields.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Updated athlete.</response>
    /// <response code="400">Validation failed.</response>
    /// <response code="404">Athlete not found.</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AthleteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAthleteRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var dto = await _athleteService.UpdateAsync(id, request, ct);
            return Ok(dto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = "NotFound", message = ex.Message });
        }
        catch (ValidationException ex)
        {
            foreach (var (field, errors) in ex.Details)
                foreach (var err in errors)
                    ModelState.AddModelError(field, err);
            return BadRequest(ModelState);
        }
    }

    /// <summary>Returns map pins (id, name, latitude, longitude) for all athletes.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of athlete map pins.</response>
    [HttpGet("pins")]
    [ProducesResponseType(typeof(List<MapPinDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPins(CancellationToken ct)
    {
        var pins = await _mapService.GetAthletePinsAsync(ct);
        return Ok(pins);
    }

    /// <summary>Deletes an athlete by id.</summary>
    /// <param name="id">Athlete identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="204">Athlete deleted.</response>
    /// <response code="404">Athlete not found.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _athleteService.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = "NotFound", message = ex.Message });
        }
    }
}
