using Microsoft.AspNetCore.Mvc;

namespace DojoCore.API.Models;

public class RegisterFormRequest
{
    /// <summary>Stringified JSON matching RegisterRequestDto.</summary>
    [FromForm(Name = "payload")]
    public string Payload { get; set; } = string.Empty;

    /// <summary>Optional file attachments (certificates, IDs, etc.).</summary>
    [FromForm(Name = "files")]
    public IFormFileCollection? Files { get; set; }
}
