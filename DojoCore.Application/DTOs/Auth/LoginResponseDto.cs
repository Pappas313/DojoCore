namespace DojoCore.Application.DTOs.Auth;

public class LoginResponseDto
{
    public LoginUserDto User { get; set; } = null!;
    public string Message { get; set; } = string.Empty;
}
