using FleetTrack.Application.DTOs.Tracking;

namespace FleetTrack.API.Hubs;

/// <summary>
/// Interface définissant les méthodes que les clients SignalR peuvent recevoir
/// </summary>
public interface IGpsClient
{
    // Position GPS
    Task ReceiveGpsPosition(GpsPositionUpdateDto position);
    Task ReceiveTrackingEvent(TrackingEventDto trackingEvent);

    // Subscriptions
    Task SubscriptionConfirmed(Guid vehicleId);
    Task UnsubscriptionConfirmed(Guid vehicleId);
    Task SubscribedToAllVehicles();
    Task UnsubscribedFromAllVehicles();

    // Sessions de tracking
    Task SessionStarted(TrackingSessionStartedDto session);
    Task SessionStopped(Guid sessionId, Guid vehicleId);
    Task SessionUpdated(ActiveTrackingSessionDto session);

    // Notifications admin -> conducteur
    Task StopTrackingRequested(Guid vehicleId, string? reason);
}
