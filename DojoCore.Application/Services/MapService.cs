using DojoCore.Application.DTOs.Map;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public class MapService : IMapService
{
    private readonly IUnitOfWork _uow;

    public MapService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<List<MapPinDto>> GetGymPinsAsync(CancellationToken ct = default)
    {
        var gyms = await _uow.Gyms.GetAllAsync(ct);
        return gyms.Select(g => new MapPinDto
        {
            Id        = g.Id,
            Name      = g.Name,
            Type      = "Gym",
            Latitude  = g.Latitude.HasValue ? (double)g.Latitude.Value : null,
            Longitude = g.Longitude.HasValue ? (double)g.Longitude.Value : null
        }).ToList();
    }

    public async Task<List<MapPinDto>> GetAthletePinsAsync(CancellationToken ct = default)
    {
        var athletes = await _uow.Athletes.GetAllAsync(ct);
        return athletes.Select(u => MapUserPin(u, "Athlete")).ToList();
    }

    public async Task<List<MapPinDto>> GetCoachPinsAsync(CancellationToken ct = default)
    {
        var coaches = await _uow.Coaches.GetAllAsync(ct);
        return coaches.Select(u => MapUserPin(u, "Coach")).ToList();
    }

    public async Task<List<MapPinDto>> GetManagerPinsAsync(CancellationToken ct = default)
    {
        var managers = await _uow.Managers.GetAllAsync(ct);
        return managers.Select(u => MapUserPin(u, "Manager")).ToList();
    }

    public async Task<MapPinsDto> GetAllPinsAsync(CancellationToken ct = default)
    {
        // Queries must run sequentially — a single NpgsqlConnection cannot
        // execute more than one command at a time (no multiplexing on scoped connections).
        var gyms     = await GetGymPinsAsync(ct);
        var athletes = await GetAthletePinsAsync(ct);
        var coaches  = await GetCoachPinsAsync(ct);
        var managers = await GetManagerPinsAsync(ct);

        return new MapPinsDto
        {
            Gyms     = gyms,
            Athletes = athletes,
            Coaches  = coaches,
            Managers = managers
        };
    }

    private static MapPinDto MapUserPin(User u, string type) => new()
    {
        Id        = u.Id,
        Name      = u.Username,
        Type      = type,
        Latitude  = u.Latitude,
        Longitude = u.Longitude
    };
}
