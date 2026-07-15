using DojoCore.Application.DTOs.Dashboard;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _uow;

    public DashboardService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        var athletes = (await _uow.Athletes.GetAllAsync(ct)).ToList();
        var coaches   = (await _uow.Coaches.GetAllAsync(ct)).ToList();
        var managers  = (await _uow.Managers.GetAllAsync(ct)).ToList();
        var gyms      = (await _uow.Gyms.GetAllAsync(ct)).ToList();

        return new DashboardStatsDto
        {
            AthleteCount = athletes.Count,
            CoachCount   = coaches.Count,
            ManagerCount = managers.Count,
            GymCount     = gyms.Count,
            Athletes     = athletes.Select(a => new AthleteNameDto
            {
                Id   = a.Id,
                Name = string.IsNullOrWhiteSpace($"{a.FirstName} {a.LastName}".Trim())
                    ? a.Username
                    : $"{a.FirstName} {a.LastName}".Trim()
            }).ToList()
        };
    }
}
