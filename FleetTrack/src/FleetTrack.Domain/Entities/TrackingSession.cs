namespace FleetTrack.Domain.Entities;

/// <summary>
/// Représente une session de tracking GPS active ou terminée
/// </summary>
public class TrackingSession : BaseEntity
{
    public Guid VehicleId { get; set; }
    public virtual Vehicle Vehicle { get; set; } = null!;

    public Guid? DriverId { get; set; }
    public virtual Driver? Driver { get; set; }

    /// <summary>
    /// Nom du conducteur (peut être différent du Driver si non authentifié)
    /// </summary>
    public string? DriverName { get; set; }

    /// <summary>
    /// Téléphone du conducteur
    /// </summary>
    public string? DriverPhone { get; set; }

    /// <summary>
    /// Date/heure de début de la session
    /// </summary>
    public DateTime StartedAt { get; set; }

    /// <summary>
    /// Date/heure de fin de la session (null si active)
    /// </summary>
    public DateTime? EndedAt { get; set; }

    /// <summary>
    /// La session est-elle active ?
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Dernière position connue - Latitude
    /// </summary>
    public double? LastLatitude { get; set; }

    /// <summary>
    /// Dernière position connue - Longitude
    /// </summary>
    public double? LastLongitude { get; set; }

    /// <summary>
    /// Dernière vitesse connue (km/h)
    /// </summary>
    public double? LastSpeed { get; set; }

    /// <summary>
    /// Dernière direction connue (degrés)
    /// </summary>
    public double? LastHeading { get; set; }

    /// <summary>
    /// Dernière mise à jour de position
    /// </summary>
    public DateTime? LastPositionAt { get; set; }

    /// <summary>
    /// Nombre total de positions reçues
    /// </summary>
    public int PositionsCount { get; set; }

    /// <summary>
    /// Distance totale parcourue (en mètres)
    /// </summary>
    public double TotalDistance { get; set; }

    /// <summary>
    /// Mission associée (optionnel)
    /// </summary>
    public Guid? MissionId { get; set; }
    public virtual Mission? Mission { get; set; }

    /// <summary>
    /// Positions GPS enregistrées pendant cette session
    /// </summary>
    public virtual ICollection<GpsPosition> Positions { get; set; } = new List<GpsPosition>();
}
