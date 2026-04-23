namespace DojoCore.Application.DTOs.Auth;

public class RegisterResponseDto
{
    public RegisteredUserDto User { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}
