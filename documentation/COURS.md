# 📚 Cours Complet - Développement d'API REST avec .NET 8 et Clean Architecture

**Projet de référence:** FleetTrack - Système de Gestion de Flotte
**Technologies:** ASP.NET Core 8.0, Entity Framework Core, SignalR, Docker
**Architecture:** Clean Architecture avec DDD
**Auteur:** Cours basé sur l'implémentation de FleetTrack
**Date:** Décembre 2025

---

## 📖 Table des Matières

1. [Introduction à Clean Architecture](#1-introduction-à-clean-architecture)
2. [ASP.NET Core 8.0 - Les Fondamentaux](#2-aspnet-core-80---les-fondamentaux)
3. [Entity Framework Core - ORM Moderne](#3-entity-framework-core---orm-moderne)
4. [Authentification JWT](#4-authentification-jwt)
5. [SignalR - Communication Temps Réel](#5-signalr---communication-temps-réel)
6. [Docker et Containerisation](#6-docker-et-containerisation)
7. [Tests Automatisés](#7-tests-automatisés)
8. [CI/CD avec GitHub Actions](#8-cicd-avec-github-actions)
9. [Patterns de Conception](#9-patterns-de-conception)
10. [Bonnes Pratiques](#10-bonnes-pratiques)

---

## 1. Introduction à Clean Architecture

### 1.1 Qu'est-ce que Clean Architecture?

Clean Architecture est un pattern architectural créé par Robert C. Martin (Uncle Bob) qui vise à créer des systèmes:
- **Indépendants des frameworks**
- **Testables**
- **Indépendants de l'UI**
- **Indépendants de la base de données**
- **Indépendants de tout agent externe**

### 1.2 Les Couches de Clean Architecture

Dans FleetTrack, nous avons 4 couches principales:

```
┌─────────────────────────────────────────┐
│     FleetTrack.API (Presentation)       │  ← Controllers, Middlewares, Hubs
├─────────────────────────────────────────┤
│   FleetTrack.Application (Business)    │  ← Services, DTOs, Interfaces
├─────────────────────────────────────────┤
│  FleetTrack.Infrastructure (Data)      │  ← Repositories, DbContext, Services externes
├─────────────────────────────────────────┤
│     FleetTrack.Domain (Core)           │  ← Entities, Enums, Value Objects
└─────────────────────────────────────────┘
```

#### 1.2.1 Domain Layer (Couche Domaine)

**Responsabilité:** Contient la logique métier pure, les entités et les règles business.

**Exemple - Entité Vehicle:**

```csharp
public class Vehicle : BaseEntity
{
    public string RegistrationNumber { get; set; } = string.Empty;
    public VehicleType Type { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public VehicleStatus Status { get; set; }
    public double CurrentMileage { get; set; }
    public double FuelCapacity { get; set; }

    // Relations
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
    public ICollection<GpsPosition> GpsPositions { get; set; } = new List<GpsPosition>();
}
```

**Caractéristiques:**
- Pas de dépendances externes
- Logique métier pure
- Entities représentent le modèle du domaine
- Enums pour les états et types

#### 1.2.2 Application Layer (Couche Application)

**Responsabilité:** Orchestre la logique business, coordonne les entités, expose les interfaces.

**Exemple - Service:**

```csharp
public class VehicleService : IVehicleService
{
    private readonly IVehicleRepository _repository;
    private readonly IMapper _mapper;

    public VehicleService(IVehicleRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<VehicleDto> CreateAsync(CreateVehicleDto dto)
    {
        // 1. Validation métier
        var existingVehicle = await _repository.GetByRegistrationNumberAsync(dto.RegistrationNumber);
        if (existingVehicle != null)
            throw new BusinessException("Un véhicule avec ce numéro existe déjà");

        // 2. Mapping DTO → Entity
        var vehicle = _mapper.Map<Vehicle>(dto);

        // 3. Persistence
        await _repository.AddAsync(vehicle);

        // 4. Mapping Entity → DTO
        return _mapper.Map<VehicleDto>(vehicle);
    }
}
```

**DTOs (Data Transfer Objects):**

```csharp
public class VehicleDto
{
    public Guid Id { get; set; }
    public string RegistrationNumber { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
```

#### 1.2.3 Infrastructure Layer (Couche Infrastructure)

**Responsabilité:** Implémente les interfaces définies dans Application, accès aux données, services externes.

**Exemple - Repository:**

```csharp
public class VehicleRepository : Repository<Vehicle>, IVehicleRepository
{
    public VehicleRepository(FleetTrackDbContext context) : base(context) { }

    public async Task<IEnumerable<Vehicle>> GetAvailableAsync()
    {
        return await _dbSet
            .Where(v => !v.IsDeleted && v.Status == VehicleStatus.Available)
            .Include(v => v.Missions)
            .ToListAsync();
    }

    public async Task<Vehicle?> GetByRegistrationNumberAsync(string regNumber)
    {
        return await _dbSet
            .FirstOrDefaultAsync(v => v.RegistrationNumber == regNumber && !v.IsDeleted);
    }
}
```

**DbContext:**

```csharp
public class FleetTrackDbContext : DbContext
{
    public FleetTrackDbContext(DbContextOptions<FleetTrackDbContext> options)
        : base(options) { }

    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<Mission> Missions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configurations des entités
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
```

#### 1.2.4 API Layer (Couche Présentation)

**Responsabilité:** Expose les endpoints HTTP, gère les requêtes/réponses, authentification, autorisation.

**Exemple - Controller:**

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Dispatcher,Viewer")]
    public async Task<ActionResult<IEnumerable<VehicleDto>>> GetAll()
    {
        var vehicles = await _vehicleService.GetAllAsync();
        return Ok(vehicles);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<VehicleDto>> Create([FromBody] CreateVehicleDto dto)
    {
        var vehicle = await _vehicleService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = vehicle.Id }, vehicle);
    }
}
```

### 1.3 Dependency Injection (DI)

La DI est cruciale pour Clean Architecture. Elle permet l'inversion de contrôle.

**Enregistrement des services:**

```csharp
// Program.cs
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// Infrastructure/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<FleetTrackDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IVehicleRepository, VehicleRepository>();

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IGpsTrackingService, GpsTrackingService>();

        return services;
    }
}
```

### 1.4 Avantages de Clean Architecture

✅ **Testabilité:** Chaque couche peut être testée indépendamment
✅ **Maintenabilité:** Code organisé et facile à modifier
✅ **Scalabilité:** Facile d'ajouter de nouvelles fonctionnalités
✅ **Indépendance:** Changement de base de données ou framework sans impact majeur
✅ **Séparation des responsabilités:** Chaque couche a un rôle précis

---

## 2. ASP.NET Core 8.0 - Les Fondamentaux

### 2.1 Qu'est-ce qu'ASP.NET Core?

ASP.NET Core est un framework open-source, cross-platform pour créer des applications web modernes:
- **Cross-platform:** Windows, Linux, macOS
- **Haute performance:** Un des frameworks web les plus rapides
- **Modulaire:** Ne chargez que ce dont vous avez besoin
- **Cloud-ready:** Conçu pour le cloud

### 2.2 Structure d'un Projet ASP.NET Core

**Program.cs - Point d'entrée de l'application:**

```csharp
var builder = WebApplication.CreateBuilder(args);

// ===== CONFIGURATION DES SERVICES =====
// Services de l'application
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// Controllers avec configuration JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Authentification JWT
builder.Services.AddJwtAuthentication(builder.Configuration);

// SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
});

// CORS
builder.Services.AddCorsConfiguration();

// Swagger
builder.Services.AddSwaggerConfiguration();

var app = builder.Build();

// ===== MIDDLEWARE PIPELINE =====
// 1. Gestion des exceptions (toujours en premier)
app.UseExceptionMiddleware();

// 2. Swagger (en développement)
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerConfiguration();
}

// 3. HTTPS Redirection
app.UseHttpsRedirection();

// 4. CORS
app.UseCors("Development");

// 5. Authentication (avant Authorization!)
app.UseAuthentication();

// 6. Authorization
app.UseAuthorization();

// 7. Mapper les endpoints
app.MapControllers();
app.MapHub<GpsHub>("/hubs/gps");

app.Run();
```

### 2.3 Controllers et Routing

**Attributs de routing:**

```csharp
[ApiController]                    // Active les fonctionnalités API
[Route("api/[controller]")]        // Route de base: /api/vehicles
[Authorize]                        // Nécessite une authentification
public class VehiclesController : ControllerBase
{
    // GET /api/vehicles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VehicleDto>>> GetAll()
    {
        // ...
    }

    // GET /api/vehicles/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<VehicleDto>> GetById(Guid id)
    {
        // ...
    }

    // POST /api/vehicles
    [HttpPost]
    public async Task<ActionResult<VehicleDto>> Create([FromBody] CreateVehicleDto dto)
    {
        // ...
    }

    // PUT /api/vehicles/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<VehicleDto>> Update(Guid id, [FromBody] UpdateVehicleDto dto)
    {
        // ...
    }

    // DELETE /api/vehicles/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        // ...
    }
}
```

### 2.4 Model Binding

ASP.NET Core peut extraire des données de plusieurs sources:

```csharp
public async Task<IActionResult> Example(
    [FromRoute] Guid id,           // URL: /api/vehicles/{id}
    [FromQuery] string? search,    // Query string: ?search=ABC
    [FromBody] CreateDto dto,      // Body JSON
    [FromHeader] string auth,      // Header: Authorization
    [FromForm] IFormFile file)     // Form data (upload)
{
    // ...
}
```

### 2.5 Middleware Pipeline

Le middleware traite les requêtes HTTP dans l'ordre:

```
Request → Middleware 1 → Middleware 2 → ... → Endpoint
         ↓              ↓                    ↓
Response ← Middleware 1 ← Middleware 2 ← ... ← Endpoint
```

**Exemple - Middleware personnalisé:**

```csharp
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);  // Appeler le middleware suivant
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Une erreur s'est produite");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = exception switch
        {
            NotFoundException => StatusCodes.Status404NotFound,
            UnauthorizedException => StatusCodes.Status401Unauthorized,
            BusinessException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };

        var response = new
        {
            StatusCode = context.Response.StatusCode,
            Message = exception.Message,
            Details = exception.StackTrace
        };

        return context.Response.WriteAsJsonAsync(response);
    }
}
```

### 2.6 Configuration

ASP.NET Core utilise un système de configuration hiérarchique:

**appsettings.json:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=FleetTrack.db"
  },
  "Jwt": {
    "Secret": "VotreSuperSecretKeyDePlus32Caracteres!",
    "Issuer": "FleetTrackAPI",
    "Audience": "FleetTrackClients",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:4200"
    ]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

**Utilisation dans le code:**

```csharp
// Injection de IConfiguration
public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private string GetJwtSecret()
    {
        return _configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT Secret not configured");
    }
}

