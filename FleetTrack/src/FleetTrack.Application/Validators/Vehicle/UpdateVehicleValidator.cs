using FleetTrack.Application.DTOs.Vehicle;
using FluentValidation;

namespace FleetTrack.Application.Validators.Vehicle;

public class UpdateVehicleValidator : AbstractValidator<UpdateVehicleDto>
{
    public UpdateVehicleValidator()
    {
        RuleFor(x => x.Brand)
            .NotEmpty().WithMessage("La marque est requise")
            .MaximumLength(100).WithMessage("La marque ne peut pas dépasser 100 caractères");

        RuleFor(x => x.Model)
            .NotEmpty().WithMessage("Le modèle est requis")
            .MaximumLength(100).WithMessage("Le modèle ne peut pas dépasser 100 caractères");

        RuleFor(x => x.CurrentFuelLevel)
            .GreaterThanOrEqualTo(0).WithMessage("Le niveau de carburant ne peut pas être négatif");

        RuleFor(x => x.Mileage)
            .GreaterThanOrEqualTo(0).WithMessage("Le kilométrage ne peut pas être négatif");
    }
}
