using FleetTrack.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Json;
using FleetTrack.Domain.Entities;

namespace FleetTrack.IntegrationTests.Helpers;

/// <summary>
/// Classe de base pour tous les tests d'intégration
/// Fournit un client HTTP et des méthodes utilitaires
/// </summary>
public class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory<Program>>
{
    protected readonly HttpClient _client;
    protected readonly CustomWebApplicationFactory<Program> _factory;

    public IntegrationTestBase(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
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
    /// Envoie une requête POST et retourne la réponse désérialisée
    /// </summary>
    protected async Task<TResponse?> PostAsync<TRequest, TResponse>(string url, TRequest request)
    {
        var response = await _client.PostAsJsonAsync(url, request);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<TResponse>();
    }

    /// <summary>
    /// Envoie une requête GET et retourne la réponse désérialisée
    /// </summary>
    protected async Task<TResponse?> GetAsync<TResponse>(string url)
    {
        var response = await _client.GetAsync(url);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<TResponse>();
    }

    /// <summary>
    /// Envoie une requête PUT et retourne la réponse désérialisée
    /// </summary>
    protected async Task<TResponse?> PutAsync<TRequest, TResponse>(string url, TRequest request)
    {
        var response = await _client.PutAsJsonAsync(url, request);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<TResponse>();
    }

    /// <summary>
    /// Envoie une requête DELETE
    /// </summary>
    protected async Task<HttpResponseMessage> DeleteAsync(string url)
    {
        return await _client.DeleteAsync(url);
    }
}
