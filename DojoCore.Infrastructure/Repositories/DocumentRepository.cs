using Dapper;
using DojoCore.Domain.Entities;
using DojoCore.Domain.Interfaces;
using Npgsql;

namespace DojoCore.Infrastructure.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly NpgsqlConnection _connection;
    private readonly Func<NpgsqlTransaction?> _transaction;

    public DocumentRepository(NpgsqlConnection connection, Func<NpgsqlTransaction?> transaction)
    {
        _connection = connection;
        _transaction = transaction;
    }

    public async Task AddRangeAsync(IEnumerable<Document> documents, CancellationToken ct)
    {
        const string sql = """
            INSERT INTO documents (id, user_id, gym_id, file_name, file_path, file_type, status, uploaded_at)
            VALUES (@Id, @UserId, @GymId, @FileName, @FilePath, @FileType, @Status, @UploadedAt)
            """;

        foreach (var doc in documents)
        {
            var cmd = new CommandDefinition(sql, doc, transaction: _transaction(), cancellationToken: ct);
            await _connection.ExecuteAsync(cmd);
        }
    }
}
