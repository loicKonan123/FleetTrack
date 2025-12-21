using FleetTrack.Application.DTOs.Mission;
using FluentValidation;

namespace FleetTrack.Application.Validators.Mission;

public class CreateMissionValidator : AbstractValidator<CreateMissionDto>
{
    public CreateMissionValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Le nom de la mission est requis")
            .MaximumLength(200).WithMessage("Le nom ne peut pas dépasser 200 caractères");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("La description ne peut pas dépasser 1000 caractères");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("La date de début est requise");

        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate)
            .When(x => x.EndDate.HasValue)
            .WithMessage("La date de fin doit être après la date de début");

        RuleFor(x => x.EstimatedDistance)
            .GreaterThan(0).WithMessage("La distance estimée doit être supérieure à 0");

        RuleFor(x => x.VehicleId)
            .NotEmpty().WithMessage("Un véhicule doit être assigné");

        RuleFor(x => x.DriverId)
            .NotEmpty().WithMessage("Un conducteur doit être assigné");

        RuleFor(x => x.Waypoints)
            .NotEmpty().WithMessage("Au moins un waypoint est requis")
            .Must(w => w.Count >= 2).WithMessage("Une mission doit avoir au moins 2 waypoints (départ et arrivée)");
    }
}
