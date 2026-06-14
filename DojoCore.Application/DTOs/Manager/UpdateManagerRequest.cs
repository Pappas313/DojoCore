using System.ComponentModel.DataAnnotations;

namespace DojoCore.Application.DTOs.Manager;

/// <summary>Payload for updating a manager's profile.</summary>
public class UpdateManagerRequest
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

    /// <summary>First name.</summary>
    [StringLength(100)]
    public string? FirstName { get; set; }

    /// <summary>Last name.</summary>
    [StringLength(100)]
    public string? LastName { get; set; }

    /// <summary>Phone number.</summary>
    [StringLength(30)]
    public string? Phone { get; set; }

    /// <summary>Short biography / description.</summary>
    [StringLength(1000)]
    public string? Description { get; set; }

    /// <summary>Gender (0 = unspecified, 1 = male, 2 = female).</summary>
    public short? Gender { get; set; }

    /// <summary>Date of birth.</summary>
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>Status (0 = pending, 1 = active, 2 = inactive).</summary>
    public short Status { get; set; }
}
