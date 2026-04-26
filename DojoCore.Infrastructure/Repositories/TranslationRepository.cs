using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class TranslationRepository : ITranslationRepository
{
    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public TranslationRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
    {
        _connection = connection;
        _transaction = transaction;
    }

    public async Task<IEnumerable<Translation>> GetByLanguageAndPageAsync(string language, string page, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """
            SELECT id, language, page, key, value, created_at AS CreatedAt, updated_at AS UpdatedAt
            FROM translations
            WHERE language = @language AND page = @page
            """,
            new { language, page },
            transaction: _transaction(),
            cancellationToken: ct);

        return await _connection.QueryAsync<Translation>(cmd);
    }

    public async Task<IEnumerable<string>> GetDistinctLanguagesAsync(CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """
            SELECT DISTINCT language FROM translations ORDER BY language
            """,
            transaction: _transaction(),
            cancellationToken: ct);

        return await _connection.QueryAsync<string>(cmd);
    }

    public async Task<(IEnumerable<Translation> Items, int Total)> GetPagedAsync(
        string? language, string? page, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var conditions = new List<string>();
        var parameters = new DynamicParameters();

        if (!string.IsNullOrEmpty(language))
        {
            conditions.Add("language = @language");
            parameters.Add("language", language);
        }
        if (!string.IsNullOrEmpty(page))
        {
            conditions.Add("page = @page");
            parameters.Add("page", page);
        }

        var where = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : string.Empty;
        parameters.Add("offset", (pageNumber - 1) * pageSize);
        parameters.Add("limit", pageSize);

        var countCmd = new CommandDefinition(
            $"SELECT COUNT(*) FROM translations {where}",
            parameters,
            transaction: _transaction(),
            cancellationToken: ct);

        var total = await _connection.ExecuteScalarAsync<int>(countCmd);

        var itemsCmd = new CommandDefinition(
            $"""
            SELECT id, language, page, key, value, created_at AS CreatedAt, updated_at AS UpdatedAt
            FROM translations
            {where}
            ORDER BY id
            LIMIT @limit OFFSET @offset
            """,
            parameters,
            transaction: _transaction(),
            cancellationToken: ct);

        var items = await _connection.QueryAsync<Translation>(itemsCmd);
        return (items, total);
    }

    public async Task<Translation?> GetByKeyAsync(string language, string page, string key, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """
            SELECT id, language, page, key, value, created_at AS CreatedAt, updated_at AS UpdatedAt
            FROM translations
            WHERE language = @language AND page = @page AND key = @key
            """,
            new { language, page, key },
            transaction: _transaction(),
            cancellationToken: ct);

        return await _connection.QueryFirstOrDefaultAsync<Translation>(cmd);
    }

    public async Task<Translation> UpsertAsync(string language, string page, string key, string value, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """
            INSERT INTO translations (language, page, key, value)
            VALUES (@language, @page, @key, @value)
            ON CONFLICT (language, page, key) DO UPDATE
                SET value = EXCLUDED.value, updated_at = NOW()
            RETURNING id, language, page, key, value, created_at AS CreatedAt, updated_at AS UpdatedAt
            """,
            new { language, page, key, value },
            transaction: _transaction(),
            cancellationToken: ct);

        return await _connection.QuerySingleAsync<Translation>(cmd);
    }

    public async Task<(int Inserted, int Updated)> BulkUpsertAsync(IEnumerable<Translation> translations, CancellationToken ct = default)
    {
        var list = translations.ToList();
        if (list.Count == 0) return (0, 0);

        // Determine which keys already exist
        var existing = new HashSet<(string, string, string)>();
        var checkCmd = new CommandDefinition(
            """
            SELECT language, page, key FROM translations
            WHERE (language, page, key) = ANY(@pairs)
            """,
            new { pairs = list.Select(t => new[] { t.Language, t.Page, t.Key }).ToArray() },
            transaction: _transaction(),
            cancellationToken: ct);

        // Use a simpler approach: upsert and track via xmax
        var upsertSql = """
            INSERT INTO translations (language, page, key, value)
            SELECT unnest(@languages), unnest(@pages), unnest(@keys), unnest(@values)
            ON CONFLICT (language, page, key) DO UPDATE
                SET value = EXCLUDED.value, updated_at = NOW()
            RETURNING (xmax = 0) AS is_insert
            """;

        var upsertCmd = new CommandDefinition(
            upsertSql,
            new
            {
                languages = list.Select(t => t.Language).ToArray(),
                pages = list.Select(t => t.Page).ToArray(),
                keys = list.Select(t => t.Key).ToArray(),
                values = list.Select(t => t.Value).ToArray()
            },
            transaction: _transaction(),
            cancellationToken: ct);

        var results = (await _connection.QueryAsync<bool>(upsertCmd)).ToList();
        var inserted = results.Count(r => r);
        var updated = results.Count - inserted;
        return (inserted, updated);
    }

    public async Task<bool> DeleteAsync(string language, string page, string key, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """
            DELETE FROM translations
            WHERE language = @language AND page = @page AND key = @key
            """,
            new { language, page, key },
            transaction: _transaction(),
            cancellationToken: ct);

        var rows = await _connection.ExecuteAsync(cmd);
        return rows > 0;
    }
}
