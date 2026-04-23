using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class UserGymRepository : IUserGymRepository
{
    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public UserGymRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
    {
        _connection = connection;
        _transaction = transaction;
    }

    public async Task AddAsync(UserGym userGym, CancellationToken ct)
    {
        const string sql = """
            INSERT INTO user_gym (id, user_id, gym_id, role, status, created_at)
            VALUES (@Id, @UserId, @GymId, @Role, @Status, @CreatedAt)
            """;

        var cmd = new CommandDefinition(sql, userGym, transaction: _transaction(), cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }
}
