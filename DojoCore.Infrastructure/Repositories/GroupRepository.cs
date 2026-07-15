using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class GroupRepository : IGroupRepository
{
    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public GroupRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
    {
        _connection = connection;
        _transaction = transaction;
    }

    private const string SelectColumns = """
        SELECT id, gym_id AS GymId, name, description, status,
               created_at AS CreatedAt, updated_at AS UpdatedAt
        FROM groups
        """;

    public async Task<IEnumerable<Group>> GetAllAsync(CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            SelectColumns + " ORDER BY created_at DESC",
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QueryAsync<Group>(cmd);
    }

    public async Task<IEnumerable<Group>> GetByGymIdAsync(Guid gymId, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            SelectColumns + " WHERE gym_id = @GymId ORDER BY created_at DESC",
            new { GymId = gymId },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QueryAsync<Group>(cmd);
    }

    public async Task<Group?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            SelectColumns + " WHERE id = @Id",
            new { Id = id },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QueryFirstOrDefaultAsync<Group>(cmd);
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "SELECT COUNT(1) FROM groups WHERE id = @Id",
            new { Id = id },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.ExecuteScalarAsync<int>(cmd) > 0;
    }

    public async Task AddAsync(Group group, CancellationToken ct)
    {
        const string sql = """
            INSERT INTO groups
                (id, gym_id, name, description, status, created_at, updated_at)
            VALUES
                (@Id, @GymId, @Name, @Description, @Status, @CreatedAt, @UpdatedAt)
            """;

        var cmd = new CommandDefinition(sql, group, transaction: _transaction(), cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }

    public async Task UpdateAsync(Group group, CancellationToken ct)
    {
        const string sql = """
            UPDATE groups
            SET name = @Name, description = @Description, status = @Status, updated_at = @UpdatedAt
            WHERE id = @Id
            """;

        var cmd = new CommandDefinition(sql, group, transaction: _transaction(), cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "DELETE FROM groups WHERE id = @Id",
            new { Id = id },
            transaction: _transaction(),
            cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }

    public async Task<IEnumerable<Guid>> GetCoachIdsAsync(Guid groupId, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "SELECT user_id FROM group_coaches WHERE group_id = @GroupId",
            new { GroupId = groupId },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QueryAsync<Guid>(cmd);
    }

    public async Task<IEnumerable<Guid>> GetAthleteIdsAsync(Guid groupId, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "SELECT user_id FROM group_athletes WHERE group_id = @GroupId",
            new { GroupId = groupId },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QueryAsync<Guid>(cmd);
    }

    public async Task ReplaceCoachesAsync(Guid groupId, IEnumerable<Guid> coachIds, CancellationToken ct)
    {
        var deleteCmd = new CommandDefinition(
            "DELETE FROM group_coaches WHERE group_id = @GroupId",
            new { GroupId = groupId },
            transaction: _transaction(),
            cancellationToken: ct);
        await _connection.ExecuteAsync(deleteCmd);

        var rows = coachIds.Select(coachId => new { GroupId = groupId, UserId = coachId }).ToList();
        if (rows.Count == 0)
            return;

        const string insertSql = """
            INSERT INTO group_coaches (group_id, user_id)
            VALUES (@GroupId, @UserId)
            """;
        var insertCmd = new CommandDefinition(insertSql, rows, transaction: _transaction(), cancellationToken: ct);
        await _connection.ExecuteAsync(insertCmd);
    }

    public async Task ReplaceAthletesAsync(Guid groupId, IEnumerable<Guid> athleteIds, CancellationToken ct)
    {
        var deleteCmd = new CommandDefinition(
            "DELETE FROM group_athletes WHERE group_id = @GroupId",
            new { GroupId = groupId },
            transaction: _transaction(),
            cancellationToken: ct);
        await _connection.ExecuteAsync(deleteCmd);

        var rows = athleteIds.Select(athleteId => new { GroupId = groupId, UserId = athleteId }).ToList();
        if (rows.Count == 0)
            return;

        const string insertSql = """
            INSERT INTO group_athletes (group_id, user_id)
            VALUES (@GroupId, @UserId)
            """;
        var insertCmd = new CommandDefinition(insertSql, rows, transaction: _transaction(), cancellationToken: ct);
        await _connection.ExecuteAsync(insertCmd);
    }
}
