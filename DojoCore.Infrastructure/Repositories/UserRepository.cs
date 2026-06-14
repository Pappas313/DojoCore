using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public UserRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
    {
        _connection = connection;
        _transaction = transaction;
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "SELECT COUNT(1) FROM users WHERE email = @Email",
            new { Email = email },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.ExecuteScalarAsync<int>(cmd) > 0;
    }

    public async Task<bool> UsernameExistsAsync(string username, CancellationToken ct)
    {
        var cmd = new CommandDefinition(
            "SELECT COUNT(1) FROM users WHERE username = @Username",
            new { Username = username },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.ExecuteScalarAsync<int>(cmd) > 0;
    }

    public async Task AddAsync(User user, CancellationToken ct)
    {
        const string sql = """
            INSERT INTO users
                (id, username, email, password_hash, user_code, role,
                 first_name, last_name, profile_image, phone, description,
                 address, gender, date_of_birth, latitude, longitude,
                 status, created_at, updated_at)
            VALUES
                (@Id, @Username, @Email, @PasswordHash, @UserCode, @Role,
                 @FirstName, @LastName, @ProfileImage, @Phone, @Description,
                 @Address, @Gender, @DateOfBirth, @Latitude, @Longitude,
                 @Status, @CreatedAt, @UpdatedAt)
            """;

        var param = new
        {
            user.Id,
            user.Username,
            user.Email,
            user.PasswordHash,
            user.UserCode,
            user.Role,
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
            user.CreatedAt,
            user.UpdatedAt
        };

        var cmd = new CommandDefinition(sql, param, transaction: _transaction(), cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }

    public async Task<User?> GetByEmailOrUsernameAsync(string identifier, CancellationToken ct)
    {
        const string sql = """
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
            WHERE email = @Identifier OR username = @Identifier
            LIMIT 1
            """;

        var cmd = new CommandDefinition(sql, new { Identifier = identifier }, cancellationToken: ct);
        return await _connection.QuerySingleOrDefaultAsync<User>(cmd);
    }
}