// Ou avec Options Pattern
public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; }
}

// Dans Program.cs
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// Injection
public AuthService(IOptions<JwtSettings> jwtSettings)
{
    _jwtSettings = jwtSettings.Value;
}
```

---

## 3. Entity Framework Core - ORM Moderne

### 3.1 Qu'est-ce qu'Entity Framework Core?

EF Core est un ORM (Object-Relational Mapper) qui permet de:
- Manipuler la base de données avec des objets C#
- Éviter d'écrire du SQL manuel
- Supporter plusieurs bases de données (SQL Server, SQLite, PostgreSQL, MySQL, etc.)

### 3.2 Code First vs Database First

**Code First (Utilisé dans FleetTrack):**
- Définir les entités en C#
- EF Core génère la base de données

**Database First:**
- Base de données existante
- EF Core génère les entités

### 3.3 Entités et Relations

**Entité de base:**

```csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;  // Soft delete
}
```

**Relations One-to-Many:**

```csharp
public class Vehicle : BaseEntity
{
    // Propriétés scalaires
    public string RegistrationNumber { get; set; } = string.Empty;

    // Navigation property (One-to-Many)
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
    public ICollection<GpsPosition> GpsPositions { get; set; } = new List<GpsPosition>();
}

public class Mission : BaseEntity
{
    // Foreign Key
    public Guid VehicleId { get; set; }

    // Navigation property
    public Vehicle Vehicle { get; set; } = null!;
}
```

**Relations Many-to-Many (via table de jonction):**

```csharp
public class Driver : BaseEntity
{
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
}

public class Mission : BaseEntity
{
    public Guid DriverId { get; set; }
    public Driver Driver { get; set; } = null!;
}
```

### 3.4 Fluent API Configuration

**Configuration des entités:**

```csharp
public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        // Table name
        builder.ToTable("Vehicles");

        // Primary Key
        builder.HasKey(v => v.Id);

        // Properties
        builder.Property(v => v.RegistrationNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(v => v.Brand)
            .IsRequired()
            .HasMaxLength(50);

        // Indexes
        builder.HasIndex(v => v.RegistrationNumber)
            .IsUnique();

        // Relations
        builder.HasMany(v => v.Missions)
            .WithOne(m => m.Vehicle)
            .HasForeignKey(m => m.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query Filter (Soft Delete)
        builder.HasQueryFilter(v => !v.IsDeleted);
    }
}
```

### 3.5 DbContext

```csharp
public class FleetTrackDbContext : DbContext
{
    public FleetTrackDbContext(DbContextOptions<FleetTrackDbContext> options)
        : base(options) { }

