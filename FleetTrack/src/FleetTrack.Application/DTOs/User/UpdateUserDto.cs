using System.ComponentModel.DataAnnotations;

namespace FleetTrack.Application.DTOs.User;

/// <summary>
/// DTO pour la mise à jour d'un utilisateur
/// </summary>
public class UpdateUserDto
{
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")]
    public string? Username { get; set; }

    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    public string? Email { get; set; }

    [StringLength(50)]
    public string? FirstName { get; set; }

    [StringLength(50)]
    public string? LastName { get; set; }

    [Phone(ErrorMessage = "Format de téléphone invalide")]
    public string? PhoneNumber { get; set; }

    public Guid? RoleId { get; set; }

    public Guid? DriverId { get; set; }

    public bool? IsActive { get; set; }
}
