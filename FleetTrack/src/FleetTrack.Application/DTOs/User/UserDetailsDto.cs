namespace FleetTrack.Application.DTOs.User;

/// <summary>
/// DTO avec les détails complets d'un utilisateur
/// </summary>
public class UserDetailsDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Role info
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string RoleDescription { get; set; } = string.Empty;

    // Driver info (if applicable)
    public Guid? DriverId { get; set; }
    public string? DriverLicenseNumber { get; set; }
}
