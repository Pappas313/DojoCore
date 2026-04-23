using DojoCore.Domain.Entities;

namespace DojoCore.Domain.Interfaces;

public interface IUserRepository
{
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
    Task<bool> UsernameExistsAsync(string username, CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
    Task<User?> GetByEmailOrUsernameAsync(string identifier, CancellationToken ct = default);
}
