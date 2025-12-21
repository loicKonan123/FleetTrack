using FleetTrack.Application.DTOs.Waypoint;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.DTOs.Mission;

public class CreateMissionDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MissionPriority Priority { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public double EstimatedDistance { get; set; }
    public Guid VehicleId { get; set; }
    public Guid DriverId { get; set; }
    public List<CreateWaypointDto> Waypoints { get; set; } = new();
}
