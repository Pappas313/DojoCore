using DojoCore.Application.DTOs.Dashboard;
using DojoCore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DojoCore.API.Controllers;

/// <summary>
/// Aggregated statistics for the dashboard.
/// </summary>
[ApiController]
[Route("api/dashboard")]
[Tags("Dashboard")]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>Returns aggregated counts for athletes, coaches, managers and gyms, plus a list of athlete names.</summary>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Dashboard statistics.</response>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var stats = await _dashboardService.GetStatsAsync(ct);
        return Ok(stats);
    }
}
