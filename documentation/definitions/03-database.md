# Définitions : Base de Données et Entity Framework Core

> Guide complet des concepts de base de données utilisés dans FleetTrack

---

## Table des Matières

1. [Concepts Base de Données](#1-concepts-base-de-données)
2. [ORM et Entity Framework Core](#2-orm-et-entity-framework-core)
3. [DbContext](#3-dbcontext)
4. [Entités et Relations](#4-entités-et-relations)
5. [Migrations](#5-migrations)
6. [Requêtes et LINQ to Entities](#6-requêtes-et-linq-to-entities)
7. [Transactions](#7-transactions)

---

## 1. Concepts Base de Données

### 1.1 Base de Données Relationnelle

#### Définition
Une **base de données relationnelle** stocke les données dans des tables avec des lignes et colonnes. Les tables sont liées entre elles par des clés.

#### Analogie
C'est comme un **classeur Excel** avec plusieurs feuilles (tables) liées entre elles. Chaque feuille a des colonnes (champs) et des lignes (enregistrements).

```
┌─────────────────────────────────────────────────────────────┐
│                   BASE DE DONNÉES FLEETTRACK               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │  VEHICLES   │     │  MISSIONS   │     │   USERS     │   │
│  ├─────────────┤     ├─────────────┤     ├─────────────┤   │
│  │ Id (PK)     │◄────│ VehicleId   │     │ Id (PK)     │   │
│  │ PlateNumber │     │ Id (PK)     │     │ Username    │   │
│  │ Brand       │     │ Name        │     │ Email       │   │
│  │ Model       │     │ Status      │     │ RoleId (FK) │──►│
│  │ Type        │     │ StartDate   │     │             │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
│                                                             │
│  PK = Primary Key (Clé Primaire)                           │
│  FK = Foreign Key (Clé Étrangère)                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Clé Primaire (Primary Key - PK)

#### Définition
La **clé primaire** est une colonne (ou ensemble de colonnes) qui identifie de façon unique chaque ligne d'une table.

```sql
-- En SQL
CREATE TABLE Vehicles (
    Id UNIQUEIDENTIFIER PRIMARY KEY,  -- Clé primaire
    PlateNumber NVARCHAR(20) NOT NULL,
    Brand NVARCHAR(100) NOT NULL
);
```

```csharp
// En Entity Framework
public class Vehicle
{
    // Par convention, "Id" est la clé primaire
    public Guid Id { get; set; }

    public string PlateNumber { get; set; } = string.Empty;
}

// Ou explicitement avec [Key]
public class Vehicle
{
    [Key]
    public Guid VehicleId { get; set; }
}

// Ou via Fluent API
modelBuilder.Entity<Vehicle>()
    .HasKey(v => v.Id);
```

### 1.3 Clé Étrangère (Foreign Key - FK)

#### Définition
Une **clé étrangère** est une colonne qui référence la clé primaire d'une autre table. Elle crée une relation entre les tables.

```csharp
public class Mission
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Clé étrangère vers Vehicle
    public Guid? VehicleId { get; set; }

    // Propriété de navigation
    public Vehicle? Vehicle { get; set; }
}

public class Vehicle
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;

    // Navigation inverse
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
}
```

### 1.4 Index

#### Définition
Un **index** est une structure de données qui accélère la recherche dans une table, comme l'index d'un livre.

```csharp
// Index unique
[Index(nameof(PlateNumber), IsUnique = true)]
public class Vehicle
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
}

// Plusieurs index via Fluent API
modelBuilder.Entity<Vehicle>(entity =>
{
    // Index unique sur PlateNumber
    entity.HasIndex(v => v.PlateNumber).IsUnique();

    // Index composite sur Brand + Model
    entity.HasIndex(v => new { v.Brand, v.Model });

    // Index pour optimiser les recherches fréquentes
    entity.HasIndex(v => v.Status);
});
```

### 1.5 Contraintes

```csharp
public class Vehicle
{
    public Guid Id { get; set; }

    [Required]                      // NOT NULL
    [MaxLength(20)]                 // VARCHAR(20)
    public string PlateNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Brand { get; set; } = string.Empty;

    [Range(0, 1000000)]
    public int Mileage { get; set; }

    [EmailAddress]
    public string? OwnerEmail { get; set; }
}

// Fluent API pour contraintes avancées
modelBuilder.Entity<Vehicle>(entity =>
{
    entity.Property(v => v.PlateNumber)
        .IsRequired()
        .HasMaxLength(20);

    entity.HasCheckConstraint(
        "CK_Vehicle_Mileage",
        "[Mileage] >= 0");

    entity.Property(v => v.Status)
        .HasDefaultValue(VehicleStatus.Available);
});
```

---

## 2. ORM et Entity Framework Core

### 2.1 ORM (Object-Relational Mapping)

#### Définition
Un **ORM** est un outil qui fait le lien entre les objets de ton code (classes C#) et les tables de la base de données. Il traduit automatiquement.

#### Analogie
L'ORM est un **traducteur**. Tu parles en C# (`vehicle.Brand`), et il traduit en SQL (`SELECT Brand FROM Vehicles`).

```
┌─────────────────────────────────────────────────────────────┐
│                          CODE C#                            │
│   var vehicle = await context.Vehicles                      │
│       .Where(v => v.Brand == "Toyota")                     │
│       .FirstOrDefaultAsync();                               │
└─────────────────────────┬───────────────────────────────────┘
                          │ ORM traduit
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                          SQL                                │
│   SELECT TOP 1 * FROM Vehicles                              │
│   WHERE Brand = 'Toyota'                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Entity Framework Core (EF Core)

#### Définition
**Entity Framework Core** est l'ORM officiel de Microsoft pour .NET. Il permet de travailler avec la base de données en utilisant des objets C# au lieu d'écrire du SQL.

#### Avantages
- Pas besoin d'écrire du SQL manuellement
- Type-safe : erreurs détectées à la compilation
- Migrations automatiques
- Support de plusieurs bases de données (SQLite, PostgreSQL, SQL Server...)

```csharp
// Sans ORM - SQL brut
using var connection = new SqlConnection(connectionString);
var command = new SqlCommand(
    "SELECT * FROM Vehicles WHERE Brand = @brand",
    connection);
command.Parameters.AddWithValue("@brand", "Toyota");
await connection.OpenAsync();
using var reader = await command.ExecuteReaderAsync();
while (await reader.ReadAsync())
{
    var vehicle = new Vehicle
    {
        Id = reader.GetGuid(0),
        PlateNumber = reader.GetString(1),
        Brand = reader.GetString(2)
        // ... mapping manuel
    };
}

// Avec Entity Framework Core
var vehicles = await context.Vehicles
    .Where(v => v.Brand == "Toyota")
    .ToListAsync();
// C'est tout! EF Core fait le mapping automatiquement
```

---

## 3. DbContext

### Définition
Le **DbContext** est la classe principale d'Entity Framework. C'est le "pont" entre ton code et la base de données.

#### Responsabilités
- Gérer la connexion à la base de données
- Représenter les tables via des DbSet<T>
- Suivre les modifications (Change Tracking)
- Sauvegarder les changements

```csharp
// FleetTrack.Infrastructure/Data/FleetTrackDbContext.cs
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Infrastructure.Data;

public class FleetTrackDbContext : DbContext
{
    public FleetTrackDbContext(DbContextOptions<FleetTrackDbContext> options)
        : base(options)
    {
    }

    // DbSet = représente une table
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Mission> Missions => Set<Mission>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<TrackingSession> TrackingSessions => Set<TrackingSession>();
    public DbSet<GpsPosition> GpsPositions => Set<GpsPosition>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuration des entités
        ConfigureVehicle(modelBuilder);
        ConfigureUser(modelBuilder);
        ConfigureMission(modelBuilder);

        // Seed data (données initiales)
        SeedRoles(modelBuilder);
    }

    private static void ConfigureVehicle(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(v => v.Id);

            entity.Property(v => v.PlateNumber)
                .IsRequired()
                .HasMaxLength(20);

            entity.HasIndex(v => v.PlateNumber)
                .IsUnique();

            // Relation One-to-Many
            entity.HasMany(v => v.Missions)
                .WithOne(m => m.Vehicle)
                .HasForeignKey(m => m.VehicleId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();

            // Relation avec Role
            entity.HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void SeedRoles(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin", Description = "Administrateur" },
            new Role { Id = 2, Name = "Dispatcher", Description = "Dispatcher" },
            new Role { Id = 3, Name = "Driver", Description = "Chauffeur" },
            new Role { Id = 4, Name = "Viewer", Description = "Observateur" }
        );
    }
}
```

### Configuration dans Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Configuration du DbContext
builder.Services.AddDbContext<FleetTrackDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    // SQLite pour développement
    options.UseSqlite(connectionString);

    // Ou PostgreSQL pour production
    // options.UseNpgsql(connectionString);

    // Options de développement
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();  // Log des valeurs SQL
        options.EnableDetailedErrors();         // Erreurs détaillées
    }
});
```

---

## 4. Entités et Relations

### 4.1 Entité (Entity)

#### Définition
Une **entité** est une classe C# qui représente une table de la base de données. Chaque instance = une ligne.

```csharp
// Entité de base
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
}

