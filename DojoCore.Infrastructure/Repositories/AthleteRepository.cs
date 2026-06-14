using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class AthleteRepository : IAthleteRepository
{
    private const short AthleteRole = 3;

    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public AthleteRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
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
               first_name     AS "FirstName",
               last_name      AS "LastName",
               profile_image  AS "ProfileImage",
               phone          AS "Phone",
               description    AS "Description",
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
            new { Role = AthleteRole },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QueryAsync<User>(cmd);
    }

    public async Task<IEnumerable<User>> GetByGymIdAsync(Guid gymId, CancellationToken ct)
    {
        const string sql = """
            SELECT u.id             AS "Id",
                   u.username       AS "Username",
                   u.email          AS "Email",
                   u.password_hash  AS "PasswordHash",
                   u.user_code      AS "UserCode",
                   u.role           AS "Role",
                   u.first_name     AS "FirstName",
                   u.last_name      AS "LastName",
                   u.profile_image  AS "ProfileImage",
                   u.phone          AS "Phone",
                   u.description    AS "Description",
                   u.address        AS "Address",
                   u.gender         AS "Gender",
                   u.date_of_birth  AS "DateOfBirth",
                   u.latitude       AS "Latitude",
                   u.longitude      AS "Longitude",
                   u.status         AS "Status",
                   u.created_at     AS "CreatedAt",
                   u.updated_at     AS "UpdatedAt"
            FROM users u
            INNER JOIN user_gym ug ON ug.user_id = u.id
            WHERE u.role = @Role AND ug.gym_id = @GymId
            ORDER BY u.created_at DESC
            """;

        var cmd = new CommandDefinition(sql, new { Role = AthleteRole, GymId = gymId },
            transaction: _transaction(), cancellationToken: ct);
        return await _connection.QueryAsync<User>(cmd);
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            SelectColumns + " AND id = @Id",
            new { Role = AthleteRole, Id = id },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.QuerySingleOrDefaultAsync<User>(cmd);
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "SELECT COUNT(1) FROM users WHERE id = @Id AND role = @Role",
            new { Id = id, Role = AthleteRole },
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
                first_name     = @FirstName,
                last_name      = @LastName,
                profile_image  = @ProfileImage,
                phone          = @Phone,
                description    = @Description,
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
            user.FirstName,
            user.LastName,
            user.ProfileImage,
            user.Phone,
            user.Description,
            user.Address,
            user.Gender,
            DateOfBirth = user.DateOfBirth.HasValue
                ? (DateTime?)user.DateOfBirth.Value.ToDateTime(TimeOnly.MinValue)
                : null,
            user.Latitude,
            user.Longitude,
            user.Status,
            user.UpdatedAt,
            Role = AthleteRole
        };

        var cmd = new CommandDefinition(sql, param, transaction: _transaction(), cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "DELETE FROM users WHERE id = @Id AND role = @Role",
            new { Id = id, Role = AthleteRole },
            transaction: _transaction(),
            cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }
}
