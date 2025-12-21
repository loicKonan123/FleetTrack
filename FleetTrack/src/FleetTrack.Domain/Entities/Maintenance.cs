using FleetTrack.Domain.Enums;

namespace FleetTrack.Domain.Entities;

public class Maintenance : BaseEntity
{
    public MaintenanceType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public int MileageAtMaintenance { get; set; }
    public decimal Cost { get; set; }
    public string? ServiceProvider { get; set; }
    public string? Notes { get; set; }
    public bool IsCompleted { get; set; }

    // Navigation properties
    public Guid VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;
}