// Entité Vehicle
public class Vehicle : BaseEntity
{
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public VehicleType Type { get; set; }
    public VehicleStatus Status { get; set; } = VehicleStatus.Available;
    public int? Year { get; set; }
    public int? Mileage { get; set; }

    // Navigation properties (relations)
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
    public ICollection<TrackingSession> TrackingSessions { get; set; } = new List<TrackingSession>();
}
```

### 4.2 Relations

#### One-to-Many (Un-à-Plusieurs)

Un véhicule peut avoir plusieurs missions.

```csharp
public class Vehicle
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;

    // UN véhicule a PLUSIEURS missions
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
}

public class Mission
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // PLUSIEURS missions appartiennent à UN véhicule
    public Guid? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
}

// Configuration Fluent API
modelBuilder.Entity<Vehicle>()
    .HasMany(v => v.Missions)      // Un véhicule a plusieurs missions
    .WithOne(m => m.Vehicle)        // Une mission a un véhicule
    .HasForeignKey(m => m.VehicleId)
    .OnDelete(DeleteBehavior.SetNull);  // Si véhicule supprimé, VehicleId = null
```

#### One-to-One (Un-à-Un)

Un utilisateur a un profil.

```csharp
public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;

    // UN utilisateur a UN profil
    public UserProfile? Profile { get; set; }
}

