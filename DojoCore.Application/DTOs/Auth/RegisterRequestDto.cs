using System.Text.Json.Serialization;

namespace DojoCore.Application.DTOs.Auth;

/// <summary>
/// The JSON payload stringified inside the multipart/form-data "payload" field.
/// </summary>
public class RegisterRequestDto
{
    [JsonPropertyName("user")]
    public RegisterUserDto User { get; set; } = new();

    /// <summary>"join" | "create" | "none"</summary>
    [JsonPropertyName("gymAction")]
    public string GymAction { get; set; } = "none";

    [JsonPropertyName("gymCode")]
    public string? GymCode { get; set; }

    [JsonPropertyName("newGym")]
    public NewGymDto? NewGym { get; set; }
}
