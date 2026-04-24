using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class GymRepository : IGymRepository
{
    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public GymRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
    {
        _connection = connection;
        _transaction = transaction;
    }

    private const string SelectColumns = """
        SELECT id, name, address, latitude, longitude, gym_code AS GymCode,
               created_by AS CreatedBy, status, created_at AS CreatedAt, updated_at AS UpdatedAt
        FROM gyms
        """;

    public async Task<IEnumerable<Gym>> GetAllAsync(CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            SelectColumns + " ORDER BY created_at DESC",
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QueryAsync<Gym>(cmd);
    }

    public async Task<Gym?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            SelectColumns + " WHERE id = @Id",
            new { Id = id },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QueryFirstOrDefaultAsync<Gym>(cmd);
    }

    public async Task<Gym?> GetByCodeAsync(string gymCode, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            SelectColumns + " WHERE gym_code = @GymCode",
            new { GymCode = gymCode },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QueryFirstOrDefaultAsync<Gym>(cmd);
    }

    public async Task AddAsync(Gym gym, CancellationToken ct)
    {
        const string sql = """
            INSERT INTO gyms
                (id, name, address, latitude, longitude, gym_code, created_by, status, created_at, updated_at)
            VALUES
                (@Id, @Name, @Address, @Latitude, @Longitude, @GymCode, @CreatedBy, @Status, @CreatedAt, @UpdatedAt)
            """;

        var cmd = new CommandDefinition(sql, gym, transaction: _transaction(), cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }

    public async Task<bool> GymCodeExistsAsync(string gymCode, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "SELECT COUNT(1) FROM gyms WHERE gym_code = @GymCode",
            new { GymCode = gymCode },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.ExecuteScalarAsync<int>(cmd) > 0;
    }
}