public class UserProfile
{
    public Guid Id { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }

    // Le profil appartient à UN utilisateur
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}

// Configuration
modelBuilder.Entity<User>()
    .HasOne(u => u.Profile)
    .WithOne(p => p.User)
    .HasForeignKey<UserProfile>(p => p.UserId);
```

#### Many-to-Many (Plusieurs-à-Plusieurs)

Un chauffeur peut conduire plusieurs véhicules, un véhicule peut être conduit par plusieurs chauffeurs.

```csharp
public class Driver
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // PLUSIEURS chauffeurs conduisent PLUSIEURS véhicules
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}

public class Vehicle
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;

    public ICollection<Driver> Drivers { get; set; } = new List<Driver>();
}

// EF Core 5+ crée automatiquement la table de jonction
// Ou explicitement:
public class DriverVehicle
{
    public Guid DriverId { get; set; }
    public Driver Driver { get; set; } = null!;

    public Guid VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;

    public DateTime AssignedAt { get; set; }
}

modelBuilder.Entity<Driver>()
    .HasMany(d => d.Vehicles)
    .WithMany(v => v.Drivers)
    .UsingEntity<DriverVehicle>(
        j => j.HasOne(dv => dv.Vehicle).WithMany().HasForeignKey(dv => dv.VehicleId),
        j => j.HasOne(dv => dv.Driver).WithMany().HasForeignKey(dv => dv.DriverId)
    );
```

### 4.3 Navigation Properties

#### Définition
Les **propriétés de navigation** permettent de naviguer entre les entités liées sans écrire de jointures.

```csharp
// Récupérer les missions d'un véhicule
var vehicle = await context.Vehicles
    .Include(v => v.Missions)  // Charge les missions
    .FirstOrDefaultAsync(v => v.Id == vehicleId);

foreach (var mission in vehicle.Missions)
{
    Console.WriteLine(mission.Name);
}

// Accès via la navigation
var mission = await context.Missions
    .Include(m => m.Vehicle)  // Charge le véhicule
    .FirstOrDefaultAsync(m => m.Id == missionId);

Console.WriteLine(mission.Vehicle?.PlateNumber);
```

---

## 5. Migrations

### Définition
Les **migrations** permettent de versionner et appliquer les changements du modèle de données à la base de données.

#### Analogie
C'est comme **Git pour ta base de données**. Chaque migration = un commit qui modifie la structure.

### 5.1 Créer une Migration

```bash
# Dans le terminal, depuis le dossier du projet API
cd FleetTrack/src/FleetTrack.API

# Créer une migration
dotnet ef migrations add AddVehicleTable --project ../FleetTrack.Infrastructure

