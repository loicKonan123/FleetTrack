using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Mission;

public class MissionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MissionStatus Status { get; set; }
    public MissionPriority Priority { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public double EstimatedDistance { get; set; }
    public double? ActualDistance { get; set; }
    public Guid VehicleId { get; set; }
    public string VehicleRegistration { get; set; } = string.Empty;
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
}
