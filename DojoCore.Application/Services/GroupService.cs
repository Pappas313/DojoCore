using DojoCore.Application.DTOs.Group;
using DojoCore.Application.Exceptions;
using DojoCore.Application.Interfaces;
using DojoCore.Domain.Interfaces;

namespace DojoCore.Application.Services;

public class GroupService : IGroupService
{
    private readonly IUnitOfWork _uow;

    // Role values (see RegisterOperationFilter): 0 = Admin, 1 = Coach, 2 = Manager, 3 = Athlete
    private const short AdminRole = 0;
    private const short AthleteRole = 3;

    public GroupService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<List<GroupDto>> GetAllAsync(CancellationToken ct = default)
    {
        var groups = await _uow.Groups.GetAllAsync(ct);
        var result = new List<GroupDto>();
        foreach (var group in groups)
            result.Add(await MapToDtoAsync(group, ct));
        return result;
    }

    public async Task<List<GroupDto>> GetByGymIdAsync(Guid gymId, CancellationToken ct = default)
    {
        var groups = await _uow.Groups.GetByGymIdAsync(gymId, ct);
        var result = new List<GroupDto>();
        foreach (var group in groups)
            result.Add(await MapToDtoAsync(group, ct));
        return result;
    }

    public async Task<List<GroupDto>> GetVisibleAsync(Guid callerId, short callerRole, CancellationToken ct = default)
    {
        if (callerRole == AdminRole)
            return await GetAllAsync(ct);

        var gymIds = (await _uow.UserGyms.GetGymIdsByUserIdAsync(callerId, ct)).ToList();

        if (gymIds.Count == 0)
        {
            // Freelancer athletes (no gym membership) see groups of all gyms
            return callerRole == AthleteRole ? await GetAllAsync(ct) : [];
        }

        var seen = new HashSet<Guid>();
        var result = new List<GroupDto>();
        foreach (var gymId in gymIds)
        {
            var groups = await _uow.Groups.GetByGymIdAsync(gymId, ct);
            foreach (var group in groups)
            {
                if (seen.Add(group.Id))
                    result.Add(await MapToDtoAsync(group, ct));
            }
        }

        return result;
    }

    public async Task<GroupDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var group = await _uow.Groups.GetByIdAsync(id, ct);
        return group is null ? null : await MapToDtoAsync(group, ct);
    }

    public async Task<GroupDto> CreateAsync(CreateGroupRequest request, CancellationToken ct = default)
    {
        var gym = await _uow.Gyms.GetByIdAsync(request.GymId, ct)
            ?? throw new ValidationException(new Dictionary<string, string[]>
            {
                ["GymId"] = [$"Gym with id '{request.GymId}' was not found."]
            });

        var group = new Domain.Entities.Group
        {
            GymId       = gym.Id,
            Name        = request.Name,
            Description = request.Description,
            Status      = 0,
        };

        await _uow.Groups.AddAsync(group, ct);
        await _uow.Groups.ReplaceCoachesAsync(group.Id, request.CoachIds, ct);
        await _uow.Groups.ReplaceAthletesAsync(group.Id, request.AthleteIds, ct);

        return await MapToDtoAsync(group, ct);
    }

    public async Task<GroupDto> UpdateAsync(Guid id, UpdateGroupRequest request, CancellationToken ct = default)
    {
        var group = await _uow.Groups.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Group with id '{id}' was not found.");

        group.Name        = request.Name;
        group.Description = request.Description;
        group.Status      = request.Status;
        group.UpdatedAt   = DateTime.UtcNow;

        await _uow.Groups.UpdateAsync(group, ct);

        return await MapToDtoAsync(group, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        if (!await _uow.Groups.ExistsAsync(id, ct))
            throw new KeyNotFoundException($"Group with id '{id}' was not found.");

        await _uow.Groups.DeleteAsync(id, ct);
    }

    public async Task<GroupDto> UpdateCoachesAsync(Guid id, UpdateGroupCoachesRequest request, CancellationToken ct = default)
    {
        var group = await _uow.Groups.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Group with id '{id}' was not found.");

        await _uow.Groups.ReplaceCoachesAsync(id, request.CoachIds, ct);

        return await MapToDtoAsync(group, ct);
    }

    public async Task<GroupDto> UpdateAthletesAsync(Guid id, UpdateGroupAthletesRequest request, CancellationToken ct = default)
    {
        var group = await _uow.Groups.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Group with id '{id}' was not found.");

        await _uow.Groups.ReplaceAthletesAsync(id, request.AthleteIds, ct);

        return await MapToDtoAsync(group, ct);
    }

    // ------------------------------------------------------------------
    private async Task<GroupDto> MapToDtoAsync(Domain.Entities.Group g, CancellationToken ct)
    {
        var coachIds = (await _uow.Groups.GetCoachIdsAsync(g.Id, ct)).ToList();
        var athleteIds = (await _uow.Groups.GetAthleteIdsAsync(g.Id, ct)).ToList();

        return new GroupDto
        {
            Id          = g.Id,
            GymId       = g.GymId,
            Name        = g.Name,
            Description = g.Description,
            Status      = g.Status,
            CoachIds    = coachIds,
            AthleteIds  = athleteIds,
            CreatedAt   = g.CreatedAt,
            UpdatedAt   = g.UpdatedAt
        };
    }
}