# Avec un nom descriptif
dotnet ef migrations add AddMileageToVehicle --project ../FleetTrack.Infrastructure
dotnet ef migrations add AddMissionVehicleRelation --project ../FleetTrack.Infrastructure
```

### 5.2 Structure d'une Migration

```csharp
// Migrations/20240115_AddVehicleTable.cs
public partial class AddVehicleTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Ce qui se passe quand on APPLIQUE la migration
        migrationBuilder.CreateTable(
            name: "Vehicles",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                PlateNumber = table.Column<string>(maxLength: 20, nullable: false),
                Brand = table.Column<string>(maxLength: 100, nullable: false),
                Model = table.Column<string>(maxLength: 100, nullable: false),
                Type = table.Column<int>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Vehicles", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Vehicles_PlateNumber",
            table: "Vehicles",
            column: "PlateNumber",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Ce qui se passe quand on ANNULE la migration
        migrationBuilder.DropTable(name: "Vehicles");
    }
}
```

### 5.3 Appliquer les Migrations

```bash
# Appliquer toutes les migrations en attente
dotnet ef database update --project ../FleetTrack.Infrastructure

# Appliquer jusqu'à une migration spécifique
dotnet ef database update AddVehicleTable --project ../FleetTrack.Infrastructure

# Annuler la dernière migration
dotnet ef database update LastMigrationName --project ../FleetTrack.Infrastructure

# Générer le script SQL (pour production)
dotnet ef migrations script --idempotent --output migration.sql
```

### 5.4 Application automatique au démarrage

```csharp
// Program.cs - Pour développement uniquement
var app = builder.Build();

// Appliquer les migrations au démarrage
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FleetTrackDbContext>();

    if (app.Environment.IsDevelopment())
    {
        // Crée/met à jour la BDD automatiquement
        await context.Database.MigrateAsync();
    }
}
```

---

## 6. Requêtes et LINQ to Entities

### 6.1 CRUD Operations

```csharp
public class VehicleService
{
    private readonly FleetTrackDbContext _context;

    // CREATE
    public async Task<Vehicle> CreateAsync(CreateVehicleDto dto)
    {
        var vehicle = new Vehicle
        {
            PlateNumber = dto.PlateNumber,
            Brand = dto.Brand,
            Model = dto.Model,
            Type = dto.Type
        };

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        return vehicle;
    }

    // READ - Single
    public async Task<Vehicle?> GetByIdAsync(Guid id)
    {
        return await _context.Vehicles.FindAsync(id);
    }

    // READ - With related data
    public async Task<Vehicle?> GetByIdWithMissionsAsync(Guid id)
    {
        return await _context.Vehicles
            .Include(v => v.Missions)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    // READ - List with filtering
    public async Task<List<Vehicle>> GetAllAsync(VehicleFilter filter)
    {
        var query = _context.Vehicles.AsQueryable();

        if (!string.IsNullOrEmpty(filter.Search))
        {
            query = query.Where(v =>
                v.PlateNumber.Contains(filter.Search) ||
                v.Brand.Contains(filter.Search));
        }

        if (filter.Type.HasValue)
        {
            query = query.Where(v => v.Type == filter.Type);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(v => v.Status == filter.Status);
        }

        return await query
            .OrderBy(v => v.PlateNumber)
            .ToListAsync();
    }

    // UPDATE
    public async Task<Vehicle?> UpdateAsync(Guid id, UpdateVehicleDto dto)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null) return null;

        vehicle.Brand = dto.Brand;
        vehicle.Model = dto.Model;
        vehicle.Type = dto.Type;
        vehicle.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return vehicle;
    }

    // DELETE (soft delete)
    public async Task<bool> DeleteAsync(Guid id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null) return false;

        vehicle.IsActive = false;
        vehicle.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    // DELETE (hard delete)
    public async Task<bool> HardDeleteAsync(Guid id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null) return false;

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();
        return true;
    }
}
```

### 6.2 Include (Eager Loading)

```csharp
// Charger les données liées
var vehicle = await _context.Vehicles
    .Include(v => v.Missions)           // Charge les missions
    .ThenInclude(m => m.Driver)         // Puis le chauffeur de chaque mission
    .Include(v => v.TrackingSessions)   // Charge aussi les sessions
    .FirstOrDefaultAsync(v => v.Id == id);

// Filtrer les données incluses (EF Core 5+)
var vehicle = await _context.Vehicles
    .Include(v => v.Missions.Where(m => m.Status == MissionStatus.Active))
    .FirstOrDefaultAsync(v => v.Id == id);
```

### 6.3 Projection avec Select

```csharp
// Ne récupérer que les champs nécessaires (optimisation)
var vehicleSummaries = await _context.Vehicles
    .Where(v => v.IsActive)
    .Select(v => new VehicleSummaryDto
    {
        Id = v.Id,
        PlateNumber = v.PlateNumber,
        DisplayName = $"{v.Brand} {v.Model}",
        ActiveMissionsCount = v.Missions.Count(m => m.Status == MissionStatus.InProgress)
    })
    .ToListAsync();

