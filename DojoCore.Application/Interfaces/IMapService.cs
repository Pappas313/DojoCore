using DojoCore.Application.DTOs.Map;

namespace DojoCore.Application.Interfaces;

public interface IMapService
{
    Task<List<MapPinDto>> GetGymPinsAsync(CancellationToken ct = default);
    Task<List<MapPinDto>> GetAthletePinsAsync(CancellationToken ct = default);
    Task<List<MapPinDto>> GetCoachPinsAsync(CancellationToken ct = default);
    Task<List<MapPinDto>> GetManagerPinsAsync(CancellationToken ct = default);
    Task<MapPinsDto> GetAllPinsAsync(CancellationToken ct = default);
}
