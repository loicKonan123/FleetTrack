using FleetTrack.Application.DTOs.Mission;
using FluentValidation;

namespace FleetTrack.Application.Validators.Mission;

public class AssignMissionValidator : AbstractValidator<AssignMissionDto>
{
    public AssignMissionValidator()
    {
        RuleFor(x => x.VehicleId)
            .NotEmpty().WithMessage("Un véhicule doit être sélectionné");

        RuleFor(x => x.DriverId)
            .NotEmpty().WithMessage("Un conducteur doit être sélectionné");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("La date de début est requise")
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("La date de début ne peut pas être dans le passé");
    }
}
