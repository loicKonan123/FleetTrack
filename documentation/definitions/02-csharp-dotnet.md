# Définitions : C# et .NET

> Guide complet des concepts C# et .NET utilisés dans FleetTrack

---

## Table des Matières

1. [Fondamentaux C#](#1-fondamentaux-c)
2. [Programmation Orientée Objet](#2-programmation-orientée-objet)
3. [Types et Structures de Données](#3-types-et-structures-de-données)
4. [Programmation Asynchrone](#4-programmation-asynchrone)
5. [LINQ](#5-linq)
6. [Génériques](#6-génériques)
7. [Nullable Reference Types](#7-nullable-reference-types)

---

## 1. Fondamentaux C#

### 1.1 Namespace (Espace de noms)

#### Définition
Un **namespace** est un conteneur logique qui organise le code et évite les conflits de noms. C'est comme des dossiers pour tes classes.

```csharp
// Déclaration d'un namespace
namespace FleetTrack.Domain.Entities
{
    public class Vehicle { }
    public class Mission { }
}

namespace FleetTrack.Application.DTOs
{
    // Peut avoir une classe Vehicle différente
    public class VehicleDto { }
}

// Utilisation
using FleetTrack.Domain.Entities;    // Importe le namespace
using FleetTrack.Application.DTOs;

// Syntaxe moderne (file-scoped namespace) - .NET 6+
namespace FleetTrack.Domain.Entities;

public class Vehicle { }  // Tout le fichier est dans ce namespace
```

### 1.2 Classe (Class)

#### Définition
Une **classe** est un modèle (blueprint) pour créer des objets. Elle définit les données (propriétés) et comportements (méthodes) d'un type d'objet.

#### Analogie
Une classe est comme un **plan d'architecte** pour une maison. Le plan décrit la maison, mais ce n'est pas une maison. Quand tu construis avec ce plan, tu crées une maison réelle (un objet/instance).

```csharp
// Définition de la classe
public class Vehicle
{
    // Propriétés = données
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public int Mileage { get; set; }

    // Constructeur = initialisation
    public Vehicle()
    {
        Id = Guid.NewGuid();
    }

    public Vehicle(string plateNumber, string brand)
    {
        Id = Guid.NewGuid();
        PlateNumber = plateNumber;
        Brand = brand;
    }

    // Méthodes = comportements
    public void UpdateMileage(int newMileage)
    {
        if (newMileage < Mileage)
            throw new ArgumentException("Le kilométrage ne peut pas diminuer");

        Mileage = newMileage;
    }

    public bool NeedsMaintenance()
    {
        return Mileage > 10000;
    }
}

// Création d'instances (objets)
var vehicle1 = new Vehicle();
var vehicle2 = new Vehicle("AB-123-CD", "Toyota");

vehicle2.UpdateMileage(5000);
Console.WriteLine(vehicle2.NeedsMaintenance());  // false
```

### 1.3 Propriété (Property)

#### Définition
Une **propriété** est un membre de classe qui encapsule un champ avec des accesseurs get/set. Elle permet de contrôler la lecture et l'écriture des données.

```csharp
public class Vehicle
{
    // Propriété automatique (le plus courant)
    public string PlateNumber { get; set; } = string.Empty;

    // Propriété en lecture seule
    public Guid Id { get; } = Guid.NewGuid();

    // Propriété avec logique personnalisée
    private int _mileage;
    public int Mileage
    {
        get => _mileage;
        set
        {
            if (value < 0)
                throw new ArgumentException("Le kilométrage ne peut pas être négatif");
            _mileage = value;
        }
    }

    // Propriété calculée (get seulement)
    public string FullName => $"{Brand} {Model} ({PlateNumber})";

    // Propriété avec init (modifiable uniquement à l'initialisation)
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    // Propriété required (.NET 7+)
    public required string Brand { get; set; }

    // Propriété nullable
    public string? Description { get; set; }
}

// Utilisation
var vehicle = new Vehicle
{
    Brand = "Toyota",           // required
    PlateNumber = "AB-123-CD",
    Mileage = 5000,
    // CreatedAt = DateTime.UtcNow  // Automatique via init
};

// vehicle.CreatedAt = DateTime.Now;  // ❌ Erreur! init = non modifiable après
vehicle.Mileage = 6000;              // ✅ OK
```

### 1.4 Méthode (Method)

#### Définition
Une **méthode** est une fonction appartenant à une classe. Elle définit un comportement ou une action.

```csharp
public class VehicleService
{
    // Méthode sans retour (void)
    public void LogVehicle(Vehicle vehicle)
    {
        Console.WriteLine($"Véhicule: {vehicle.PlateNumber}");
    }

    // Méthode avec retour
    public bool IsVehicleAvailable(Vehicle vehicle)
    {
        return vehicle.Status == VehicleStatus.Available;
    }

    // Méthode avec paramètres optionnels
    public List<Vehicle> GetVehicles(int page = 1, int pageSize = 10)
    {
        return _vehicles
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }

    // Méthode avec expression body (=>)
    public string GetVehicleName(Vehicle v) => $"{v.Brand} {v.Model}";

    // Méthode asynchrone
    public async Task<Vehicle?> GetByIdAsync(Guid id)
    {
        return await _context.Vehicles.FindAsync(id);
    }

    // Méthode statique (appelable sans instance)
    public static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        // Formule Haversine
        const double R = 6371; // Rayon Terre en km
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        // ...
        return distance;
    }

    private static double ToRadians(double deg) => deg * Math.PI / 180;
}

// Appel des méthodes
var service = new VehicleService();
service.LogVehicle(vehicle);                           // Instance
var available = service.IsVehicleAvailable(vehicle);   // Instance
var vehicles = service.GetVehicles(page: 2);           // Paramètre nommé

// Méthode statique - pas besoin d'instance
var distance = VehicleService.CalculateDistance(48.8, 2.3, 45.7, 4.8);
```

### 1.5 Constructeur (Constructor)

#### Définition
Un **constructeur** est une méthode spéciale appelée automatiquement lors de la création d'un objet. Il initialise l'objet.

```csharp
public class Vehicle
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; }
    public string Brand { get; set; }
    public DateTime CreatedAt { get; set; }

    // Constructeur par défaut (sans paramètres)
    public Vehicle()
    {
        Id = Guid.NewGuid();
        PlateNumber = string.Empty;
        Brand = string.Empty;
        CreatedAt = DateTime.UtcNow;
    }

    // Constructeur avec paramètres
    public Vehicle(string plateNumber, string brand)
    {
        Id = Guid.NewGuid();
        PlateNumber = plateNumber;
        Brand = brand;
        CreatedAt = DateTime.UtcNow;
    }

    // Constructeur qui appelle un autre constructeur
    public Vehicle(string plateNumber) : this(plateNumber, "Unknown")
    {
        // Le code ici s'exécute APRÈS this(...)
    }
}

// Utilisation
var v1 = new Vehicle();                          // Constructeur par défaut
var v2 = new Vehicle("AB-123-CD", "Toyota");     // Avec paramètres
var v3 = new Vehicle("XY-789-ZZ");               // Appelle this(...)
```

### 1.6 Constructeur Primary (.NET 8+)

```csharp
// Nouvelle syntaxe compacte
public class VehicleService(
    FleetTrackDbContext context,
    ILogger<VehicleService> logger)
{
    // context et logger sont automatiquement disponibles
    // comme des champs privés

    public async Task<Vehicle?> GetByIdAsync(Guid id)
    {
        logger.LogInformation("Recherche véhicule {Id}", id);
        return await context.Vehicles.FindAsync(id);
    }
}

// Équivalent à l'ancienne syntaxe
public class VehicleService
{
    private readonly FleetTrackDbContext _context;
    private readonly ILogger<VehicleService> _logger;

    public VehicleService(
        FleetTrackDbContext context,
        ILogger<VehicleService> logger)
    {
        _context = context;
        _logger = logger;
    }
}
```

---

## 2. Programmation Orientée Objet

### 2.1 Interface

#### Définition
Une **interface** est un contrat qui définit ce qu'une classe DOIT implémenter, sans dire COMMENT. C'est un ensemble de signatures de méthodes sans implémentation.

#### Analogie
Une interface est comme une **prise électrique**. Elle définit la forme (les prises), mais pas ce qui passe dedans. N'importe quel appareil avec la bonne prise peut se brancher.

```csharp
// Définition de l'interface
public interface IVehicleService
{
    Task<VehicleDto?> GetByIdAsync(Guid id);
    Task<PagedResult<VehicleDto>> GetAllAsync(int page, int pageSize);
    Task<VehicleDto> CreateAsync(CreateVehicleDto dto);
    Task<VehicleDto?> UpdateAsync(Guid id, UpdateVehicleDto dto);
    Task<bool> DeleteAsync(Guid id);
}

// Implémentation de l'interface
public class VehicleService : IVehicleService
{
    private readonly FleetTrackDbContext _context;

    public VehicleService(FleetTrackDbContext context)
    {
        _context = context;
    }

    // DOIT implémenter toutes les méthodes de l'interface
    public async Task<VehicleDto?> GetByIdAsync(Guid id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        return vehicle == null ? null : MapToDto(vehicle);
    }

    public async Task<PagedResult<VehicleDto>> GetAllAsync(int page, int pageSize)
    {
        // Implémentation...
    }

    public async Task<VehicleDto> CreateAsync(CreateVehicleDto dto)
    {
        // Implémentation...
    }

    // ... etc
}

// Autre implémentation (pour les tests)
public class MockVehicleService : IVehicleService
{
    private readonly List<VehicleDto> _vehicles = new();

    public Task<VehicleDto?> GetByIdAsync(Guid id)
    {
        return Task.FromResult(_vehicles.FirstOrDefault(v => v.Id == id));
    }

    // ... autres méthodes mockées
}
```

#### Pourquoi utiliser des interfaces ?

```csharp
// Le Controller ne dépend pas de l'implémentation concrète
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _service;  // Interface!

    public VehiclesController(IVehicleService service)
    {
        _service = service;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VehicleDto>> GetById(Guid id)
    {
        var vehicle = await _service.GetByIdAsync(id);
        return vehicle == null ? NotFound() : Ok(vehicle);
    }
}

// En production: on injecte VehicleService
// En test: on injecte MockVehicleService
// Le Controller fonctionne avec les deux!
```

### 2.2 Classe Abstraite (Abstract Class)

#### Définition
Une **classe abstraite** est une classe qui ne peut pas être instanciée directement. Elle sert de base pour d'autres classes et peut contenir à la fois du code implémenté et des méthodes abstraites (sans implémentation).

#### Différence avec Interface
- Interface = contrat pur (que des signatures)
- Classe abstraite = base commune avec du code partagé

```csharp
// Classe abstraite
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Méthode concrète (partagée par toutes les entités)
    public void MarkAsUpdated()
    {
        UpdatedAt = DateTime.UtcNow;
    }

    // Méthode abstraite (chaque entité doit l'implémenter)
    public abstract string GetDisplayName();
}

// Classes dérivées
public class Vehicle : BaseEntity
{
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;

    // DOIT implémenter la méthode abstraite
    public override string GetDisplayName()
    {
        return $"{Brand} {Model} ({PlateNumber})";
    }
}

public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    public override string GetDisplayName()
    {
        return $"{FirstName} {LastName}";
    }
}

// Utilisation
// var entity = new BaseEntity();  // ❌ ERREUR! Classe abstraite
var vehicle = new Vehicle { Brand = "Toyota", Model = "Corolla" };
vehicle.MarkAsUpdated();  // Méthode héritée
Console.WriteLine(vehicle.GetDisplayName());  // "Toyota Corolla ()"
```

### 2.3 Héritage (Inheritance)

#### Définition
L'**héritage** permet à une classe de reprendre les propriétés et méthodes d'une autre classe (classe parent/base).

```csharp
// Classe parent
public class Vehicle
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;

    public virtual void StartEngine()
    {
        Console.WriteLine("Moteur démarré");
    }
}

// Classe enfant - hérite de Vehicle
public class Truck : Vehicle
{
    public int MaxLoadKg { get; set; }
    public bool HasTrailer { get; set; }

    // Surcharge (override) de la méthode parent
    public override void StartEngine()
    {
        Console.WriteLine("Vérification du chargement...");
        base.StartEngine();  // Appelle la méthode parent
        Console.WriteLine("Camion prêt");
    }

    // Nouvelle méthode spécifique
    public void LoadCargo(int weightKg)
    {
        if (weightKg > MaxLoadKg)
            throw new InvalidOperationException("Charge trop lourde!");
    }
}

// Utilisation
var truck = new Truck
{
    PlateNumber = "TR-001-CK",  // Propriété héritée
    Brand = "Volvo",            // Propriété héritée
    MaxLoadKg = 10000           // Propriété propre
};

truck.StartEngine();  // Utilise la version surchargée
truck.LoadCargo(5000);
```

### 2.4 Polymorphisme

#### Définition
Le **polymorphisme** permet de traiter des objets de différents types de manière uniforme via une interface ou classe parente commune.

#### Analogie
Tu peux "conduire" n'importe quel véhicule (voiture, camion, moto) car ils partagent tous le concept de "conduire", même si chacun le fait différemment.

```csharp
// Interface commune
public interface ITrackable
{
    Guid Id { get; }
    void UpdatePosition(double latitude, double longitude);
    GpsPosition GetLastPosition();
}

// Différentes implémentations
public class Vehicle : ITrackable
{
    public Guid Id { get; set; }
    private GpsPosition _lastPosition;

    public void UpdatePosition(double lat, double lon)
    {
        _lastPosition = new GpsPosition(lat, lon);
        Console.WriteLine($"Véhicule {Id} en mouvement");
    }

    public GpsPosition GetLastPosition() => _lastPosition;
}

public class Drone : ITrackable
{
    public Guid Id { get; set; }
    private GpsPosition _lastPosition;
    public double Altitude { get; set; }

    public void UpdatePosition(double lat, double lon)
    {
        _lastPosition = new GpsPosition(lat, lon);
        Console.WriteLine($"Drone {Id} en vol à {Altitude}m");
    }

    public GpsPosition GetLastPosition() => _lastPosition;
}

// Utilisation polymorphique
public class TrackingService
{
    public void UpdateAllPositions(IEnumerable<ITrackable> items, double lat, double lon)
    {
        foreach (var item in items)
        {
            // Appelle la bonne implémentation automatiquement!
            item.UpdatePosition(lat, lon);
        }
    }
}

// Usage
var items = new List<ITrackable>
{
    new Vehicle { Id = Guid.NewGuid() },
    new Drone { Id = Guid.NewGuid(), Altitude = 100 }
};

var service = new TrackingService();
service.UpdateAllPositions(items, 48.8566, 2.3522);
// Output:
// "Véhicule xxx en mouvement"
// "Drone xxx en vol à 100m"
```

### 2.5 Encapsulation

#### Définition
L'**encapsulation** consiste à cacher les détails internes d'une classe et exposer uniquement ce qui est nécessaire via des méthodes/propriétés publiques.

```csharp
public class Vehicle
{
    // Champ privé - inaccessible de l'extérieur
    private int _mileage;
    private readonly List<MaintenanceRecord> _maintenanceHistory = new();

    // Propriété publique avec logique de validation
    public int Mileage
    {
        get => _mileage;
        set
        {
            if (value < _mileage)
                throw new InvalidOperationException("Le kilométrage ne peut pas diminuer");
            _mileage = value;
        }
    }

    // Propriété en lecture seule vers l'extérieur
    public IReadOnlyList<MaintenanceRecord> MaintenanceHistory => _maintenanceHistory.AsReadOnly();

    // Méthode publique pour ajouter (contrôlée)
    public void AddMaintenanceRecord(MaintenanceRecord record)
    {
        if (record.Date > DateTime.UtcNow)
            throw new InvalidOperationException("Date future non autorisée");

        _maintenanceHistory.Add(record);
    }

    // Méthode privée - logique interne
    private bool ShouldScheduleMaintenance()
    {
        var lastMaintenance = _maintenanceHistory.LastOrDefault();
        if (lastMaintenance == null) return true;

        return _mileage - lastMaintenance.Mileage > 10000;
    }
}

// Utilisation
var vehicle = new Vehicle();
vehicle.Mileage = 5000;               // ✅ OK via propriété
// vehicle._mileage = 5000;           // ❌ Erreur! Champ privé
// vehicle._maintenanceHistory.Add(); // ❌ Erreur! Liste privée

vehicle.AddMaintenanceRecord(new MaintenanceRecord { Date = DateTime.UtcNow });
var history = vehicle.MaintenanceHistory;  // ✅ Lecture seule
// history.Add(new MaintenanceRecord());   // ❌ Erreur! IReadOnlyList
```

---

## 3. Types et Structures de Données

### 3.1 Types Valeur vs Types Référence

#### Types Valeur
Stockés directement dans la pile (stack). Copiés par valeur.

```csharp
// Types valeur (struct, enum, primitifs)
int a = 5;
int b = a;    // Copie de la valeur
b = 10;       // a reste à 5

// Primitifs: int, double, bool, char, decimal, float, long, byte...
// Structs: DateTime, Guid, TimeSpan, Point...
// Enums: VehicleType, MissionStatus...

struct GpsCoordinate
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

var pos1 = new GpsCoordinate { Latitude = 48.8, Longitude = 2.3 };
var pos2 = pos1;          // Copie!
pos2.Latitude = 45.0;     // pos1.Latitude reste 48.8
```

#### Types Référence
Stockés dans le tas (heap). Copiés par référence.

```csharp
// Types référence (class, string, array, interface...)
var vehicle1 = new Vehicle { PlateNumber = "AB-123" };
var vehicle2 = vehicle1;  // Même référence!
vehicle2.PlateNumber = "XY-789";

Console.WriteLine(vehicle1.PlateNumber);  // "XY-789" - Modifié aussi!

// Pour copier réellement, il faut cloner
var vehicle3 = new Vehicle
{
    PlateNumber = vehicle1.PlateNumber,
    Brand = vehicle1.Brand
};
```

### 3.2 Enum (Énumération)

#### Définition
Un **enum** est un type qui définit un ensemble de constantes nommées. Idéal pour les valeurs fixes et prédéfinies.

```csharp
// Définition simple
public enum VehicleStatus
{
    Available,    // = 0 (par défaut)
    InUse,        // = 1
    Maintenance,  // = 2
    OutOfService  // = 3
}

// Avec valeurs explicites
public enum VehicleType
{
    Car = 0,
    Truck = 1,
    Van = 2,
    Motorcycle = 3,
    Bus = 4
}

// Avec attribut Flags (combinaisons)
[Flags]
public enum Permissions
{
    None = 0,
    Read = 1,      // 0001
    Write = 2,     // 0010
    Delete = 4,    // 0100
    Admin = 8,     // 1000

    // Combinaisons
    ReadWrite = Read | Write,        // 3 = 0011
    All = Read | Write | Delete | Admin  // 15 = 1111
}

// Utilisation
var status = VehicleStatus.Available;
if (status == VehicleStatus.Available)
{
    Console.WriteLine("Véhicule disponible");
}

// Conversion
int statusValue = (int)status;  // 0
string statusName = status.ToString();  // "Available"
VehicleStatus parsed = Enum.Parse<VehicleStatus>("InUse");

// Flags
var perms = Permissions.Read | Permissions.Write;
bool canRead = perms.HasFlag(Permissions.Read);  // true
bool canDelete = perms.HasFlag(Permissions.Delete);  // false
```

### 3.3 Record

#### Définition
Un **record** est un type référence immuable, idéal pour les DTOs et les objets de valeur. Génère automatiquement Equals, GetHashCode, ToString.

```csharp
// Record simple (C# 9+)
public record VehicleDto(
    Guid Id,
    string PlateNumber,
    string Brand,
    string Model,
    VehicleType Type
);

// Équivalent à écrire tout ça manuellement:
public class VehicleDto
{
    public Guid Id { get; init; }
    public string PlateNumber { get; init; }
    // ... + Equals, GetHashCode, ToString, déconstruction...
}

// Utilisation
var dto1 = new VehicleDto(
    Guid.NewGuid(),
    "AB-123",
    "Toyota",
    "Corolla",
    VehicleType.Car
);

// Modification avec "with" (crée une copie)
var dto2 = dto1 with { PlateNumber = "XY-789" };

// Comparaison par valeur (pas par référence!)
var dto3 = new VehicleDto(dto1.Id, "AB-123", "Toyota", "Corolla", VehicleType.Car);
Console.WriteLine(dto1 == dto3);  // true (mêmes valeurs)

// Déconstruction
var (id, plate, brand, model, type) = dto1;

// Record avec propriétés mutables
public record MutableVehicleDto
{
    public Guid Id { get; init; }
    public string PlateNumber { get; set; } = string.Empty;  // Mutable
}
```

### 3.4 Collections

```csharp
// List<T> - Liste dynamique
var vehicles = new List<Vehicle>();
vehicles.Add(new Vehicle { PlateNumber = "AB-123" });
vehicles.AddRange(new[] { vehicle1, vehicle2 });
var first = vehicles[0];
var count = vehicles.Count;

// Dictionary<TKey, TValue> - Clé-Valeur
var vehiclesByPlate = new Dictionary<string, Vehicle>();
vehiclesByPlate["AB-123"] = new Vehicle { PlateNumber = "AB-123" };
vehiclesByPlate.Add("XY-789", new Vehicle { PlateNumber = "XY-789" });

if (vehiclesByPlate.TryGetValue("AB-123", out var vehicle))
{
    Console.WriteLine($"Trouvé: {vehicle.Brand}");
}

// HashSet<T> - Ensemble unique (pas de doublons)
var activeVehicleIds = new HashSet<Guid>();
activeVehicleIds.Add(Guid.NewGuid());
activeVehicleIds.Add(Guid.NewGuid());
bool exists = activeVehicleIds.Contains(someId);

// Queue<T> - File (FIFO: First In, First Out)
var taskQueue = new Queue<Task>();
taskQueue.Enqueue(task1);
var nextTask = taskQueue.Dequeue();  // Récupère et supprime le premier

// Stack<T> - Pile (LIFO: Last In, First Out)
var history = new Stack<string>();
history.Push("Page1");
history.Push("Page2");
var lastPage = history.Pop();  // "Page2"

// IEnumerable<T> - Interface de base pour toutes les collections
public IEnumerable<Vehicle> GetVehicles()
{
    // Peut retourner List, Array, ou tout itérable
    return _context.Vehicles.Where(v => v.IsActive);
}
```

---

## 4. Programmation Asynchrone

### 4.1 async/await

#### Définition
**async/await** permet d'écrire du code asynchrone (non-bloquant) de manière lisible. Le programme peut faire autre chose en attendant une opération longue (I/O, réseau, etc.).

#### Analogie
Tu commandes un café (await), mais au lieu de rester planté devant le comptoir, tu vas t'asseoir et lire ton journal. Le serveur t'appelle quand c'est prêt.

```csharp
// Méthode synchrone (bloquante)
public Vehicle GetVehicle(Guid id)
{
    // BLOQUE le thread jusqu'à la fin de la requête BDD
    var vehicle = _context.Vehicles.Find(id);
    return vehicle;
}

// Méthode asynchrone (non-bloquante)
public async Task<Vehicle?> GetVehicleAsync(Guid id)
{
    // LIBÈRE le thread pendant la requête BDD
    var vehicle = await _context.Vehicles.FindAsync(id);
    return vehicle;
}
```

### 4.2 Task et Task<T>

#### Définition
**Task** représente une opération asynchrone en cours. `Task<T>` contient un résultat de type T une fois terminée.

```csharp
// Task sans résultat
public async Task SendEmailAsync(string to, string subject, string body)
{
    await _emailClient.SendAsync(to, subject, body);
    // Pas de return nécessaire
}

// Task<T> avec résultat
public async Task<Vehicle?> GetByIdAsync(Guid id)
{
    var vehicle = await _context.Vehicles.FindAsync(id);
    return vehicle;  // Retourne Vehicle?
}

// Combinaison de Tasks
public async Task<DashboardDto> GetDashboardAsync()
{
    // Exécution parallèle
    var vehiclesTask = _vehicleService.GetAllAsync();
    var missionsTask = _missionService.GetActiveAsync();
    var usersTask = _userService.GetCountAsync();

    // Attend toutes les tâches
    await Task.WhenAll(vehiclesTask, missionsTask, usersTask);

    return new DashboardDto
    {
        Vehicles = vehiclesTask.Result,
        ActiveMissions = missionsTask.Result,
        UserCount = usersTask.Result
    };
}

// Timeout
public async Task<Vehicle?> GetWithTimeoutAsync(Guid id)
{
    var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));

    try
    {
        return await _context.Vehicles
            .FindAsync(new object[] { id }, cts.Token);
    }
    catch (OperationCanceledException)
    {
        _logger.LogWarning("Timeout lors de la recherche");
        return null;
    }
}
```

### 4.3 Patterns Courants

```csharp
// Pattern: Fire and forget (attention!)
public void StartBackgroundTask()
{
    // Ne pas attendre - tâche en arrière-plan
    _ = DoBackgroundWorkAsync();
}

// Pattern: Retry avec délai
public async Task<Vehicle?> GetWithRetryAsync(Guid id, int maxRetries = 3)
{
    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            return await _context.Vehicles.FindAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Tentative {Attempt} échouée", i + 1);
            if (i < maxRetries - 1)
                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, i)));
        }
    }
    return null;
}

// Pattern: Parallel processing
public async Task ProcessVehiclesAsync(IEnumerable<Guid> vehicleIds)
{
    var tasks = vehicleIds.Select(async id =>
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle != null)
        {
            vehicle.LastChecked = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    });

    await Task.WhenAll(tasks);
}
```

---

## 5. LINQ

### Définition
**LINQ** (Language Integrated Query) permet d'interroger des collections avec une syntaxe proche du SQL, directement en C#.

### 5.1 Méthodes LINQ de base

```csharp
var vehicles = new List<Vehicle>
{
    new Vehicle { Brand = "Toyota", Model = "Corolla", Type = VehicleType.Car, Mileage = 50000 },
    new Vehicle { Brand = "Volvo", Model = "FH16", Type = VehicleType.Truck, Mileage = 200000 },
    new Vehicle { Brand = "Ford", Model = "Transit", Type = VehicleType.Van, Mileage = 80000 },
    new Vehicle { Brand = "Toyota", Model = "Camry", Type = VehicleType.Car, Mileage = 30000 }
};

// WHERE - Filtrer
var cars = vehicles.Where(v => v.Type == VehicleType.Car);

// SELECT - Transformer/Projeter
var names = vehicles.Select(v => $"{v.Brand} {v.Model}");
var dtos = vehicles.Select(v => new VehicleDto { Brand = v.Brand, Model = v.Model });

// ORDERBY - Trier
var sortedByMileage = vehicles.OrderBy(v => v.Mileage);
var sortedDesc = vehicles.OrderByDescending(v => v.Mileage);
var multiSort = vehicles
    .OrderBy(v => v.Brand)
    .ThenBy(v => v.Model);

// FIRST / FIRSTORDEFAULT
var firstToyota = vehicles.FirstOrDefault(v => v.Brand == "Toyota");
// FirstOrDefault retourne null si pas trouvé
// First lance une exception si pas trouvé

// SINGLE / SINGLEORDEFAULT
// Comme First, mais lance une exception s'il y en a plus d'un

// ANY - Existe-t-il au moins un?
bool hasTrucks = vehicles.Any(v => v.Type == VehicleType.Truck);  // true

// ALL - Tous satisfont-ils la condition?
bool allActive = vehicles.All(v => v.IsActive);

// COUNT
int carCount = vehicles.Count(v => v.Type == VehicleType.Car);  // 2

// SUM / AVERAGE / MAX / MIN
int totalMileage = vehicles.Sum(v => v.Mileage);
double avgMileage = vehicles.Average(v => v.Mileage);
int maxMileage = vehicles.Max(v => v.Mileage);

// TAKE / SKIP - Pagination
var page2 = vehicles.Skip(10).Take(10);  // Éléments 11-20

// DISTINCT - Valeurs uniques
var uniqueBrands = vehicles.Select(v => v.Brand).Distinct();

// GROUPBY - Grouper
var byType = vehicles.GroupBy(v => v.Type);
foreach (var group in byType)
{
    Console.WriteLine($"{group.Key}: {group.Count()} véhicules");
}

// TOLIST / TOARRAY / TODICTIONARY
var list = vehicles.Where(v => v.IsActive).ToList();
var dict = vehicles.ToDictionary(v => v.Id);
```

### 5.2 LINQ avec Entity Framework

```csharp
public class VehicleService
{
    private readonly FleetTrackDbContext _context;

    public async Task<PagedResult<VehicleDto>> GetAllAsync(
        int page,
        int pageSize,
        string? search = null,
        VehicleType? type = null)
    {
        // IQueryable = requête pas encore exécutée
        IQueryable<Vehicle> query = _context.Vehicles
            .Where(v => v.IsActive);

        // Filtres conditionnels
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(v =>
                v.PlateNumber.Contains(search) ||
                v.Brand.Contains(search) ||
                v.Model.Contains(search));
        }

        if (type.HasValue)
        {
            query = query.Where(v => v.Type == type.Value);
        }

        // Comptage total (avant pagination)
        var totalCount = await query.CountAsync();

        // Projection + Pagination
        var items = await query
            .OrderBy(v => v.PlateNumber)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(v => new VehicleDto
            {
                Id = v.Id,
                PlateNumber = v.PlateNumber,
                Brand = v.Brand,
                Model = v.Model,
                Type = v.Type
            })
            .ToListAsync();  // Exécution de la requête SQL

        return new PagedResult<VehicleDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}
```

---

## 6. Génériques

### Définition
Les **génériques** permettent de créer des classes, méthodes ou interfaces réutilisables avec différents types.

```csharp
// Classe générique
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

// Utilisation avec différents types
var vehicleResult = new PagedResult<VehicleDto>();
var missionResult = new PagedResult<MissionDto>();
var userResult = new PagedResult<UserDto>();

// Interface générique
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(Guid id);
}

// Implémentation générique
public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly FleetTrackDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(FleetTrackDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
    }
}

// Méthode générique
public T? Clone<T>(T source) where T : class, new()
{
    if (source == null) return null;

    var clone = new T();
    foreach (var prop in typeof(T).GetProperties())
    {
        prop.SetValue(clone, prop.GetValue(source));
    }
    return clone;
}

// Contraintes génériques
public class Service<T> where T : class, IEntity, new()
// where T : class          = T doit être un type référence
// where T : struct         = T doit être un type valeur
// where T : new()          = T doit avoir un constructeur sans paramètre
// where T : IEntity        = T doit implémenter IEntity
// where T : BaseClass      = T doit hériter de BaseClass
```

---

## 7. Nullable Reference Types

### Définition
Les **Nullable Reference Types** (NRT) permettent au compilateur de détecter les potentielles erreurs de null à la compilation.

```csharp
// Activation dans le projet (.csproj)
<PropertyGroup>
    <Nullable>enable</Nullable>
</PropertyGroup>

// Types non-nullable (par défaut)
string name = "John";           // Ne peut PAS être null
// name = null;                 // ❌ Warning du compilateur

// Types nullable (avec ?)
string? optionalName = null;    // Peut être null

// Vérification obligatoire
public void PrintName(string? name)
{
    // Console.WriteLine(name.ToUpper());  // ❌ Warning: peut être null

    // Option 1: Vérification if
    if (name != null)
    {
        Console.WriteLine(name.ToUpper());  // ✅ OK
    }

    // Option 2: Opérateur null-conditional (?.)
    Console.WriteLine(name?.ToUpper());  // ✅ OK, affiche null si name est null

    // Option 3: Opérateur null-coalescing (??)
    Console.WriteLine((name ?? "Inconnu").ToUpper());  // ✅ "INCONNU" si null

    // Option 4: Null-forgiving (!) - "Je sais que ce n'est pas null"
    Console.WriteLine(name!.ToUpper());  // ⚠️ Dangereux si vraiment null
}

// Dans les classes
public class Vehicle
{
    // Non-nullable = doit être initialisé
    public string PlateNumber { get; set; } = string.Empty;

    // Nullable = peut être null
    public string? Description { get; set; }

    // Required (.NET 7+) = doit être fourni à la construction
    public required string Brand { get; set; }
}

// Pattern matching avec null
public string GetVehicleInfo(Vehicle? vehicle)
{
    return vehicle switch
    {
        null => "Véhicule non trouvé",
        { Status: VehicleStatus.Available } => "Disponible",
        { Mileage: > 100000 } => "Kilométrage élevé",
        _ => $"{vehicle.Brand} {vehicle.Model}"
    };
}
```

---

## Résumé

| Concept | Description |
|---------|-------------|
| **Namespace** | Conteneur logique pour organiser le code |
| **Class** | Modèle pour créer des objets |
| **Interface** | Contrat définissant des signatures |
| **Abstract Class** | Classe de base non instanciable |
| **Enum** | Ensemble de constantes nommées |
| **Record** | Type référence immuable pour les données |
| **async/await** | Programmation asynchrone non-bloquante |
| **LINQ** | Requêtes sur collections |
| **Génériques** | Code réutilisable avec différents types |
| **Nullable Types** | Gestion explicite des valeurs null |

---

[← Précédent : Architecture](./01-architecture.md) | [Suivant : Base de données →](./03-database.md)
