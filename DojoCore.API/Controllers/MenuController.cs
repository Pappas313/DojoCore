using DojoCore.Application.DTOs.Menu;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DojoCore.API.Controllers;

/// <summary>
/// Manages the hierarchical site menu.
/// Hierarchy is derived exclusively from <c>PageCode</c> — no ParentId is used.
/// <para>
/// Hierarchy rules:<br/>
/// • Root items have a single-character PageCode (e.g. <c>"1"</c>, <c>"2"</c>).<br/>
/// • A child's PageCode extends its parent's by one character (e.g. <c>"11"</c> is a child of <c>"1"</c>).<br/>
/// • Deleting an item also deletes every descendant.
/// </para>
/// </summary>
[ApiController]
[Route("api/menu")]
[Tags("Menu")]
[Produces("application/json")]
public class MenuController : ControllerBase
{
    private readonly IMenuService _menuService;

    public MenuController(IMenuService menuService)
    {
        _menuService = menuService;
    }

    /// <summary>
    /// Returns the full menu tree, ordered by <c>OrderIndex</c> then <c>PageCode</c> at every level.
    /// </summary>
    /// <remarks>
    /// Each node contains a recursive <c>children</c> array.<br/>
    /// Example response:
    /// <code>
    /// [
    ///   {
    ///     "id": 1, "title": "Home", "pageCode": "1", "orderIndex": 0,
    ///     "url": "/", "icon": "home",
    ///     "children": [
    ///       { "id": 2, "title": "Dashboard", "pageCode": "11", "orderIndex": 0,
    ///         "url": "/dashboard", "icon": null, "children": [] }
    ///     ]
    ///   }
    /// ]
    /// </code>
    /// </remarks>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Full menu tree.</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<MenuItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTree(CancellationToken ct)
    {
        var tree = await _menuService.GetTreeAsync(ct);
        return Ok(tree);
    }

    /// <summary>
    /// Creates a new menu item.
    /// </summary>
    /// <remarks>
    /// <b>PageCode rules:</b><br/>
    /// • Must be unique across all items.<br/>
    /// • Single character = root item (e.g. <c>"1"</c>).<br/>
    /// • Longer codes require the parent to already exist
    ///   (e.g. creating <c>"11"</c> requires <c>"1"</c> to exist).<br/>
    /// • PageCode <b>cannot be changed</b> after creation.
    /// </remarks>
    /// <param name="request">New menu item payload.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="201">Item created. Returns the created <see cref="MenuItemDto"/>.</response>
    /// <response code="400">Validation failed (duplicate PageCode or missing parent).</response>
    [HttpPost]
    [ProducesResponseType(typeof(MenuItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateMenuItemRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var dto = await _menuService.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetTree), new { }, dto);
        }
        catch (Application.Exceptions.ValidationException ex)
        {
            foreach (var (key, messages) in ex.Details)
                foreach (var msg in messages)
                    ModelState.AddModelError(key, msg);

            return ValidationProblem(ModelState);
        }
    }

    /// <summary>
    /// Updates an existing menu item's mutable fields.
    /// </summary>
    /// <remarks>
    /// <b>PageCode cannot be updated.</b> Only <c>Title</c>, <c>OrderIndex</c>, <c>Url</c>,
    /// and <c>Icon</c> are mutable.
    /// </remarks>
    /// <param name="id">The item's integer primary key.</param>
    /// <param name="request">Updated field values.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Returns the updated <see cref="MenuItemDto"/>.</response>
    /// <response code="400">Model validation failed.</response>
    /// <response code="404">No item found with the given <paramref name="id"/>.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(MenuItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMenuItemRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var dto = await _menuService.UpdateAsync(id, request, ct);
            return Ok(dto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title  = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
    }

    /// <summary>
    /// Deletes a menu item <b>and all of its descendants</b>.
    /// </summary>
    /// <remarks>
    /// Deletion is cascaded to every item whose <c>PageCode</c> starts with the target item's
    /// <c>PageCode</c>. For example, deleting <c>"1"</c> also removes <c>"11"</c>, <c>"12"</c>,
    /// <c>"111"</c>, etc.
    /// </remarks>
    /// <param name="id">The item's integer primary key.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="204">Item and descendants deleted successfully.</response>
    /// <response code="404">No item found with the given <paramref name="id"/>.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        try
        {
            await _menuService.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title  = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
    }
}

