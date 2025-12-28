using FleetTrack.Application.DTOs.Tracking;
using FleetTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrackingSessionsController : ControllerBase
{
    private readonly ITrackingSessionService _sessionService;
    private readonly ILogger<TrackingSessionsController> _logger;

    public TrackingSessionsController(
        ITrackingSessionService sessionService,
        ILogger<TrackingSessionsController> logger)
    {
        _sessionService = sessionService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère toutes les sessions de tracking actives
    /// </summary>
    [HttpGet("active")]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<IEnumerable<ActiveTrackingSessionDto>>> GetActiveSessions()
    {
        var sessions = await _sessionService.GetActiveSessionsAsync();
        return Ok(sessions);
    }

    /// <summary>
    /// Récupère une session par son ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TrackingSessionDto>> GetById(Guid id)
    {
        var session = await _sessionService.GetByIdAsync(id);
        if (session == null)
        {
            return NotFound();
        }
        return Ok(session);
    }

    /// <summary>
    /// Récupère la session active d'un véhicule
    /// </summary>
    [HttpGet("vehicle/{vehicleId}/active")]
    public async Task<ActionResult<TrackingSessionDto>> GetActiveByVehicle(Guid vehicleId)
    {
        var session = await _sessionService.GetActiveSessionByVehicleAsync(vehicleId);
        if (session == null)
        {
            return NotFound(new { message = "Aucune session active pour ce véhicule" });
        }
        return Ok(session);
    }

    /// <summary>
    /// Récupère l'historique des sessions d'un véhicule
    /// </summary>
    [HttpGet("vehicle/{vehicleId}/history")]
    public async Task<ActionResult<IEnumerable<TrackingSessionDto>>> GetVehicleHistory(
        Guid vehicleId,
        [FromQuery] int limit = 10)
    {
        var sessions = await _sessionService.GetVehicleSessionHistoryAsync(vehicleId, limit);
        return Ok(sessions);
    }

    /// <summary>
    /// Démarre une nouvelle session de tracking (appelé par le conducteur)
    /// </summary>
    [HttpPost("start")]
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task<ActionResult<TrackingSessionStartedDto>> StartSession([FromBody] StartTrackingSessionDto dto)
    {
        try
        {
            var result = await _sessionService.StartSessionAsync(dto);
            _logger.LogInformation("Session de tracking démarrée: {SessionId} pour véhicule {VehicleId}",
                result.SessionId, dto.VehicleId);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Arrête une session de tracking spécifique
    /// </summary>
    [HttpPost("{id}/stop")]
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task<ActionResult> StopSession(Guid id)
    {
        var success = await _sessionService.StopSessionAsync(id);
        if (!success)
        {
            return NotFound(new { message = "Session non trouvée" });
        }

        _logger.LogInformation("Session de tracking arrêtée: {SessionId}", id);
        return Ok(new { message = "Session arrêtée" });
    }

    /// <summary>
    /// Arrête toutes les sessions actives d'un véhicule (appelé par l'admin)
    /// </summary>
    [HttpPost("vehicle/{vehicleId}/stop")]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult> StopVehicleSessions(Guid vehicleId)
    {
        var success = await _sessionService.StopVehicleSessionsAsync(vehicleId);
        if (!success)
        {
            return NotFound(new { message = "Aucune session active pour ce véhicule" });
        }

        _logger.LogInformation("Sessions de tracking arrêtées pour véhicule: {VehicleId}", vehicleId);
        return Ok(new { message = "Sessions arrêtées" });
    }
}
