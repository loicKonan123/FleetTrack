using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Maintenance;
using FleetTrack.Application.Interfaces;
using FleetTrack.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.API.Controllers;

/// <summary>
/// Contrôleur pour la gestion des maintenances de véhicules
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly IMaintenanceService _maintenanceService;
    private readonly ILogger<MaintenanceController> _logger;

    public MaintenanceController(IMaintenanceService maintenanceService, ILogger<MaintenanceController> logger)
    {
        _maintenanceService = maintenanceService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère la liste paginée des maintenances
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<MaintenanceDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<MaintenanceDto>>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] Guid? vehicleId = null,
        [FromQuery] MaintenanceType? type = null,
        [FromQuery] bool? isCompleted = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de la liste des maintenances");

        var result = await _maintenanceService.GetAllAsync(pageNumber, pageSize, vehicleId, type, isCompleted, cancellationToken);

        return Ok(new ApiResponse<PagedResult<MaintenanceDto>>
        {
            Success = true,
            Data = result,
            Message = "Liste des maintenances récupérée avec succès"
        });
    }

    /// <summary>
    /// Récupère une maintenance par son identifiant
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<MaintenanceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<MaintenanceDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<MaintenanceDto>>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de la maintenance {MaintenanceId}", id);

        var maintenance = await _maintenanceService.GetByIdAsync(id, cancellationToken);

        if (maintenance == null)
        {
            return NotFound(new ApiResponse<MaintenanceDto>
            {
                Success = false,
                Message = $"Maintenance avec l'ID {id} introuvable"
            });
        }

        return Ok(new ApiResponse<MaintenanceDto>
        {
            Success = true,
            Data = maintenance,
            Message = "Maintenance récupérée avec succès"
        });
    }

    /// <summary>
    /// Récupère les maintenances d'un véhicule
    /// </summary>
    [HttpGet("vehicle/{vehicleId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<MaintenanceDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<MaintenanceDto>>>> GetByVehicle(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des maintenances du véhicule {VehicleId}", vehicleId);

        var maintenances = await _maintenanceService.GetByVehicleIdAsync(vehicleId, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<MaintenanceDto>>
        {
            Success = true,
            Data = maintenances,
            Message = "Maintenances du véhicule récupérées avec succès"
        });
    }

    /// <summary>
    /// Récupère les maintenances à venir
    /// </summary>
    [HttpGet("upcoming")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<MaintenanceDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<MaintenanceDto>>>> GetUpcoming([FromQuery] int days = 30, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des maintenances à venir dans les {Days} jours", days);

        var maintenances = await _maintenanceService.GetUpcomingAsync(days, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<MaintenanceDto>>
        {
            Success = true,
            Data = maintenances,
            Message = "Maintenances à venir récupérées avec succès"
        });
    }

    /// <summary>
    /// Récupère les maintenances en retard
    /// </summary>
    [HttpGet("overdue")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<MaintenanceDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<MaintenanceDto>>>> GetOverdue(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des maintenances en retard");

        var maintenances = await _maintenanceService.GetOverdueAsync(cancellationToken);

        return Ok(new ApiResponse<IEnumerable<MaintenanceDto>>
        {
            Success = true,
            Data = maintenances,
            Message = "Maintenances en retard récupérées avec succès"
        });
    }

    /// <summary>
    /// Crée une nouvelle maintenance
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,FleetManager")]
    [ProducesResponseType(typeof(ApiResponse<MaintenanceDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<MaintenanceDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<MaintenanceDto>>> Create([FromBody] CreateMaintenanceDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Création d'une nouvelle maintenance pour le véhicule {VehicleId}", dto.VehicleId);

        var maintenance = await _maintenanceService.CreateAsync(dto, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = maintenance.Id },
            new ApiResponse<MaintenanceDto>
            {
                Success = true,
                Data = maintenance,
                Message = "Maintenance créée avec succès"
            });
    }

    /// <summary>
    /// Met à jour une maintenance existante
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,FleetManager")]
    [ProducesResponseType(typeof(ApiResponse<MaintenanceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<MaintenanceDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<MaintenanceDto>>> Update(Guid id, [FromBody] UpdateMaintenanceDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Mise à jour de la maintenance {MaintenanceId}", id);

        var maintenance = await _maintenanceService.UpdateAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<MaintenanceDto>
        {
            Success = true,
            Data = maintenance,
            Message = "Maintenance mise à jour avec succès"
        });
    }

    /// <summary>
    /// Marque une maintenance comme terminée
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    [Authorize(Roles = "Admin,FleetManager")]
    [ProducesResponseType(typeof(ApiResponse<MaintenanceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<MaintenanceDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<MaintenanceDto>>> Complete(Guid id, [FromBody] CompleteMaintenanceDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Marquage de la maintenance {MaintenanceId} comme terminée", id);

        var maintenance = await _maintenanceService.CompleteAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<MaintenanceDto>
        {
            Success = true,
            Data = maintenance,
            Message = "Maintenance marquée comme terminée avec succès"
        });
    }

    /// <summary>
    /// Supprime une maintenance
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Suppression de la maintenance {MaintenanceId}", id);

        await _maintenanceService.DeleteAsync(id, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Maintenance supprimée avec succès"
        });
    }
}
