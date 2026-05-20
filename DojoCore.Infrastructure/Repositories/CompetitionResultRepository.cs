using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class CompetitionResultRepository : ICompetitionResultRepository
{
    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public CompetitionResultRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
    {
        _connection  = connection;
        _transaction = transaction;
    }

    public async Task<IEnumerable<CompetitionResult>> GetByImportIdAsync(Guid importId, CancellationToken ct = default)
    {
        const string sql = """
            SELECT id            AS "Id",
                   import_id     AS "ImportId",
                   category      AS "Category",
                   gender        AS "Gender",
                   weight_class  AS "WeightClass",
                   placement     AS "Placement",
                   athlete_name  AS "AthleteName",
                   country_code  AS "CountryCode",
                   club_name     AS "ClubName",
                   created_at    AS "CreatedAt"
            FROM competition_results
            WHERE import_id = @ImportId
            ORDER BY gender, weight_class, placement
            """;

        var cmd = new CommandDefinition(sql, new { ImportId = importId }, transaction: _transaction(), cancellationToken: ct);
        return await _connection.QueryAsync<CompetitionResult>(cmd);
    }

    public async Task<IEnumerable<CompetitionResultWithImport>> GetAllWithImportAsync(CancellationToken ct = default)
    {
        const string sql = """
            SELECT cr.id            AS "Id",
                   cr.import_id     AS "ImportId",
                   ci.title         AS "ImportTitle",
                   ci.tournament    AS "Tournament",
                   cr.category      AS "Category",
                   cr.gender        AS "Gender",
                   cr.weight_class  AS "WeightClass",
                   cr.placement     AS "Placement",
                   cr.athlete_name  AS "AthleteName",
                   cr.country_code  AS "CountryCode",
                   cr.club_name     AS "ClubName",
                   cr.created_at    AS "CreatedAt"
            FROM competition_results cr
            INNER JOIN competition_imports ci ON ci.id = cr.import_id
            ORDER BY ci.title, cr.gender, cr.weight_class, cr.placement
            """;

        var cmd = new CommandDefinition(sql, transaction: _transaction(), cancellationToken: ct);
        return await _connection.QueryAsync<CompetitionResultWithImport>(cmd);
    }

    public async Task BulkInsertAsync(IEnumerable<CompetitionResult> results, CancellationToken ct = default)
    {
        const string sql = """
            INSERT INTO competition_results
                (id, import_id, category, gender, weight_class, placement, athlete_name, country_code, club_name, created_at)
            VALUES
                (@Id, @ImportId, @Category, @Gender, @WeightClass, @Placement, @AthleteName, @CountryCode, @ClubName, @CreatedAt)
            """;

        var rows = results.Select(r => new
        {
            r.Id,
            r.ImportId,
            r.Category,
            r.Gender,
            r.WeightClass,
            r.Placement,
            r.AthleteName,
            r.CountryCode,
            r.ClubName,
            r.CreatedAt
        });

        var cmd = new CommandDefinition(sql, rows, transaction: _transaction(), cancellationToken: ct);
        await _connection.ExecuteAsync(cmd);
    }
}
