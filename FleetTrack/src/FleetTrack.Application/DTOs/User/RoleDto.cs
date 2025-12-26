namespace FleetTrack.Application.DTOs.User;

/// <summary>
/// DTO pour les rôles
/// </summary>
public class RoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int UserCount { get; set; }
}
