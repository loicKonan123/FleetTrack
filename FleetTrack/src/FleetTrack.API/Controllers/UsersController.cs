using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.User;
using FleetTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.API.Controllers;

/// <summary>
/// Contrôleur pour la gestion des utilisateurs (Admin seulement)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère la liste paginée des utilisateurs
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<UserListDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<UserListDto>>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de la liste des utilisateurs - Page: {PageNumber}", pageNumber);

        var result = await _userService.GetAllAsync(pageNumber, pageSize, cancellationToken);

        return Ok(new ApiResponse<PagedResult<UserListDto>>
        {
            Success = true,
            Data = result,
            Message = "Liste des utilisateurs récupérée avec succès"
        });
    }

    /// <summary>
    /// Récupère un utilisateur par son ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDetailsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UserDetailsDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserDetailsDto>>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de l'utilisateur {UserId}", id);

        var user = await _userService.GetByIdAsync(id, cancellationToken);

        if (user == null)
        {
            return NotFound(new ApiResponse<UserDetailsDto>
            {
                Success = false,
                Message = $"Utilisateur avec l'ID {id} introuvable"
            });
        }

        return Ok(new ApiResponse<UserDetailsDto>
        {
            Success = true,
            Data = user,
            Message = "Utilisateur récupéré avec succès"
        });
    }

    /// <summary>
    /// Récupère les utilisateurs par rôle
    /// </summary>
    [HttpGet("role/{roleId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserListDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserListDto>>>> GetByRole(Guid roleId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération des utilisateurs avec le rôle {RoleId}", roleId);

        var users = await _userService.GetByRoleAsync(roleId, cancellationToken);

        return Ok(new ApiResponse<IEnumerable<UserListDto>>
        {
            Success = true,
            Data = users,
            Message = "Utilisateurs récupérés avec succès"
        });
    }

    /// <summary>
    /// Crée un nouvel utilisateur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserDetailsDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<UserDetailsDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<UserDetailsDto>>> Create([FromBody] CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Création d'un nouvel utilisateur: {Username}", dto.Username);

        var user = await _userService.CreateAsync(dto, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = user.Id },
            new ApiResponse<UserDetailsDto>
            {
                Success = true,
                Data = user,
                Message = "Utilisateur créé avec succès"
            });
    }

    /// <summary>
    /// Met à jour un utilisateur
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDetailsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UserDetailsDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserDetailsDto>>> Update(Guid id, [FromBody] UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Mise à jour de l'utilisateur {UserId}", id);

        var user = await _userService.UpdateAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<UserDetailsDto>
        {
            Success = true,
            Data = user,
            Message = "Utilisateur mis à jour avec succès"
        });
    }

    /// <summary>
    /// Supprime un utilisateur
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Suppression de l'utilisateur {UserId}", id);

        await _userService.DeleteAsync(id, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Utilisateur supprimé avec succès"
        });
    }

    /// <summary>
    /// Réinitialise le mot de passe d'un utilisateur
    /// </summary>
    [HttpPost("{id:guid}/reset-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword(Guid id, [FromBody] ResetPasswordDto dto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Réinitialisation du mot de passe pour l'utilisateur {UserId}", id);

        await _userService.ResetPasswordAsync(id, dto, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Mot de passe réinitialisé avec succès"
        });
    }

    /// <summary>
    /// Active un utilisateur
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Activate(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Activation de l'utilisateur {UserId}", id);

        await _userService.ActivateAsync(id, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Utilisateur activé avec succès"
        });
    }

    /// <summary>
    /// Désactive un utilisateur
    /// </summary>
    [HttpPost("{id:guid}/deactivate")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> Deactivate(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Désactivation de l'utilisateur {UserId}", id);

        await _userService.DeactivateAsync(id, cancellationToken);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Utilisateur désactivé avec succès"
        });
    }

    /// <summary>
    /// Récupère tous les rôles disponibles
    /// </summary>
    [HttpGet("roles")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<RoleDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<RoleDto>>>> GetRoles(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Récupération de la liste des rôles");

        var roles = await _userService.GetAllRolesAsync(cancellationToken);

        return Ok(new ApiResponse<IEnumerable<RoleDto>>
        {
            Success = true,
            Data = roles,
            Message = "Rôles récupérés avec succès"
        });
    }
}
