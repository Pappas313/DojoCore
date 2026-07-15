using DojoCore.Application.DTOs.Dashboard;

namespace DojoCore.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct = default);
}
