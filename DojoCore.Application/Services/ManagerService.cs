using DojoCore.Application.DTOs.Manager;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public class ManagerService : IManagerService
{
    private readonly IUnitOfWork _uow;
    private readonly IGeocodingService _geocoding;

    public ManagerService(IUnitOfWork uow, IGeocodingService geocoding)
    {
        _uow = uow;
        _geocoding = geocoding;
    }

    public async Task<List<ManagerDto>> GetAllAsync(CancellationToken ct = default)
    {
        var managers = await _uow.Managers.GetAllAsync(ct);
        return managers.Select(MapToDto).ToList();
    }

    // Role values (see RegisterOperationFilter): 0 = Admin, 1 = Coach, 2 = Manager, 3 = Athlete
    private const short AdminRole = 0;
    private const short AthleteRole = 3;

    public async Task<List<ManagerDto>> GetVisibleAsync(Guid callerId, short callerRole, CancellationToken ct = default)
    {
        if (callerRole == AdminRole)
            return await GetAllAsync(ct);

        var gymIds = (await _uow.UserGyms.GetGymIdsByUserIdAsync(callerId, ct)).ToList();

        if (gymIds.Count == 0)
        {
            // Freelancer athletes (no gym membership) see managers of all gyms
            return callerRole == AthleteRole ? await GetAllAsync(ct) : [];
        }

        var seen = new HashSet<Guid>();
        var result = new List<ManagerDto>();
        foreach (var gymId in gymIds)
        {
            var managers = await _uow.Managers.GetByGymIdAsync(gymId, ct);
            foreach (var manager in managers)
            {
                if (seen.Add(manager.Id))
                    result.Add(MapToDto(manager));
            }
        }

        return result;
    }

    public async Task<ManagerDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var manager = await _uow.Managers.GetByIdAsync(id, ct);
        return manager is null ? null : MapToDto(manager);
    }

    public async Task<ManagerDto> UpdateAsync(Guid id, UpdateManagerRequest request, CancellationToken ct = default)
    {
        var manager = await _uow.Managers.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Manager with id '{id}' was not found.");

        if (!string.Equals(manager.Username, request.Username, StringComparison.OrdinalIgnoreCase))
        {
            if (await _uow.Users.UsernameExistsAsync(request.Username, ct))
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["Username"] = [$"Username '{request.Username}' is already taken."]
                });
        }

        if (!string.Equals(manager.Email, request.Email, StringComparison.OrdinalIgnoreCase))
        {
            if (await _uow.Users.EmailExistsAsync(request.Email, ct))
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["Email"] = [$"Email '{request.Email}' is already in use."]
                });
        }

        double? lat = manager.Latitude;
        double? lon = manager.Longitude;
        if (!string.Equals(manager.Address, request.Address, StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(request.Address))
        {
            var coords = await _geocoding.GeocodeAsync(request.Address, ct);
            if (coords.HasValue)
            {
                lat = coords.Value.Latitude;
                lon = coords.Value.Longitude;
            }
        }

        manager.Username    = request.Username;
        manager.Email       = request.Email;
        manager.FirstName   = request.FirstName;
        manager.LastName    = request.LastName;
        manager.Phone       = request.Phone;
        manager.Description = request.Description;
        manager.Address     = request.Address;
        manager.Gender      = request.Gender;
        manager.DateOfBirth = request.DateOfBirth;
        manager.Status      = request.Status;
        manager.Latitude    = lat;
        manager.Longitude   = lon;
        manager.UpdatedAt   = DateTime.UtcNow;

        await _uow.Managers.UpdateAsync(manager, ct);

        return MapToDto(manager);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        if (!await _uow.Managers.ExistsAsync(id, ct))
            throw new KeyNotFoundException($"Manager with id '{id}' was not found.");

        await _uow.Managers.DeleteAsync(id, ct);
    }

    // ------------------------------------------------------------------
    private static ManagerDto MapToDto(Domain.Entities.User u) => new()
    {
        Id           = u.Id,
        Username     = u.Username,
        Email        = u.Email,
        UserCode     = u.UserCode,
        FirstName    = u.FirstName,
        LastName     = u.LastName,
        ProfileImage = u.ProfileImage,
        Phone        = u.Phone,
        Description  = u.Description,
        Address      = u.Address,
        Gender       = u.Gender,
        DateOfBirth  = u.DateOfBirth,
        Latitude     = u.Latitude,
        Longitude    = u.Longitude,
        Status       = u.Status,
        CreatedAt    = u.CreatedAt,
        UpdatedAt    = u.UpdatedAt
    };
}
