using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FleetTrack.Application.DTOs.Auth;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Domain.Entities;
using FleetTrack.Infrastructure.Data;
using FleetTrack.IntegrationTests.Helpers;
using Microsoft.Extensions.DependencyInjection;

namespace FleetTrack.IntegrationTests.Controllers;

public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory<Program> _factory;

    public AuthControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();

        // Seed test data
        using var scope = factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<FleetTrackDbContext>();

        // Nettoyer et recréer la base
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        SeedTestData(context);
    }

    private static void SeedTestData(FleetTrackDbContext context)
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

        var dispatcherRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = Role.Names.Dispatcher,
            Description = "Dispatcher",
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

        context.Roles.AddRange(adminRole, dispatcherRole, driverRole);
        context.SaveChanges();

        // Créer un utilisateur admin de test
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Username = "admin",
            Email = "admin@fleettrack.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            FirstName = "Admin",
            LastName = "User",
            RoleId = adminRole.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        // Créer un utilisateur driver de test
        var driverUser = new User
        {
            Id = Guid.NewGuid(),
            Username = "driver",
            Email = "driver@fleettrack.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Driver123!"),
            FirstName = "Driver",
            LastName = "User",
            RoleId = driverRole.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        context.Users.AddRange(adminUser, driverUser);
        context.SaveChanges();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturn200AndTokens()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "admin",
            Password = "Admin123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.NotNull(result.Data.AccessToken);
        Assert.NotNull(result.Data.RefreshToken);
        Assert.NotNull(result.Data.User);
        Assert.Equal("admin", result.Data.User.Username);
        Assert.Equal("Admin", result.Data.User.RoleName);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturn401()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "admin",
            Password = "WrongPassword!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ShouldReturn401()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "nonexistent",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithValidData_ShouldReturn201AndTokens()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Username = "newuser",
            Email = "newuser@fleettrack.com",
            Password = "NewUser123!",
            FirstName = "New",
            LastName = "User",
            PhoneNumber = "+33612345678",
            RoleName = Role.Names.Driver
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("newuser", result.Data.User.Username);
        Assert.Equal("newuser@fleettrack.com", result.Data.User.Email);
    }

    [Fact]
    public async Task Register_WithExistingUsername_ShouldReturn400()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Username = "admin", // Existe déjà
            Email = "another@fleettrack.com",
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            RoleName = Role.Names.Driver
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithExistingEmail_ShouldReturn400()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Username = "newuser2",
            Email = "admin@fleettrack.com", // Existe déjà
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            RoleName = Role.Names.Driver
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RefreshToken_WithValidToken_ShouldReturn200AndNewTokens()
    {
        // Arrange
        // D'abord se connecter pour obtenir un refresh token
        var loginDto = new LoginDto
        {
            Username = "admin",
            Password = "Admin123!"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();

        var refreshDto = new RefreshTokenDto
        {
            RefreshToken = loginResult!.Data!.RefreshToken
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/refresh", refreshDto);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.NotNull(result.Data.AccessToken);
        Assert.NotNull(result.Data.RefreshToken);

        // Vérifier que les tokens sont différents (rotation)
        Assert.NotEqual(loginResult.Data.AccessToken, result.Data.AccessToken);
        Assert.NotEqual(loginResult.Data.RefreshToken, result.Data.RefreshToken);
    }

    [Fact]
    public async Task RefreshToken_WithInvalidToken_ShouldReturn401()
    {
        // Arrange
        var refreshDto = new RefreshTokenDto
        {
            RefreshToken = "InvalidToken123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/refresh", refreshDto);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMe_WithValidToken_ShouldReturn200AndUserInfo()
    {
        // Arrange
        var token = await GetAuthTokenAsync("admin", "Admin123!");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/auth/me");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<UserDto>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("admin", result.Data.Username);
        Assert.Equal("admin@fleettrack.com", result.Data.Email);
    }

    [Fact]
    public async Task GetMe_WithoutToken_ShouldReturn401()
    {
        // Act
        var response = await _client.GetAsync("/api/auth/me");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetUserById_AsAdmin_ShouldReturn200()
    {
        // Arrange
        var token = await GetAuthTokenAsync("admin", "Admin123!");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Obtenir l'ID d'un utilisateur
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<FleetTrackDbContext>();
        var userId = context.Users.First(u => u.Username == "driver").Id;

        // Act
        var response = await _client.GetAsync($"/api/auth/{userId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<UserDto>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.Equal("driver", result.Data!.Username);
    }

    [Fact]
    public async Task GetUserById_AsDriver_ShouldReturn403()
    {
        // Arrange
        var token = await GetAuthTokenAsync("driver", "Driver123!");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Obtenir l'ID d'un utilisateur
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<FleetTrackDbContext>();
        var userId = context.Users.First(u => u.Username == "admin").Id;

        // Act
        var response = await _client.GetAsync($"/api/auth/{userId}");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task RevokeToken_AsAdmin_ShouldReturn200()
    {
        // Arrange
        var token = await GetAuthTokenAsync("admin", "Admin123!");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.PostAsync("/api/auth/revoke/driver", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        // Vérifier que le refresh token a été révoqué
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<FleetTrackDbContext>();
        var user = context.Users.First(u => u.Username == "driver");
        Assert.Null(user.RefreshToken);
        Assert.Null(user.RefreshTokenExpiryTime);
    }

    [Fact]
    public async Task RevokeToken_AsDriver_ShouldReturn403()
    {
        // Arrange
        var token = await GetAuthTokenAsync("driver", "Driver123!");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.PostAsync("/api/auth/revoke/admin", null);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task RevokeToken_WithNonExistentUser_ShouldReturn404()
    {
        // Arrange
        var token = await GetAuthTokenAsync("admin", "Admin123!");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.PostAsync("/api/auth/revoke/nonexistent", null);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AccessProtectedEndpoint_WithoutToken_ShouldReturn401()
    {
        // Act
        var response = await _client.GetAsync("/api/vehicles");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AccessProtectedEndpoint_WithValidToken_ShouldReturn200()
    {
        // Arrange
        var token = await GetAuthTokenAsync("admin", "Admin123!");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/vehicles");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task DeleteVehicle_AsDriver_ShouldReturn403()
    {
        // Arrange
        var token = await GetAuthTokenAsync("driver", "Driver123!");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var vehicleId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/vehicles/{vehicleId}");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    /// <summary>
    /// Méthode helper pour obtenir un token d'authentification
    /// </summary>
    private async Task<string> GetAuthTokenAsync(string username, string password)
    {
        var loginDto = new LoginDto
        {
            Username = username,
            Password = password
        };

        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        return result!.Data!.AccessToken;
    }
}
