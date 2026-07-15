using DojoCore.Application.DTOs.Group;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DojoCore.API.Controllers;

/// <summary>
/// CRUD operations for training groups (coach -- group -- athletes hierarchy) within a gym.
/// </summary>
[ApiController]
[Route("api/groups")]
[Tags("Groups")]
[Produces("application/json")]
public class GroupController : ControllerBase
{
    private readonly IGroupService _groupService;

    public GroupController(IGroupService groupService)
    {
        _groupService = groupService;
    }

    /// <summary>
    /// Returns groups visible to the caller. Managers, coaches and athletes belonging to a gym
    /// see only groups of their own gym(s); freelancer athletes see groups of all gyms.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of groups.</response>
    /// <response code="401">Caller is not authenticated.</response>
    [Authorize]
    [HttpGet]
    [ProducesResponseType(typeof(List<GroupDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var sub  = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var role = User.FindFirstValue("role");

        if (sub is null || !Guid.TryParse(sub, out var callerId))
            return Unauthorized();

        var groups = await _groupService.GetVisibleAsync(callerId, short.TryParse(role, out var r) ? r : (short)0, ct);
        return Ok(groups);
    }

    /// <summary>Returns all groups belonging to a specific gym.</summary>
    /// <param name="gymId">Gym identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of groups for the gym.</response>
    [HttpGet("gym/{gymId:guid}")]
    [ProducesResponseType(typeof(List<GroupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByGymId(Guid gymId, CancellationToken ct)
    {
        var groups = await _groupService.GetByGymIdAsync(gymId, ct);
        return Ok(groups);
    }

    /// <summary>Returns a single group by id.</summary>
    /// <param name="id">Group identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Group found.</response>
    /// <response code="404">Group not found.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(GroupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var group = await _groupService.GetByIdAsync(id, ct);
        if (group is null)
            return NotFound(new { error = "NotFound", message = $"Group '{id}' was not found." });

        return Ok(group);
    }

    /// <summary>Creates a new group within a gym.</summary>
    /// <param name="request">Group details, including optional initial coaches/athletes.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="201">Group created.</response>
    /// <response code="400">Validation failed.</response>
    [HttpPost]
    [ProducesResponseType(typeof(GroupDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateGroupRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var dto = await _groupService.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (ValidationException ex)
        {
            foreach (var (field, errors) in ex.Details)
                foreach (var err in errors)
                    ModelState.AddModelError(field, err);
            return BadRequest(ModelState);
        }
    }

    /// <summary>Updates an existing group's profile fields.</summary>
    /// <param name="id">Group identifier.</param>
    /// <param name="request">Updated fields.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Updated group.</response>
    /// <response code="400">Validation failed.</response>
    /// <response code="404">Group not found.</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(GroupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGroupRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var dto = await _groupService.UpdateAsync(id, request, ct);
            return Ok(dto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = "NotFound", message = ex.Message });
        }
    }

    /// <summary>Replaces the coaches assigned to a group.</summary>
    /// <param name="id">Group identifier.</param>
    /// <param name="request">Full list of coach ids.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Updated group.</response>
    /// <response code="404">Group not found.</response>
    [HttpPut("{id:guid}/coaches")]
    [ProducesResponseType(typeof(GroupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCoaches(Guid id, [FromBody] UpdateGroupCoachesRequest request, CancellationToken ct)
    {
        try
        {
            var dto = await _groupService.UpdateCoachesAsync(id, request, ct);
            return Ok(dto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = "NotFound", message = ex.Message });
        }
    }

    /// <summary>Replaces the athletes assigned to a group.</summary>
    /// <param name="id">Group identifier.</param>
    /// <param name="request">Full list of athlete ids.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Updated group.</response>
    /// <response code="404">Group not found.</response>
    [HttpPut("{id:guid}/athletes")]
    [ProducesResponseType(typeof(GroupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAthletes(Guid id, [FromBody] UpdateGroupAthletesRequest request, CancellationToken ct)
    {
        try
        {
            var dto = await _groupService.UpdateAthletesAsync(id, request, ct);
            return Ok(dto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = "NotFound", message = ex.Message });
        }
    }

    /// <summary>Deletes a group by id.</summary>
    /// <param name="id">Group identifier.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="204">Group deleted.</response>
    /// <response code="404">Group not found.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _groupService.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = "NotFound", message = ex.Message });
        }
    }
}
