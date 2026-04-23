using DojoCore.Domain.Interfaces;
using DojoCore.Infrastructure.Repositories;
using Npgsql;

namespace DojoCore.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork, IDisposable
{
    private readonly NpgsqlConnection _connection;
    private NpgsqlTransaction? _transaction;

    public IUserRepository Users { get; }
    public IGymRepository Gyms { get; }
    public IUserGymRepository UserGyms { get; }
    public IDocumentRepository Documents { get; }

    public UnitOfWork(NpgsqlConnection connection)
    {
        _connection = connection;
        _connection.Open();
        Users = new UserRepository(_connection, () => _transaction);
        Gyms = new GymRepository(_connection, () => _transaction);
        UserGyms = new UserGymRepository(_connection, () => _transaction);
        Documents = new DocumentRepository(_connection, () => _transaction);
    }

    public Task BeginTransactionAsync(CancellationToken ct = default)
    {
        _transaction = _connection.BeginTransaction();
        return Task.CompletedTask;
    }

    public async Task CommitAsync(CancellationToken ct = default)
    {
        if (_transaction is not null)
        {
            await _transaction.CommitAsync(ct);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackAsync(CancellationToken ct = default)
    {
        if (_transaction is not null)
        {
            await _transaction.RollbackAsync(ct);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _connection.Dispose();
    }
}
