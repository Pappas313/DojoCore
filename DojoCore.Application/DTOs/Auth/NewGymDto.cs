using System.Text.Json.Serialization;

namespace DojoCore.Application.DTOs.Auth;

public class NewGymDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("address")]
    public string Address { get; set; } = string.Empty;
}
