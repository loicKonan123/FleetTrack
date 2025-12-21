using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Driver;
using FleetTrack.Application.Interfaces;
using FleetTrack.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.API.Controllers;

/// <summary>
/// Contrôleur pour la gestion des conducteurs
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DriversController : ControllerBase
{
    private readonly IDriverService _driverService;
    private readonly ILogger<DriversController> _logger;

    public DriversController(IDriverService driverService, ILogger<DriversController> logger)
    {
        _driverService = driverService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère la liste paginée des conducteurs
    /// </summary>
    /// <param name="pageNumber">Numéro de la page (défaut: 1)</param>
    /// <param name="pageSize">Taille de la page (défaut: 10)</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Liste paginée des conducteurs</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<DriverDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<DriverDto>>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de la liste des conducteurs - Page: {PageNumber}, Taille: {PageSize}", pageNumber, pageSize);

        var result = await _driverService.GetAllAsync(pageNumber, pageSize, cancellationToken);

        return Ok(new ApiResponse<PagedResult<DriverDto>>
        {
            Success = true,
            Data = result,
            Message = "Liste des conducteurs récupérée avec succès"
        });
    }

    /// <summary>
    /// Récupère un conducteur par son identifiant
    /// </summary>
    /// <param name="id">Identifiant du conducteur</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Détails du conducteur</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DriverDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DriverDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<DriverDto>>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération du conducteur {DriverId}", id);

        var driver = await _driverService.GetByIdAsync(id, cancellationToken);

        if (driver == null)
        {
            return NotFound(new ApiResponse<DriverDto>
            {
                Success = false,
                Message = $"Conducteur avec l'ID {id} introuvable"
            });
        }

        return Ok(new ApiResponse<DriverDto>
        {
            Success = true,
            Data = driver,
            Message = "Conducteur récupéré avec succès"
        });
    }

    /// <summary>
    /// Récupère les détails complets d'un conducteur
    /// </summary>
    /// <param name="id">Identifiant du conducteur</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Détails complets du conducteur</returns>
    [HttpGet("{id:guid}/details")]
    [ProducesResponseType(typeof(ApiResponse<DriverDetailsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DriverDetailsDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<DriverDetailsDto>>> GetDetails(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des détails du conducteur {DriverId}", id);

        var driver = await _driverService.GetDetailsAsync(id, cancellationToken);

        if (driver == null)
        {
            return NotFound(new ApiResponse<DriverDetailsDto>
            {
                Success = false,
                Message = $"Conducteur avec l'ID {id} introuvable"
            });
        }

        return Ok(new ApiResponse<DriverDetailsDto>
        {
            Success = true,
            Data = driver,
            Message = "Détails du conducteur récupérés avec succès"
        });
    }

    /// <summary>
    /// Récupère la liste des conducteurs disponibles
    /// </summary>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Liste des conducteurs disponibles</returns>
    [HttpGet("available")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<DriverDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<DriverDto>>>> GetAvailable(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des conducteurs disponibles");

        var drivers = await _driverService.GetAvailableAsync(cancellationToken);

        return Ok(new ApiResponse<IEnumerable<DriverDto>>
        {
            Success = true,
            Data = drivers,
            Message = "Conducteurs disponibles récupérés avec succès"
        });
    }

    /// <summary>
    /// Récupère les conducteurs par statut
    /// </summary>
    /// <param name="status">Statut du conducteur</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Liste des conducteurs avec le statut spécifié</returns>
    [HttpGet("status/{status}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<DriverDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<DriverDto>>>> GetByStatus(DriverStatus status, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des conducteurs avec le statut {Status}", status);

        var drivers = await _driverService.GetByStatusAsync(status, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<DriverDto>>
        {
            Success = true,
            Data = drivers,
            Message = $"Conducteurs avec le statut {status} récupérés avec succès"
        });
    }

    /// <summary>
    /// Crée un nouveau conducteur
    /// </summary>
    /// <param name="dto">Données du conducteur à créer</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Conducteur créé</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<DriverDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<DriverDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<DriverDto>>> Create([FromBody] CreateDriverDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Création d'un nouveau conducteur: {FirstName} {LastName}", dto.FirstName, dto.LastName);

        var driver = await _driverService.CreateAsync(dto, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = driver.Id },
            new ApiResponse<DriverDto>
            {
                Success = true,
                Data = driver,
                Message = "Conducteur créé avec succès"
            });
    }

    /// <summary>
    /// Met à jour un conducteur existant
    /// </summary>
    /// <param name="id">Identifiant du conducteur</param>
    /// <param name="dto">Données de mise à jour</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Conducteur mis à jour</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<DriverDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DriverDto>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<DriverDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<DriverDto>>> Update(Guid id, [FromBody] UpdateDriverDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Mise à jour du conducteur {DriverId}", id);

        var driver = await _driverService.UpdateAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<DriverDto>
        {
            Success = true,
            Data = driver,
            Message = "Conducteur mis à jour avec succès"
        });
    }

    /// <summary>
    /// Supprime un conducteur
    /// </summary>
    /// <param name="id">Identifiant du conducteur</param>
    /// <param name="cancellationToken">Token d'annulation</param>
    /// <returns>Confirmation de suppression</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Suppression du conducteur {DriverId}", id);

        await _driverService.DeleteAsync(id, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Conducteur supprimé avec succès"
        });
    }
}
