# Définitions : Architecture Logicielle

> Guide complet des concepts d'architecture utilisés dans FleetTrack

---

## Table des Matières

1. [Clean Architecture](#1-clean-architecture)
2. [Couches de l'Application](#2-couches-de-lapplication)
3. [Principes SOLID](#3-principes-solid)
4. [Patterns de Conception](#4-patterns-de-conception)
5. [Inversion de Dépendances](#5-inversion-de-dépendances)

---

## 1. Clean Architecture

### Définition Simple
La **Clean Architecture** est une façon d'organiser le code en "cercles concentriques" où le code métier (le plus important) est au centre, protégé des détails techniques (base de données, interface web, etc.).

### Analogie
Imagine une **forteresse médiévale** :
- **Le donjon** (centre) = Ton code métier (règles de gestion)
- **Les murailles intérieures** = Les cas d'utilisation (que peut-on faire?)
- **Les murailles extérieures** = Les adaptateurs (comment communiquer?)
- **L'extérieur** = Le monde réel (utilisateurs, bases de données)

```
┌─────────────────────────────────────────────────────────────┐
│                    MONDE EXTÉRIEUR                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              INFRASTRUCTURE (externe)                  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │            APPLICATION (use cases)              │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │              DOMAIN (centre)              │  │  │  │
│  │  │  │         Entités & Règles Métier           │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

        Les flèches de dépendance vont vers le CENTRE
              (l'extérieur dépend de l'intérieur)
```

### Règle d'Or
**Les dépendances pointent toujours vers l'intérieur.** Le Domain ne connaît JAMAIS l'Infrastructure.

### Exemple Concret dans FleetTrack

```csharp
// ❌ MAUVAIS : Le Domain dépend de l'Infrastructure
namespace FleetTrack.Domain.Entities
{
    public class Vehicle
    {
        public void Save()
        {
            // ERREUR! Le Domain ne doit pas connaître la BDD
            var db = new SqlConnection("...");
            db.Execute("INSERT INTO Vehicles...");
        }
    }
}

// ✅ BON : Le Domain est pur, l'Infrastructure s'occupe de la persistance
namespace FleetTrack.Domain.Entities
{
    public class Vehicle
    {
        public Guid Id { get; set; }
        public string PlateNumber { get; set; }
        public VehicleType Type { get; set; }

        // Logique métier pure
        public bool IsAvailable() => Status == VehicleStatus.Available;
    }
}

namespace FleetTrack.Infrastructure.Persistence
{
    public class VehicleRepository : IVehicleRepository
    {
        private readonly FleetTrackDbContext _context;

        public async Task SaveAsync(Vehicle vehicle)
        {
            // L'Infrastructure gère la persistance
            await _context.Vehicles.AddAsync(vehicle);
            await _context.SaveChangesAsync();
        }
    }
}
```

---

## 2. Couches de l'Application

### 2.1 Domain (Domaine)

#### Définition
Le **Domain** contient le cœur métier de l'application. Ce sont les concepts, règles et logiques qui existeraient même sans ordinateur.

#### Contenu
- **Entités** : Objets avec une identité unique (Vehicle, User, Mission)
- **Value Objects** : Objets définis par leurs valeurs (Address, GpsCoordinate)
- **Énumérations** : Types fixes (VehicleType, MissionStatus)
- **Interfaces** : Contrats pour les services externes

#### Exemple FleetTrack

```csharp
// FleetTrack.Domain/Entities/Vehicle.cs
namespace FleetTrack.Domain.Entities;

public class Vehicle
{
    // Identité unique - c'est ce qui fait une "Entité"
    public Guid Id { get; set; }

    // Propriétés métier
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public VehicleType Type { get; set; }
    public VehicleStatus Status { get; set; }
    public int? Mileage { get; set; }

    // Relations (navigation properties)
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
    public ICollection<TrackingSession> TrackingSessions { get; set; } = new List<TrackingSession>();

    // Logique métier - règles du domaine
    public bool CanBeAssignedToMission()
    {
        return Status == VehicleStatus.Available && IsActive;
    }

    public void AssignToMission(Mission mission)
    {
        if (!CanBeAssignedToMission())
            throw new DomainException("Ce véhicule n'est pas disponible");

        Status = VehicleStatus.InUse;
        Missions.Add(mission);
    }
}
```

```csharp
// FleetTrack.Domain/Enums/VehicleType.cs
namespace FleetTrack.Domain.Enums;

public enum VehicleType
{
    Car = 0,        // Voiture
    Truck = 1,      // Camion
    Van = 2,        // Fourgon
    Motorcycle = 3, // Moto
    Bus = 4         // Bus
}
```

### 2.2 Application

#### Définition
La couche **Application** orchestre les cas d'utilisation. Elle dit "quoi faire" mais pas "comment faire".

#### Contenu
- **DTOs** : Objets de transfert de données
- **Interfaces de Services** : Contrats (IVehicleService, IAuthService)
- **Validators** : Règles de validation des entrées
- **Exceptions** : Erreurs métier personnalisées

#### Exemple FleetTrack

```csharp
// FleetTrack.Application/DTOs/VehicleDto.cs
namespace FleetTrack.Application.DTOs;

/// <summary>
/// DTO = Data Transfer Object
/// Objet simplifié pour transférer des données entre couches
/// </summary>
public class VehicleDto
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public VehicleType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;  // Pour affichage
    public VehicleStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty; // Pour affichage
}

/// <summary>
/// DTO pour création - ne contient pas l'Id (généré automatiquement)
/// </summary>
public class CreateVehicleDto
{
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public VehicleType Type { get; set; }
}
```

```csharp
// FleetTrack.Application/Interfaces/IVehicleService.cs
namespace FleetTrack.Application.Interfaces;

/// <summary>
/// Interface = Contrat
/// Définit CE QUE le service doit faire, pas COMMENT
/// </summary>
public interface IVehicleService
{
    Task<VehicleDto?> GetByIdAsync(Guid id);
    Task<PagedResult<VehicleDto>> GetAllAsync(int page, int pageSize);
    Task<VehicleDto> CreateAsync(CreateVehicleDto dto);
    Task<VehicleDto?> UpdateAsync(Guid id, UpdateVehicleDto dto);
    Task<bool> DeleteAsync(Guid id);
}
```

### 2.3 Infrastructure

#### Définition
La couche **Infrastructure** contient les détails techniques : base de données, envoi d'emails, appels HTTP, etc.

#### Contenu
- **DbContext** : Configuration Entity Framework
- **Repositories** : Implémentation de l'accès aux données
- **Services** : Implémentation des interfaces Application
- **External Services** : Intégrations tierces (SMS, Email, etc.)

#### Exemple FleetTrack

```csharp
// FleetTrack.Infrastructure/Services/VehicleService.cs
namespace FleetTrack.Infrastructure.Services;

/// <summary>
/// Implémentation concrète de IVehicleService
/// C'est ICI qu'on accède vraiment à la base de données
/// </summary>
public class VehicleService : IVehicleService
{
    private readonly FleetTrackDbContext _context;
    private readonly ILogger<VehicleService> _logger;

    public VehicleService(FleetTrackDbContext context, ILogger<VehicleService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<VehicleDto?> GetByIdAsync(Guid id)
    {
        var vehicle = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == id);

        return vehicle == null ? null : MapToDto(vehicle);
    }

    public async Task<VehicleDto> CreateAsync(CreateVehicleDto dto)
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            PlateNumber = dto.PlateNumber,
            Brand = dto.Brand,
            Model = dto.Model,
            Type = dto.Type,
            Status = VehicleStatus.Available,
            CreatedAt = DateTime.UtcNow
        };

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Véhicule créé: {PlateNumber}", vehicle.PlateNumber);

        return MapToDto(vehicle);
    }

    private static VehicleDto MapToDto(Vehicle vehicle)
    {
        return new VehicleDto
        {
            Id = vehicle.Id,
            PlateNumber = vehicle.PlateNumber,
            Brand = vehicle.Brand,
            Model = vehicle.Model,
            Type = vehicle.Type,
            TypeName = vehicle.Type.ToString(),
            Status = vehicle.Status,
            StatusName = vehicle.Status.ToString()
        };
    }
}
```

### 2.4 API (Présentation)

#### Définition
La couche **API** expose l'application au monde extérieur via des endpoints HTTP.

#### Contenu
- **Controllers** : Points d'entrée HTTP
- **Middleware** : Traitement transversal (auth, logging, erreurs)
- **Configuration** : Setup de l'application

#### Exemple FleetTrack

```csharp
// FleetTrack.API/Controllers/VehiclesController.cs
namespace FleetTrack.API.Controllers;

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

    /// <summary>
    /// GET /api/vehicles/{id}
    /// Récupère un véhicule par son ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VehicleDto>> GetById(Guid id)
    {
        var vehicle = await _vehicleService.GetByIdAsync(id);

        if (vehicle == null)
            return NotFound();

        return Ok(vehicle);
    }

    /// <summary>
    /// POST /api/vehicles
    /// Crée un nouveau véhicule
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<VehicleDto>> Create(CreateVehicleDto dto)
    {
        var vehicle = await _vehicleService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = vehicle.Id }, vehicle);
    }
}
```

---

## 3. Principes SOLID

### 3.1 S - Single Responsibility Principle (SRP)

#### Définition
Une classe ne doit avoir qu'**une seule raison de changer**. Elle doit faire UNE seule chose, mais la faire bien.

#### Analogie
Un couteau suisse fait tout, mais mal. Un couteau de chef fait une chose : couper, mais excellemment.

```csharp
// ❌ MAUVAIS : Cette classe fait TROP de choses
public class VehicleManager
{
    public void SaveVehicle(Vehicle v) { /* BDD */ }
    public void SendNotification(string msg) { /* Email */ }
    public void GeneratePdf(Vehicle v) { /* PDF */ }
    public void ValidateVehicle(Vehicle v) { /* Validation */ }
}

// ✅ BON : Chaque classe a UNE responsabilité
public class VehicleRepository
{
    public void Save(Vehicle v) { /* Uniquement BDD */ }
}

public class NotificationService
{
    public void Send(string msg) { /* Uniquement notifications */ }
}

public class VehicleReportGenerator
{
    public void GeneratePdf(Vehicle v) { /* Uniquement PDF */ }
}

public class VehicleValidator
{
    public bool Validate(Vehicle v) { /* Uniquement validation */ }
}
```

### 3.2 O - Open/Closed Principle (OCP)

#### Définition
Le code doit être **ouvert à l'extension** mais **fermé à la modification**. On peut ajouter des fonctionnalités sans modifier le code existant.

```csharp
// ❌ MAUVAIS : Modifier cette méthode à chaque nouveau type
public class VehiclePriceCalculator
{
    public decimal Calculate(Vehicle v)
    {
        if (v.Type == VehicleType.Car)
            return 50;
        else if (v.Type == VehicleType.Truck)
            return 100;
        else if (v.Type == VehicleType.Van)
            return 75;
        // Ajouter un nouveau type = modifier ce code
    }
}

// ✅ BON : Utiliser le polymorphisme
public interface IPriceStrategy
{
    decimal Calculate(Vehicle v);
}

public class CarPriceStrategy : IPriceStrategy
{
    public decimal Calculate(Vehicle v) => 50;
}

public class TruckPriceStrategy : IPriceStrategy
{
    public decimal Calculate(Vehicle v) => 100;
}

// Ajouter un nouveau type = créer une nouvelle classe
public class BusPriceStrategy : IPriceStrategy
{
    public decimal Calculate(Vehicle v) => 150;
}
```

### 3.3 L - Liskov Substitution Principle (LSP)

#### Définition
Une classe enfant doit pouvoir **remplacer** sa classe parent sans casser le programme.

```csharp
// ❌ MAUVAIS : Le carré casse le comportement du rectangle
public class Rectangle
{
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }

    public int Area() => Width * Height;
}

public class Square : Rectangle
{
    public override int Width
    {
        set { base.Width = base.Height = value; }
    }
    public override int Height
    {
        set { base.Width = base.Height = value; }
    }
}

// Ce code échoue avec Square!
Rectangle r = new Square();
r.Width = 5;
r.Height = 10;
// Attendu: Area = 50, Réel: Area = 100 (car Square force Width = Height)

// ✅ BON : Séparer les abstractions
public interface IShape
{
    int Area();
}

public class Rectangle : IShape
{
    public int Width { get; set; }
    public int Height { get; set; }
    public int Area() => Width * Height;
}

public class Square : IShape
{
    public int Side { get; set; }
    public int Area() => Side * Side;
}
```

### 3.4 I - Interface Segregation Principle (ISP)

#### Définition
Mieux vaut **plusieurs petites interfaces** spécifiques qu'une seule interface géante.

```csharp
// ❌ MAUVAIS : Interface trop grosse
public interface IVehicleService
{
    Task<VehicleDto> GetById(Guid id);
    Task<VehicleDto> Create(CreateVehicleDto dto);
    Task<VehicleDto> Update(Guid id, UpdateVehicleDto dto);
    Task Delete(Guid id);
    Task SendMaintenanceReminder(Guid id);      // Pas toujours nécessaire
    Task GenerateQRCode(Guid id);               // Pas toujours nécessaire
    Task ExportToExcel(List<Guid> ids);         // Pas toujours nécessaire
}

// ✅ BON : Interfaces séparées par responsabilité
public interface IVehicleReader
{
    Task<VehicleDto> GetById(Guid id);
    Task<PagedResult<VehicleDto>> GetAll(int page, int size);
}

public interface IVehicleWriter
{
    Task<VehicleDto> Create(CreateVehicleDto dto);
    Task<VehicleDto> Update(Guid id, UpdateVehicleDto dto);
    Task Delete(Guid id);
}

public interface IVehicleNotifier
{
    Task SendMaintenanceReminder(Guid id);
}

public interface IVehicleExporter
{
    Task ExportToExcel(List<Guid> ids);
}
```

### 3.5 D - Dependency Inversion Principle (DIP)

#### Définition
Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'**abstractions** (interfaces).

```csharp
// ❌ MAUVAIS : Dépendance directe vers la classe concrète
public class VehicleController
{
    private readonly SqlVehicleRepository _repository;

    public VehicleController()
    {
        // Création directe = couplage fort
        _repository = new SqlVehicleRepository();
    }
}

// ✅ BON : Dépendance vers l'abstraction + Injection
public interface IVehicleRepository
{
    Task<Vehicle?> GetById(Guid id);
}

public class SqlVehicleRepository : IVehicleRepository
{
    public Task<Vehicle?> GetById(Guid id) { /* SQL */ }
}

public class MongoVehicleRepository : IVehicleRepository
{
    public Task<Vehicle?> GetById(Guid id) { /* MongoDB */ }
}

public class VehicleController
{
    private readonly IVehicleRepository _repository;

    // Injection de dépendance via constructeur
    public VehicleController(IVehicleRepository repository)
    {
        _repository = repository;
    }
}
```

---

## 4. Patterns de Conception

### 4.1 Repository Pattern

#### Définition
Le **Repository** est une abstraction qui cache les détails d'accès aux données. Il fait croire au reste du code qu'il travaille avec une simple collection en mémoire.

#### Analogie
C'est comme un **bibliothécaire**. Tu lui demandes un livre, il te le trouve. Tu ne sais pas s'il va le chercher dans la réserve, le commander ailleurs, ou te le donner depuis son bureau.

```csharp
// Interface du Repository
public interface IVehicleRepository
{
    Task<Vehicle?> GetByIdAsync(Guid id);
    Task<IEnumerable<Vehicle>> GetAllAsync();
    Task AddAsync(Vehicle vehicle);
    Task UpdateAsync(Vehicle vehicle);
    Task DeleteAsync(Guid id);
}

// Implémentation avec Entity Framework
public class EfVehicleRepository : IVehicleRepository
{
    private readonly FleetTrackDbContext _context;

    public EfVehicleRepository(FleetTrackDbContext context)
    {
        _context = context;
    }

    public async Task<Vehicle?> GetByIdAsync(Guid id)
    {
        return await _context.Vehicles.FindAsync(id);
    }

    public async Task<IEnumerable<Vehicle>> GetAllAsync()
    {
        return await _context.Vehicles.ToListAsync();
    }

    public async Task AddAsync(Vehicle vehicle)
    {
        await _context.Vehicles.AddAsync(vehicle);
        await _context.SaveChangesAsync();
    }
}

// Implémentation en mémoire (pour les tests)
public class InMemoryVehicleRepository : IVehicleRepository
{
    private readonly List<Vehicle> _vehicles = new();

    public Task<Vehicle?> GetByIdAsync(Guid id)
    {
        return Task.FromResult(_vehicles.FirstOrDefault(v => v.Id == id));
    }

    public Task<IEnumerable<Vehicle>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<Vehicle>>(_vehicles);
    }

    public Task AddAsync(Vehicle vehicle)
    {
        _vehicles.Add(vehicle);
        return Task.CompletedTask;
    }
}
```

### 4.2 Dependency Injection (DI)

#### Définition
L'**Injection de Dépendances** est un pattern où les dépendances d'une classe sont fournies de l'extérieur plutôt que créées à l'intérieur.

#### Analogie
Au lieu de fabriquer toi-même ton café (new CoffeeMachine()), tu le demandes au serveur qui te l'apporte (injection).

```csharp
// Configuration de l'injection dans Program.cs
var builder = WebApplication.CreateBuilder(args);

// Enregistrement des services
// AddScoped = Une instance par requête HTTP
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// AddSingleton = Une seule instance pour toute l'application
builder.Services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();

// AddTransient = Nouvelle instance à chaque demande
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();

var app = builder.Build();
```

#### Durées de vie des services

| Type | Durée | Utilisation |
|------|-------|-------------|
| **Transient** | Nouvelle instance à chaque injection | Services légers, sans état |
| **Scoped** | Une instance par requête HTTP | DbContext, Services avec état par requête |
| **Singleton** | Une instance pour toute l'app | Configuration, Cache, Connexions persistantes |

```csharp
// Le contrôleur reçoit ses dépendances automatiquement
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    private readonly ILogger<VehiclesController> _logger;

    // ASP.NET Core injecte automatiquement ces services
    public VehiclesController(
        IVehicleService vehicleService,
        ILogger<VehiclesController> logger)
    {
        _vehicleService = vehicleService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<VehicleDto>>> GetAll()
    {
        // On utilise le service injecté
        var vehicles = await _vehicleService.GetAllAsync();
        return Ok(vehicles);
    }
}
```

### 4.3 Factory Pattern

#### Définition
Le **Factory** crée des objets sans exposer la logique de création. Il décide quel type concret instancier.

```csharp
// Factory pour créer différents types de notifications
public interface INotification
{
    Task SendAsync(string message);
}

public class EmailNotification : INotification
{
    public Task SendAsync(string message) => /* Envoyer email */;
}

public class SmsNotification : INotification
{
    public Task SendAsync(string message) => /* Envoyer SMS */;
}

public class PushNotification : INotification
{
    public Task SendAsync(string message) => /* Notification push */;
}

// Factory
public interface INotificationFactory
{
    INotification Create(NotificationType type);
}

public class NotificationFactory : INotificationFactory
{
    public INotification Create(NotificationType type)
    {
        return type switch
        {
            NotificationType.Email => new EmailNotification(),
            NotificationType.Sms => new SmsNotification(),
            NotificationType.Push => new PushNotification(),
            _ => throw new ArgumentException($"Type inconnu: {type}")
        };
    }
}

// Utilisation
public class AlertService
{
    private readonly INotificationFactory _factory;

    public AlertService(INotificationFactory factory)
    {
        _factory = factory;
    }

    public async Task SendAlertAsync(User user, string message)
    {
        // La factory décide comment créer la notification
        var notification = _factory.Create(user.PreferredNotificationType);
        await notification.SendAsync(message);
    }
}
```

---

## 5. Inversion de Dépendances

### Pourquoi inverser les dépendances ?

Sans inversion, le flux naturel est :
```
Controller → Service → Repository → Database
```

Le problème : si tu changes de base de données, tu dois modifier Repository, qui impacte Service, qui impacte Controller...

Avec inversion :
```
Controller → IService ← Service
                          ↓
              IRepository ← Repository → Database
```

Maintenant :
- Controller dépend de IService (interface)
- Service implémente IService
- Tu peux changer Service sans toucher Controller

### Schéma de dépendances FleetTrack

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Controllers                        │   │
│  │    VehiclesController, MissionsController, etc.     │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │ dépend de                        │
│                          ▼                                  │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Interfaces (Contrats)                  │   │
│  │   IVehicleService, IMissionService, IAuthService    │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │ implémenté par                   │
│                          ▼                                  │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Services (Implémentations)                │   │
│  │      VehicleService, MissionService, AuthService    │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │ utilise                          │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               FleetTrackDbContext                    │   │
│  │              (Entity Framework Core)                 │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SQLite / PostgreSQL                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Avantages de cette architecture

1. **Testabilité** : On peut mocker les interfaces pour les tests
2. **Maintenabilité** : Changements isolés dans chaque couche
3. **Flexibilité** : Facile de changer de technologie (SQLite → PostgreSQL)
4. **Clarté** : Chaque couche a une responsabilité claire

---

## Résumé

| Concept | Description Simple |
|---------|-------------------|
| **Clean Architecture** | Organisation en cercles, métier au centre |
| **Domain** | Règles métier pures |
| **Application** | Cas d'utilisation, DTOs, interfaces |
| **Infrastructure** | Détails techniques (BDD, services externes) |
| **API** | Points d'entrée HTTP |
| **SOLID** | 5 principes pour du code propre |
| **Repository** | Abstraction de l'accès aux données |
| **Dependency Injection** | Fournir les dépendances de l'extérieur |
| **Factory** | Création d'objets déléguée |

---

[← Retour au sommaire](./INDEX.md) | [Suivant : C# et .NET →](./02-csharp-dotnet.md)
