using FleetTrack.Application.DTOs.Tracking;

namespace FleetTrack.Application.Interfaces;

/// <summary>
/// Service pour la gestion du tracking GPS
/// </summary>
public interface IGpsTrackingService
{
    /// <summary>
    /// Obtenir le statut de tracking de tous les véhicules
    /// </summary>
    Task<List<VehicleTrackingStatusDto>> GetAllVehicleTrackingStatusAsync();

    /// <summary>
    /// Obtenir le statut de tracking d'un véhicule spécifique
    /// </summary>
    Task<VehicleTrackingStatusDto?> GetVehicleTrackingStatusAsync(Guid vehicleId);

    /// <summary>
    /// Créer un DTO de position GPS à partir d'une position enregistrée
    /// </summary>
    Task<GpsPositionUpdateDto?> CreateGpsPositionUpdateDtoAsync(Guid positionId);
}
