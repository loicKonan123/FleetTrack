namespace FleetTrack.Application.DTOs.Tracking;

/// <summary>
/// DTO pour les événements de tracking (connexion, déconnexion, etc.)
/// </summary>
public class TrackingEventDto
{
    public string EventType { get; set; } = string.Empty; // "VehicleConnected", "VehicleDisconnected", "VehicleMoving", "VehicleStopped"
    public Guid VehicleId { get; set; }
    public string? VehiclePlateNumber { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Message { get; set; }
    public Dictionary<string, object>? AdditionalData { get; set; }
}

/// <summary>
/// Types d'événements de tracking
/// </summary>
public static class TrackingEventTypes
{
    public const string VehicleConnected = "VehicleConnected";
    public const string VehicleDisconnected = "VehicleDisconnected";
    public const string VehicleMoving = "VehicleMoving";
    public const string VehicleStopped = "VehicleStopped";
    public const string SpeedLimitExceeded = "SpeedLimitExceeded";
    public const string GeofenceEntered = "GeofenceEntered";
    public const string GeofenceExited = "GeofenceExited";
}