    // DbSets
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<Mission> Missions { get; set; }
    public DbSet<GpsPosition> GpsPositions { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Appliquer toutes les configurations
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Mettre à jour CreatedAt et UpdatedAt automatiquement
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
```

### 3.6 Migrations

Les migrations permettent de gérer l'évolution du schéma de base de données.

**Créer une migration:**

```bash
# Depuis le répertoire de l'API
cd FleetTrack/src/FleetTrack.API

# Créer une migration
dotnet ef migrations add NomDeLaMigration \
  --project ../FleetTrack.Infrastructure/FleetTrack.Infrastructure.csproj

# Appliquer les migrations
dotnet ef database update \
  --project ../FleetTrack.Infrastructure/FleetTrack.Infrastructure.csproj

# Supprimer la dernière migration
dotnet ef migrations remove \
  --project ../FleetTrack.Infrastructure/FleetTrack.Infrastructure.csproj
```

**Fichier de migration généré:**

```csharp
public partial class CreateVehiclesTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Vehicles",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                RegistrationNumber = table.Column<string>(maxLength: 20, nullable: false),
                Brand = table.Column<string>(maxLength: 50, nullable: false),
                Model = table.Column<string>(maxLength: 50, nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false),
                IsDeleted = table.Column<bool>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Vehicles", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Vehicles_RegistrationNumber",
            table: "Vehicles",
            column: "RegistrationNumber",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Vehicles");
    }
}
```

### 3.7 Requêtes LINQ

```csharp
// Requête simple
var vehicles = await _context.Vehicles
    .Where(v => v.Status == VehicleStatus.Available)
    .ToListAsync();

// Requête avec Include (Eager Loading)
var vehicle = await _context.Vehicles
    .Include(v => v.Missions)
    .Include(v => v.GpsPositions.OrderByDescending(g => g.Timestamp).Take(1))
    .FirstOrDefaultAsync(v => v.Id == id);

