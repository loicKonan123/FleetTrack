using FleetTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FleetTrack.IntegrationTests.Helpers;

/// <summary>
/// Factory personnalisée pour créer une instance de l'application pour les tests d'intégration
/// Remplace la base de données SQLite par une base de données en mémoire
/// Chaque factory utilise une base de données unique pour éviter les conflits entre tests
/// </summary>
public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    // Chaque factory a sa propre base de données unique
    private readonly string _databaseName = $"FleetTrackTestDb_{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Supprimer le DbContext existant
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<FleetTrackDbContext>));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Ajouter un DbContext en mémoire pour les tests avec un nom unique
            services.AddDbContext<FleetTrackDbContext>(options =>
            {
                options.UseInMemoryDatabase(_databaseName);
            });
        });

        builder.UseEnvironment("Testing");
    }
}
