using DojoCore.Application.DTOs.Coach;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public class CoachService : ICoachService
{
    private readonly IUnitOfWork _uow;
    private readonly IGeocodingService _geocoding;

    public CoachService(IUnitOfWork uow, IGeocodingService geocoding)
    {
        _uow = uow;
        _geocoding = geocoding;
    }

    public async Task<List<CoachDto>> GetAllAsync(CancellationToken ct = default)
    {
        var coaches = await _uow.Coaches.GetAllAsync(ct);
        return coaches.Select(MapToDto).ToList();
    }

    // Role values (see RegisterOperationFilter): 0 = Admin, 1 = Coach, 2 = Manager, 3 = Athlete
    private const short AdminRole = 0;
    private const short AthleteRole = 3;

    public async Task<List<CoachDto>> GetVisibleAsync(Guid callerId, short callerRole, CancellationToken ct = default)
    {
        if (callerRole == AdminRole)
            return await GetAllAsync(ct);

        var gymIds = (await _uow.UserGyms.GetGymIdsByUserIdAsync(callerId, ct)).ToList();

        if (gymIds.Count == 0)
        {
            // Freelancer athletes (no gym membership) see coaches of all gyms
            return callerRole == AthleteRole ? await GetAllAsync(ct) : [];
        }

        var seen = new HashSet<Guid>();
        var result = new List<CoachDto>();
        foreach (var gymId in gymIds)
        {
            var coaches = await _uow.Coaches.GetByGymIdAsync(gymId, ct);
            foreach (var coach in coaches)
            {
                if (seen.Add(coach.Id))
                    result.Add(MapToDto(coach));
            }
        }

        return result;
    }

    public async Task<CoachDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var coach = await _uow.Coaches.GetByIdAsync(id, ct);
        return coach is null ? null : MapToDto(coach);
    }

    public async Task<CoachDto> UpdateAsync(Guid id, UpdateCoachRequest request, CancellationToken ct = default)
    {
        var coach = await _uow.Coaches.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Coach with id '{id}' was not found.");

        if (!string.Equals(coach.Username, request.Username, StringComparison.OrdinalIgnoreCase))
        {
            if (await _uow.Users.UsernameExistsAsync(request.Username, ct))
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["Username"] = [$"Username '{request.Username}' is already taken."]
                });
        }

        if (!string.Equals(coach.Email, request.Email, StringComparison.OrdinalIgnoreCase))
        {
            if (await _uow.Users.EmailExistsAsync(request.Email, ct))
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["Email"] = [$"Email '{request.Email}' is already in use."]
                });
        }

        double? lat = coach.Latitude;
        double? lon = coach.Longitude;
        if (!string.Equals(coach.Address, request.Address, StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(request.Address))
        {
            var coords = await _geocoding.GeocodeAsync(request.Address, ct);
            if (coords.HasValue)
            {
                lat = coords.Value.Latitude;
                lon = coords.Value.Longitude;
            }
        }

        coach.Username    = request.Username;
        coach.Email       = request.Email;
        coach.FirstName   = request.FirstName;
        coach.LastName    = request.LastName;
        coach.Phone       = request.Phone;
        coach.Description = request.Description;
        coach.Address     = request.Address;
        coach.Gender      = request.Gender;
        coach.DateOfBirth = request.DateOfBirth;
        coach.Status      = request.Status;
        coach.Latitude    = lat;
        coach.Longitude   = lon;
        coach.UpdatedAt   = DateTime.UtcNow;

        await _uow.Coaches.UpdateAsync(coach, ct);

        return MapToDto(coach);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        if (!await _uow.Coaches.ExistsAsync(id, ct))
            throw new KeyNotFoundException($"Coach with id '{id}' was not found.");

        await _uow.Coaches.DeleteAsync(id, ct);
    }

    // ------------------------------------------------------------------
    private static CoachDto MapToDto(Domain.Entities.User u) => new()
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