// Génère une requête SQL optimisée - ne charge pas tout l'objet Vehicle
```

### 6.4 Pagination

```csharp
public async Task<PagedResult<VehicleDto>> GetPagedAsync(int page, int pageSize)
{
    var query = _context.Vehicles.Where(v => v.IsActive);

    // Compte total (pour afficher "Page 1 sur 5")
    var totalCount = await query.CountAsync();

    // Récupère la page demandée
    var items = await query
        .OrderBy(v => v.PlateNumber)
        .Skip((page - 1) * pageSize)  // Saute les pages précédentes
        .Take(pageSize)                // Prend N éléments
        .Select(v => MapToDto(v))
        .ToListAsync();

    return new PagedResult<VehicleDto>
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize,
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
    };
}
```

### 6.5 AsNoTracking (Optimisation lecture seule)

```csharp
// Par défaut, EF Core "suit" les entités pour détecter les changements
var vehicle = await _context.Vehicles.FindAsync(id);
vehicle.Brand = "Modified";
await _context.SaveChangesAsync();  // Détecte et sauvegarde le changement

// AsNoTracking = lecture seule, plus performant
var vehicles = await _context.Vehicles
    .AsNoTracking()  // Pas de tracking
    .Where(v => v.IsActive)
    .ToListAsync();

// Utile pour les requêtes de lecture pure (API GET)
```

---

## 7. Transactions

### Définition
Une **transaction** garantit que plusieurs opérations sont exécutées comme une unité : soit toutes réussissent, soit aucune n'est appliquée.

#### Analogie
C'est comme un **virement bancaire** : l'argent est débité ET crédité, ou rien ne se passe. Pas de "à moitié".

### 7.1 Transaction implicite (SaveChanges)

```csharp
// SaveChanges crée automatiquement une transaction
public async Task CreateVehicleWithMissionAsync(CreateVehicleDto vehicleDto, CreateMissionDto missionDto)
{
    var vehicle = new Vehicle { /* ... */ };
    var mission = new Mission { Vehicle = vehicle, /* ... */ };

    _context.Vehicles.Add(vehicle);
    _context.Missions.Add(mission);

    // Une seule transaction : si l'un échoue, les deux sont annulés
    await _context.SaveChangesAsync();
}
```

### 7.2 Transaction explicite

```csharp
public async Task TransferMissionAsync(Guid missionId, Guid newVehicleId)
{
    // Début de la transaction
    using var transaction = await _context.Database.BeginTransactionAsync();

    try
    {
        // Opération 1: Libérer l'ancien véhicule
        var mission = await _context.Missions
            .Include(m => m.Vehicle)
            .FirstOrDefaultAsync(m => m.Id == missionId);

        if (mission?.Vehicle != null)
        {
            mission.Vehicle.Status = VehicleStatus.Available;
        }

        // Opération 2: Assigner le nouveau véhicule
        var newVehicle = await _context.Vehicles.FindAsync(newVehicleId);
        if (newVehicle == null)
            throw new InvalidOperationException("Véhicule non trouvé");

        if (newVehicle.Status != VehicleStatus.Available)
            throw new InvalidOperationException("Véhicule non disponible");

        mission!.VehicleId = newVehicleId;
        newVehicle.Status = VehicleStatus.InUse;

        // Sauvegarder
        await _context.SaveChangesAsync();

        // Valider la transaction
        await transaction.CommitAsync();
    }
    catch
    {
        // Annuler tout en cas d'erreur
        await transaction.RollbackAsync();
        throw;
    }
}
```

### 7.3 Niveaux d'Isolation

```csharp
// Niveau d'isolation pour éviter les problèmes de concurrence
using var transaction = await _context.Database
    .BeginTransactionAsync(IsolationLevel.Serializable);

// Niveaux disponibles:
// - ReadUncommitted: Le plus rapide, peut lire des données non validées
// - ReadCommitted: (Par défaut) Ne lit que les données validées
// - RepeatableRead: Garantit des lectures cohérentes
// - Serializable: Le plus strict, exécution séquentielle
```

---

## Résumé

| Concept | Description |
|---------|-------------|
| **Base Relationnelle** | Tables liées par des clés |
| **ORM** | Mapping objets ↔ tables |
| **Entity Framework** | ORM .NET officiel |
| **DbContext** | Pont entre code et BDD |
| **Entité** | Classe = Table |
| **Migration** | Versionnage du schéma |
| **Include** | Chargement des relations |
| **AsNoTracking** | Optimisation lecture |
| **Transaction** | Opérations atomiques |

---

[← Précédent : C# .NET](./02-csharp-dotnet.md) | [Suivant : API REST →](./04-api-rest.md)
