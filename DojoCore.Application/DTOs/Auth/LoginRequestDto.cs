namespace DojoCore.Application.DTOs.Auth;

public class LoginRequestDto
{
    public string Identifier { get; set; } = string.Empty; // email or username
    public string Password { get; set; } = string.Empty;
}
