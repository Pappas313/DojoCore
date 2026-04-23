using DojoCore.Domain.Entities;

namespace DojoCore.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
