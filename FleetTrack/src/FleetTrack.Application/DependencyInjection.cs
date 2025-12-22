using FleetTrack.Application.Interfaces;
using FleetTrack.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace FleetTrack.Application;

/// <summary>
/// Configuration de l'injection de dépendances pour la couche Application
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Enregistre tous les services Application dans le conteneur DI
    /// </summary>
    /// <param name="services">Collection de services</param>
    /// <returns>La collection de services pour le chainage</returns>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Enregistrement automatique d'AutoMapper
        services.AddAutoMapper(assembly);

        // Enregistrement automatique de FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // Enregistrement des services métier
        services.AddScoped<IVehicleService, VehicleService>();
        services.AddScoped<IDriverService, DriverService>();
        services.AddScoped<IMissionService, MissionService>();

        return services;
    }
}
