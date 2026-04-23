using DojoCore.Application.DTOs.Auth;

namespace DojoCore.Application.Interfaces;

public interface IAuthService
{
    Task<RegisterResponseDto> RegisterAsync(
        RegisterRequestDto request,
        IReadOnlyList<(Stream Content, string FileName, string ContentType)> files,
        CancellationToken ct = default);
}
