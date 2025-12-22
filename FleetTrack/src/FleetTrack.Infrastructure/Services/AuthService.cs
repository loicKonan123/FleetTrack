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
using Microsoft.IdentityModel.Tokens;

namespace FleetTrack.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly FleetTrackDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(FleetTrackDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
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
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

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
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

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
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

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
            new("role_id", user.RoleId.ToString())
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
        return int.TryParse(expirationStr, out var minutes) ? minutes : 60;
    }

    #endregion
}
