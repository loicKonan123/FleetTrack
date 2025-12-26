using System.ComponentModel.DataAnnotations;

namespace FleetTrack.Application.DTOs.User;

/// <summary>
/// DTO pour la création d'un nouvel utilisateur (Admin seulement)
/// </summary>
public class CreateUserDto
{
    [Required(ErrorMessage = "Le nom d'utilisateur est requis")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'email est requis")]
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le mot de passe est requis")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Le mot de passe doit contenir au moins 8 caractères")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le prénom est requis")]
    [StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom est requis")]
    [StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Format de téléphone invalide")]
    public string? PhoneNumber { get; set; }

    [Required(ErrorMessage = "Le rôle est requis")]
    public Guid RoleId { get; set; }

    /// <summary>
    /// ID du conducteur associé (optionnel, uniquement pour les utilisateurs avec le rôle Driver)
    /// </summary>
    public Guid? DriverId { get; set; }

    /// <summary>
    /// Indique si le compte est actif dès sa création
    /// </summary>
    public bool IsActive { get; set; } = true;
}
