using DojoCore.Application.DTOs.Athlete;
using DojoCore.Application.DTOs.Coach;
using DojoCore.Application.DTOs.Gym;
using DojoCore.Application.DTOs.Manager;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public class GymService : IGymService
{
    private readonly IUnitOfWork _uow;

    public GymService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<List<GymDto>> GetAllAsync(CancellationToken ct = default)
    {
        var gyms = await _uow.Gyms.GetAllAsync(ct);
        return gyms.Select(MapToDto).ToList();
    }

    public async Task<GymDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var gym = await _uow.Gyms.GetByIdAsync(id, ct);
        return gym is null ? null : MapToDto(gym);
    }

    public async Task<List<CoachDto>> GetCoachesByGymAsync(Guid gymId, CancellationToken ct = default)
    {
        var users = await _uow.Coaches.GetByGymIdAsync(gymId, ct);
        return users.Select(MapToCoachDto).ToList();
    }

    public async Task<List<ManagerDto>> GetManagersByGymAsync(Guid gymId, CancellationToken ct = default)
    {
        var users = await _uow.Managers.GetByGymIdAsync(gymId, ct);
        return users.Select(MapToManagerDto).ToList();
    }

    public async Task<List<AthleteDto>> GetAthletesByGymAsync(Guid gymId, CancellationToken ct = default)
    {
        var users = await _uow.Athletes.GetByGymIdAsync(gymId, ct);
        return users.Select(MapToAthleteDto).ToList();
    }

    public async Task<GymWithMembersDto?> GetWithMembersAsync(Guid gymId, CancellationToken ct = default)
    {
        var gym = await _uow.Gyms.GetByIdAsync(gymId, ct);
        if (gym is null) return null;

        var (coaches, managers, athletes) = await FetchMembersAsync(gymId, ct);

        return new GymWithMembersDto
        {
            Gym      = MapToDto(gym),
            Coaches  = coaches,
            Managers = managers,
            Athletes = athletes
        };
    }

    public async Task<List<GymWithMembersDto>> GetAllWithMembersAsync(CancellationToken ct = default)
    {
        var gyms = await _uow.Gyms.GetAllAsync(ct);
        var result = new List<GymWithMembersDto>();

        foreach (var gym in gyms)
        {
            var (coaches, managers, athletes) = await FetchMembersAsync(gym.Id, ct);
            result.Add(new GymWithMembersDto
            {
                Gym      = MapToDto(gym),
                Coaches  = coaches,
                Managers = managers,
                Athletes = athletes
            });
        }

        return result;
    }

    // Role values (see RegisterOperationFilter): 0 = Admin, 1 = Coach, 2 = Manager, 3 = Athlete
    private const short AdminRole = 0;
    private const short AthleteRole = 3;

    public async Task<MyMembersDto> GetMyMembersAsync(Guid userId, short role, CancellationToken ct = default)
    {
        // Admins see every gym and all of its members
        if (role == AdminRole)
        {
            var allGyms = await GetAllWithMembersAsync(ct);
            return new MyMembersDto { IsFreelancer = false, Gyms = allGyms };
        }

        var gymIds = (await _uow.UserGyms.GetGymIdsByUserIdAsync(userId, ct)).ToList();

        // Freelancer athlete: no gym membership -> see managers and coaches of all gyms (no athletes)
        if (role == AthleteRole && gymIds.Count == 0)
        {
            var gyms = await _uow.Gyms.GetAllAsync(ct);
            var result = new List<GymWithMembersDto>();

            foreach (var gym in gyms)
            {
                var coaches  = await _uow.Coaches.GetByGymIdAsync(gym.Id, ct);
                var managers = await _uow.Managers.GetByGymIdAsync(gym.Id, ct);

                result.Add(new GymWithMembersDto
                {
                    Gym      = MapToDto(gym),
                    Coaches  = coaches.Select(MapToCoachDto).ToList(),
                    Managers = managers.Select(MapToManagerDto).ToList(),
                    Athletes = []
                });
            }

            return new MyMembersDto { IsFreelancer = true, Gyms = result };
        }

        // Manager / Coach / Athlete belonging to gym(s): see members of their own gym(s) only
        var visibleGyms = new List<GymWithMembersDto>();
        foreach (var gymId in gymIds)
        {
            var gym = await _uow.Gyms.GetByIdAsync(gymId, ct);
            if (gym is null) continue;

            var (coaches, managers, athletes) = await FetchMembersAsync(gymId, ct);
            visibleGyms.Add(new GymWithMembersDto
            {
                Gym      = MapToDto(gym),
                Coaches  = coaches,
                Managers = managers,
                Athletes = athletes
            });
        }

        return new MyMembersDto { IsFreelancer = false, Gyms = visibleGyms };
    }

    // ------------------------------------------------------------------
    private async Task<(List<CoachDto> coaches, List<ManagerDto> managers, List<AthleteDto> athletes)>
        FetchMembersAsync(Guid gymId, CancellationToken ct)
    {
        var coaches  = await _uow.Coaches.GetByGymIdAsync(gymId, ct);
        var managers = await _uow.Managers.GetByGymIdAsync(gymId, ct);
        var athletes = await _uow.Athletes.GetByGymIdAsync(gymId, ct);

        return (
            coaches.Select(MapToCoachDto).ToList(),
            managers.Select(MapToManagerDto).ToList(),
            athletes.Select(MapToAthleteDto).ToList()
        );
    }
    private static GymDto MapToDto(Gym g) => new()
    {
        Id           = g.Id,
        Name         = g.Name,
        Address      = g.Address,
        Latitude     = g.Latitude,
        Longitude    = g.Longitude,
        GymCode      = g.GymCode,
        CreatedBy    = g.CreatedBy,
        LogoImage    = g.LogoImage,
        Phone        = g.Phone,
        ContactEmail = g.ContactEmail,
        Description  = g.Description,
        Status       = g.Status,
        CreatedAt    = g.CreatedAt,
        UpdatedAt    = g.UpdatedAt
    };

    private static CoachDto MapToCoachDto(User u) => new()
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

    private static ManagerDto MapToManagerDto(User u) => new()
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

    private static AthleteDto MapToAthleteDto(User u) => new()
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
