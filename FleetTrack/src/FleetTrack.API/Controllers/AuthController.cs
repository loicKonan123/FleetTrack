using FleetTrack.Application.DTOs.Auth;
using FleetTrack.Application.DTOs.Common;
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
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var response = await _authService.LoginAsync(loginDto);
            _logger.LogInformation("User {Username} logged in successfully", loginDto.Username);
            return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(response, "Connexion réussie"));
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning("Login failed for user {Username}: {Message}", loginDto.Username, ex.Message);
            return Unauthorized(ApiResponse<AuthResponseDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Inscription d'un nouvel utilisateur
    /// </summary>
    /// <param name="registerDto">Informations d'inscription</param>
    /// <returns>Tokens JWT et informations utilisateur</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            var response = await _authService.RegisterAsync(registerDto);
            _logger.LogInformation("New user registered: {Username}", registerDto.Username);
            return CreatedAtAction(nameof(GetMe), new { id = response.User.Id },
                ApiResponse<AuthResponseDto>.SuccessResponse(response, "Inscription réussie"));
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning("Registration failed for {Username}: {Message}", registerDto.Username, ex.Message);
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Rafraîchir le token d'accès
    /// </summary>
    /// <param name="refreshTokenDto">Token de rafraîchissement</param>
    /// <returns>Nouveaux tokens JWT</returns>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(refreshTokenDto.RefreshToken);
            _logger.LogInformation("Token refreshed for user {Username}", response.User.Username);
            return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(response, "Token rafraîchi avec succès"));
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning("Token refresh failed: {Message}", ex.Message);
            return Unauthorized(ApiResponse<AuthResponseDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Révoquer le token de rafraîchissement (déconnexion)
    /// </summary>
    /// <param name="username">Nom d'utilisateur</param>
    /// <returns>Confirmation de révocation</returns>
    [HttpPost("revoke/{username}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> RevokeToken(string username)
    {
        try
        {
            await _authService.RevokeTokenAsync(username);
            _logger.LogInformation("Token revoked for user {Username}", username);
            return Ok(ApiResponse<object>.SuccessResponse(null!, $"Token révoqué pour l'utilisateur {username}"));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Token revocation failed for {Username}: {Message}", username, ex.Message);
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Obtenir les informations de l'utilisateur connecté
    /// </summary>
    /// <returns>Informations utilisateur</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetMe()
    {
        try
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized(ApiResponse<UserDto>.ErrorResponse("Utilisateur non authentifié"));

            var user = await _authService.GetUserByUsernameAsync(username);
            return Ok(ApiResponse<UserDto>.SuccessResponse(user, "Profil récupéré avec succès"));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {Message}", ex.Message);
            return NotFound(ApiResponse<UserDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Obtenir un utilisateur par son ID (Admin uniquement)
    /// </summary>
    /// <param name="id">ID de l'utilisateur</param>
    /// <returns>Informations utilisateur</returns>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(Guid id)
    {
        try
        {
            var user = await _authService.GetUserByIdAsync(id);
            return Ok(ApiResponse<UserDto>.SuccessResponse(user, "Utilisateur récupéré avec succès"));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {Message}", ex.Message);
            return NotFound(ApiResponse<UserDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Demander une reinitialisation de mot de passe
    /// </summary>
    /// <param name="forgotPasswordDto">Email de l'utilisateur</param>
    /// <returns>Confirmation d'envoi</returns>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<object>>> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        try
        {
            await _authService.ForgotPasswordAsync(forgotPasswordDto);
            _logger.LogInformation("Password reset requested for email: {Email}", forgotPasswordDto.Email);
            return Ok(ApiResponse<object>.SuccessResponse(null!, "Si un compte existe avec cet email, un lien de reinitialisation a ete envoye"));
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning("Password reset failed: {Message}", ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Reinitialiser le mot de passe avec un token
    /// </summary>
    /// <param name="resetPasswordDto">Token et nouveau mot de passe</param>
    /// <returns>Confirmation de reinitialisation</returns>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        try
        {
            await _authService.ResetPasswordAsync(resetPasswordDto);
            _logger.LogInformation("Password reset successful");
            return Ok(ApiResponse<object>.SuccessResponse(null!, "Mot de passe reinitialise avec succes"));
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning("Password reset failed: {Message}", ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }
}
