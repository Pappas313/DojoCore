namespace DojoCore.Application.DTOs.Auth;

public class LoginUserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public short Role { get; set; }
    public short Status { get; set; }
}
