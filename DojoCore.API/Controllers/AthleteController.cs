using DojoCore.Application.DTOs.Athlete;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

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

    public AthleteController(IAthleteService athleteService)
    {
        _athleteService = athleteService;
    }

    /// <summary>Returns all athletes.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of athletes.</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<AthleteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var athletes = await _athleteService.GetAllAsync(ct);
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
