using FleetTrack.Application.DTOs.Alert;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.Interfaces;
using FleetTrack.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.API.Controllers;

/// <summary>
/// Contrôleur pour la gestion des alertes
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;
    private readonly ILogger<AlertsController> _logger;

    public AlertsController(IAlertService alertService, ILogger<AlertsController> logger)
    {
        _alertService = alertService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère la liste paginée des alertes
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AlertDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<AlertDto>>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] Guid? vehicleId = null,
        [FromQuery] AlertType? type = null,
        [FromQuery] AlertSeverity? severity = null,
        [FromQuery] bool? isAcknowledged = null,
        [FromQuery] bool? isResolved = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de la liste des alertes");

        var result = await _alertService.GetAllAsync(pageNumber, pageSize, vehicleId, type, severity, isAcknowledged, isResolved, cancellationToken);

        return Ok(new ApiResponse<PagedResult<AlertDto>>
        {
            Success = true,
            Data = result,
            Message = "Liste des alertes récupérée avec succès"
        });
    }

    /// <summary>
    /// Récupère une alerte par son identifiant
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<AlertDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AlertDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AlertDto>>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de l'alerte {AlertId}", id);

        var alert = await _alertService.GetByIdAsync(id, cancellationToken);

        if (alert == null)
        {
            return NotFound(new ApiResponse<AlertDto>
            {
                Success = false,
                Message = $"Alerte avec l'ID {id} introuvable"
            });
        }

        return Ok(new ApiResponse<AlertDto>
        {
            Success = true,
            Data = alert,
            Message = "Alerte récupérée avec succès"
        });
    }

    /// <summary>
    /// Récupère les alertes d'un véhicule
    /// </summary>
    [HttpGet("vehicle/{vehicleId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<AlertDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<AlertDto>>>> GetByVehicle(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des alertes du véhicule {VehicleId}", vehicleId);

        var alerts = await _alertService.GetByVehicleIdAsync(vehicleId, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<AlertDto>>
        {
            Success = true,
            Data = alerts,
            Message = "Alertes du véhicule récupérées avec succès"
        });
    }

    /// <summary>
    /// Récupère les alertes non acquittées
    /// </summary>
    [HttpGet("unacknowledged")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<AlertDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<AlertDto>>>> GetUnacknowledged(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des alertes non acquittées");

        var alerts = await _alertService.GetUnacknowledgedAsync(cancellationToken);

        return Ok(new ApiResponse<IEnumerable<AlertDto>>
        {
            Success = true,
            Data = alerts,
            Message = "Alertes non acquittées récupérées avec succès"
        });
    }

    /// <summary>
    /// Récupère les alertes non résolues
    /// </summary>
    [HttpGet("unresolved")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<AlertDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<AlertDto>>>> GetUnresolved(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des alertes non résolues");

        var alerts = await _alertService.GetUnresolvedAsync(cancellationToken);

        return Ok(new ApiResponse<IEnumerable<AlertDto>>
        {
            Success = true,
            Data = alerts,
            Message = "Alertes non résolues récupérées avec succès"
        });
    }

    /// <summary>
    /// Récupère le nombre d'alertes non acquittées
    /// </summary>
    [HttpGet("unacknowledged/count")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<int>>> GetUnacknowledgedCount(CancellationToken cancellationToken = default)
    {
        var count = await _alertService.GetUnacknowledgedCountAsync(cancellationToken);

        return Ok(new ApiResponse<int>
        {
            Success = true,
            Data = count,
            Message = "Nombre d'alertes non acquittées récupéré avec succès"
        });
    }

    /// <summary>
    /// Crée une nouvelle alerte
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,FleetManager,System")]
    [ProducesResponseType(typeof(ApiResponse<AlertDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<AlertDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<AlertDto>>> Create([FromBody] CreateAlertDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Création d'une nouvelle alerte pour le véhicule {VehicleId}", dto.VehicleId);

        var alert = await _alertService.CreateAsync(dto, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = alert.Id },
            new ApiResponse<AlertDto>
            {
                Success = true,
                Data = alert,
                Message = "Alerte créée avec succès"
            });
    }

    /// <summary>
    /// Acquitte une alerte
    /// </summary>
    [HttpPost("{id:guid}/acknowledge")]
    [ProducesResponseType(typeof(ApiResponse<AlertDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AlertDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AlertDto>>> Acknowledge(Guid id, [FromBody] AcknowledgeAlertDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Acquittement de l'alerte {AlertId} par {User}", id, dto.AcknowledgedBy);

        var alert = await _alertService.AcknowledgeAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<AlertDto>
        {
            Success = true,
            Data = alert,
            Message = "Alerte acquittée avec succès"
        });
    }

    /// <summary>
    /// Résout une alerte
    /// </summary>
    [HttpPost("{id:guid}/resolve")]
    [ProducesResponseType(typeof(ApiResponse<AlertDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AlertDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<AlertDto>>> Resolve(Guid id, [FromBody] ResolveAlertDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Résolution de l'alerte {AlertId}", id);

        var alert = await _alertService.ResolveAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<AlertDto>
        {
            Success = true,
            Data = alert,
            Message = "Alerte résolue avec succès"
        });
    }

    /// <summary>
    /// Supprime une alerte
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Suppression de l'alerte {AlertId}", id);

        await _alertService.DeleteAsync(id, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Alerte supprimée avec succès"
        });
    }
}