// Pagination
var vehicles = await _context.Vehicles
    .Skip((pageNumber - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();

// Projection (Select)
var vehicleSummaries = await _context.Vehicles
    .Select(v => new VehicleSummaryDto
    {
        Id = v.Id,
        RegistrationNumber = v.RegistrationNumber,
        Status = v.Status.ToString()
    })
    .ToListAsync();

// Agrégation
var totalVehicles = await _context.Vehicles.CountAsync();
var averageMileage = await _context.Vehicles.AverageAsync(v => v.CurrentMileage);

// Requête avec condition
var searchResults = await _context.Vehicles
    .Where(v => v.RegistrationNumber.Contains(searchTerm) ||
                v.Brand.Contains(searchTerm) ||
                v.Model.Contains(searchTerm))
    .ToListAsync();
```

### 3.8 Tracking vs No-Tracking

```csharp
// Avec tracking (par défaut) - EF Core surveille les modifications
var vehicle = await _context.Vehicles.FindAsync(id);
vehicle.Status = VehicleStatus.Maintenance;
await _context.SaveChangesAsync();  // UPDATE automatique

// Sans tracking (meilleure performance pour lecture seule)
var vehicles = await _context.Vehicles
    .AsNoTracking()
    .ToListAsync();
```

### 3.9 Transactions

```csharp
using var transaction = await _context.Database.BeginTransactionAsync();

try
{
    // Opération 1
    var vehicle = await _context.Vehicles.FindAsync(vehicleId);
    vehicle.Status = VehicleStatus.OnMission;

    // Opération 2
    var mission = new Mission { VehicleId = vehicleId, /* ... */ };
    _context.Missions.Add(mission);

    await _context.SaveChangesAsync();
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

---

## 4. Authentification JWT

### 4.1 Qu'est-ce que JWT?

JWT (JSON Web Token) est un standard ouvert (RFC 7519) pour créer des tokens d'accès qui permettent de vérifier l'identité d'un utilisateur.

**Structure d'un JWT:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

HEADER.PAYLOAD.SIGNATURE
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": "user-id",
  "name": "John Doe",
  "role": "Admin",
  "exp": 1516239022
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### 4.2 Configuration de JWT dans ASP.NET Core

**appsettings.json:**

```json
{
  "Jwt": {
    "Secret": "VotreSuperSecretKeyDePlus32Caracteres!",
    "Issuer": "FleetTrackAPI",
    "Audience": "FleetTrackClients",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  }
}
```

**Extension Method pour JWT:**

```csharp
public static class JwtExtensions
{
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSecret = configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT Secret not configured");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ClockSkew = TimeSpan.Zero  // Pas de tolérance sur l'expiration
            };

            // Configuration pour SignalR
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;

                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        return services;
    }
}
```

### 4.3 Génération de Tokens

**AuthService - Génération de JWT:**

```csharp
public class AuthService : IAuthService
{
    private readonly FleetTrackDbContext _context;
    private readonly IConfiguration _configuration;

    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.GivenName, user.FirstName),
            new Claim(ClaimTypes.Surname, user.LastName),
            new Claim(ClaimTypes.Role, user.Role.Name),
            new Claim("RoleId", user.RoleId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["Jwt:ExpiryMinutes"]!)),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
```

### 4.4 Endpoints d'Authentification

**Login:**

```csharp
[HttpPost("login")]
[AllowAnonymous]
public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto loginDto)
{
    var user = await _context.Users
        .Include(u => u.Role)
        .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

    if (user == null)
        return Unauthorized(new { message = "Identifiants invalides" });

    // Vérifier le mot de passe hashé
    if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        return Unauthorized(new { message = "Identifiants invalides" });

    if (!user.IsActive)
        return Unauthorized(new { message = "Compte désactivé" });

    // Générer les tokens
    var accessToken = GenerateJwtToken(user);
    var refreshToken = GenerateRefreshToken();

    // Sauvegarder le refresh token
    user.RefreshToken = refreshToken;
    user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
        int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"]!));
    user.LastLoginDate = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return Ok(new LoginResponseDto
    {
        AccessToken = accessToken,
        RefreshToken = refreshToken,
        ExpiresAt = DateTime.UtcNow.AddMinutes(
            int.Parse(_configuration["Jwt:ExpiryMinutes"]!)),
        User = _mapper.Map<UserDto>(user)
    });
}
```

**Refresh Token:**

```csharp
[HttpPost("refresh")]
[AllowAnonymous]
public async Task<ActionResult<LoginResponseDto>> Refresh([FromBody] RefreshTokenDto dto)
{
    var user = await _context.Users
        .Include(u => u.Role)
        .FirstOrDefaultAsync(u => u.RefreshToken == dto.RefreshToken);

    if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        return Unauthorized(new { message = "Refresh token invalide ou expiré" });

    // Générer de nouveaux tokens
    var accessToken = GenerateJwtToken(user);
    var newRefreshToken = GenerateRefreshToken();

    // Rotation du refresh token
    user.RefreshToken = newRefreshToken;
    user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
        int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"]!));

    await _context.SaveChangesAsync();

    return Ok(new LoginResponseDto
    {
        AccessToken = accessToken,
        RefreshToken = newRefreshToken,
        ExpiresAt = DateTime.UtcNow.AddMinutes(
            int.Parse(_configuration["Jwt:ExpiryMinutes"]!)),
        User = _mapper.Map<UserDto>(user)
    });
}
```

### 4.5 Autorisation basée sur les Rôles

**Utilisation dans les Controllers:**

```csharp
// Nécessite une authentification (n'importe quel rôle)
[Authorize]
public class VehiclesController : ControllerBase
{
    // Admin et Dispatcher peuvent créer
    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<VehicleDto>> Create(CreateVehicleDto dto)
    {
        // ...
    }

    // Tout le monde peut lire
    [HttpGet]
    [Authorize(Roles = "Admin,Dispatcher,Driver,Viewer")]
    public async Task<ActionResult<IEnumerable<VehicleDto>>> GetAll()
    {
        // ...
    }

    // Seulement Admin peut supprimer
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        // ...
    }
}
```

**Accéder aux informations de l'utilisateur connecté:**

```csharp
[HttpGet("me")]
[Authorize]
public async Task<ActionResult<UserDto>> GetCurrentUser()
{
    // Récupérer l'ID de l'utilisateur depuis les claims
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        return Unauthorized();

    var user = await _context.Users
        .Include(u => u.Role)
        .FirstOrDefaultAsync(u => u.Id == userId);

    if (user == null)
        return NotFound();

    return Ok(_mapper.Map<UserDto>(user));
}
```

### 4.6 Hachage des Mots de Passe

**Utilisation de BCrypt:**

```csharp
// Lors de la création d'un utilisateur
public async Task<UserDto> RegisterAsync(RegisterDto dto)
{
    // Vérifier si l'utilisateur existe déjà
    var existingUser = await _context.Users
        .FirstOrDefaultAsync(u => u.Username == dto.Username || u.Email == dto.Email);

    if (existingUser != null)
        throw new BusinessException("Un utilisateur avec ce nom ou email existe déjà");

    // Hasher le mot de passe
    var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

    var user = new User
    {
        Username = dto.Username,
        Email = dto.Email,
        FirstName = dto.FirstName,
        LastName = dto.LastName,
        PasswordHash = passwordHash,
        RoleId = dto.RoleId,
        IsActive = true
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    return _mapper.Map<UserDto>(user);
}

// Lors de la vérification
var isPasswordValid = BCrypt.Net.BCrypt.Verify(inputPassword, user.PasswordHash);
```

---

## 5. SignalR - Communication Temps Réel

### 5.1 Qu'est-ce que SignalR?

SignalR est une bibliothèque pour ASP.NET Core qui facilite l'ajout de fonctionnalités web temps réel:
- **WebSockets** en premier choix
- Fallback automatique vers Server-Sent Events ou Long Polling
- Communication **bidirectionnelle** entre client et serveur
- Gestion automatique de la **reconnexion**

### 5.2 Cas d'Usage

✅ Chat en temps réel
✅ Notifications push
✅ Tableaux de bord en direct
✅ **Tracking GPS en temps réel** (FleetTrack)
✅ Jeux multijoueurs
✅ Collaboration en temps réel

### 5.3 Configuration de SignalR

**Program.cs:**

```csharp
// Ajouter SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// ...

// Mapper le hub
app.MapHub<GpsHub>("/hubs/gps");
```

### 5.4 Création d'un Hub

**Interface typée pour les clients:**

```csharp
public interface IGpsClient
{
    Task ReceiveGpsPosition(GpsPositionUpdateDto position);
    Task ReceiveTrackingEvent(TrackingEventDto trackingEvent);
    Task SubscriptionConfirmed(Guid vehicleId);
    Task UnsubscriptionConfirmed(Guid vehicleId);
    Task SubscribedToAllVehicles();
    Task UnsubscribedFromAllVehicles();
}
```

**Hub avec authentification:**

```csharp
[Authorize]
public class GpsHub : Hub<IGpsClient>
{
    private readonly ILogger<GpsHub> _logger;
    private static readonly Dictionary<string, HashSet<Guid>> UserVehicleSubscriptions = new();
    private static readonly Dictionary<Guid, HashSet<string>> VehicleSubscribers = new();
    private static readonly object LockObject = new();

    public GpsHub(ILogger<GpsHub> logger)
    {
        _logger = logger;
    }

    // Appelé quand un client se connecte
    public override async Task OnConnectedAsync()
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
        _logger.LogInformation("Client connecté: {ConnectionId}, User: {Username}",
            Context.ConnectionId, username);

        await Groups.AddToGroupAsync(Context.ConnectionId, "all");
        await base.OnConnectedAsync();
    }

    // Appelé quand un client se déconnecte
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
        _logger.LogInformation("Client déconnecté: {ConnectionId}, User: {Username}",
            Context.ConnectionId, username);

        // Nettoyage des abonnements
        lock (LockObject)
        {
            if (UserVehicleSubscriptions.TryGetValue(Context.ConnectionId, out var vehicleIds))
            {
                foreach (var vehicleId in vehicleIds)
                {
                    if (VehicleSubscribers.TryGetValue(vehicleId, out var subscribers))
                    {
                        subscribers.Remove(Context.ConnectionId);
                        if (subscribers.Count == 0)
                            VehicleSubscribers.Remove(vehicleId);
                    }
                }
                UserVehicleSubscriptions.Remove(Context.ConnectionId);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    // Méthode appelable par les clients
    public async Task SubscribeToVehicle(Guid vehicleId)
    {
        lock (LockObject)
        {
            if (!UserVehicleSubscriptions.ContainsKey(Context.ConnectionId))
                UserVehicleSubscriptions[Context.ConnectionId] = new HashSet<Guid>();
            UserVehicleSubscriptions[Context.ConnectionId].Add(vehicleId);

            if (!VehicleSubscribers.ContainsKey(vehicleId))
                VehicleSubscribers[vehicleId] = new HashSet<string>();
            VehicleSubscribers[vehicleId].Add(Context.ConnectionId);
        }

        // Ajouter au groupe SignalR
        await Groups.AddToGroupAsync(Context.ConnectionId, $"vehicle_{vehicleId}");

        // Confirmer au client
        await Clients.Caller.SubscriptionConfirmed(vehicleId);
    }

    // Envoyer une position GPS (appelé par les véhicules ou le serveur)
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task SendGpsPosition(GpsPositionUpdateDto position)
    {
        _logger.LogInformation("Position GPS reçue pour le véhicule {VehicleId}",
            position.VehicleId);

        // Diffuser aux clients abonnés à ce véhicule
        await Clients.Group($"vehicle_{position.VehicleId}")
            .ReceiveGpsPosition(position);

        // Diffuser à ceux abonnés à tous les véhicules
        await Clients.Group("all_vehicles")
            .ReceiveGpsPosition(position);
    }

    // Envoyer un événement de tracking
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task SendTrackingEvent(TrackingEventDto trackingEvent)
    {
        await Clients.Group($"vehicle_{trackingEvent.VehicleId}")
            .ReceiveTrackingEvent(trackingEvent);

        await Clients.Group("all_vehicles")
            .ReceiveTrackingEvent(trackingEvent);
    }
}
```

### 5.5 Client JavaScript/TypeScript

**Installation:**

```bash
npm install @microsoft/signalr
```

**Connexion au Hub:**

```javascript
import * as signalR from "@microsoft/signalr";

// Créer la connexion
const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5115/hubs/gps", {
    accessTokenFactory: () => localStorage.getItem("accessToken")
  })
  .withAutomaticReconnect()  // Reconnexion automatique
  .configureLogging(signalR.LogLevel.Information)
  .build();

// Gérer les événements de connexion
connection.onreconnecting((error) => {
  console.log("Reconnexion en cours...", error);
});

connection.onreconnected((connectionId) => {
  console.log("Reconnecté avec l'ID:", connectionId);
});

connection.onclose((error) => {
  console.log("Connexion fermée:", error);
});

// Écouter les messages du serveur
connection.on("ReceiveGpsPosition", (position) => {
  console.log("Nouvelle position GPS:", position);
  updateMapMarker(position.vehicleId, position.latitude, position.longitude);
});

connection.on("ReceiveTrackingEvent", (event) => {
  console.log("Événement de tracking:", event);
  showNotification(event.message);
});

connection.on("SubscriptionConfirmed", (vehicleId) => {
  console.log("Abonné au véhicule:", vehicleId);
});

// Démarrer la connexion
async function start() {
  try {
    await connection.start();
    console.log("SignalR connecté!");

    // S'abonner à un véhicule
    await connection.invoke("SubscribeToVehicle", vehicleId);

    // S'abonner à tous les véhicules
    await connection.invoke("SubscribeToAllVehicles");
  } catch (err) {
    console.error("Erreur de connexion:", err);
    setTimeout(start, 5000);  // Réessayer après 5 secondes
  }
}

start();
```

**Hook React personnalisé:**

```typescript
// useGpsTracking.ts
import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

interface GpsPosition {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: string;
}

export function useGpsTracking(vehicleId?: string) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [positions, setPositions] = useState<Map<string, GpsPosition>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5115/hubs/gps", {
        accessTokenFactory: () => localStorage.getItem("accessToken") || ""
      })
      .withAutomaticReconnect()
      .build();

    newConnection.on("ReceiveGpsPosition", (position: GpsPosition) => {
      setPositions(prev => new Map(prev).set(position.vehicleId, position));
    });

    newConnection.start()
      .then(() => {
        setIsConnected(true);
        if (vehicleId) {
          newConnection.invoke("SubscribeToVehicle", vehicleId);
        } else {
          newConnection.invoke("SubscribeToAllVehicles");
        }
      })
      .catch(err => console.error("Erreur SignalR:", err));

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, [vehicleId]);

  return { positions, isConnected, connection };
}

// Utilisation dans un composant
function MapComponent() {
  const { positions, isConnected } = useGpsTracking();

  return (
    <div>
      <div>État: {isConnected ? "Connecté" : "Déconnecté"}</div>
      <Map>
        {Array.from(positions.values()).map(pos => (
          <Marker
            key={pos.vehicleId}
            position={[pos.latitude, pos.longitude]}
          />
        ))}
      </Map>
    </div>
  );
}
```

### 5.6 Groupes SignalR

Les groupes permettent de diffuser des messages à des sous-ensembles de clients:

```csharp
// Ajouter un client à un groupe
await Groups.AddToGroupAsync(Context.ConnectionId, "vehicle_" + vehicleId);

// Retirer un client d'un groupe
await Groups.RemoveFromGroupAsync(Context.ConnectionId, "vehicle_" + vehicleId);

// Envoyer à un groupe spécifique
await Clients.Group("vehicle_123").ReceiveGpsPosition(position);

// Envoyer à tous sauf l'appelant
await Clients.Others.ReceiveMessage(message);

// Envoyer à un client spécifique
await Clients.Client(connectionId).ReceiveMessage(message);

// Envoyer à l'appelant
await Clients.Caller.ReceiveMessage(message);

// Envoyer à tous
await Clients.All.ReceiveMessage(message);
```

### 5.7 SignalR avec JWT

Pour utiliser JWT avec SignalR, on configure l'authentification dans les options:

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Configuration JWT standard...

        // Configuration spécifique pour SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                // Si la requête est pour un hub SignalR
                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });
```

**Côté client, passer le token:**

```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5115/hubs/gps", {
    accessTokenFactory: () => yourJwtToken  // Fournir le token ici
  })
  .build();
