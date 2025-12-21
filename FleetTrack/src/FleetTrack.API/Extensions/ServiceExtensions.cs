using FleetTrack.API.Middlewares;

namespace FleetTrack.API.Extensions;

/// <summary>
/// Extensions de services pour l'API
/// </summary>
public static class ServiceExtensions
{
    /// <summary>
    /// Configure CORS pour l'application
    /// </summary>
    public static IServiceCollection AddCorsConfiguration(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", builder =>
            {
                builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });

            options.AddPolicy("Development", builder =>
            {
                builder
                    .WithOrigins("http://localhost:3000", "http://localhost:4200", "http://localhost:5173")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });

            options.AddPolicy("Production", builder =>
            {
                builder
                    .WithOrigins() // Ajouter les origines autorisées en production
                    .WithMethods("GET", "POST", "PUT", "DELETE")
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        });

        return services;
    }

    /// <summary>
    /// Configure Swagger/OpenAPI
    /// </summary>
    public static IServiceCollection AddSwaggerConfiguration(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            // Inclure les commentaires XML pour Swagger
            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }
        });

        return services;
    }

    /// <summary>
    /// Configure le middleware de gestion des exceptions
    /// </summary>
    public static IApplicationBuilder UseExceptionMiddleware(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionMiddleware>();
    }

    /// <summary>
    /// Configure Swagger UI
    /// </summary>
    public static IApplicationBuilder UseSwaggerConfiguration(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "FleetTrack API v1");
            options.RoutePrefix = string.Empty; // Swagger UI à la racine
            options.DocumentTitle = "FleetTrack API Documentation";
            options.EnableDeepLinking();
            options.DisplayRequestDuration();
        });

        return app;
    }
}
