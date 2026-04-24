using System.ComponentModel.DataAnnotations;

namespace DojoCore.Application.DTOs.Coach;

/// <summary>Payload for updating a coach's profile.</summary>
public class UpdateCoachRequest
{
    /// <summary>Username (3–60 characters).</summary>
    [Required]
    [StringLength(60, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    /// <summary>Email address.</summary>
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Address.</summary>
    [StringLength(100)]
    public string? Address { get; set; }

    /// <summary>Gender (0 = unspecified, 1 = male, 2 = female).</summary>
    public short? Gender { get; set; }

    /// <summary>Date of birth.</summary>
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>Status (0 = pending, 1 = active, 2 = inactive).</summary>
    public short Status { get; set; }
}