```

---

## 6. Docker et Containerisation

### 6.1 Qu'est-ce que Docker?

Docker est une plateforme de containerisation qui permet de:
- **Empaqueter** une application avec toutes ses dépendances
- **Isoler** l'application de l'environnement hôte
- **Déployer** facilement sur n'importe quel système
- **Scaler** horizontalement

### 6.2 Concepts de Base

**Image:** Template read-only contenant l'application et ses dépendances
**Container:** Instance en cours d'exécution d'une image
**Dockerfile:** Fichier de configuration pour créer une image
**Docker Compose:** Outil pour définir et exécuter des applications multi-conteneurs

### 6.3 Dockerfile Multi-Stage

Un Dockerfile multi-stage permet de:
- Réduire la taille de l'image finale
- Séparer les outils de build et de runtime
- Améliorer la sécurité

**Dockerfile de FleetTrack:**

```dockerfile
# ===== STAGE 1: BUILD =====
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copier les fichiers de projet
COPY ["FleetTrack.sln", "./"]
COPY ["src/FleetTrack.API/FleetTrack.API.csproj", "src/FleetTrack.API/"]
COPY ["src/FleetTrack.Application/FleetTrack.Application.csproj", "src/FleetTrack.Application/"]
COPY ["src/FleetTrack.Domain/FleetTrack.Domain.csproj", "src/FleetTrack.Domain/"]
COPY ["src/FleetTrack.Infrastructure/FleetTrack.Infrastructure.csproj", "src/FleetTrack.Infrastructure/"]

# Restaurer les dépendances
RUN dotnet restore "src/FleetTrack.API/FleetTrack.API.csproj"

# Copier tout le code source
COPY . .

# Build l'application
WORKDIR "/src/src/FleetTrack.API"
RUN dotnet build "FleetTrack.API.csproj" -c Release -o /app/build

# ===== STAGE 2: PUBLISH =====
FROM build AS publish
RUN dotnet publish "FleetTrack.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ===== STAGE 3: RUNTIME =====
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 fleettrack && \
    adduser --system --uid 1001 --ingroup fleettrack fleettrack

# Copier les fichiers publiés depuis l'étape publish
COPY --from=publish /app/publish .

# Créer le répertoire de données pour SQLite
RUN mkdir -p /app/data && \
    chown -R fleettrack:fleettrack /app

# Passer à l'utilisateur non-root
USER fleettrack

# Exposer le port
EXPOSE 8080

