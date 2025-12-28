namespace FleetTrack.Application.DTOs.Tracking;

/// <summary>
/// DTO pour afficher une session de tracking
/// </summary>
public class TrackingSessionDto
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public string? VehiclePlateNumber { get; set; }
    public string? VehicleBrand { get; set; }
    public string? VehicleModel { get; set; }

    public Guid? DriverId { get; set; }
    public string? DriverName { get; set; }
    public string? DriverPhone { get; set; }

    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public bool IsActive { get; set; }

    public double? LastLatitude { get; set; }
    public double? LastLongitude { get; set; }
    public double? LastSpeed { get; set; }
    public double? LastHeading { get; set; }
    public DateTime? LastPositionAt { get; set; }

    public int PositionsCount { get; set; }
    public double TotalDistance { get; set; }

    public Guid? MissionId { get; set; }
}

/// <summary>
/// DTO pour démarrer une session de tracking
/// </summary>
public class StartTrackingSessionDto
{
    public Guid VehicleId { get; set; }
    public string? DriverName { get; set; }
    public string? DriverPhone { get; set; }
    public Guid? MissionId { get; set; }
}

/// <summary>
/// DTO pour la réponse de démarrage de session
/// </summary>
public class TrackingSessionStartedDto
{
    public Guid SessionId { get; set; }
    public Guid VehicleId { get; set; }
    public DateTime StartedAt { get; set; }
    public string Message { get; set; } = "Session de tracking démarrée";
}

/// <summary>
/// DTO pour arrêter une session de tracking
/// </summary>
public class StopTrackingSessionDto
{
    public Guid SessionId { get; set; }
}

/// <summary>
/// DTO pour la liste des sessions actives (vue admin)
/// </summary>
public class ActiveTrackingSessionDto
{
    public Guid SessionId { get; set; }
    public Guid VehicleId { get; set; }
    public string? VehiclePlateNumber { get; set; }
    public string? VehicleBrand { get; set; }
    public string? VehicleModel { get; set; }
    public string? VehicleType { get; set; }

    public string? DriverName { get; set; }
    public string? DriverPhone { get; set; }

    public DateTime StartedAt { get; set; }
    public DateTime? LastPositionAt { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public double? Speed { get; set; }
    public double? Heading { get; set; }

    public int PositionsCount { get; set; }
    public bool IsActive { get; set; }

    /// <summary>
    /// Mission associée (optionnel)
    /// </summary>
    public Guid? MissionId { get; set; }
    public string? MissionName { get; set; }

    /// <summary>
    /// Durée depuis le démarrage (en secondes)
    /// </summary>
    public double DurationSeconds => (DateTime.UtcNow - StartedAt).TotalSeconds;
}
