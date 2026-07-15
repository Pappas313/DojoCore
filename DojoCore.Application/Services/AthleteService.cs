using DojoCore.Application.DTOs.Athlete;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public class AthleteService : IAthleteService
{
    private readonly IUnitOfWork _uow;
    private readonly IGeocodingService _geocoding;

    public AthleteService(IUnitOfWork uow, IGeocodingService geocoding)
    {
        _uow = uow;
        _geocoding = geocoding;
    }

    public async Task<List<AthleteDto>> GetAllAsync(CancellationToken ct = default)
    {
        var athletes = await _uow.Athletes.GetAllAsync(ct);
        return athletes.Select(MapToDto).ToList();
    }

    // Role values (see RegisterOperationFilter): 0 = Admin, 1 = Coach, 2 = Manager, 3 = Athlete
    private const short AdminRole = 0;

    public async Task<List<AthleteDto>> GetVisibleAsync(Guid callerId, short callerRole, CancellationToken ct = default)
    {
        if (callerRole == AdminRole)
            return await GetAllAsync(ct);

        var gymIds = (await _uow.UserGyms.GetGymIdsByUserIdAsync(callerId, ct)).ToList();
        if (gymIds.Count == 0)
            return []; // freelancers (and any user without a gym) don't see other athletes

        var seen = new HashSet<Guid>();
        var result = new List<AthleteDto>();
        foreach (var gymId in gymIds)
        {
            var athletes = await _uow.Athletes.GetByGymIdAsync(gymId, ct);
            foreach (var athlete in athletes)
            {
                if (seen.Add(athlete.Id))
                    result.Add(MapToDto(athlete));
            }
        }

        return result;
    }

    public async Task<AthleteDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var athlete = await _uow.Athletes.GetByIdAsync(id, ct);
        return athlete is null ? null : MapToDto(athlete);
    }

    public async Task<AthleteDto> UpdateAsync(Guid id, UpdateAthleteRequest request, CancellationToken ct = default)
    {
        var athlete = await _uow.Athletes.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Athlete with id '{id}' was not found.");

        // Check username/email uniqueness (only if changed)
        if (!string.Equals(athlete.Username, request.Username, StringComparison.OrdinalIgnoreCase))
        {
            if (await _uow.Users.UsernameExistsAsync(request.Username, ct))
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["Username"] = [$"Username '{request.Username}' is already taken."]
                });
        }

        if (!string.Equals(athlete.Email, request.Email, StringComparison.OrdinalIgnoreCase))
        {
            if (await _uow.Users.EmailExistsAsync(request.Email, ct))
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["Email"] = [$"Email '{request.Email}' is already in use."]
                });
        }

        // Resolve coordinates if address changed
        double? lat = athlete.Latitude;
        double? lon = athlete.Longitude;
        if (!string.Equals(athlete.Address, request.Address, StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(request.Address))
        {
            var coords = await _geocoding.GeocodeAsync(request.Address, ct);
            if (coords.HasValue)
            {
                lat = coords.Value.Latitude;
                lon = coords.Value.Longitude;
            }
        }

        athlete.Username    = request.Username;
        athlete.Email       = request.Email;
        athlete.FirstName   = request.FirstName;
        athlete.LastName    = request.LastName;
        athlete.Phone       = request.Phone;
        athlete.Description = request.Description;
        athlete.Address     = request.Address;
        athlete.Gender      = request.Gender;
        athlete.DateOfBirth = request.DateOfBirth;
        athlete.Status      = request.Status;
        athlete.Latitude    = lat;
        athlete.Longitude   = lon;
        athlete.UpdatedAt   = DateTime.UtcNow;

        await _uow.Athletes.UpdateAsync(athlete, ct);

        return MapToDto(athlete);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        if (!await _uow.Athletes.ExistsAsync(id, ct))
            throw new KeyNotFoundException($"Athlete with id '{id}' was not found.");

        await _uow.Athletes.DeleteAsync(id, ct);
    }

    // ------------------------------------------------------------------
    private static AthleteDto MapToDto(Domain.Entities.User u) => new()
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
