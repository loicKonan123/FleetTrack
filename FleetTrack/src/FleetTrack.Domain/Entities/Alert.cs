using FleetTrack.Domain.Enums;

namespace FleetTrack.Domain.Entities;

public class Alert : BaseEntity
{
    public AlertType Type { get; set; }
    public AlertSeverity Severity { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime TriggeredAt { get; set; }
    public bool IsAcknowledged { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public string? AcknowledgedBy { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? Resolution { get; set; }

    // Navigation properties
    public Guid VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;
}
