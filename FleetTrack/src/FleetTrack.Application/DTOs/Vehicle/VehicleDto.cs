using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Vehicle;

public class VehicleDto
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
    public Guid? CurrentDriverId { get; set; }
    public string? CurrentDriverName { get; set; }
}