# Variables d'environnement
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Point d'entrée
ENTRYPOINT ["dotnet", "FleetTrack.API.dll"]
```

**Avantages:**
- Image SDK (1+ GB) uniquement pour le build
- Image finale avec runtime seulement (~200 MB)
- Sécurité: utilisateur non-root
- Health check intégré

### 6.4 Docker Compose

Docker Compose simplifie la gestion de conteneurs multiples.

**docker-compose.yml:**

```yaml
services:
  # API FleetTrack
  api:
    build:
      context: ./FleetTrack
      dockerfile: src/FleetTrack.API/Dockerfile
    container_name: fleettrack-api
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:8080
      - ConnectionStrings__DefaultConnection=Data Source=/app/data/FleetTrack.db
    volumes:
      # Persister la base de données
      - fleettrack-data:/app/data
    networks:
      - fleettrack-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

# Volumes pour persister les données
volumes:
  fleettrack-data:
    driver: local

# Réseau pour la communication
networks:
  fleettrack-network:
    driver: bridge
```

### 6.5 Commandes Docker

**Build:**

```bash
# Build une image
docker build -t fleettrack-api:latest -f Dockerfile ./FleetTrack

# Build avec Docker Compose
docker-compose build
```

**Run:**

```bash
# Lancer un conteneur
docker run -d -p 8080:8080 --name fleettrack-api fleettrack-api:latest

# Lancer avec Docker Compose
docker-compose up -d

# Lancer et rebuilder
docker-compose up -d --build
```

**Gestion:**

```bash
# Voir les conteneurs en cours
docker ps

# Voir tous les conteneurs
docker ps -a

# Arrêter un conteneur
docker stop fleettrack-api

# Supprimer un conteneur
docker rm fleettrack-api

# Voir les logs
docker logs fleettrack-api
docker logs -f fleettrack-api  # Mode suivi

# Accéder au shell du conteneur
docker exec -it fleettrack-api /bin/bash
```

**Docker Compose:**

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Rebuild et restart
docker-compose up -d --build

# Supprimer tout (conteneurs, volumes, images)
docker-compose down -v --rmi all
```

### 6.6 .dockerignore

Optimiser le build en excluant les fichiers inutiles:

```
# Binaires
**/bin/
**/obj/
**/out/

# Base de données
**/*.db
**/*.db-shm
**/*.db-wal

# IDE
.vs/
.vscode/
.idea/

# Git
.git/
.gitignore

# Documentation
**/documentation/
**/*.md
!README.md

# Tests
**/TestResults/
**/*.trx

# Logs
**/logs/
**/*.log
```

### 6.7 Migrations Automatiques au Démarrage

Pour que Docker crée automatiquement la base de données:

```csharp
// Program.cs
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider
        .GetRequiredService<FleetTrackDbContext>();

    // Créer la base de données et appliquer les migrations
    await context.Database.MigrateAsync();

    // Seed les données initiales
    await DataSeeder.SeedAsync(context);
}
```

---

## 7. Tests Automatisés

### 7.1 Pyramide des Tests

```
        ┌─────────┐
        │   E2E   │        Peu de tests, lents, fragiles
        ├─────────┤
        │  INTEG  │        Tests d'intégration, API, DB
        ├─────────┤
        │  UNIT   │        Beaucoup de tests, rapides, isolés
        └─────────┘
```

### 7.2 Tests Unitaires avec xUnit

**Installation:**

```bash
dotnet add package xUnit
dotnet add package xUnit.runner.visualstudio
dotnet add package Moq
dotnet add package FluentAssertions
```

**Exemple - VehicleServiceTests:**

```csharp
public class VehicleServiceTests
{
    private readonly Mock<IVehicleRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly VehicleService _service;

    public VehicleServiceTests()
    {
        _mockRepository = new Mock<IVehicleRepository>();
        _mockMapper = new Mock<IMapper>();
        _service = new VehicleService(_mockRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllVehicles()
    {
        // Arrange
        var vehicles = new List<Vehicle>
        {
            new Vehicle { Id = Guid.NewGuid(), RegistrationNumber = "ABC123" },
            new Vehicle { Id = Guid.NewGuid(), RegistrationNumber = "XYZ789" }
        };

        var vehicleDtos = vehicles.Select(v => new VehicleDto
        {
            Id = v.Id,
            RegistrationNumber = v.RegistrationNumber
        }).ToList();

        _mockRepository.Setup(r => r.GetAllAsync())
            .ReturnsAsync(vehicles);

        _mockMapper.Setup(m => m.Map<IEnumerable<VehicleDto>>(vehicles))
            .Returns(vehicleDtos);

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(v => v.RegistrationNumber == "ABC123");
        result.Should().Contain(v => v.RegistrationNumber == "XYZ789");
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateRegistration_ShouldThrowException()
    {
        // Arrange
        var dto = new CreateVehicleDto { RegistrationNumber = "ABC123" };
        var existingVehicle = new Vehicle { RegistrationNumber = "ABC123" };

        _mockRepository.Setup(r => r.GetByRegistrationNumberAsync("ABC123"))
            .ReturnsAsync(existingVehicle);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessException>(
            () => _service.CreateAsync(dto));
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    [InlineData("   ")]
    public async Task CreateAsync_WithInvalidRegistration_ShouldThrowException(string regNumber)
    {
        // Arrange
        var dto = new CreateVehicleDto { RegistrationNumber = regNumber };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _service.CreateAsync(dto));
    }
}
```

**Attributs xUnit:**

- `[Fact]` - Test simple
- `[Theory]` - Test paramétré avec plusieurs cas
- `[InlineData]` - Données pour Theory
- `[ClassData]` - Données complexes pour Theory

### 7.3 Tests d'Intégration

Les tests d'intégration testent l'application complète avec une vraie base de données.

**WebApplicationFactory:**

```csharp
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Retirer le DbContext existant
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<FleetTrackDbContext>));

            if (descriptor != null)
                services.Remove(descriptor);

            // Ajouter une base de données en mémoire pour les tests
            services.AddDbContext<FleetTrackDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDatabase");
            });

            // Créer la base de données
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FleetTrackDbContext>();
            db.Database.EnsureCreated();
        });
    }
}
```

**Tests d'intégration:**

```csharp
public class VehiclesControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public VehiclesControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetVehicles_ReturnsSuccessStatusCode()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/vehicles");

        // Assert
        response.Should().BeSuccessful();
        var content = await response.Content.ReadAsStringAsync();
        var vehicles = JsonSerializer.Deserialize<List<VehicleDto>>(content);
        vehicles.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateVehicle_WithValidData_ReturnsCreated()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var newVehicle = new CreateVehicleDto
        {
            RegistrationNumber = "TEST123",
            Brand = "Toyota",
            Model = "Corolla",
            Year = 2023,
            Type = VehicleType.Car
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/vehicles", newVehicle);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadAsStringAsync();
        var vehicle = JsonSerializer.Deserialize<VehicleDto>(content);
        vehicle.Should().NotBeNull();
        vehicle!.RegistrationNumber.Should().Be("TEST123");
    }

    private async Task<string> GetAuthTokenAsync()
    {
        var loginDto = new LoginDto
        {
            Username = "admin",
            Password = "Admin123!"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
        var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        return result!.AccessToken;
    }
}
```

