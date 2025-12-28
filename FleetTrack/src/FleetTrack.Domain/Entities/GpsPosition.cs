namespace FleetTrack.Domain.Entities;

public class GpsPosition : BaseEntity
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? Altitude { get; set; }
    public double? Speed { get; set; }
    public double? Heading { get; set; }
    public DateTime Timestamp { get; set; }
    public double? Accuracy { get; set; }

    // Navigation properties
    public Guid VehicleId { get; set; }
    public virtual Vehicle Vehicle { get; set; } = null!;

    // Lien vers la session de tracking
    public Guid? TrackingSessionId { get; set; }
    public virtual TrackingSession? TrackingSession { get; set; }
}
