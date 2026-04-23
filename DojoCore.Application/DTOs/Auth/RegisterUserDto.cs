using System.Text.Json.Serialization;

namespace DojoCore.Application.DTOs.Auth;

public class RegisterUserDto
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;

    [JsonPropertyName("user_code")]
    public string? UserCode { get; set; }

    [JsonPropertyName("role")]
    public short Role { get; set; }

    [JsonPropertyName("address")]
    public string? Address { get; set; }

    [JsonPropertyName("gender")]
    public short? Gender { get; set; }

    [JsonPropertyName("dateOfBirth")]
    public DateOnly? DateOfBirth { get; set; }
}
