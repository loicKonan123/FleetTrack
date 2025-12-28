using FleetTrack.Application.Interfaces;
using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Infrastructure.Data;
using FleetTrack.Infrastructure.Repositories;
using FleetTrack.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FleetTrack.Infrastructure;

/// <summary>
/// Configuration de l'injection de dépendances pour la couche Infrastructure
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Enregistre tous les services Infrastructure dans le conteneur DI
    /// </summary>
    /// <param name="services">Collection de services</param>
    /// <param name="configuration">Configuration de l'application</param>
    /// <returns>La collection de services pour le chainage</returns>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configuration du DbContext avec SQL Server
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<FleetTrackDbContext>(options =>
        {
            // Utiliser SQLite pour le développement (plus simple, pas besoin de SQL Server)
            if (connectionString.Contains("Data Source=") || connectionString.Contains("DataSource="))
            {
                // Configuration SQLite
                options.UseSqlite(connectionString);
            }
            else
            {
                // Configuration SQL Server pour la production
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);

                    sqlOptions.CommandTimeout(60);
                });
            }

            // En mode développement, activer les logs détaillés
#if DEBUG
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
#endif
        });

        // Enregistrement des repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<IDriverRepository, DriverRepository>();
        services.AddScoped<IMissionRepository, MissionRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();

        // Enregistrement des services d'authentification
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        // Enregistrement du service de gestion des utilisateurs
        services.AddScoped<IUserService, Application.Services.UserService>();

        // Enregistrement du service de tracking GPS
        services.AddScoped<IGpsTrackingService, GpsTrackingService>();

        // Enregistrement du service de sessions de tracking
        services.AddScoped<ITrackingSessionService, TrackingSessionService>();

        return services;
    }

    /// <summary>
    /// Enregistre Infrastructure avec une chaîne de connexion personnalisée
    /// </summary>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new ArgumentException("Connection string cannot be null or empty.", nameof(connectionString));

        services.AddDbContext<FleetTrackDbContext>(options =>
        {
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null);
            });

#if DEBUG
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
#endif
        });

        // Enregistrement des repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<IDriverRepository, DriverRepository>();
        services.AddScoped<IMissionRepository, MissionRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();

        // Enregistrement des services d'authentification
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        // Enregistrement du service de gestion des utilisateurs
        services.AddScoped<IUserService, Application.Services.UserService>();

        // Enregistrement du service de tracking GPS
        services.AddScoped<IGpsTrackingService, GpsTrackingService>();

        // Enregistrement du service de sessions de tracking
        services.AddScoped<ITrackingSessionService, TrackingSessionService>();

        return services;
    }
}
