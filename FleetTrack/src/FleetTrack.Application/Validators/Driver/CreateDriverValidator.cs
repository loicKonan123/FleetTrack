using FleetTrack.Application.DTOs.Driver;
using FluentValidation;

namespace FleetTrack.Application.Validators.Driver;

public class CreateDriverValidator : AbstractValidator<CreateDriverDto>
{
    public CreateDriverValidator()
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
            .MaximumLength(20).WithMessage("Le numéro de téléphone ne peut pas dépasser 20 caractères")
            .Matches(@"^[\d\s\+\-\(\)]+$").WithMessage("Le numéro de téléphone n'est pas valide");

        RuleFor(x => x.LicenseNumber)
            .NotEmpty().WithMessage("Le numéro de permis est requis")
            .MaximumLength(50).WithMessage("Le numéro de permis ne peut pas dépasser 50 caractères");

        RuleFor(x => x.LicenseExpiryDate)
            .NotEmpty().WithMessage("La date d'expiration du permis est requise")
            .GreaterThan(DateTime.UtcNow.Date).WithMessage("Le permis ne peut pas être expiré");
    }
}
