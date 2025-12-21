using FleetTrack.Application.DTOs.Waypoint;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Mission;

public class MissionDetailsDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MissionStatus Status { get; set; }
    public MissionPriority Priority { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public double EstimatedDistance { get; set; }
    public double? ActualDistance { get; set; }

    // Vehicle info
    public Guid VehicleId { get; set; }
    public string VehicleRegistration { get; set; } = string.Empty;
    public string VehicleBrandModel { get; set; } = string.Empty;

    // Driver info
    public Guid DriverId { get; set; }
    public string DriverFullName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;

    // Waypoints
    public List<WaypointDto> Waypoints { get; set; } = new();
}
