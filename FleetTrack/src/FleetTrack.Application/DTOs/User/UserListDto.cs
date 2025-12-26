namespace FleetTrack.Application.DTOs.User;

/// <summary>
/// DTO simplifié pour la liste des utilisateurs
/// </summary>
public class UserListDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
