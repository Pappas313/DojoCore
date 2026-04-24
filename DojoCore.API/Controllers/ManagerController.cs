using DojoCore.Application.DTOs.Manager;
using DojoCore.Application.DTOs.Map;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DojoCore.API.Controllers;

/// <summary>
/// CRUD operations for managers (users with role = 2).
/// </summary>
[ApiController]
[Route("api/managers")]
[Tags("Managers")]
[Produces("application/json")]
public class ManagerController : ControllerBase
{
    private readonly IManagerService _managerService;
    private readonly IMapService _mapService;

    public ManagerController(IManagerService managerService, IMapService mapService)
    {
        _managerService = managerService;
        _mapService = mapService;
    }

    /// <summary>Returns all managers.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of managers.</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<ManagerDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var managers = await _managerService.GetAllAsync(ct);
        return Ok(managers);
    }

    /// <summary>Returns a single manager by id.</summary>
    /// <param name="id">Manager identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Manager found.</response>
    /// <response code="404">Manager not found.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ManagerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var manager = await _managerService.GetByIdAsync(id, ct);
        if (manager is null)
            return NotFound(new { error = "NotFound", message = $"Manager '{id}' was not found." });

        return Ok(manager);
    }

    /// <summary>Updates an existing manager's profile.</summary>
    /// <param name="id">Manager identifier.</param>
    /// <param name="request">Updated fields.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Updated manager.</response>
    /// <response code="400">Validation failed.</response>
    /// <response code="404">Manager not found.</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ManagerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateManagerRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var dto = await _managerService.UpdateAsync(id, request, ct);
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

    /// <summary>Returns map pins (id, name, latitude, longitude) for all managers.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of manager map pins.</response>
    [HttpGet("pins")]
    [ProducesResponseType(typeof(List<MapPinDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPins(CancellationToken ct)
    {
        var pins = await _mapService.GetManagerPinsAsync(ct);
        return Ok(pins);
    }

    /// <summary>Deletes a manager by id.</summary>
    /// <param name="id">Manager identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="204">Manager deleted.</response>
    /// <response code="404">Manager not found.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _managerService.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = "NotFound", message = ex.Message });
        }
    }
}
