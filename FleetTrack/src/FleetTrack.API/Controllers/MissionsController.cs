using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Mission;
using FleetTrack.Application.Interfaces;
using FleetTrack.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.API.Controllers;

/// <summary>
/// Contrôleur pour la gestion des missions
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize] // Tous les endpoints nécessitent une authentification
public class MissionsController : ControllerBase
{
    private readonly IMissionService _missionService;
    private readonly ILogger<MissionsController> _logger;

    public MissionsController(IMissionService missionService, ILogger<MissionsController> logger)
    {
        _missionService = missionService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère la liste paginée des missions
    /// </summary>
    /// <param name="pageNumber">Numéro de la page (défaut: 1)</param>
    /// <param name="pageSize">Taille de la page (défaut: 10)</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Liste paginée des missions</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<MissionDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<MissionDto>>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de la liste des missions - Page: {PageNumber}, Taille: {PageSize}", pageNumber, pageSize);

        var result = await _missionService.GetAllAsync(pageNumber, pageSize, cancellationToken);

        return Ok(new ApiResponse<PagedResult<MissionDto>>
        {
            Success = true,
            Data = result,
            Message = "Liste des missions récupérée avec succès"
        });
    }

    /// <summary>
    /// Récupère une mission par son identifiant
    /// </summary>
    /// <param name="id">Identifiant de la mission</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Détails de la mission</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<MissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<MissionDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<MissionDto>>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de la mission {MissionId}", id);

        var mission = await _missionService.GetByIdAsync(id, cancellationToken);

        if (mission == null)
        {
            return NotFound(new ApiResponse<MissionDto>
            {
                Success = false,
                Message = $"Mission avec l'ID {id} introuvable"
            });
        }

        return Ok(new ApiResponse<MissionDto>
        {
            Success = true,
            Data = mission,
            Message = "Mission récupérée avec succès"
        });
    }

    /// <summary>
    /// Récupère les détails complets d'une mission
    /// </summary>
    /// <param name="id">Identifiant de la mission</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Détails complets de la mission</returns>
    [HttpGet("{id:guid}/details")]
    [ProducesResponseType(typeof(ApiResponse<MissionDetailsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<MissionDetailsDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<MissionDetailsDto>>> GetDetails(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des détails de la mission {MissionId}", id);

        var mission = await _missionService.GetDetailsAsync(id, cancellationToken);

        if (mission == null)
        {
            return NotFound(new ApiResponse<MissionDetailsDto>
            {
                Success = false,
                Message = $"Mission avec l'ID {id} introuvable"
            });
        }

        return Ok(new ApiResponse<MissionDetailsDto>
        {
            Success = true,
            Data = mission,
            Message = "Détails de la mission récupérés avec succès"
        });
    }

    /// <summary>
    /// Récupère la liste des missions actives
    /// </summary>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Liste des missions actives</returns>
    [HttpGet("active")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<MissionDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<MissionDto>>>> GetActive(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des missions actives");

        var missions = await _missionService.GetActiveAsync(cancellationToken);

        return Ok(new ApiResponse<IEnumerable<MissionDto>>
        {
            Success = true,
            Data = missions,
            Message = "Missions actives récupérées avec succès"
        });
    }

    /// <summary>
    /// Récupère les missions par statut
    /// </summary>
    /// <param name="status">Statut de la mission</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Liste des missions avec le statut spécifié</returns>
    [HttpGet("status/{status}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<MissionDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<MissionDto>>>> GetByStatus(MissionStatus status, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des missions avec le statut {Status}", status);

        var missions = await _missionService.GetByStatusAsync(status, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<MissionDto>>
        {
            Success = true,
            Data = missions,
            Message = $"Missions avec le statut {status} récupérées avec succès"
        });
    }

    /// <summary>
    /// Crée une nouvelle mission
    /// </summary>
    /// <param name="dto">Données de la mission à créer</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Mission créée</returns>
    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")] // Seuls Admin et Dispatcher peuvent créer des missions
    [ProducesResponseType(typeof(ApiResponse<MissionDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<MissionDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<MissionDto>>> Create([FromBody] CreateMissionDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Création d'une nouvelle mission: {Name}", dto.Name);

        var mission = await _missionService.CreateAsync(dto, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = mission.Id },
            new ApiResponse<MissionDto>
            {
                Success = true,
                Data = mission,
                Message = "Mission créée avec succès"
            });
    }

    /// <summary>
    /// Met à jour une mission existante
    /// </summary>
    /// <param name="id">Identifiant de la mission</param>
    /// <param name="dto">Données de mise à jour</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Mission mise à jour</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Dispatcher")] // Seuls Admin et Dispatcher peuvent modifier des missions
    [ProducesResponseType(typeof(ApiResponse<MissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<MissionDto>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<MissionDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<MissionDto>>> Update(Guid id, [FromBody] UpdateMissionDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Mise à jour de la mission {MissionId}", id);

        var mission = await _missionService.UpdateAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<MissionDto>
        {
            Success = true,
            Data = mission,
            Message = "Mission mise à jour avec succès"
        });
    }

    /// <summary>
    /// Assigne un véhicule et un conducteur à une mission
    /// </summary>
    /// <param name="id">Identifiant de la mission</param>
    /// <param name="dto">Données d'assignation</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Mission assignée</returns>
    [HttpPost("{id:guid}/assign")]
    [Authorize(Roles = "Admin,Dispatcher")] // Seuls Admin et Dispatcher peuvent assigner des missions
    [ProducesResponseType(typeof(ApiResponse<MissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<MissionDto>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<MissionDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<MissionDto>>> Assign(Guid id, [FromBody] AssignMissionDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Assignation de la mission {MissionId} au véhicule {VehicleId} et conducteur {DriverId}",
            id, dto.VehicleId, dto.DriverId);

        var mission = await _missionService.AssignAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<MissionDto>
        {
            Success = true,
            Data = mission,
            Message = "Mission assignée avec succès"
        });
    }

    /// <summary>
    /// Supprime une mission
    /// </summary>
    /// <param name="id">Identifiant de la mission</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Confirmation de suppression</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")] // Seul Admin peut supprimer des missions
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Suppression de la mission {MissionId}", id);

        await _missionService.DeleteAsync(id, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Mission supprimée avec succès"
        });
    }
}
