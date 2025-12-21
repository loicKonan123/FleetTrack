using FleetTrack.Domain.Enums;

namespace FleetTrack.Domain.Entities;

public class Mission : BaseEntity
{
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

    // Navigation properties
    public Guid VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;
    public Guid DriverId { get; set; }
    public Driver Driver { get; set; } = null!;
    public ICollection<Waypoint> Waypoints { get; set; } = new List<Waypoint>();
}
