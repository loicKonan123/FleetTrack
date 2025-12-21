using FleetTrack.Application.DTOs.Auth;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.API.Controllers;

/// <summary>
/// Contrôleur pour l'authentification et la gestion des utilisateurs
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Connexion d'un utilisateur
    /// </summary>
    /// <param name="loginDto">Informations de connexion</param>
    /// <returns>Tokens JWT et informations utilisateur</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var response = await _authService.LoginAsync(loginDto);
            _logger.LogInformation("User {Username} logged in successfully", loginDto.Username);
            return Ok(response);
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning("Login failed for user {Username}: {Message}", loginDto.Username, ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Inscription d'un nouvel utilisateur
    /// </summary>
    /// <param name="registerDto">Informations d'inscription</param>
    /// <returns>Tokens JWT et informations utilisateur</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            var response = await _authService.RegisterAsync(registerDto);
            _logger.LogInformation("New user registered: {Username}", registerDto.Username);
            return CreatedAtAction(nameof(GetMe), new { id = response.User.Id }, response);
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning("Registration failed for {Username}: {Message}", registerDto.Username, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Rafraîchir le token d'accès
    /// </summary>
    /// <param name="refreshTokenDto">Token de rafraîchissement</param>
    /// <returns>Nouveaux tokens JWT</returns>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(refreshTokenDto.RefreshToken);
            _logger.LogInformation("Token refreshed for user {Username}", response.User.Username);
            return Ok(response);
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning("Token refresh failed: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Révoquer le token de rafraîchissement (déconnexion)
    /// </summary>
    /// <param name="username">Nom d'utilisateur</param>
    /// <returns>Confirmation de révocation</returns>
    [HttpPost("revoke/{username}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RevokeToken(string username)
    {
        try
        {
            await _authService.RevokeTokenAsync(username);
            _logger.LogInformation("Token revoked for user {Username}", username);
            return Ok(new { message = $"Token révoqué pour l'utilisateur {username}" });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Token revocation failed for {Username}: {Message}", username, ex.Message);
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtenir les informations de l'utilisateur connecté
    /// </summary>
    /// <returns>Informations utilisateur</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        try
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { message = "Utilisateur non authentifié" });

            var user = await _authService.GetUserByUsernameAsync(username);
            return Ok(user);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Obtenir un utilisateur par son ID (Admin uniquement)
    /// </summary>
    /// <param name="id">ID de l'utilisateur</param>
    /// <returns>Informations utilisateur</returns>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetUserById(Guid id)
    {
        try
        {
            var user = await _authService.GetUserByIdAsync(id);
            return Ok(user);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
    }
}
