using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Vehicle;
using FleetTrack.Application.Interfaces;
using FleetTrack.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.API.Controllers;

/// <summary>
/// Contrôleur pour la gestion des véhicules
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize] // Tous les endpoints nécessitent une authentification
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    private readonly ILogger<VehiclesController> _logger;

    public VehiclesController(IVehicleService vehicleService, ILogger<VehiclesController> logger)
    {
        _vehicleService = vehicleService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère la liste paginée des véhicules
    /// </summary>
    /// <param name="pageNumber">Numéro de la page (défaut: 1)</param>
    /// <param name="pageSize">Taille de la page (défaut: 10)</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Liste paginée des véhicules</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<VehicleDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<VehicleDto>>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de la liste des véhicules - Page: {PageNumber}, Taille: {PageSize}", pageNumber, pageSize);

        var result = await _vehicleService.GetAllAsync(pageNumber, pageSize, cancellationToken);

        return Ok(new ApiResponse<PagedResult<VehicleDto>>
        {
            Success = true,
            Data = result,
            Message = "Liste des véhicules récupérée avec succès"
        });
    }

    /// <summary>
    /// Récupère un véhicule par son identifiant
    /// </summary>
    /// <param name="id">Identifiant du véhicule</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Détails du véhicule</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<VehicleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<VehicleDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<VehicleDto>>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération du véhicule {VehicleId}", id);

        var vehicle = await _vehicleService.GetByIdAsync(id, cancellationToken);

        if (vehicle == null)
        {
            return NotFound(new ApiResponse<VehicleDto>
            {
                Success = false,
                Message = $"Véhicule avec l'ID {id} introuvable"
            });
        }

        return Ok(new ApiResponse<VehicleDto>
        {
            Success = true,
            Data = vehicle,
            Message = "Véhicule récupéré avec succès"
        });
    }

    /// <summary>
    /// Récupère les détails complets d'un véhicule
    /// </summary>
    /// <param name="id">Identifiant du véhicule</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Détails complets du véhicule</returns>
    [HttpGet("{id:guid}/details")]
    [ProducesResponseType(typeof(ApiResponse<VehicleDetailsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<VehicleDetailsDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<VehicleDetailsDto>>> GetDetails(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des détails du véhicule {VehicleId}", id);

        var vehicle = await _vehicleService.GetDetailsAsync(id, cancellationToken);

        if (vehicle == null)
        {
            return NotFound(new ApiResponse<VehicleDetailsDto>
            {
                Success = false,
                Message = $"Véhicule avec l'ID {id} introuvable"
            });
        }

        return Ok(new ApiResponse<VehicleDetailsDto>
        {
            Success = true,
            Data = vehicle,
            Message = "Détails du véhicule récupérés avec succès"
        });
    }

    /// <summary>
    /// Récupère la liste des véhicules disponibles
    /// </summary>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Liste des véhicules disponibles</returns>
    [HttpGet("available")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<VehicleDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<VehicleDto>>>> GetAvailable(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des véhicules disponibles");

        var vehicles = await _vehicleService.GetAvailableAsync(cancellationToken);

        return Ok(new ApiResponse<IEnumerable<VehicleDto>>
        {
            Success = true,
            Data = vehicles,
            Message = "Véhicules disponibles récupérés avec succès"
        });
    }

    /// <summary>
    /// Récupère les véhicules par statut
    /// </summary>
    /// <param name="status">Statut du véhicule</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Liste des véhicules avec le statut spécifié</returns>
    [HttpGet("status/{status}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<VehicleDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<VehicleDto>>>> GetByStatus(VehicleStatus status, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des véhicules avec le statut {Status}", status);

        var vehicles = await _vehicleService.GetByStatusAsync(status, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<VehicleDto>>
        {
            Success = true,
            Data = vehicles,
            Message = $"Véhicules avec le statut {status} récupérés avec succès"
        });
    }

    /// <summary>
    /// Crée un nouveau véhicule
    /// </summary>
    /// <param name="dto">Données du véhicule à créer</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Véhicule créé</returns>
    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")] // Seuls Admin et Dispatcher peuvent créer des véhicules
    [ProducesResponseType(typeof(ApiResponse<VehicleDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<VehicleDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<VehicleDto>>> Create([FromBody] CreateVehicleDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Création d'un nouveau véhicule: {RegistrationNumber}", dto.RegistrationNumber);

        var vehicle = await _vehicleService.CreateAsync(dto, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = vehicle.Id },
            new ApiResponse<VehicleDto>
            {
                Success = true,
                Data = vehicle,
                Message = "Véhicule créé avec succès"
            });
    }

    /// <summary>
    /// Met à jour un véhicule existant
    /// </summary>
    /// <param name="id">Identifiant du véhicule</param>
    /// <param name="dto">Données de mise à jour</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Véhicule mis à jour</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Dispatcher")] // Seuls Admin et Dispatcher peuvent modifier des véhicules
    [ProducesResponseType(typeof(ApiResponse<VehicleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<VehicleDto>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<VehicleDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<VehicleDto>>> Update(Guid id, [FromBody] UpdateVehicleDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Mise à jour du véhicule {VehicleId}", id);

        var vehicle = await _vehicleService.UpdateAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<VehicleDto>
        {
            Success = true,
            Data = vehicle,
            Message = "Véhicule mis à jour avec succès"
        });
    }

    /// <summary>
    /// Supprime un véhicule
    /// </summary>
    /// <param name="id">Identifiant du véhicule</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Confirmation de suppression</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")] // Seul Admin peut supprimer des véhicules
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Suppression du véhicule {VehicleId}", id);

        await _vehicleService.DeleteAsync(id, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Véhicule supprimé avec succès"
        });
    }
}
