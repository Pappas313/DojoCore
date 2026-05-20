using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class CompetitionImportRepository : ICompetitionImportRepository
{
    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public CompetitionImportRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
    {
        _connection  = connection;
        _transaction = transaction;
    }

    public async Task<IEnumerable<CompetitionImport>> GetAllAsync(CancellationToken ct = default)
    {
        const string sql = """
            SELECT ci.id           AS "Id",
                   ci.title        AS "Title",
                   ci.tournament   AS "Tournament",
                   ci.file_name    AS "FileName",
                   ci.imported_by  AS "ImportedBy",
                   ci.created_at   AS "CreatedAt",
                   COUNT(cr.id)    AS "RowCount"
            FROM competition_imports ci
            LEFT JOIN competition_results cr ON cr.import_id = ci.id
            GROUP BY ci.id
            ORDER BY ci.created_at DESC
            """;

        var cmd = new CommandDefinition(sql, transaction: _transaction(), cancellationToken: ct);
        return await _connection.QueryAsync<CompetitionImport>(cmd);
    }

    public async Task<CompetitionImport?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        const string sql = """
            SELECT id           AS "Id",
                   title        AS "Title",
                   tournament   AS "Tournament",
                   file_name    AS "FileName",
                   imported_by  AS "ImportedBy",
                   created_at   AS "CreatedAt"
            FROM competition_imports
            WHERE id = @Id
            """;

        var cmd = new CommandDefinition(sql, new { Id = id }, transaction: _transaction(), cancellationToken: ct);
        return await _connection.QuerySingleOrDefaultAsync<CompetitionImport>(cmd);
    }

    public async Task<Guid> InsertAsync(CompetitionImport import, CancellationToken ct = default)
    {
        const string sql = """
            INSERT INTO competition_imports (id, title, tournament, file_name, imported_by, created_at)
            VALUES (@Id, @Title, @Tournament, @FileName, @ImportedBy, @CreatedAt)
            RETURNING id
            """;

        var param = new
        {
            import.Id,
            import.Title,
            import.Tournament,
            import.FileName,
            import.ImportedBy,
            import.CreatedAt
        };

        var cmd = new CommandDefinition(sql, param, transaction: _transaction(), cancellationToken: ct);
        return await _connection.ExecuteScalarAsync<Guid>(cmd);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            "DELETE FROM competition_imports WHERE id = @Id",
            new { Id = id },
            transaction: _transaction(),
            cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            "SELECT COUNT(1) FROM competition_imports WHERE id = @Id",
            new { Id = id },
            transaction: _transaction(),
            cancellationToken: ct);
        return await _connection.ExecuteScalarAsync<int>(cmd) > 0;
    }
}
