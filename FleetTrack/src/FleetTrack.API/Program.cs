using FleetTrack.API.Extensions;
using FleetTrack.Application;
using FleetTrack.Infrastructure;
using Microsoft.EntityFrameworkCore;

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

// SignalR pour le tracking GPS en temps réel
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// CORS
builder.Services.AddCorsConfiguration();

// Swagger/OpenAPI avec support JWT
builder.Services.AddSwaggerConfiguration();

var app = builder.Build();

// Initialiser la base de données avec les données de base (rôles, admin)
// Skip migrations for in-memory database (used in integration tests)
if (!app.Environment.IsEnvironment("Testing"))
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<FleetTrack.Infrastructure.Data.FleetTrackDbContext>();

        // Créer la base de données et appliquer les migrations automatiquement
        await context.Database.MigrateAsync();

        // Seed les données initiales
        await FleetTrack.Infrastructure.Data.DataSeeder.SeedAsync(context);
    }
}

// Configure the HTTP request pipeline.

// Middleware de gestion des exceptions (doit être en premier)
app.UseExceptionMiddleware();

// Swagger en développement et production (avant CORS et Auth)
app.UseSwagger();
app.UseSwaggerUI();

// HTTPS Redirection uniquement en développement (Docker utilise HTTP)
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS - utiliser la politique selon l'environnement
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll"); // Permet les fichiers HTML locaux (file:///)
}
else
{
    app.UseCors("Production");
}

// Authentication doit être avant Authorization
app.UseAuthentication();
app.UseAuthorization();

// Mapper les controllers API
app.MapControllers();

// Mapper le hub SignalR pour le tracking GPS
app.MapHub<FleetTrack.API.Hubs.GpsHub>("/hubs/gps");

// Afficher les URLs importantes au démarrage
var urls = app.Urls.FirstOrDefault() ?? "http://localhost:5115";
var testSignalRPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "..", "test-signalr.html");

Console.WriteLine("\n╔════════════════════════════════════════════════════════════════╗");
Console.WriteLine("║        🚗 FleetTrack API - Démarrage réussi! 🚗               ║");
Console.WriteLine("╚════════════════════════════════════════════════════════════════╝");
Console.WriteLine();
Console.WriteLine("📡 URLs de l'API:");
Console.WriteLine($"   • Swagger UI:        {urls}/swagger");
Console.WriteLine($"   • Swagger (HTML):    {urls}/swagger/index.html");
Console.WriteLine($"   • Swagger JSON:      {urls}/swagger/v1/swagger.json");
Console.WriteLine($"   • API Base:          {urls}/api");
Console.WriteLine($"   • Health Check:      {urls}/health");
Console.WriteLine();
Console.WriteLine("🔐 Authentification:");
Console.WriteLine($"   • Login:             {urls}/api/auth/login");
Console.WriteLine($"   • Register:          {urls}/api/auth/register");
Console.WriteLine($"   • Mon profil:        {urls}/api/auth/me");
Console.WriteLine($"   • Refresh Token:     {urls}/api/auth/refresh");
Console.WriteLine();
Console.WriteLine("📊 Endpoints principaux:");
Console.WriteLine($"   • Véhicules:         {urls}/api/vehicles");
Console.WriteLine($"   • Chauffeurs:        {urls}/api/drivers");
Console.WriteLine($"   • Missions:          {urls}/api/missions");
Console.WriteLine($"   • GPS Tracking:      {urls}/api/gpstracking");
Console.WriteLine($"   • Alertes:           {urls}/api/alerts");
Console.WriteLine($"   • Maintenance:       {urls}/api/maintenance");
Console.WriteLine();
Console.WriteLine("🌐 SignalR (Temps Réel):");
Console.WriteLine($"   • Hub GPS:           {urls}/hubs/gps");
Console.WriteLine();
Console.WriteLine("🧪 Test SignalR:");
if (File.Exists(testSignalRPath))
{
    Console.WriteLine($"   • Page de test:      file:///{testSignalRPath.Replace("\\", "/")}");
}
else
{
    Console.WriteLine($"   • Page de test:      {Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "test-signalr.html")}");
}
Console.WriteLine();
Console.WriteLine("👤 Compte Admin par défaut:");
Console.WriteLine("   • Username:          admin");
Console.WriteLine("   • Password:          Admin123!");
Console.WriteLine("   • Rôle:              Admin (tous les droits)");
Console.WriteLine();
Console.WriteLine("════════════════════════════════════════════════════════════════");
Console.WriteLine();

app.Run();

// Make the implicit Program class public for integration tests
public partial class Program { }
