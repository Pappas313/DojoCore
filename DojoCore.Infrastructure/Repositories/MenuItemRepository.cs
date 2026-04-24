using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class MenuItemRepository : IMenuItemRepository
{
    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public MenuItemRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
    {
        _connection = connection;
        _transaction = transaction;
    }

    public async Task<IEnumerable<MenuItem>> GetAllAsync(CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """
            SELECT "Id", "Title", "PageCode", "OrderIndex", "Url", "Icon", "CreatedAt", "UpdatedAt"
            FROM "MenuItems"
            ORDER BY "PageCode"
            """,
            transaction: _transaction(),
            cancellationToken: ct);

        return await _connection.QueryAsync<MenuItem>(cmd);
    }

    public async Task<MenuItem?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """
            SELECT "Id", "Title", "PageCode", "OrderIndex", "Url", "Icon", "CreatedAt", "UpdatedAt"
            FROM "MenuItems"
            WHERE "Id" = @Id
            """,
            new { Id = id },
            transaction: _transaction(),
            cancellationToken: ct);

        return await _connection.QueryFirstOrDefaultAsync<MenuItem>(cmd);
    }

    public async Task<MenuItem?> GetByPageCodeAsync(string pageCode, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """
            SELECT "Id", "Title", "PageCode", "OrderIndex", "Url", "Icon", "CreatedAt", "UpdatedAt"
            FROM "MenuItems"
            WHERE "PageCode" = @PageCode
            """,
            new { PageCode = pageCode },
            transaction: _transaction(),
            cancellationToken: ct);

        return await _connection.QueryFirstOrDefaultAsync<MenuItem>(cmd);
    }

    public async Task<bool> PageCodeExistsAsync(string pageCode, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """SELECT COUNT(1) FROM "MenuItems" WHERE "PageCode" = @PageCode""",
            new { PageCode = pageCode },
            transaction: _transaction(),
            cancellationToken: ct);

        return await _connection.ExecuteScalarAsync<int>(cmd) > 0;
    }

    public async Task<int> AddAsync(MenuItem item, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """
            INSERT INTO "MenuItems" ("Title", "PageCode", "OrderIndex", "Url", "Icon", "CreatedAt", "UpdatedAt")
            VALUES (@Title, @PageCode, @OrderIndex, @Url, @Icon, @CreatedAt, @UpdatedAt)
            RETURNING "Id"
            """,
            item,
            transaction: _transaction(),
            cancellationToken: ct);

        return await _connection.ExecuteScalarAsync<int>(cmd);
    }

    public async Task UpdateAsync(MenuItem item, CancellationToken ct = default)
    {
        var cmd = new CommandDefinition(
            """
            UPDATE "MenuItems"
            SET "Title"      = @Title,
                "OrderIndex" = @OrderIndex,
                "Url"        = @Url,
                "Icon"       = @Icon,
                "UpdatedAt"  = @UpdatedAt
            WHERE "Id" = @Id
            """,
            item,
            transaction: _transaction(),
            cancellationToken: ct);

        await _connection.ExecuteAsync(cmd);
    }

    public async Task DeleteByPageCodePrefixAsync(string pageCode, CancellationToken ct = default)
    {
        // Deletes the item itself and every descendant whose PageCode starts with the given prefix.
        var cmd = new CommandDefinition(
            """
            DELETE FROM "MenuItems"
            WHERE "PageCode" = @PageCode
               OR "PageCode" LIKE @Prefix
            """,
            new { PageCode = pageCode, Prefix = pageCode + "%" },
            transaction: _transaction(),
            cancellationToken: ct);

        await _connection.ExecuteAsync(cmd);
    }
}