### 7.4 Exécution des Tests

```bash
# Tous les tests
dotnet test

# Tests d'un projet spécifique
dotnet test FleetTrack/tests/FleetTrack.UnitTests

# Avec couverture de code
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura

# Mode watch (TDD)
dotnet watch test

# Verbose
dotnet test --logger "console;verbosity=detailed"
```

**Script PowerShell (run-tests.ps1):**

```powershell
param(
    [string]$Type = "all"
)

Write-Host "🧪 Exécution des tests FleetTrack..." -ForegroundColor Cyan

switch ($Type) {
    "unit" {
        dotnet test FleetTrack/tests/FleetTrack.UnitTests/FleetTrack.UnitTests.csproj
    }
    "integration" {
        dotnet test FleetTrack/tests/FleetTrack.IntegrationTests/FleetTrack.IntegrationTests.csproj
    }
    "coverage" {
        dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=html
    }
    default {
        dotnet test
    }
}
```

---

## 8. CI/CD avec GitHub Actions

### 8.1 Qu'est-ce que CI/CD?

**CI (Continuous Integration):** Intégration continue du code
**CD (Continuous Deployment):** Déploiement continu en production

### 8.2 GitHub Actions Workflow

**.github/workflows/dotnet-ci.yml:**

```yaml
name: .NET CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '8.0.x'

    - name: Restore dependencies
      run: dotnet restore FleetTrack/FleetTrack.sln

    - name: Build
      run: dotnet build FleetTrack/FleetTrack.sln --configuration Release --no-restore

    - name: Run Unit Tests
      run: dotnet test FleetTrack/tests/FleetTrack.UnitTests --no-build --verbosity normal

    - name: Run Integration Tests
      run: dotnet test FleetTrack/tests/FleetTrack.IntegrationTests --no-build --verbosity normal

    - name: Upload Test Results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: '**/TestResults/*.trx'

    - name: Code Coverage
      run: |
        dotnet test FleetTrack/tests/FleetTrack.UnitTests \
          /p:CollectCoverage=true \
          /p:CoverletOutputFormat=cobertura

    - name: Upload Coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: coverage.cobertura.xml

  build-docker:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Build Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./FleetTrack
        file: ./FleetTrack/src/FleetTrack.API/Dockerfile
        push: false
        tags: fleettrack-api:latest
```

### 8.3 Badges GitHub

Afficher le statut dans le README:

```markdown
![.NET CI/CD](https://github.com/username/FleetTrack/actions/workflows/dotnet-ci.yml/badge.svg)
![.NET Version](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![Tests](https://img.shields.io/badge/tests-101%20passing-success)
```

---

## 9. Patterns de Conception

### 9.1 Repository Pattern

**But:** Abstraire l'accès aux données

**Interface:**

```csharp
public interface IRepository<T> where T : BaseEntity
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(Guid id);
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(Guid id);
}
```

**Implémentation:**

```csharp
public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly FleetTrackDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(FleetTrackDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.Where(e => !e.IsDeleted).ToListAsync();
    }

    public virtual async Task<T?> GetByIdAsync(Guid id)
    {
        return await _dbSet.FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
    }

    public virtual async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }
}
```

### 9.2 Unit of Work Pattern

**But:** Grouper plusieurs opérations en une transaction

```csharp
public interface IUnitOfWork : IDisposable
{
    IVehicleRepository Vehicles { get; }
    IDriverRepository Drivers { get; }
    IMissionRepository Missions { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}

public class UnitOfWork : IUnitOfWork
{
    private readonly FleetTrackDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(FleetTrackDbContext context)
    {
        _context = context;
        Vehicles = new VehicleRepository(context);
        Drivers = new DriverRepository(context);
        Missions = new MissionRepository(context);
    }

    public IVehicleRepository Vehicles { get; }
    public IDriverRepository Drivers { get; }
    public IMissionRepository Missions { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        await _transaction?.CommitAsync()!;
    }

    public async Task RollbackTransactionAsync()
    {
        await _transaction?.RollbackAsync()!;
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
```

### 9.3 DTO Pattern

**But:** Transférer des données entre les couches sans exposer les entités

```csharp
// Entity (Domain)
public class Vehicle : BaseEntity
{
    public string RegistrationNumber { get; set; }
    public VehicleType Type { get; set; }
    // ... autres propriétés
    public ICollection<Mission> Missions { get; set; }
}

// DTO (Application)
public class VehicleDto
{
    public Guid Id { get; set; }
    public string RegistrationNumber { get; set; }
    public string Type { get; set; }  // String au lieu d'enum
    public DateTime CreatedAt { get; set; }
    // Pas de navigation properties
}

// Mapping avec AutoMapper
public class VehicleProfile : Profile
{
    public VehicleProfile()
    {
        CreateMap<Vehicle, VehicleDto>()
            .ForMember(dest => dest.Type,
                opt => opt.MapFrom(src => src.Type.ToString()));

        CreateMap<CreateVehicleDto, Vehicle>();
    }
}
```

### 9.4 CQRS (Command Query Responsibility Segregation)

**But:** Séparer les opérations de lecture et d'écriture

```csharp
// Query - Lecture
public interface IVehicleQueries
{
    Task<IEnumerable<VehicleDto>> GetAllAsync();
    Task<VehicleDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<VehicleDto>> SearchAsync(string searchTerm);
}

// Command - Écriture
public interface IVehicleCommands
{
    Task<VehicleDto> CreateAsync(CreateVehicleDto dto);
    Task<VehicleDto> UpdateAsync(Guid id, UpdateVehicleDto dto);
    Task DeleteAsync(Guid id);
}

// Service qui implémente les deux
public class VehicleService : IVehicleQueries, IVehicleCommands
{
    // Implémentation...
}
```

### 9.5 Factory Pattern

**But:** Créer des objets complexes

```csharp
public interface IVehicleFactory
{
    Vehicle CreateVehicle(CreateVehicleDto dto);
}

public class VehicleFactory : IVehicleFactory
{
    public Vehicle CreateVehicle(CreateVehicleDto dto)
    {
        return dto.Type switch
        {
            VehicleType.Truck => CreateTruck(dto),
            VehicleType.Car => CreateCar(dto),
            VehicleType.Motorcycle => CreateMotorcycle(dto),
            _ => throw new ArgumentException($"Type de véhicule non supporté: {dto.Type}")
        };
    }

    private Vehicle CreateTruck(CreateVehicleDto dto)
    {
        return new Vehicle
        {
            RegistrationNumber = dto.RegistrationNumber,
            Type = VehicleType.Truck,
            FuelCapacity = 300,  // Capacité par défaut pour un camion
            // ...
        };
    }
}
```

