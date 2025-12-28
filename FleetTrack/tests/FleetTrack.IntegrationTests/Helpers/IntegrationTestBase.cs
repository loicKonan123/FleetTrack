using System.Net.Http.Headers;
using System.Net.Http.Json;
using FleetTrack.Application.DTOs.Auth;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Domain.Entities;
using FleetTrack.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;

namespace FleetTrack.IntegrationTests.Helpers;

/// <summary>
/// Classe de base pour tous les tests d'intégration
/// Fournit un client HTTP et des méthodes utilitaires
/// </summary>
public class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory<Program>>
{
    protected readonly HttpClient _client;
    protected readonly CustomWebApplicationFactory<Program> _factory;
    protected string? _authToken;

    public IntegrationTestBase(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();

        // Seed test data and authenticate
        SeedTestDataAndAuthenticate().GetAwaiter().GetResult();
    }

    /// <summary>
    /// Seed les données de test et authentifie le client
    /// </summary>
    private async Task SeedTestDataAndAuthenticate()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<FleetTrackDbContext>();

        // Nettoyer et recréer la base
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();

        // Vérifier si les rôles existent déjà
        if (!context.Roles.Any())
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
            await context.SaveChangesAsync();

            // Créer un utilisateur admin de test
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                Username = "testadmin",
                Email = "testadmin@fleettrack.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestAdmin123!"),
                FirstName = "Test",
                LastName = "Admin",
                RoleId = adminRole.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }

        // Authentifier le client
        await AuthenticateAsync("testadmin", "TestAdmin123!");
    }

    /// <summary>
    /// Authentifie le client HTTP avec les credentials fournis
    /// </summary>
    protected async Task AuthenticateAsync(string username, string password)
    {
        var loginDto = new LoginDto
        {
            Username = username,
            Password = password
        };

        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
        _authToken = result?.Data?.AccessToken;

        if (!string.IsNullOrEmpty(_authToken))
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _authToken);
        }
    }

    /// <summary>
    /// Nettoie la base de données avant chaque test
    /// </summary>
    protected async Task ClearDatabaseAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<FleetTrackDbContext>();

        context.GpsPositions.RemoveRange(context.GpsPositions);
        context.Waypoints.RemoveRange(context.Waypoints);
        context.Alerts.RemoveRange(context.Alerts);
        context.MaintenanceRecords.RemoveRange(context.MaintenanceRecords);
        context.Missions.RemoveRange(context.Missions);
        context.Drivers.RemoveRange(context.Drivers);
        context.Vehicles.RemoveRange(context.Vehicles);
        context.Zones.RemoveRange(context.Zones);

        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Obtient le contexte de base de données pour insérer des données de test
    /// </summary>
    protected FleetTrackDbContext GetDbContext()
    {
        var scope = _factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<FleetTrackDbContext>();
    }

    /// <summary>
    /// Envoie une requête POST et retourne la réponse désérialisée (extrait Data de ApiResponse)
    /// </summary>
    protected async Task<TResponse?> PostAsync<TRequest, TResponse>(string url, TRequest request)
    {
        var response = await _client.PostAsJsonAsync(url, request);
        response.EnsureSuccessStatusCode();
        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<TResponse>>();
        return apiResponse != null ? apiResponse.Data : default;
    }

    /// <summary>
    /// Envoie une requête GET et retourne la réponse désérialisée (extrait Data de ApiResponse)
    /// </summary>
    protected async Task<TResponse?> GetAsync<TResponse>(string url)
    {
        var response = await _client.GetAsync(url);
        response.EnsureSuccessStatusCode();
        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<TResponse>>();
        return apiResponse != null ? apiResponse.Data : default;
    }

    /// <summary>
    /// Envoie une requête PUT et retourne la réponse désérialisée (extrait Data de ApiResponse)
    /// </summary>
    protected async Task<TResponse?> PutAsync<TRequest, TResponse>(string url, TRequest request)
    {
        var response = await _client.PutAsJsonAsync(url, request);
        response.EnsureSuccessStatusCode();
        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<TResponse>>();
        return apiResponse != null ? apiResponse.Data : default;
    }

    /// <summary>
    /// Envoie une requête DELETE
    /// </summary>
    protected async Task<HttpResponseMessage> DeleteAsync(string url)
    {
        return await _client.DeleteAsync(url);
    }
}
