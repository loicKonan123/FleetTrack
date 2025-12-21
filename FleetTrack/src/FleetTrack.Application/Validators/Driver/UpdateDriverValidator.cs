using FleetTrack.Application.DTOs.Driver;
using FluentValidation;

namespace FleetTrack.Application.Validators.Driver;

public class UpdateDriverValidator : AbstractValidator<UpdateDriverDto>
{
    public UpdateDriverValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Le prénom est requis")
            .MaximumLength(100).WithMessage("Le prénom ne peut pas dépasser 100 caractères");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Le nom est requis")
            .MaximumLength(100).WithMessage("Le nom ne peut pas dépasser 100 caractères");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("L'email est requis")
            .EmailAddress().WithMessage("L'email n'est pas valide")
            .MaximumLength(255).WithMessage("L'email ne peut pas dépasser 255 caractères");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Le numéro de téléphone est requis")
            .MaximumLength(20).WithMessage("Le numéro de téléphone ne peut pas dépasser 20 caractères");

        RuleFor(x => x.LicenseExpiryDate)
            .NotEmpty().WithMessage("La date d'expiration du permis est requise");
    }
}
