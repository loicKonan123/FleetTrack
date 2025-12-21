# 🏗️ FleetTrack - Parcours du Code (Architecture Flow)

## 📚 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Exemple: Créer un véhicule](#exemple-créer-un-véhicule)
3. [Exemple: Récupérer la liste des véhicules](#exemple-récupérer-la-liste-des-véhicules)
4. [Gestion des erreurs](#gestion-des-erreurs)
5. [Diagramme de flux](#diagramme-de-flux)

---

## Vue d'ensemble

### 🎯 Architecture Clean (4 couches)

```
┌─────────────────────────────────────────────────────┐
│                    FleetTrack.API                    │  ← Couche Présentation
│  Controllers, Middlewares, Extensions, Program.cs   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│               FleetTrack.Application                 │  ← Couche Application
│  Services, DTOs, Validators, Mappings, Exceptions   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│             FleetTrack.Infrastructure                │  ← Couche Infrastructure
│  DbContext, Repositories, Configurations, Migrations│
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│                FleetTrack.Domain                     │  ← Couche Domaine
│           Entities, Enums, Business Rules            │
└─────────────────────────────────────────────────────┘
```

### 📋 Principes clés
- ✅ **Séparation des responsabilités** - Chaque couche a un rôle précis
- ✅ **Dépendances unidirectionnelles** - Les dépendances vont vers le Domain
- ✅ **Inversion de dépendances** - Application définit les interfaces, Infrastructure les implémente
- ✅ **Testabilité** - Chaque couche peut être testée indépendamment

---

## Exemple: Créer un véhicule

### 📥 Requête HTTP
```http
POST http://localhost:5115/api/vehicles
Content-Type: application/json

{
  "registrationNumber": "AB-123-CD",
  "brand": "Renault",
  "model": "Master",
  "year": 2023,
  "type": 1,
  "fuelType": 0,
  "fuelCapacity": 80.0,
  "currentFuelLevel": 60.0,
  "mileage": 15000
}
```

### 🔄 Parcours du code étape par étape

#### **ÉTAPE 1: Point d'entrée - Program.cs**
📁 `src/FleetTrack.API/Program.cs`

```csharp
// Ligne 1-3: Imports des extensions
using FleetTrack.API.Extensions;
using FleetTrack.Application;
using FleetTrack.Infrastructure;

// Ligne 5: Création du builder
var builder = WebApplication.CreateBuilder(args);

// Ligne 10-11: Injection de dépendances des couches
builder.Services.AddInfrastructure(builder.Configuration);  // ← Configure DbContext + Repositories
builder.Services.AddApplication();                           // ← Configure Services + AutoMapper + Validators

// Ligne 14-19: Configuration JSON
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Ligne 27: Construction de l'application
var app = builder.Build();

// Ligne 32: Middleware d'exception (PREMIER dans le pipeline!)
app.UseExceptionMiddleware();  // ← Attrape toutes les erreurs

// Ligne 59: Mapping des contrôleurs
app.MapControllers();

// Ligne 61: Démarrage
app.Run();
```

**🎯 Rôle**: Configure toute l'application et le pipeline HTTP

---

#### **ÉTAPE 2: Middleware d'exception**
📁 `src/FleetTrack.API/Middlewares/ExceptionMiddleware.cs`

```csharp
// Ligne 14-28: Intercepte TOUTES les requêtes
public async Task InvokeAsync(HttpContext context)
{
    try
    {
        await _next(context);  // ← Passe à l'étape suivante
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Erreur: {Message}", ex.Message);
        await HandleExceptionAsync(context, ex);  // ← Gère l'erreur
    }
}

// Ligne 35-80: Convertit les exceptions en réponses HTTP
switch (exception)
{
    case NotFoundException:
        context.Response.StatusCode = 404;  // ← Not Found
        break;
    case ValidationException validationException:
        context.Response.StatusCode = 400;  // ← Bad Request
        response.Errors = validationException.Errors;
        break;
    // ...
}
```

**🎯 Rôle**: Attrape et transforme les exceptions en réponses HTTP propres

---

#### **ÉTAPE 3: Contrôleur - VehiclesController**
📁 `src/FleetTrack.API/Controllers/VehiclesController.cs`

```csharp
// Ligne 14-23: Déclaration du contrôleur
[ApiController]
[Route("api/[controller]")]  // ← Route: /api/vehicles
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;  // ← Injection du service
    private readonly ILogger<VehiclesController> _logger;

    // Constructeur avec injection de dépendances
}

// Ligne 169-189: Endpoint POST
[HttpPost]
public async Task<ActionResult<ApiResponse<VehicleDto>>> Create(
    [FromBody] CreateVehicleDto dto,  // ← Désérialisation automatique du JSON
    CancellationToken cancellationToken = default)
{
    _logger.LogInformation("Création véhicule: {Reg}", dto.RegistrationNumber);

    // APPEL AU SERVICE ↓
    var vehicle = await _vehicleService.CreateAsync(dto, cancellationToken);

    // Retour avec code 201 Created
    return CreatedAtAction(
        nameof(GetById),
        new { id = vehicle.Id },
        new ApiResponse<VehicleDto>
        {
            Success = true,
            Data = vehicle,
            Message = "Véhicule créé avec succès"
        });
}
```

**🎯 Rôle**:
- Reçoit la requête HTTP
- Valide les données (automatique via FluentValidation)
- Appelle le service métier
- Retourne la réponse HTTP

---

#### **ÉTAPE 4: Validation - CreateVehicleValidator**
📁 `src/FleetTrack.Application/Validators/Vehicle/CreateVehicleValidator.cs`

```csharp
// Ligne 8-46: Règles de validation
public CreateVehicleValidator()
{
    RuleFor(x => x.RegistrationNumber)
        .NotEmpty().WithMessage("Le numéro d'immatriculation est requis")
        .MaximumLength(20);

    RuleFor(x => x.Brand)
        .NotEmpty().WithMessage("La marque est requise")
        .MaximumLength(100);

    RuleFor(x => x.Year)
        .InclusiveBetween(1900, DateTime.Now.Year + 1)
        .WithMessage("L'année doit être entre 1900 et {0}", DateTime.Now.Year + 1);

    RuleFor(x => x.FuelCapacity)
        .GreaterThan(0).WithMessage("La capacité doit être > 0");

    RuleFor(x => x.CurrentFuelLevel)
        .GreaterThanOrEqualTo(0)
        .LessThanOrEqualTo(x => x.FuelCapacity)
        .WithMessage("Le niveau ne peut pas dépasser la capacité");
}
```

**🎯 Rôle**:
- Validation automatique AVANT l'appel au service
- Si erreur → `ValidationException` → HTTP 400
- Configuration dans `DependencyInjection.cs:15` avec `AddValidatorsFromAssembly()`

---

#### **ÉTAPE 5: Service - VehicleService**
📁 `src/FleetTrack.Application/Services/VehicleService.cs`

```csharp
// Ligne 13-26: Injection des dépendances
public class VehicleService : IVehicleService
{
    private readonly IVehicleRepository _vehicleRepository;  // ← Interface!
    private readonly IMapper _mapper;  // ← AutoMapper

    public VehicleService(
        IVehicleRepository vehicleRepository,
        IMapper mapper)
    {
        _vehicleRepository = vehicleRepository;
        _mapper = mapper;
    }
}

// Ligne 28-45: Logique métier de création
public async Task<VehicleDto> CreateAsync(
    CreateVehicleDto dto,
    CancellationToken cancellationToken = default)
{
    // 1. VÉRIFICATION: Le numéro d'immatriculation existe déjà?
    var existing = await _vehicleRepository
        .GetByRegistrationNumberAsync(dto.RegistrationNumber, cancellationToken);

    if (existing != null)
        throw new ValidationException(
            $"Un véhicule avec le numéro {dto.RegistrationNumber} existe déjà.");

    // 2. MAPPING: DTO → Entity
    var vehicle = _mapper.Map<Vehicle>(dto);
    vehicle.Status = VehicleStatus.Available;  // ← Statut par défaut

    // 3. PERSISTENCE: Sauvegarde en base
    var created = await _vehicleRepository.AddAsync(vehicle, cancellationToken);

    // 4. MAPPING: Entity → DTO
    return _mapper.Map<VehicleDto>(created);
}
```

**🎯 Rôle**:
- Contient la **logique métier**
- Vérifie les règles business
- Utilise les repositories (abstraction!)
- Ne connaît PAS Entity Framework

---

#### **ÉTAPE 6: Mapping - AutoMapper**
📁 `src/FleetTrack.Application/Mappings/MappingProfile.cs`

```csharp
// Ligne 12-24: Configuration des mappings
public MappingProfile()
{
    // DTO → Entity (pour la création)
    CreateMap<CreateVehicleDto, Vehicle>()
        .ForMember(dest => dest.Id, opt => opt.Ignore())
        .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
        .ForMember(dest => dest.Status, opt => opt.Ignore());

    // Entity → DTO (pour la réponse)
    CreateMap<Vehicle, VehicleDto>()
        .ForMember(dest => dest.StatusName,
            opt => opt.MapFrom(src => src.Status.ToString()))
        .ForMember(dest => dest.CurrentDriverName,
            opt => opt.MapFrom(src => src.CurrentDriver != null
                ? $"{src.CurrentDriver.FirstName} {src.CurrentDriver.LastName}"
                : null));
}
```

**🎯 Rôle**:
- Transforme automatiquement les objets
- CreateVehicleDto → Vehicle (pour sauvegarder)
- Vehicle → VehicleDto (pour renvoyer)

---

#### **ÉTAPE 7: Repository - VehicleRepository**
📁 `src/FleetTrack.Infrastructure/Repositories/VehicleRepository.cs`

```csharp
// Ligne 8-17: Implémentation du repository
public class VehicleRepository : Repository<Vehicle>, IVehicleRepository
{
    public VehicleRepository(FleetTrackDbContext context) : base(context)
    {
    }

    // Ligne 42-48: Recherche par numéro d'immatriculation
    public async Task<Vehicle?> GetByRegistrationNumberAsync(
        string registrationNumber,
        CancellationToken cancellationToken = default)
    {
        return await _context.Vehicles
            .FirstOrDefaultAsync(
                v => v.RegistrationNumber == registrationNumber,
                cancellationToken);
    }
}
```

📁 `src/FleetTrack.Infrastructure/Repositories/Repository.cs` (classe générique)

```csharp
// Ligne 25-35: Ajout d'une entité
public virtual async Task<T> AddAsync(
    T entity,
    CancellationToken cancellationToken = default)
{
    entity.CreatedAt = DateTime.UtcNow;  // ← Automatique!
    await _context.Set<T>().AddAsync(entity, cancellationToken);
    await _context.SaveChangesAsync(cancellationToken);  // ← Sauvegarde en BDD
    return entity;
}
```

**🎯 Rôle**:
- **SEULE** couche qui parle à la base de données
- Implémente les interfaces définies dans Application
- Gère Entity Framework Core

---

#### **ÉTAPE 8: DbContext - FleetTrackDbContext**
📁 `src/FleetTrack.Infrastructure/Data/FleetTrackDbContext.cs`

```csharp
// Ligne 8-18: Configuration du contexte
public class FleetTrackDbContext : DbContext
{
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<Mission> Missions { get; set; }
    // ...

    // Ligne 20-43: Configuration du modèle
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Applique TOUTES les configurations (VehicleConfiguration, etc.)
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Filtres globaux (soft delete)
        modelBuilder.Entity<Vehicle>().HasQueryFilter(v => !v.IsDeleted);
        modelBuilder.Entity<Driver>().HasQueryFilter(d => !d.IsDeleted);
        // ...
    }

    // Ligne 45-58: Mise à jour automatique de UpdatedAt
    public override async Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;  // ← Automatique!
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
```

**🎯 Rôle**:
- Représente la base de données
- Configure les relations entre tables
- Gère les filtres globaux (soft delete)
- Met à jour automatiquement UpdatedAt

---

#### **ÉTAPE 9: Configuration - VehicleConfiguration**
📁 `src/FleetTrack.Infrastructure/Data/Configurations/VehicleConfiguration.cs`

```csharp
// Ligne 9-70: Configuration Fluent API
public void Configure(EntityTypeBuilder<Vehicle> builder)
{
    builder.ToTable("Vehicles");  // ← Nom de la table
    builder.HasKey(v => v.Id);    // ← Clé primaire

    // Propriétés
    builder.Property(v => v.RegistrationNumber)
        .IsRequired()
        .HasMaxLength(20);

    builder.Property(v => v.FuelCapacity)
        .HasColumnType("REAL");  // ← Type SQLite

    // Index unique
    builder.HasIndex(v => v.RegistrationNumber)
        .IsUnique();  // ← Empêche les doublons!

    // Relations
    builder.HasOne(v => v.CurrentDriver)
        .WithOne(d => d.CurrentVehicle)
        .HasForeignKey<Vehicle>(v => v.CurrentDriverId)
        .OnDelete(DeleteBehavior.SetNull);
}
```

**🎯 Rôle**:
- Définit la structure de la table
- Configure les contraintes (unique, required, max length)
- Définit les relations entre tables
- Configure les types de données

---

#### **ÉTAPE 10: Entity - Vehicle**
📁 `src/FleetTrack.Domain/Entities/Vehicle.cs`

```csharp
// Ligne 5-35: Entité métier
public class Vehicle : BaseEntity
{
    public string RegistrationNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public VehicleType Type { get; set; }
    public VehicleStatus Status { get; set; }
    public FuelType FuelType { get; set; }
    public double FuelCapacity { get; set; }
    public double CurrentFuelLevel { get; set; }
    public int Mileage { get; set; }

    // Relations
    public Guid? CurrentDriverId { get; set; }
    public Driver? CurrentDriver { get; set; }
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
    public ICollection<GpsPosition> GpsPositions { get; set; } = new List<GpsPosition>();
    // ...
}
```

**🎯 Rôle**:
- Représente un **objet métier**
- Pas de logique, juste des données
- Hérite de BaseEntity (Id, CreatedAt, UpdatedAt, IsDeleted)

---

### 📤 Réponse finale

Après tous ces traitements, la réponse JSON est retournée:

```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "registrationNumber": "AB-123-CD",
    "brand": "Renault",
    "model": "Master",
    "year": 2023,
    "type": 1,
    "status": 0,
    "statusName": "Available",
    "fuelType": 0,
    "fuelCapacity": 80.0,
    "currentFuelLevel": 60.0,
    "mileage": 15000,
    "currentDriverName": null,
    "createdAt": "2025-12-20T05:52:32.123Z"
  },
  "message": "Véhicule créé avec succès",
  "errors": null
}
```

**Code HTTP**: `201 Created`
**Header Location**: `http://localhost:5115/api/vehicles/3fa85f64-5717-4562-b3fc-2c963f66afa6`

---

## Exemple: Récupérer la liste des véhicules

### 📥 Requête HTTP
```http
GET http://localhost:5115/api/vehicles?pageNumber=1&pageSize=10
```

### 🔄 Parcours simplifié

```
1. VehiclesController.GetAll() (ligne 30-47)
   ↓
2. VehicleService.GetAllAsync() (ligne 47-61)
   ↓
3. VehicleRepository.GetPagedAsync() (Repository.cs ligne 68-78)
   ↓
4. DbContext.Vehicles.Skip().Take().ToListAsync()
   ↓
5. AutoMapper: List<Vehicle> → List<VehicleDto>
   ↓
6. PagedResult<VehicleDto> créé (total, pages, etc.)
   ↓
7. Retour JSON avec ApiResponse<PagedResult<VehicleDto>>
```

**Code SQL généré** (visible dans les logs):
```sql
SELECT "v"."Id", "v"."Brand", "v"."Model", ...
FROM "Vehicles" AS "v"
WHERE "v"."IsDeleted" = 0  -- ← Filtre soft delete automatique!
ORDER BY "v"."CreatedAt" DESC
LIMIT 10 OFFSET 0
```

---

## Gestion des erreurs

### ❌ Erreur de validation

**Requête**:
```json
{
  "registrationNumber": "",  // ← VIDE!
  "brand": "Renault",
  "year": 1800  // ← Trop ancien!
}
```

**Parcours**:
```
1. VehiclesController.Create() reçoit le DTO
   ↓
2. FluentValidation s'exécute AUTOMATIQUEMENT
   - RuleFor(x => x.RegistrationNumber).NotEmpty() → ÉCHEC
   - RuleFor(x => x.Year).InclusiveBetween(1900, ...) → ÉCHEC
   ↓
3. ValidationException levée avec la liste des erreurs
   ↓
4. ExceptionMiddleware attrape l'exception
   ↓
5. Réponse HTTP 400 Bad Request
```

**Réponse**:
```json
{
  "success": false,
  "data": null,
  "message": "Erreur de validation",
  "errors": [
    "Le numéro d'immatriculation est requis",
    "L'année doit être entre 1900 et 2025"
  ]
}
```

### ❌ Entité introuvable

**Requête**:
```http
GET /api/vehicles/99999999-9999-9999-9999-999999999999
```

**Parcours**:
```
1. VehiclesController.GetById()
   ↓
2. VehicleService.GetByIdAsync()
   ↓
3. VehicleRepository.GetByIdAsync() → retourne null
   ↓
4. Service retourne null
   ↓
5. Controller vérifie: if (vehicle == null)
   ↓
6. Retourne NotFound() avec ApiResponse
```

**Réponse**: `404 Not Found`
```json
{
  "success": false,
  "data": null,
  "message": "Véhicule avec l'ID 99999... introuvable",
  "errors": null
}
```

### ❌ Duplication

**Requête**: Créer un véhicule avec un numéro existant

**Parcours**:
```
1. VehiclesController.Create()
   ↓
2. VehicleService.CreateAsync()
   ↓
3. GetByRegistrationNumberAsync() → trouve un véhicule!
   ↓
4. throw new ValidationException("...existe déjà")
   ↓
5. ExceptionMiddleware attrape
   ↓
6. HTTP 400 Bad Request
```

---

## Diagramme de flux

### Flux complet d'une requête POST

```
┌──────────────┐
│   Client     │
│ (Browser/    │
│  Postman)    │
└──────┬───────┘
       │ POST /api/vehicles + JSON
       ↓
┌─────────────────────────────────────────────┐
│         COUCHE API (Présentation)           │
├─────────────────────────────────────────────┤
│ 1. Program.cs                               │
│    └→ Pipeline HTTP configuré               │
│                                             │
│ 2. ExceptionMiddleware                      │
│    └→ try { await _next(context); }         │
│                                             │
│ 3. VehiclesController                       │
│    └→ Create([FromBody] CreateVehicleDto)  │
│       • Désérialisation JSON automatique   │
│       • Validation FluentValidation auto   │
└──────┬──────────────────────────────────────┘
       │ CreateVehicleDto validé
       ↓
┌─────────────────────────────────────────────┐
│       COUCHE APPLICATION (Métier)           │
├─────────────────────────────────────────────┤
│ 4. VehicleService.CreateAsync()             │
│    ├→ Vérification règles métier            │
│    │  (numéro unique, etc.)                 │
│    ├→ AutoMapper: DTO → Entity              │
│    └→ _vehicleRepository.AddAsync()         │
└──────┬──────────────────────────────────────┘
       │ Vehicle entity
       ↓
┌─────────────────────────────────────────────┐
│   COUCHE INFRASTRUCTURE (Persistence)       │
├─────────────────────────────────────────────┤
│ 5. VehicleRepository.AddAsync()             │
│    └→ Repository<T>.AddAsync()              │
│       ├→ entity.CreatedAt = DateTime.UtcNow │
│       ├→ _context.Set<T>().AddAsync()       │
│       └→ _context.SaveChangesAsync()        │
│                                             │
│ 6. FleetTrackDbContext                      │
│    ├→ Applique configurations              │
│    ├→ Met à jour UpdatedAt                 │
│    └→ Génère SQL                           │
│                                             │
│ 7. VehicleConfiguration                     │
│    └→ Définit structure table, contraintes │
└──────┬──────────────────────────────────────┘
       │ SQL INSERT
       ↓
┌─────────────────────────────────────────────┐
│          BASE DE DONNÉES (SQLite)           │
│  INSERT INTO Vehicles (...) VALUES (...)    │
└──────┬──────────────────────────────────────┘
       │ Vehicle avec ID généré
       ↓
┌─────────────────────────────────────────────┐
│      RETOUR (même chemin inverse)           │
├─────────────────────────────────────────────┤
│ 8. AutoMapper: Vehicle → VehicleDto         │
│                                             │
│ 9. VehiclesController                       │
│    └→ CreatedAtAction(...)                 │
│       └→ ApiResponse<VehicleDto>           │
│                                             │
│ 10. Sérialisation JSON (camelCase)          │
└──────┬──────────────────────────────────────┘
       │ HTTP 201 + JSON
       ↓
┌──────────────┐
│   Client     │ ← Reçoit la réponse
└──────────────┘
```

---

## 🔑 Points clés à retenir

### 1. **Injection de dépendances partout**
```csharp
// Dans Program.cs
builder.Services.AddInfrastructure(configuration);  // ← Enregistre DbContext, Repositories
builder.Services.AddApplication();                  // ← Enregistre Services, AutoMapper, Validators

// Dans VehiclesController
public VehiclesController(IVehicleService vehicleService)  // ← Interface injectée

// Dans VehicleService
public VehicleService(IVehicleRepository repository)  // ← Interface injectée
```

### 2. **Validation automatique**
```csharp
// Enregistrement dans DependencyInjection.cs
services.AddValidatorsFromAssembly(assembly);

// FluentValidation s'exécute AVANT l'appel au contrôleur
// Si erreur → ValidationException → HTTP 400
```

### 3. **Mapping automatique**
```csharp
// Configuration
CreateMap<CreateVehicleDto, Vehicle>();
CreateMap<Vehicle, VehicleDto>();

// Utilisation
var vehicle = _mapper.Map<Vehicle>(dto);           // DTO → Entity
var result = _mapper.Map<VehicleDto>(vehicle);     // Entity → DTO
```

### 4. **Soft Delete automatique**
```csharp
// Dans DbContext
modelBuilder.Entity<Vehicle>().HasQueryFilter(v => !v.IsDeleted);

// TOUS les SELECT incluent automatiquement: WHERE IsDeleted = 0
// Pas besoin de le faire manuellement!
```

### 5. **Gestion des erreurs centralisée**
```csharp
// ExceptionMiddleware attrape TOUT
try {
    await _next(context);
} catch (Exception ex) {
    // Conversion exception → réponse HTTP propre
}
```

---

## 📊 Résumé des responsabilités

| Couche | Responsabilité | Exemples |
|--------|---------------|----------|
| **API** | HTTP, Routing, Sérialisation | Controllers, Middlewares, Program.cs |
| **Application** | Logique métier, Orchestration | Services, DTOs, Validators, Mappings |
| **Infrastructure** | Accès données, Persistence | Repositories, DbContext, Configurations |
| **Domain** | Modèle métier, Règles | Entities, Enums, Value Objects |

---

## 🎓 Pour aller plus loin

### Fichiers importants à étudier:
1. **Program.cs** - Point d'entrée et configuration
2. **DependencyInjection.cs** (Application + Infrastructure) - Injection de dépendances
3. **VehicleService.cs** - Exemple de logique métier
4. **VehicleConfiguration.cs** - Configuration EF Core
5. **ExceptionMiddleware.cs** - Gestion globale des erreurs

### Commandes utiles:
```bash
# Voir les logs de requêtes SQL
dotnet run  # Les logs SQL s'affichent dans la console

# Créer une nouvelle migration
dotnet ef migrations add NomDeLaMigration --startup-project ../FleetTrack.API

# Appliquer les migrations
dotnet ef database update --startup-project ../FleetTrack.API
```

---

**✅ Architecture Clean implémentée avec succès!**
