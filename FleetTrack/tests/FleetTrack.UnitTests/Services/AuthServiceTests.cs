using FleetTrack.Application.DTOs.Auth;
using FleetTrack.Application.Exceptions;
using FleetTrack.Domain.Entities;
using FleetTrack.Infrastructure.Data;
using FleetTrack.Infrastructure.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FleetTrack.UnitTests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly FleetTrackDbContext _context;
    private readonly AuthService _authService;
    private readonly SqliteConnection _connection;
    private readonly IConfiguration _configuration;

    public AuthServiceTests()
    {
        // Configuration SQLite in-memory
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<FleetTrackDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new FleetTrackDbContext(options);
        _context.Database.EnsureCreated();

        // Configuration JWT pour les tests
        var configData = new Dictionary<string, string>
        {
            { "Jwt:Secret", "TestSecretKey_MinimumLength32Characters_ForTesting!" },
            { "Jwt:Issuer", "FleetTrackTestAPI" },
            { "Jwt:Audience", "FleetTrackTestClients" },
            { "Jwt:ExpirationMinutes", "60" }
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configData!)
            .Build();

        _authService = new AuthService(_context, _configuration);

        // Seed test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        // Créer les rôles
        var adminRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = Role.Names.Admin,
            Description = "Administrator",
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        var driverRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = Role.Names.Driver,
            Description = "Driver",
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.Roles.AddRange(adminRole, driverRole);
        _context.SaveChanges();

        // Créer un utilisateur de test
        var testUser = new User
        {
            Id = Guid.NewGuid(),
            Username = "testuser",
            Email = "test@fleettrack.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            FirstName = "Test",
            LastName = "User",
            RoleId = driverRole.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.Users.Add(testUser);
        _context.SaveChanges();
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnAuthResponse()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = "Password123!"
        };

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
        Assert.NotNull(result.User);
        Assert.Equal("testuser", result.User.Username);
        Assert.Equal("test@fleettrack.com", result.User.Email);
        Assert.True(result.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidUsername_ShouldThrowBusinessException()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "nonexistent",
            Password = "Password123!"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _authService.LoginAsync(loginDto)
        );

        Assert.Equal("Nom d'utilisateur ou mot de passe incorrect", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ShouldThrowBusinessException()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = "WrongPassword!"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _authService.LoginAsync(loginDto)
        );

        Assert.Equal("Nom d'utilisateur ou mot de passe incorrect", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_WithInactiveUser_ShouldThrowBusinessException()
    {
        // Arrange
        var inactiveUser = new User
        {
            Id = Guid.NewGuid(),
            Username = "inactive",
            Email = "inactive@fleettrack.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            FirstName = "Inactive",
            LastName = "User",
            RoleId = _context.Roles.First().Id,
            IsActive = false,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.Users.Add(inactiveUser);
        await _context.SaveChangesAsync();

        var loginDto = new LoginDto
        {
            Username = "inactive",
            Password = "Password123!"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _authService.LoginAsync(loginDto)
        );

        Assert.Equal("Ce compte est désactivé", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_ShouldUpdateLastLoginDate()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = "Password123!"
        };

        var beforeLogin = DateTime.UtcNow;

        // Act
        await _authService.LoginAsync(loginDto);

        // Assert
        var user = await _context.Users.FirstAsync(u => u.Username == "testuser");
        Assert.NotNull(user.LastLoginDate);
        Assert.True(user.LastLoginDate >= beforeLogin);
    }

    [Fact]
    public async Task LoginAsync_ShouldStoreRefreshToken()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = "Password123!"
        };

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        var user = await _context.Users.FirstAsync(u => u.Username == "testuser");
        Assert.NotNull(user.RefreshToken);
        Assert.NotNull(user.RefreshTokenExpiryTime);
        Assert.Equal(result.RefreshToken, user.RefreshToken);
        Assert.True(user.RefreshTokenExpiryTime > DateTime.UtcNow);
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_ShouldCreateUserAndReturnAuthResponse()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Username = "newuser",
            Email = "newuser@fleettrack.com",
            Password = "NewPassword123!",
            FirstName = "New",
            LastName = "User",
            PhoneNumber = "+33612345678",
            RoleName = Role.Names.Driver
        };

        // Act
        var result = await _authService.RegisterAsync(registerDto);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
        Assert.Equal("newuser", result.User.Username);
        Assert.Equal("newuser@fleettrack.com", result.User.Email);
        Assert.Equal(Role.Names.Driver, result.User.RoleName);

        // Vérifier en base
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == "newuser");
        Assert.NotNull(user);
        Assert.True(BCrypt.Net.BCrypt.Verify("NewPassword123!", user.PasswordHash));
    }

    [Fact]
    public async Task RegisterAsync_WithExistingUsername_ShouldThrowBusinessException()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Username = "testuser", // Existe déjà
            Email = "another@fleettrack.com",
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            RoleName = Role.Names.Driver
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _authService.RegisterAsync(registerDto)
        );

        Assert.Equal("Le nom d'utilisateur 'testuser' est déjà utilisé", exception.Message);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ShouldThrowBusinessException()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Username = "anotheruser",
            Email = "test@fleettrack.com", // Existe déjà
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            RoleName = Role.Names.Driver
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _authService.RegisterAsync(registerDto)
        );

        Assert.Equal("L'email 'test@fleettrack.com' est déjà utilisé", exception.Message);
    }

    [Fact]
    public async Task RegisterAsync_WithInvalidRole_ShouldThrowBusinessException()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Username = "newuser",
            Email = "newuser@fleettrack.com",
            Password = "Password123!",
            FirstName = "New",
            LastName = "User",
            RoleName = "InvalidRole"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _authService.RegisterAsync(registerDto)
        );

        Assert.Equal("Le rôle 'InvalidRole' n'existe pas", exception.Message);
    }

    [Fact]
    public async Task RefreshTokenAsync_WithValidToken_ShouldReturnNewTokens()
    {
        // Arrange
        // D'abord se connecter pour obtenir un refresh token
        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = "Password123!"
        };

        var loginResult = await _authService.LoginAsync(loginDto);

        // Act
        var result = await _authService.RefreshTokenAsync(loginResult.RefreshToken);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
        // Note: Access tokens peuvent être identiques s'ils sont générés à la même seconde
        Assert.NotEqual(loginResult.RefreshToken, result.RefreshToken); // Rotation importante!
    }

    [Fact]
    public async Task RefreshTokenAsync_WithInvalidToken_ShouldThrowBusinessException()
    {
        // Arrange
        var invalidToken = "InvalidToken123";

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _authService.RefreshTokenAsync(invalidToken)
        );

        Assert.Equal("Token de rafraîchissement invalide", exception.Message);
    }

    [Fact]
    public async Task RefreshTokenAsync_WithExpiredToken_ShouldThrowBusinessException()
    {
        // Arrange
        var user = await _context.Users.FirstAsync(u => u.Username == "testuser");
        user.RefreshToken = "ExpiredToken123";
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(-1); // Expiré hier
        await _context.SaveChangesAsync();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _authService.RefreshTokenAsync("ExpiredToken123")
        );

        Assert.Equal("Token de rafraîchissement expiré", exception.Message);
    }

    [Fact]
    public async Task RevokeTokenAsync_WithValidUsername_ShouldClearRefreshToken()
    {
        // Arrange
        var user = await _context.Users.FirstAsync(u => u.Username == "testuser");
        user.RefreshToken = "SomeToken";
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        // Act
        await _authService.RevokeTokenAsync("testuser");

        // Assert
        var updatedUser = await _context.Users.FirstAsync(u => u.Username == "testuser");
        Assert.Null(updatedUser.RefreshToken);
        Assert.Null(updatedUser.RefreshTokenExpiryTime);
    }

    [Fact]
    public async Task RevokeTokenAsync_WithInvalidUsername_ShouldThrowNotFoundException()
    {
        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(
            () => _authService.RevokeTokenAsync("nonexistent")
        );

        Assert.Equal("Utilisateur 'nonexistent' non trouvé", exception.Message);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithValidId_ShouldReturnUserDto()
    {
        // Arrange
        var user = await _context.Users.Include(u => u.Role).FirstAsync(u => u.Username == "testuser");

        // Act
        var result = await _authService.GetUserByIdAsync(user.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(user.Id, result.Id);
        Assert.Equal("testuser", result.Username);
        Assert.Equal("test@fleettrack.com", result.Email);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithInvalidId_ShouldThrowNotFoundException()
    {
        // Arrange
        var invalidId = Guid.NewGuid();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(
            () => _authService.GetUserByIdAsync(invalidId)
        );

        Assert.StartsWith("Utilisateur avec l'ID", exception.Message);
        Assert.Contains("non trouvé", exception.Message);
    }

    [Fact]
    public async Task GetUserByUsernameAsync_WithValidUsername_ShouldReturnUserDto()
    {
        // Act
        var result = await _authService.GetUserByUsernameAsync("testuser");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("testuser", result.Username);
        Assert.Equal("test@fleettrack.com", result.Email);
    }

    [Fact]
    public async Task GetUserByUsernameAsync_WithInvalidUsername_ShouldThrowNotFoundException()
    {
        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(
            () => _authService.GetUserByUsernameAsync("nonexistent")
        );

        Assert.Equal("Utilisateur 'nonexistent' non trouvé", exception.Message);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
        _connection.Close();
        _connection.Dispose();
    }
}
