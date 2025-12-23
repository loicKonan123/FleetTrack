namespace FleetTrack.Application.DTOs.Tracking;

/// <summary>
/// DTO pour le statut de tracking d'un véhicule
/// </summary>
public class VehicleTrackingStatusDto
{
    public Guid VehicleId { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public bool IsTracking { get; set; }
    public DateTime? LastPositionTime { get; set; }
    public double? LastLatitude { get; set; }
    public double? LastLongitude { get; set; }
    public double? LastSpeed { get; set; }
    public string? CurrentDriverName { get; set; }
    public Guid? CurrentMissionId { get; set; }
    public string? MissionStatus { get; set; }
}