---

## 10. Bonnes Pratiques

### 10.1 Nommage

**Classes:**
- PascalCase
- Noms descriptifs
- Suffixes: `Service`, `Repository`, `Controller`, `Dto`

```csharp
public class VehicleService { }
public class VehicleRepository { }
public class VehiclesController { }
public class CreateVehicleDto { }
```

**Méthodes:**
- PascalCase
- Verbes d'action
- Async suffix pour méthodes asynchrones

```csharp
public async Task<VehicleDto> GetByIdAsync(Guid id) { }
public async Task CreateAsync(CreateVehicleDto dto) { }
public void CalculateTotalDistance() { }
```

**Variables et Propriétés:**
- camelCase pour variables locales
- PascalCase pour propriétés

```csharp
public string RegistrationNumber { get; set; }

private void ProcessVehicle()
{
    var totalDistance = 0;
    var currentVehicle = new Vehicle();
}
```

### 10.2 Gestion des Erreurs

**Exceptions personnalisées:**

```csharp
public class BusinessException : Exception
{
    public BusinessException(string message) : base(message) { }
}

public class NotFoundException : Exception
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} avec l'ID {key} n'a pas été trouvé") { }
}
```

**Middleware de gestion d'erreurs:**

```csharp
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = exception switch
        {
            NotFoundException => (404, exception.Message),
            BusinessException => (400, exception.Message),
            UnauthorizedException => (401, exception.Message),
            _ => (500, "Une erreur interne s'est produite")
        };

        context.Response.StatusCode = statusCode;
        return context.Response.WriteAsJsonAsync(new { error = message });
    }
}
```

### 10.3 Logging

**Utilisation de ILogger:**

```csharp
public class VehicleService : IVehicleService
{
    private readonly ILogger<VehicleService> _logger;

    public VehicleService(ILogger<VehicleService> logger)
    {
        _logger = logger;
    }

    public async Task<VehicleDto> CreateAsync(CreateVehicleDto dto)
    {
        _logger.LogInformation("Création d'un nouveau véhicule: {RegistrationNumber}",
            dto.RegistrationNumber);

        try
        {
            // Logique métier
            var vehicle = await _repository.AddAsync(mappedVehicle);

            _logger.LogInformation("Véhicule créé avec succès: {VehicleId}", vehicle.Id);
            return _mapper.Map<VehicleDto>(vehicle);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la création du véhicule");
            throw;
        }
    }
}
```

### 10.4 Validation

**FluentValidation:**

```csharp
public class CreateVehicleDtoValidator : AbstractValidator<CreateVehicleDto>
{
    public CreateVehicleDtoValidator()
    {
        RuleFor(v => v.RegistrationNumber)
            .NotEmpty().WithMessage("Le numéro d'immatriculation est requis")
            .MaximumLength(20).WithMessage("Le numéro ne peut pas dépasser 20 caractères")
            .Matches("^[A-Z0-9]+$").WithMessage("Format invalide");

        RuleFor(v => v.Brand)
            .NotEmpty().WithMessage("La marque est requise")
            .MaximumLength(50);

        RuleFor(v => v.Year)
            .InclusiveBetween(1900, DateTime.Now.Year + 1)
            .WithMessage("Année invalide");

        RuleFor(v => v.FuelCapacity)
            .GreaterThan(0).WithMessage("La capacité doit être positive");
    }
}
```

**Enregistrement:**

```csharp
// Program.cs
builder.Services.AddValidatorsFromAssemblyContaining<CreateVehicleDtoValidator>();

// Utilisation automatique dans les controllers
[ApiController]
public class VehiclesController : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateVehicleDto dto)
    {
        // La validation est automatique avec [ApiController]
        // Si invalide, retourne 400 Bad Request avec les erreurs

        var result = await _service.CreateAsync(dto);
        return Ok(result);
    }
}
```

### 10.5 Configuration

**Utilisez le Options Pattern:**

```csharp
// Settings class
public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; }
}

// Configuration
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt"));

// Injection
public class AuthService
{
    private readonly JwtSettings _jwtSettings;

    public AuthService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
    }
}
```

### 10.6 Async/Await

**Toujours utiliser async/await pour les I/O:**

```csharp
// ❌ Mauvais
public VehicleDto GetById(Guid id)
{
    var vehicle = _repository.GetByIdAsync(id).Result;  // BLOCKING!
    return _mapper.Map<VehicleDto>(vehicle);
}

// ✅ Bon
public async Task<VehicleDto> GetByIdAsync(Guid id)
{
    var vehicle = await _repository.GetByIdAsync(id);
    return _mapper.Map<VehicleDto>(vehicle);
}
```

### 10.7 SOLID Principles

**S - Single Responsibility:**
- Une classe = une responsabilité

**O - Open/Closed:**
- Ouvert à l'extension, fermé à la modification

**L - Liskov Substitution:**
- Les classes dérivées doivent pouvoir remplacer leurs classes de base

**I - Interface Segregation:**
- Plusieurs interfaces spécifiques > une interface générale

**D - Dependency Inversion:**
- Dépendre des abstractions, pas des implémentations

```csharp
// ❌ Mauvais - Dépendance directe
public class VehicleService
{
    private readonly VehicleRepository _repository;  // Classe concrète
}

// ✅ Bon - Dépendance sur l'interface
public class VehicleService
{
    private readonly IVehicleRepository _repository;  // Interface
}
```

---

## 📚 Ressources Complémentaires

### Documentation Officielle
- [ASP.NET Core](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [SignalR](https://docs.microsoft.com/aspnet/core/signalr)
- [xUnit](https://xunit.net/)
- [Docker](https://docs.docker.com/)

### Livres Recommandés
- Clean Architecture - Robert C. Martin
- Domain-Driven Design - Eric Evans
- C# in Depth - Jon Skeet

### Outils
- **Postman** - Test d'API
- **Swagger** - Documentation API
- **DB Browser for SQLite** - Gestion de base de données
- **Docker Desktop** - Containerisation
- **Visual Studio Code** - IDE léger

---

## 🎓 Conclusion

Ce cours couvre les concepts essentiels pour développer des APIs modernes avec .NET 8:

✅ Architecture propre et maintenable (Clean Architecture)
✅ Accès aux données avec Entity Framework Core
✅ Authentification sécurisée avec JWT
✅ Communication temps réel avec SignalR
✅ Containerisation avec Docker
✅ Tests automatisés (unitaires et d'intégration)
✅ CI/CD avec GitHub Actions
✅ Patterns de conception professionnels
✅ Bonnes pratiques de développement

**FleetTrack** est un projet de référence qui implémente tous ces concepts dans une application réelle.

Pour aller plus loin, explorez:
- Microservices avec .NET
- GraphQL
- gRPC
- Kubernetes pour l'orchestration
- Azure / AWS pour le cloud

Bon apprentissage! 🚀
