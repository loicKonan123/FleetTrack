using FleetTrack.API.Extensions;
using FleetTrack.Application;
using FleetTrack.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Configuration des couches Infrastructure et Application
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// Controllers avec configuration JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// JWT Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

// CORS
builder.Services.AddCorsConfiguration();

// Swagger/OpenAPI avec support JWT
builder.Services.AddSwaggerConfiguration();

var app = builder.Build();

// Initialiser la base de données avec les données de base (rôles, admin)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FleetTrack.Infrastructure.Data.FleetTrackDbContext>();
    await FleetTrack.Infrastructure.Data.DataSeeder.SeedAsync(context);
}

// Configure the HTTP request pipeline.

// Middleware de gestion des exceptions (doit être en premier)
app.UseExceptionMiddleware();

// Swagger en développement et production
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerConfiguration();
}
else
{
    // En production, optionnel selon les besoins
    // app.UseSwaggerConfiguration();
}

app.UseHttpsRedirection();

// CORS - utiliser la politique selon l'environnement
if (app.Environment.IsDevelopment())
{
    app.UseCors("Development");
}
else
{
    app.UseCors("Production");
}

// Authentication doit être avant Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Make the implicit Program class public for integration tests
public partial class Program { }
