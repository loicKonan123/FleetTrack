using System.Security.Claims;
using FleetTrack.Application.DTOs.Tracking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FleetTrack.API.Hubs;

/// <summary>
/// Hub SignalR pour le tracking GPS en temps réel
/// </summary>
[Authorize]
public class GpsHub : Hub<IGpsClient>
{
    private readonly ILogger<GpsHub> _logger;
    private static readonly Dictionary<string, HashSet<Guid>> UserVehicleSubscriptions = new();
    private static readonly Dictionary<Guid, HashSet<string>> VehicleSubscribers = new();
    private static readonly object LockObject = new();

    public GpsHub(ILogger<GpsHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Appelé lorsqu'un client se connecte au hub
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Client connecté au GpsHub: {ConnectionId}, User: {Username}",
            Context.ConnectionId, username);

        // Ajouter le client au groupe "all" pour les broadcasts globaux
        await Groups.AddToGroupAsync(Context.ConnectionId, "all");

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Appelé lorsqu'un client se déconnecte du hub
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Client déconnecté du GpsHub: {ConnectionId}, User: {Username}",
            Context.ConnectionId, username);

        // Nettoyer les abonnements du client
        lock (LockObject)
        {
            if (UserVehicleSubscriptions.TryGetValue(Context.ConnectionId, out var vehicles))
            {
                foreach (var vehicleId in vehicles)
                {
                    if (VehicleSubscribers.TryGetValue(vehicleId, out var subscribers))
                    {
                        subscribers.Remove(Context.ConnectionId);
                        if (subscribers.Count == 0)
                        {
                            VehicleSubscribers.Remove(vehicleId);
                        }
                    }
                }
                UserVehicleSubscriptions.Remove(Context.ConnectionId);
            }
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "all");
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// S'abonner au tracking d'un véhicule spécifique
    /// </summary>
    public async Task SubscribeToVehicle(Guid vehicleId)
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Client {ConnectionId} (User: {Username}) s'abonne au véhicule {VehicleId}",
            Context.ConnectionId, username, vehicleId);

        lock (LockObject)
        {
            if (!UserVehicleSubscriptions.ContainsKey(Context.ConnectionId))
            {
                UserVehicleSubscriptions[Context.ConnectionId] = new HashSet<Guid>();
            }
            UserVehicleSubscriptions[Context.ConnectionId].Add(vehicleId);

            if (!VehicleSubscribers.ContainsKey(vehicleId))
            {
                VehicleSubscribers[vehicleId] = new HashSet<string>();
            }
            VehicleSubscribers[vehicleId].Add(Context.ConnectionId);
        }

        // Ajouter au groupe SignalR pour ce véhicule
        await Groups.AddToGroupAsync(Context.ConnectionId, $"vehicle_{vehicleId}");

        await Clients.Caller.SubscriptionConfirmed(vehicleId);
    }

    /// <summary>
    /// Se désabonner du tracking d'un véhicule spécifique
    /// </summary>
    public async Task UnsubscribeFromVehicle(Guid vehicleId)
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Client {ConnectionId} (User: {Username}) se désabonne du véhicule {VehicleId}",
            Context.ConnectionId, username, vehicleId);

        lock (LockObject)
        {
            if (UserVehicleSubscriptions.TryGetValue(Context.ConnectionId, out var vehicles))
            {
                vehicles.Remove(vehicleId);
            }

            if (VehicleSubscribers.TryGetValue(vehicleId, out var subscribers))
            {
                subscribers.Remove(Context.ConnectionId);
                if (subscribers.Count == 0)
                {
                    VehicleSubscribers.Remove(vehicleId);
                }
            }
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"vehicle_{vehicleId}");

        await Clients.Caller.UnsubscriptionConfirmed(vehicleId);
    }

    /// <summary>
    /// S'abonner à tous les véhicules
    /// </summary>
    public async Task SubscribeToAllVehicles()
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Client {ConnectionId} (User: {Username}) s'abonne à tous les véhicules",
            Context.ConnectionId, username);

        await Groups.AddToGroupAsync(Context.ConnectionId, "all_vehicles");

        await Clients.Caller.SubscribedToAllVehicles();
    }

    /// <summary>
    /// Se désabonner de tous les véhicules
    /// </summary>
    public async Task UnsubscribeFromAllVehicles()
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Client {ConnectionId} (User: {Username}) se désabonne de tous les véhicules",
            Context.ConnectionId, username);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "all_vehicles");

        await Clients.Caller.UnsubscribedFromAllVehicles();
    }

    /// <summary>
    /// Obtenir la liste des véhicules actuellement suivis par ce client
    /// </summary>
    public Task<List<Guid>> GetSubscribedVehicles()
    {
        lock (LockObject)
        {
            if (UserVehicleSubscriptions.TryGetValue(Context.ConnectionId, out var vehicles))
            {
                return Task.FromResult(vehicles.ToList());
            }
            return Task.FromResult(new List<Guid>());
        }
    }

    /// <summary>
    /// Recevoir une position GPS d'un véhicule (appelé par les conducteurs/dispositifs GPS)
    /// </summary>
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task SendGpsPosition(GpsPositionUpdateDto position)
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Position GPS reçue pour le véhicule {VehicleId} de {Username}",
            position.VehicleId, username);

        // Diffuser la position aux clients abonnés à ce véhicule
        await Clients.Group($"vehicle_{position.VehicleId}")
            .ReceiveGpsPosition(position);

        // Diffuser aussi à ceux abonnés à tous les véhicules
        await Clients.Group("all_vehicles")
            .ReceiveGpsPosition(position);
    }

    /// <summary>
    /// Envoyer un événement de tracking
    /// </summary>
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task SendTrackingEvent(TrackingEventDto trackingEvent)
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Événement de tracking reçu: {EventType} pour le véhicule {VehicleId}",
            trackingEvent.EventType, trackingEvent.VehicleId);

        // Diffuser l'événement
        await Clients.Group($"vehicle_{trackingEvent.VehicleId}")
            .ReceiveTrackingEvent(trackingEvent);

        await Clients.Group("all_vehicles")
            .ReceiveTrackingEvent(trackingEvent);
    }
}
