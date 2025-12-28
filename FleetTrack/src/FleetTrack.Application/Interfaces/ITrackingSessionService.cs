using FleetTrack.Application.DTOs.Tracking;

namespace FleetTrack.Application.Interfaces;

public interface ITrackingSessionService
{
    /// <summary>
    /// Démarre une nouvelle session de tracking
    /// </summary>
    Task<TrackingSessionStartedDto> StartSessionAsync(StartTrackingSessionDto dto);

    /// <summary>
    /// Arrête une session de tracking
    /// </summary>
    Task<bool> StopSessionAsync(Guid sessionId);

    /// <summary>
    /// Arrête toutes les sessions actives d'un véhicule
    /// </summary>
    Task<bool> StopVehicleSessionsAsync(Guid vehicleId);

    /// <summary>
    /// Met à jour la position d'une session active
    /// </summary>
    Task UpdatePositionAsync(Guid sessionId, GpsPositionUpdateDto position);

    /// <summary>
    /// Récupère une session par son ID
    /// </summary>
    Task<TrackingSessionDto?> GetByIdAsync(Guid sessionId);

    /// <summary>
    /// Récupère la session active d'un véhicule
    /// </summary>
    Task<TrackingSessionDto?> GetActiveSessionByVehicleAsync(Guid vehicleId);

    /// <summary>
    /// Récupère toutes les sessions actives
    /// </summary>
    Task<IEnumerable<ActiveTrackingSessionDto>> GetActiveSessionsAsync();

    /// <summary>
    /// Récupère l'historique des sessions d'un véhicule
    /// </summary>
    Task<IEnumerable<TrackingSessionDto>> GetVehicleSessionHistoryAsync(Guid vehicleId, int limit = 10);

    /// <summary>
    /// Marque les sessions inactives (pas de position depuis X secondes)
    /// </summary>
    Task MarkInactiveSessionsAsync(int timeoutSeconds = 60);
}
