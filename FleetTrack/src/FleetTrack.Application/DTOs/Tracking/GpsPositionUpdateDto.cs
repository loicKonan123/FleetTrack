namespace FleetTrack.Application.DTOs.Tracking;

/// <summary>
/// DTO pour les mises à jour de position GPS en temps réel
/// </summary>
public class GpsPositionUpdateDto
{
    public Guid VehicleId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? Speed { get; set; }
    public double? Heading { get; set; }
    public double? Altitude { get; set; }
    public double? Accuracy { get; set; }
    public DateTime Timestamp { get; set; }

    // Informations additionnelles optionnelles
    public string? VehiclePlateNumber { get; set; }
    public string? VehicleType { get; set; }
    public string? DriverName { get; set; }
    public Guid? CurrentMissionId { get; set; }
}
