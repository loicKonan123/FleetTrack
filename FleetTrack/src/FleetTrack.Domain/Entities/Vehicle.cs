using FleetTrack.Domain.Enums;

namespace FleetTrack.Domain.Entities;

public class Vehicle : BaseEntity
{
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

    // Navigation properties
    public Guid? CurrentDriverId { get; set; }
    public Driver? CurrentDriver { get; set; }
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
    public ICollection<GpsPosition> GpsPositions { get; set; } = new List<GpsPosition>();
    public ICollection<Alert> Alerts { get; set; } = new List<Alert>();
    public ICollection<Maintenance> MaintenanceRecords { get; set; } = new List<Maintenance>();
}
