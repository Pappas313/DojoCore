using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class CoachRepository : ICoachRepository
{
    private const short CoachRole = 1;

    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public CoachRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
    {
        _connection = connection;
        _transaction = transaction;
    }

    private const string SelectColumns = """
        SELECT id             AS "Id",
               username       AS "Username",
               email          AS "Email",
               password_hash  AS "PasswordHash",
               user_code      AS "UserCode",
               role           AS "Role",
               address        AS "Address",
               gender         AS "Gender",
               date_of_birth  AS "DateOfBirth",
               latitude       AS "Latitude",
               longitude      AS "Longitude",
               status         AS "Status",
               created_at     AS "CreatedAt",
               updated_at     AS "UpdatedAt"
        FROM users
        WHERE role = @Role
        """;

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            SelectColumns + " ORDER BY created_at DESC",
            new { Role = CoachRole },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QueryAsync<User>(cmd);
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            SelectColumns + " AND id = @Id",
            new { Role = CoachRole, Id = id },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QuerySingleOrDefaultAsync<User>(cmd);
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "SELECT COUNT(1) FROM users WHERE id = @Id AND role = @Role",
            new { Id = id, Role = CoachRole },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.ExecuteScalarAsync<int>(cmd) > 0;
    }

    public async Task UpdateAsync(User user, CancellationToken ct)
    {
        const string sql = """
            UPDATE users
            SET username       = @Username,
                email          = @Email,
                address        = @Address,
                gender         = @Gender,
                date_of_birth  = @DateOfBirth,
                latitude       = @Latitude,
                longitude      = @Longitude,
                status         = @Status,
                updated_at     = @UpdatedAt
            WHERE id = @Id AND role = @Role
            """;

        var param = new
        {
            user.Id,
            user.Username,
            user.Email,
            user.Address,
            user.Gender,
            DateOfBirth = user.DateOfBirth.HasValue
                ? (DateTime?)user.DateOfBirth.Value.ToDateTime(TimeOnly.MinValue)
                : null,
            user.Latitude,
            user.Longitude,
            user.Status,
            user.UpdatedAt,
            Role = CoachRole
        };

        var cmd = new CommandDefinition(sql, param, transaction: _transaction(), cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "DELETE FROM users WHERE id = @Id AND role = @Role",
            new { Id = id, Role = CoachRole },
            transaction: _transaction(),
            cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }
}
