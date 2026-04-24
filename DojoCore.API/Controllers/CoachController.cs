using DojoCore.Application.DTOs.Coach;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DojoCore.API.Controllers;

/// <summary>
/// CRUD operations for coaches (users with role = 1).
/// </summary>
[ApiController]
[Route("api/coaches")]
[Tags("Coaches")]
[Produces("application/json")]
public class CoachController : ControllerBase
{
    private readonly ICoachService _coachService;

    public CoachController(ICoachService coachService)
    {
        _coachService = coachService;
    }

    /// <summary>Returns all coaches.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of coaches.</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<CoachDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var coaches = await _coachService.GetAllAsync(ct);
        return Ok(coaches);
    }

    /// <summary>Returns a single coach by id.</summary>
    /// <param name="id">Coach identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Coach found.</response>
    /// <response code="404">Coach not found.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CoachDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var coach = await _coachService.GetByIdAsync(id, ct);
        if (coach is null)
            return NotFound(new { error = "NotFound", message = $"Coach '{id}' was not found." });

        return Ok(coach);
    }

    /// <summary>Updates an existing coach's profile.</summary>
    /// <param name="id">Coach identifier.</param>
    /// <param name="request">Updated fields.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Updated coach.</response>
    /// <response code="400">Validation failed.</response>
    /// <response code="404">Coach not found.</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CoachDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCoachRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var dto = await _coachService.UpdateAsync(id, request, ct);
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

    /// <summary>Deletes a coach by id.</summary>
    /// <param name="id">Coach identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="204">Coach deleted.</response>
    /// <response code="404">Coach not found.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _coachService.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = "NotFound", message = ex.Message });
        }
    }
}
