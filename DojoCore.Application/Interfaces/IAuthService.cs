using DojoCore.Application.DTOs.Auth;

namespace DojoCore.Application.Interfaces;

public interface IAuthService
{
    Task<RegisterResponseDto> RegisterAsync(
        RegisterRequestDto request,
        IReadOnlyList<(Stream Content, string FileName, string ContentType)> files,
        CancellationToken ct = default);

    Task<(LoginResponseDto Response, string Token)> LoginAsync(
        LoginRequestDto request,
        CancellationToken ct = default);

    Task LogoutAsync(CancellationToken ct = default);
}
