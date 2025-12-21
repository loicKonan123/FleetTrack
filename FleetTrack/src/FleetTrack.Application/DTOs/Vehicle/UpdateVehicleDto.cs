using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Vehicle;

public class UpdateVehicleDto
{
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public VehicleStatus Status { get; set; }
    public double CurrentFuelLevel { get; set; }
    public int Mileage { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }
}
