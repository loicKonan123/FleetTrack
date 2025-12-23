using FleetTrack.Application.DTOs.Tracking;

namespace FleetTrack.API.Hubs;

/// <summary>
/// Interface définissant les méthodes que les clients SignalR peuvent recevoir
/// </summary>
public interface IGpsClient
{
    Task ReceiveGpsPosition(GpsPositionUpdateDto position);
    Task ReceiveTrackingEvent(TrackingEventDto trackingEvent);
    Task SubscriptionConfirmed(Guid vehicleId);
    Task UnsubscriptionConfirmed(Guid vehicleId);
    Task SubscribedToAllVehicles();
    Task UnsubscribedFromAllVehicles();
}
