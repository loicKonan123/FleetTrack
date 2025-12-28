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

    // Informations véhicule
    public string? VehiclePlateNumber { get; set; }
    public string? VehicleType { get; set; }
    public string? VehicleBrand { get; set; }
    public string? VehicleModel { get; set; }

    // Informations conducteur
    public string? DriverName { get; set; }
    public string? DriverPhone { get; set; }

    // Mission
    public Guid? CurrentMissionId { get; set; }
}
