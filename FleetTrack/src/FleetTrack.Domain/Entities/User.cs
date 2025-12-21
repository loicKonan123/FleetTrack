namespace FleetTrack.Domain.Entities;

/// <summary>
/// Représente un utilisateur du système FleetTrack
/// </summary>
public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginDate { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Navigation properties
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    // Relation optionnelle avec Driver (si l'utilisateur est un conducteur)
    public Guid? DriverId { get; set; }
    public Driver? Driver { get; set; }
}
