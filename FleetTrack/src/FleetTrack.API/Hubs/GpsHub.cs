using System.Security.Claims;
using FleetTrack.Application.DTOs.Tracking;
using FleetTrack.Application.Interfaces;
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
    private readonly ITrackingSessionService _sessionService;

    // Subscriptions des clients (pour l'écoute des positions)
    private static readonly Dictionary<string, HashSet<Guid>> UserVehicleSubscriptions = new();
    private static readonly Dictionary<Guid, HashSet<string>> VehicleSubscribers = new();

    // Sessions de tracking actives (conducteurs)
    private static readonly Dictionary<string, Guid> DriverSessions = new(); // ConnectionId -> SessionId
    private static readonly Dictionary<Guid, string> SessionConnections = new(); // SessionId -> ConnectionId

    private static readonly object LockObject = new();

    public GpsHub(ILogger<GpsHub> logger, ITrackingSessionService sessionService)
    {
        _logger = logger;
        _sessionService = sessionService;
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

        // Ne PAS arrêter automatiquement la session de tracking à la déconnexion
        // Les sessions restent actives et peuvent être reprises ou arrêtées manuellement
        // Cela permet de gérer les déconnexions temporaires (changement de page, perte réseau)
        lock (LockObject)
        {
            if (DriverSessions.TryGetValue(Context.ConnectionId, out var sid))
            {
                // Nettoyer seulement les références de connexion, pas la session en BD
                DriverSessions.Remove(Context.ConnectionId);
                SessionConnections.Remove(sid);
                _logger.LogInformation("Connexion nettoyée pour session {SessionId} (session reste active)", sid);
            }
        }

        // Nettoyer les abonnements du client
        lock (LockObject)
        {
            if (UserVehicleSubscriptions.TryGetValue(Context.ConnectionId, out var vehicles))
            {
                foreach (var vid in vehicles)
                {
                    if (VehicleSubscribers.TryGetValue(vid, out var subscribers))
                    {
                        subscribers.Remove(Context.ConnectionId);
                        if (subscribers.Count == 0)
                        {
                            VehicleSubscribers.Remove(vid);
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

        _logger.LogInformation("📡 SubscribeToAllVehicles: Client {ConnectionId} (User: {Username}) s'abonne à tous les véhicules",
            Context.ConnectionId, username);

        await Groups.AddToGroupAsync(Context.ConnectionId, "all_vehicles");

        _logger.LogInformation("📡 Client {ConnectionId} ajouté au groupe all_vehicles", Context.ConnectionId);

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

        _logger.LogInformation("📍 Position GPS reçue: Vehicle={VehicleId}, Lat={Lat}, Lng={Lng}, User={Username}",
            position.VehicleId, position.Latitude, position.Longitude, username);

        // Mettre à jour la session dans la base de données
        Guid? sessionId = null;
        lock (LockObject)
        {
            DriverSessions.TryGetValue(Context.ConnectionId, out var sid);
            sessionId = sid == Guid.Empty ? null : sid;
            _logger.LogInformation("📍 Session lookup: ConnectionId={ConnectionId}, SessionId={SessionId}",
                Context.ConnectionId, sessionId);
        }

        if (sessionId.HasValue)
        {
            await _sessionService.UpdatePositionAsync(sessionId.Value, position);
            _logger.LogInformation("📍 Position saved to session {SessionId}", sessionId.Value);
        }
        else
        {
            _logger.LogWarning("📍 No session found for connection, position not saved to DB");
        }

        // Diffuser la position aux clients abonnés à ce véhicule
        _logger.LogInformation("📍 Broadcasting to vehicle_{VehicleId} and all_vehicles groups", position.VehicleId);
        await Clients.Group($"vehicle_{position.VehicleId}")
            .ReceiveGpsPosition(position);

        // Diffuser aussi à ceux abonnés à tous les véhicules
        await Clients.Group("all_vehicles")
            .ReceiveGpsPosition(position);

        _logger.LogInformation("📍 Broadcast complete");
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

    /// <summary>
    /// Démarre une session de tracking (appelé par un conducteur)
    /// </summary>
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task StartTrackingSession(StartTrackingSessionDto dto)
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Démarrage session de tracking pour véhicule {VehicleId} par {Username}",
            dto.VehicleId, username);

        try
        {
            // Créer la session en base de données
            var result = await _sessionService.StartSessionAsync(dto);

            // Enregistrer la connexion
            lock (LockObject)
            {
                // Si le conducteur avait une session précédente, la nettoyer
                if (DriverSessions.TryGetValue(Context.ConnectionId, out var oldSessionId))
                {
                    SessionConnections.Remove(oldSessionId);
                }

                DriverSessions[Context.ConnectionId] = result.SessionId;
                SessionConnections[result.SessionId] = Context.ConnectionId;
            }

            // Ajouter au groupe du véhicule
            await Groups.AddToGroupAsync(Context.ConnectionId, $"driver_{dto.VehicleId}");

            // Notifier le conducteur
            await Clients.Caller.SessionStarted(result);

            // Notifier les admins/dispatchers
            var activeSessions = await _sessionService.GetActiveSessionsAsync();
            var activeSession = activeSessions.FirstOrDefault(s => s.SessionId == result.SessionId);
            if (activeSession != null)
            {
                await Clients.Group("all_vehicles").SessionUpdated(activeSession);
            }

            _logger.LogInformation("Session {SessionId} démarrée pour véhicule {VehicleId}",
                result.SessionId, dto.VehicleId);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Erreur démarrage session: {Error}", ex.Message);
            throw new HubException(ex.Message);
        }
    }

    /// <summary>
    /// Arrête la session de tracking du conducteur actuel
    /// </summary>
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task StopTrackingSession()
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        Guid? sessionId = null;
        lock (LockObject)
        {
            if (DriverSessions.TryGetValue(Context.ConnectionId, out var sid))
            {
                sessionId = sid;
                DriverSessions.Remove(Context.ConnectionId);
                SessionConnections.Remove(sid);
            }
        }

        if (!sessionId.HasValue)
        {
            _logger.LogWarning("Aucune session active pour {Username}", username);
            return;
        }

        var session = await _sessionService.GetByIdAsync(sessionId.Value);
        if (session != null)
        {
            await _sessionService.StopSessionAsync(sessionId.Value);

            // Quitter le groupe du véhicule
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"driver_{session.VehicleId}");

            // Notifier les admins/dispatchers
            await Clients.Group("all_vehicles").SessionStopped(sessionId.Value, session.VehicleId);

            _logger.LogInformation("Session {SessionId} arrêtée par {Username}", sessionId.Value, username);
        }
    }

    /// <summary>
    /// Force l'arrêt du tracking d'un véhicule (appelé par admin/dispatcher)
    /// </summary>
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task ForceStopVehicleTracking(Guid vehicleId, string? reason = null)
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Arrêt forcé du tracking pour véhicule {VehicleId} par {Username}, raison: {Reason}",
            vehicleId, username, reason ?? "Non spécifiée");

        // Trouver et arrêter les sessions actives pour ce véhicule
        var stopped = await _sessionService.StopVehicleSessionsAsync(vehicleId);

        if (stopped)
        {
            // Trouver le conducteur connecté pour ce véhicule et le notifier
            string? driverConnectionId = null;
            Guid? sessionId = null;

            lock (LockObject)
            {
                foreach (var kvp in SessionConnections)
                {
                    // Chercher la session qui correspond à ce véhicule
                    if (DriverSessions.TryGetValue(kvp.Value, out var sid))
                    {
                        // On doit vérifier si cette session est pour le bon véhicule
                        // Pour simplifier, on va stocker l'info différemment
                        driverConnectionId = kvp.Value;
                        sessionId = kvp.Key;
                        break;
                    }
                }

                // Nettoyer les dictionnaires
                if (sessionId.HasValue && driverConnectionId != null)
                {
                    DriverSessions.Remove(driverConnectionId);
                    SessionConnections.Remove(sessionId.Value);
                }
            }

            // Notifier le conducteur s'il est connecté
            await Clients.Group($"driver_{vehicleId}").StopTrackingRequested(vehicleId, reason);

            // Notifier tous les admins/dispatchers
            if (sessionId.HasValue)
            {
                await Clients.Group("all_vehicles").SessionStopped(sessionId.Value, vehicleId);
            }
        }
    }

    /// <summary>
    /// Récupère les sessions actives (pour les admins/dispatchers)
    /// </summary>
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<IEnumerable<ActiveTrackingSessionDto>> GetActiveSessions()
    {
        return await _sessionService.GetActiveSessionsAsync();
    }
}
