using System.ComponentModel.DataAnnotations;

namespace FleetTrack.Application.DTOs.User;

/// <summary>
/// DTO pour le changement de mot de passe
/// </summary>
public class ChangePasswordDto
{
    [Required(ErrorMessage = "L'ancien mot de passe est requis")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nouveau mot de passe est requis")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Le mot de passe doit contenir au moins 8 caractères")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "La confirmation du mot de passe est requise")]
    [Compare("NewPassword", ErrorMessage = "Les mots de passe ne correspondent pas")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

/// <summary>
/// DTO pour la réinitialisation du mot de passe par un admin
/// </summary>
public class ResetPasswordDto
{
    [Required(ErrorMessage = "Le nouveau mot de passe est requis")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Le mot de passe doit contenir au moins 8 caractères")]
    public string NewPassword { get; set; } = string.Empty;
}
