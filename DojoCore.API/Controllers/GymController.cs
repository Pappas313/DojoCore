using DojoCore.Application.DTOs.Athlete;
using DojoCore.Application.DTOs.Coach;
using DojoCore.Application.DTOs.Gym;
using DojoCore.Application.DTOs.Manager;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DojoCore.API.Controllers;

/// <summary>
/// Query gyms and their members grouped by role.
/// </summary>
[ApiController]
[Route("api/gyms")]
[Tags("Gyms")]
[Produces("application/json")]
public class GymController : ControllerBase
{
    private readonly IGymService _gymService;

    public GymController(IGymService gymService)
    {
        _gymService = gymService;
    }

    /// <summary>Returns all gyms.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of gyms.</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<GymDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var gyms = await _gymService.GetAllAsync(ct);
        return Ok(gyms);
    }

    /// <summary>Returns a single gym by id.</summary>
    /// <param name="id">Gym identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Gym found.</response>
    /// <response code="404">Gym not found.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(GymDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var gym = await _gymService.GetByIdAsync(id, ct);
        if (gym is null)
            return NotFound(new { error = "NotFound", message = $"Gym '{id}' was not found." });

        return Ok(gym);
    }

    /// <summary>Returns all coaches assigned to a gym.</summary>
    /// <param name="id">Gym identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of coaches.</response>
    [HttpGet("{id:guid}/coaches")]
    [ProducesResponseType(typeof(List<CoachDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCoaches(Guid id, CancellationToken ct)
    {
        var coaches = await _gymService.GetCoachesByGymAsync(id, ct);
        return Ok(coaches);
    }

    /// <summary>Returns all managers assigned to a gym.</summary>
    /// <param name="id">Gym identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of managers.</response>
    [HttpGet("{id:guid}/managers")]
    [ProducesResponseType(typeof(List<ManagerDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetManagers(Guid id, CancellationToken ct)
    {
        var managers = await _gymService.GetManagersByGymAsync(id, ct);
        return Ok(managers);
    }

    /// <summary>Returns all athletes assigned to a gym.</summary>
    /// <param name="id">Gym identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of athletes.</response>
    [HttpGet("{id:guid}/athletes")]
    [ProducesResponseType(typeof(List<AthleteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAthletes(Guid id, CancellationToken ct)
    {
        var athletes = await _gymService.GetAthletesByGymAsync(id, ct);
        return Ok(athletes);
    }

    /// <summary>Returns a single gym with all its members grouped by role (coaches, managers, athletes).</summary>
    /// <param name="id">Gym identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Gym with grouped members.</response>
    /// <response code="404">Gym not found.</response>
    [HttpGet("{id:guid}/members")]
    [ProducesResponseType(typeof(GymWithMembersDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWithMembers(Guid id, CancellationToken ct)
    {
        var result = await _gymService.GetWithMembersAsync(id, ct);
        if (result is null)
            return NotFound(new { error = "NotFound", message = $"Gym '{id}' was not found." });

        return Ok(result);
    }

    /// <summary>Returns all gyms with their members grouped by role (coaches, managers, athletes).</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of gyms with grouped members.</response>
    [HttpGet("members")]
    [ProducesResponseType(typeof(List<GymWithMembersDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllWithMembers(CancellationToken ct)
    {
        var result = await _gymService.GetAllWithMembersAsync(ct);
        return Ok(result);
    }
}
