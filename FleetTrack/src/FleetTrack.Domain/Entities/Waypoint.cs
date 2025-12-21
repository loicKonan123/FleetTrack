using FleetTrack.Domain.Enums;

namespace FleetTrack.Domain.Entities;

public class Waypoint : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public WaypointType Type { get; set; }
    public int Order { get; set; }
    public DateTime? PlannedArrivalTime { get; set; }
    public DateTime? ActualArrivalTime { get; set; }
    public DateTime? PlannedDepartureTime { get; set; }
    public DateTime? ActualDepartureTime { get; set; }
    public bool IsCompleted { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public Guid MissionId { get; set; }
    public Mission Mission { get; set; } = null!;
}
