using FleetTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FleetTrack.IntegrationTests.Helpers;

/// <summary>
/// Factory personnalisée pour créer une instance de l'application pour les tests d'intégration
/// Remplace la base de données SQLite par une base de données en mémoire
/// </summary>
public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
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

            // Ajouter un DbContext en mémoire pour les tests
            services.AddDbContext<FleetTrackDbContext>(options =>
            {
                options.UseInMemoryDatabase("InMemoryFleetTrackTest");
            });

            // Créer la base de données et appliquer le schéma
            var serviceProvider = services.BuildServiceProvider();
            using (var scope = serviceProvider.CreateScope())
            {
                var scopedServices = scope.ServiceProvider;
                var db = scopedServices.GetRequiredService<FleetTrackDbContext>();

                // Assurer que la base de données est créée
                db.Database.EnsureCreated();
            }
        });

        builder.UseEnvironment("Testing");
    }
}
