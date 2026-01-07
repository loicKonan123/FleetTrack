using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FleetTrack.Application.DTOs.Auth;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces;
using FleetTrack.Domain.Entities;
using FleetTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace FleetTrack.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly FleetTrackDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ICaptchaService _captchaService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        FleetTrackDbContext context,
        IConfiguration configuration,
        ICaptchaService captchaService,
        ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _captchaService = captchaService;
        _logger = logger;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        // Valider le CAPTCHA
        if (!await _captchaService.ValidateAsync(loginDto.CaptchaToken))
            throw new BusinessException("Validation CAPTCHA echouee");

        // Trouver l'utilisateur par username
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

        if (user == null)
            throw new BusinessException("Nom d'utilisateur ou mot de passe incorrect");

        // Vérifier si l'utilisateur est actif
        if (!user.IsActive)
            throw new BusinessException("Ce compte est désactivé");

        // Vérifier le mot de passe
        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            throw new BusinessException("Nom d'utilisateur ou mot de passe incorrect");

        // Mettre à jour la date de dernière connexion
        user.LastLoginDate = DateTime.UtcNow;

        // Générer les tokens
        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(GetRefreshTokenExpirationDays());

        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(GetJwtExpirationMinutes()),
            User = MapToUserDto(user)
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // Valider le CAPTCHA
        if (!await _captchaService.ValidateAsync(registerDto.CaptchaToken))
            throw new BusinessException("Validation CAPTCHA echouee");

        // Vérifier si le username existe déjà
        if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            throw new BusinessException($"Le nom d'utilisateur '{registerDto.Username}' est déjà utilisé");

        // Vérifier si l'email existe déjà
        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            throw new BusinessException($"L'email '{registerDto.Email}' est déjà utilisé");

        // Trouver le rôle
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == registerDto.RoleName);
        if (role == null)
            throw new BusinessException($"Le rôle '{registerDto.RoleName}' n'existe pas");

        // Créer l'utilisateur
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = registerDto.Username,
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            PhoneNumber = registerDto.PhoneNumber,
            RoleId = role.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Recharger avec le rôle
        user = await _context.Users
            .Include(u => u.Role)
            .FirstAsync(u => u.Id == user.Id);

        // Générer les tokens
        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(GetRefreshTokenExpirationDays());

        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(GetJwtExpirationMinutes()),
            User = MapToUserDto(user)
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

        if (user == null)
            throw new BusinessException("Token de rafraîchissement invalide");

        if (user.RefreshTokenExpiryTime < DateTime.UtcNow)
            throw new BusinessException("Token de rafraîchissement expiré");

        if (!user.IsActive)
            throw new BusinessException("Ce compte est désactivé");

        // Générer de nouveaux tokens
        var accessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(GetRefreshTokenExpirationDays());

        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(GetJwtExpirationMinutes()),
            User = MapToUserDto(user)
        };
    }

    public async Task RevokeTokenAsync(string username)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
            throw new NotFoundException($"Utilisateur '{username}' non trouvé");

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;

        await _context.SaveChangesAsync();
    }

    public async Task<UserDto> GetUserByIdAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new NotFoundException($"Utilisateur avec l'ID {userId} non trouvé");

        return MapToUserDto(user);
    }

    public async Task<UserDto> GetUserByUsernameAsync(string username)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
            throw new NotFoundException($"Utilisateur '{username}' non trouvé");

        return MapToUserDto(user);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
    {
        // Valider le CAPTCHA
        if (!await _captchaService.ValidateAsync(forgotPasswordDto.CaptchaToken))
            throw new BusinessException("Validation CAPTCHA echouee");

        // Trouver l'utilisateur par email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == forgotPasswordDto.Email);

        // Pour des raisons de securite, on ne revele pas si l'email existe ou non
        if (user == null)
        {
            _logger.LogInformation("Password reset requested for non-existent email: {Email}", forgotPasswordDto.Email);
            return;
        }

        // Generer un token de reinitialisation
        var token = GeneratePasswordResetToken();
        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(1), // Token valide 1 heure
            IsUsed = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Set<PasswordResetToken>().Add(resetToken);
        await _context.SaveChangesAsync();

        // TODO: Envoyer l'email avec le lien de reinitialisation
        // Pour l'instant, on log le token (a remplacer par un vrai service d'email)
        var resetUrl = $"{_configuration["Frontend:Url"]}/reset-password?token={token}";
        _logger.LogInformation("Password reset link for {Email}: {ResetUrl}", forgotPasswordDto.Email, resetUrl);
    }

    public async Task ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        // Trouver le token
        var resetToken = await _context.Set<PasswordResetToken>()
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == resetPasswordDto.Token);

        if (resetToken == null)
            throw new BusinessException("Token de reinitialisation invalide");

        if (resetToken.IsUsed)
            throw new BusinessException("Ce token a deja ete utilise");

        if (resetToken.ExpiresAt < DateTime.UtcNow)
            throw new BusinessException("Ce token a expire");

        // Mettre a jour le mot de passe
        var user = resetToken.User;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetPasswordDto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        // Marquer le token comme utilise
        resetToken.IsUsed = true;
        resetToken.UpdatedAt = DateTime.UtcNow;

        // Revoquer tous les refresh tokens existants pour forcer une reconnexion
        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Password reset successful for user {UserId}", user.Id);
    }

    #region Private Methods

    private string GenerateAccessToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(GetJwtSecret());

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.GivenName, user.FirstName),
            new(ClaimTypes.Surname, user.LastName),
            new(ClaimTypes.Role, user.Role.Name),
            new("role_id", user.RoleId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique token ID
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(GetJwtExpirationMinutes()),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature),
            Issuer = GetJwtIssuer(),
            Audience = GetJwtAudience()
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private static string GeneratePasswordResetToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToHexString(randomNumber).ToLower();
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            RoleName = user.Role.Name,
            IsActive = user.IsActive,
            LastLoginDate = user.LastLoginDate
        };
    }

    private string GetJwtSecret()
    {
        return _configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT Secret not configured");
    }

    private string GetJwtIssuer()
    {
        return _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT Issuer not configured");
    }

    private string GetJwtAudience()
    {
        return _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT Audience not configured");
    }

    private int GetJwtExpirationMinutes()
    {
        var expirationStr = _configuration["Jwt:ExpirationMinutes"];
        return int.TryParse(expirationStr, out var minutes) ? minutes : 43200; // Default: 30 days
    }

    private int GetRefreshTokenExpirationDays()
    {
        var expirationStr = _configuration["Jwt:RefreshTokenExpirationDays"];
        return int.TryParse(expirationStr, out var days) ? days : 30; // Default: 30 days
    }

    #endregion
}
