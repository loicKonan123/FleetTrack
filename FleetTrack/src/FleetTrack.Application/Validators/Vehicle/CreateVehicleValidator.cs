using FleetTrack.Application.DTOs.Vehicle;
using FluentValidation;

namespace FleetTrack.Application.Validators.Vehicle;

public class CreateVehicleValidator : AbstractValidator<CreateVehicleDto>
{
    public CreateVehicleValidator()
    {
        RuleFor(x => x.RegistrationNumber)
            .NotEmpty().WithMessage("Le numéro d'immatriculation est requis")
            .MaximumLength(20).WithMessage("Le numéro d'immatriculation ne peut pas dépasser 20 caractères");

        RuleFor(x => x.Brand)
            .NotEmpty().WithMessage("La marque est requise")
            .MaximumLength(100).WithMessage("La marque ne peut pas dépasser 100 caractères");

        RuleFor(x => x.Model)
            .NotEmpty().WithMessage("Le modèle est requis")
            .MaximumLength(100).WithMessage("Le modèle ne peut pas dépasser 100 caractères");

        RuleFor(x => x.Year)
            .GreaterThan(1900).WithMessage("L'année doit être supérieure à 1900")
            .LessThanOrEqualTo(DateTime.UtcNow.Year + 1).WithMessage("L'année ne peut pas être dans le futur");

        RuleFor(x => x.FuelCapacity)
            .GreaterThan(0).WithMessage("La capacité de carburant doit être supérieure à 0");

        RuleFor(x => x.CurrentFuelLevel)
            .GreaterThanOrEqualTo(0).WithMessage("Le niveau de carburant ne peut pas être négatif")
            .LessThanOrEqualTo(x => x.FuelCapacity).WithMessage("Le niveau de carburant ne peut pas dépasser la capacité");

        RuleFor(x => x.Mileage)
            .GreaterThanOrEqualTo(0).WithMessage("Le kilométrage ne peut pas être négatif");
    }
}
