using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Vehicle;

public class VehicleDetailsDto
{
    public Guid Id { get; set; }
    public string RegistrationNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public VehicleType Type { get; set; }
    public VehicleStatus Status { get; set; }
    public FuelType FuelType { get; set; }
    public double FuelCapacity { get; set; }
    public double CurrentFuelLevel { get; set; }
    public int Mileage { get; set; }
    public DateTime? LastMaintenanceDate { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }

    // Relations
    public CurrentDriverDto? CurrentDriver { get; set; }
    public List<MissionSummaryDto> ActiveMissions { get; set; } = new();
    public List<AlertSummaryDto> UnresolvedAlerts { get; set; } = new();
}

public class CurrentDriverDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}

public class MissionSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public MissionStatus Status { get; set; }
    public DateTime StartDate { get; set; }
}

public class AlertSummaryDto
{
    public Guid Id { get; set; }
    public AlertType Type { get; set; }
    public AlertSeverity Severity { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime TriggeredAt { get; set; }
}
