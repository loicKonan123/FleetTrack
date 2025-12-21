# FleetTrack.Infrastructure - Documentation Détaillée

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Structure du Projet](#structure-du-projet)
4. [DbContext Entity Framework](#dbcontext-entity-framework)
5. [Configurations des Entités](#configurations-des-entités)
6. [Pattern Repository](#pattern-repository)
7. [Injection de Dépendances](#injection-de-dépendances)
8. [Migrations de Base de Données](#migrations-de-base-de-données)
9. [Exemples d'Utilisation](#exemples-dutilisation)

---

## 📌 Vue d'ensemble

Le projet **FleetTrack.Infrastructure** représente la **couche d'infrastructure** de l'application FleetTrack selon les principes de **Clean Architecture**. Cette couche est responsable de :

- 🗄️ **Persistance des données** avec Entity Framework Core
- 🔗 **Accès aux données** via le pattern Repository
- ⚙️ **Configuration** de la base de données SQL Server
- 🔄 **Gestion des migrations** de schéma

### Responsabilités Clés
- Implémentation du DbContext Entity Framework
- Configuration des relations entre entités (FluentAPI)
- Implémentation du pattern Repository pour l'abstraction des données
- Gestion du Soft Delete automatique
- Mise à jour automatique de UpdatedAt lors des modifications

---

## 🏗️ Architecture

### Clean Architecture - Couche Infrastructure

```
┌─────────────────────────────────────────┐
│         FleetTrack.API                  │
│         (Presentation Layer)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      FleetTrack.Application             │
│      (Business Logic Layer)             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   FleetTrack.Infrastructure   ◄────────┤
│   (Data Access Layer)                   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    FleetTrackDbContext            │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │    Configurations (FluentAPI)     │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │    Repositories                   │ │
│  └───────────────────────────────────┘ │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      FleetTrack.Domain                  │
│      (Core Domain Layer)                │
└─────────────────────────────────────────┘
                  │
                  ▼
         ┌───────────────┐
         │  SQL Server   │
         │   Database    │
         └───────────────┘
```

### Dépendances
- ✅ **FleetTrack.Domain** : Pour les entités et enums
- ✅ **FleetTrack.Application** : Pour les interfaces de services (optionnel)
- ✅ **Entity Framework Core** : ORM pour la persistance
- ✅ **SQL Server** : Base de données

---

## 📁 Structure du Projet

```
FleetTrack.Infrastructure/
├── Data/
│   ├── FleetTrackDbContext.cs          # Contexte EF Core principal
│   └── Configurations/                  # Configurations FluentAPI
│       ├── VehicleConfiguration.cs
│       ├── DriverConfiguration.cs
│       ├── MissionConfiguration.cs
│       ├── WaypointConfiguration.cs
│       ├── GpsPositionConfiguration.cs
│       ├── AlertConfiguration.cs
│       ├── MaintenanceConfiguration.cs
│       └── ZoneConfiguration.cs
├── Repositories/                        # Pattern Repository
│   ├── IRepository.cs                   # Interface générique
│   ├── Repository.cs                    # Implémentation générique
│   ├── IVehicleRepository.cs           # Interface spécifique Vehicle
│   ├── VehicleRepository.cs            # Implémentation Vehicle
│   ├── IDriverRepository.cs            # Interface spécifique Driver
│   ├── DriverRepository.cs             # Implémentation Driver
│   ├── IMissionRepository.cs           # Interface spécifique Mission
│   └── MissionRepository.cs            # Implémentation Mission
├── DependencyInjection.cs               # Configuration DI
├── FleetTrack.Infrastructure.csproj     # Fichier projet
└── README.md                            # Cette documentation
```

---

## 🗄️ DbContext Entity Framework

### FleetTrackDbContext.cs

**Fichier** : `Data/FleetTrackDbContext.cs`

```csharp
public class FleetTrackDbContext : DbContext
{
    public FleetTrackDbContext(DbContextOptions<FleetTrackDbContext> options)
        : base(options)
    {
    }

    // DbSets pour chaque entité
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Mission> Missions => Set<Mission>();
    public DbSet<Waypoint> Waypoints => Set<Waypoint>();
    public DbSet<GpsPosition> GpsPositions => Set<GpsPosition>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<Maintenance> MaintenanceRecords => Set<Maintenance>();
    public DbSet<Zone> Zones => Set<Zone>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Application automatique de toutes les configurations
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Filtre global pour le Soft Delete
        modelBuilder.Entity<Vehicle>().HasQueryFilter(v => !v.IsDeleted);
        modelBuilder.Entity<Driver>().HasQueryFilter(d => !d.IsDeleted);
        // ... autres filtres
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Mise à jour automatique de UpdatedAt
        var entries = ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
```

#### 📖 Explication Détaillée

**DbSets - Tables de la Base de Données**
- `DbSet<Vehicle>` → Table "Vehicles"
- `DbSet<Driver>` → Table "Drivers"
- Chaque DbSet représente une table dans SQL Server

**OnModelCreating - Configuration du Modèle**

1. **ApplyConfigurationsFromAssembly** :
   ```csharp
   modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
   ```
   - Découvre et applique automatiquement toutes les classes `IEntityTypeConfiguration<T>`
   - Évite d'appeler manuellement chaque configuration
   - Convention over Configuration

2. **HasQueryFilter - Soft Delete Global** :
   ```csharp
   modelBuilder.Entity<Vehicle>().HasQueryFilter(v => !v.IsDeleted);
   ```
   - Filtre automatique sur toutes les requêtes
   - Les entités supprimées (`IsDeleted = true`) sont invisibles par défaut
   - Pas besoin d'ajouter `.Where(v => !v.IsDeleted)` partout

**SaveChangesAsync - Logique Métier**

```csharp
public override async Task<int> SaveChangesAsync(...)
{
    var entries = ChangeTracker.Entries<BaseEntity>()
        .Where(e => e.State == EntityState.Modified);

    foreach (var entry in entries)
    {
        entry.Entity.UpdatedAt = DateTime.UtcNow;
    }

    return await base.SaveChangesAsync(cancellationToken);
}
```

- **ChangeTracker** : Suit les modifications des entités
- **EntityState.Modified** : Entités qui ont été modifiées
- **UpdatedAt** : Mis à jour automatiquement à chaque modification
- Pas besoin de faire `vehicle.UpdatedAt = DateTime.UtcNow` manuellement!

---

## ⚙️ Configurations des Entités

Les configurations utilisent **Fluent API** d'Entity Framework pour définir le schéma de la base de données.

### Pourquoi Fluent API au lieu de Data Annotations ?

| Fluent API | Data Annotations |
|------------|------------------|
| ✅ Séparation des préoccupations | ❌ Pollue le modèle Domain |
| ✅ Plus puissant et flexible | ❌ Fonctionnalités limitées |
| ✅ Relations complexes faciles | ❌ Relations complexes difficiles |
| ✅ Configuration centralisée | ❌ Configuration dispersée |

### VehicleConfiguration.cs

**Fichier** : `Data/Configurations/VehicleConfiguration.cs`

```csharp
public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        // Table
        builder.ToTable("Vehicles");

        // Primary Key
        builder.HasKey(v => v.Id);

        // Properties
        builder.Property(v => v.RegistrationNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(v => v.Brand)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.FuelCapacity)
            .HasColumnType("decimal(18,2)");

        // Indexes
        builder.HasIndex(v => v.RegistrationNumber)
            .IsUnique();

        builder.HasIndex(v => v.Status);

        // Relationships
        builder.HasOne(v => v.CurrentDriver)
            .WithOne(d => d.CurrentVehicle)
            .HasForeignKey<Vehicle>(v => v.CurrentDriverId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(v => v.Missions)
            .WithOne(m => m.Vehicle)
            .HasForeignKey(m => m.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

#### 📖 Explication Ligne par Ligne

**1. Table et Clé Primaire**
```csharp
builder.ToTable("Vehicles");
builder.HasKey(v => v.Id);
```
- Nom de la table SQL : "Vehicles"
- Clé primaire : colonne "Id" (GUID)

**2. Propriétés avec Contraintes**
```csharp
builder.Property(v => v.RegistrationNumber)
    .IsRequired()           // NOT NULL en SQL
    .HasMaxLength(20);      // VARCHAR(20)
```
- `IsRequired()` : Champ obligatoire (NOT NULL)
- `HasMaxLength(20)` : Limite de caractères

```csharp
builder.Property(v => v.FuelCapacity)
    .HasColumnType("decimal(18,2)");
```
- `decimal(18,2)` : 18 chiffres total, 2 après la virgule
- Exemple : 12345.67 ✅, 12345.678 ❌

**3. Index pour Performance**
```csharp
builder.HasIndex(v => v.RegistrationNumber)
    .IsUnique();
```
- Index sur RegistrationNumber
- Unique : Pas de doublons (ex: deux véhicules avec même plaque)
- Recherche ultra-rapide : `WHERE RegistrationNumber = 'AB-123-CD'`

```csharp
builder.HasIndex(v => v.Status);
```
- Index sur Status (non unique)
- Optimise : `WHERE Status = VehicleStatus.Available`

**4. Relations (Foreign Keys)**

**Relation One-to-One** : Vehicle ↔ Driver
```csharp
builder.HasOne(v => v.CurrentDriver)
    .WithOne(d => d.CurrentVehicle)
    .HasForeignKey<Vehicle>(v => v.CurrentDriverId)
    .OnDelete(DeleteBehavior.SetNull);
```
- Un véhicule a UN conducteur (ou null)
- Un conducteur a UN véhicule (ou null)
- Clé étrangère : `CurrentDriverId` dans table Vehicles
- Si le Driver est supprimé → `CurrentDriverId = NULL` (pas de cascade)

**Relation One-to-Many** : Vehicle → Missions
```csharp
builder.HasMany(v => v.Missions)
    .WithOne(m => m.Vehicle)
    .HasForeignKey(m => m.VehicleId)
    .OnDelete(DeleteBehavior.Restrict);
```
- Un véhicule a PLUSIEURS missions
- Une mission appartient à UN véhicule
- Clé étrangère : `VehicleId` dans table Missions
- `Restrict` : Impossible de supprimer un véhicule avec des missions actives

**DeleteBehavior Expliqué**
- `Cascade` : Supprime les enfants (ex: supprimer véhicule → supprime ses positions GPS)
- `SetNull` : Met la FK à NULL (ex: supprimer driver → véhicule sans conducteur)
- `Restrict` : Empêche la suppression (ex: véhicule avec missions actives)

---

### DriverConfiguration.cs

**Fichier** : `Data/Configurations/DriverConfiguration.cs`

**Points Importants** :
```csharp
builder.HasIndex(d => d.Email)
    .IsUnique();

builder.HasIndex(d => d.LicenseNumber)
    .IsUnique();
```
- Email unique : Pas deux conducteurs avec même email
- Numéro de permis unique : Un permis = un conducteur

---

### MissionConfiguration.cs

**Fichier** : `Data/Configurations/MissionConfiguration.cs`

**Index Composés** :
```csharp
builder.HasIndex(m => new { m.VehicleId, m.Status });
builder.HasIndex(m => new { m.DriverId, m.Status });
```
- Index composite (multi-colonnes)
- Optimise : `WHERE VehicleId = X AND Status = InProgress`
- Très utile pour les requêtes fréquentes

**Relation Cascade** :
```csharp
builder.HasMany(m => m.Waypoints)
    .WithOne(w => w.Mission)
    .HasForeignKey(w => w.MissionId)
    .OnDelete(DeleteBehavior.Cascade);
```
- Supprimer une mission → supprime automatiquement ses waypoints
- Logique : Waypoints n'ont pas de sens sans mission

---

### WaypointConfiguration.cs

**Précision GPS** :
```csharp
builder.Property(w => w.Latitude)
    .HasColumnType("decimal(10,8)");

builder.Property(w => w.Longitude)
    .HasColumnType("decimal(11,8)");
```
- `decimal(10,8)` : Latitude (-90 à 90, 8 décimales)
  - Exemple : 48.85661400 (Paris)
  - Précision : ~1mm
- `decimal(11,8)` : Longitude (-180 à 180, 8 décimales)
  - Exemple : 2.35222190 (Paris)

---

### GpsPositionConfiguration.cs

**Index Temporel** :
```csharp
builder.HasIndex(g => new { g.VehicleId, g.Timestamp });
builder.HasIndex(g => g.Timestamp);
```
- Optimise la récupération de l'historique GPS
- Requête : "Toutes les positions du véhicule X hier"
- Performance critique (beaucoup de données GPS)

---

### AlertConfiguration.cs

**Index Multi-Statuts** :
```csharp
builder.HasIndex(a => a.Type);
builder.HasIndex(a => a.Severity);
builder.HasIndex(a => a.IsAcknowledged);
builder.HasIndex(a => a.IsResolved);
```
- Permet de filtrer rapidement les alertes
- Exemples :
  - Toutes les alertes critiques non résolues
  - Toutes les alertes de type Speeding
  - Alertes non acquittées

---

### MaintenanceConfiguration.cs

**Type Décimal pour Coût** :
```csharp
builder.Property(m => m.Cost)
    .IsRequired()
    .HasColumnType("decimal(18,2)");
```
- Toujours `decimal` pour l'argent (jamais `float` ou `double`)
- Évite les erreurs d'arrondi
- Exemple : 150.99 € stocké exactement

---

### ZoneConfiguration.cs

**JSON pour Polygones** :
```csharp
builder.Property(z => z.Coordinates)
    .HasColumnType("nvarchar(max)"); // JSON
```
- `nvarchar(max)` : Texte illimité en SQL Server
- Stocke JSON : `[{lat:48.8,lng:2.3},{lat:48.9,lng:2.4}]`
- Permet zones complexes (polygones)

---

## 📦 Pattern Repository

### Qu'est-ce que le Pattern Repository ?

Le **Repository Pattern** est un motif de conception qui :
- 🔒 **Abstrait** l'accès aux données
- 🧪 **Facilite** les tests unitaires (mock facile)
- 🎯 **Centralise** la logique d'accès aux données
- 🔄 **Découple** la logique métier de la persistance

### Architecture Repository

```
┌──────────────────┐
│   Controller     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Service       │ (Business Logic)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  IVehicleRepo    │ (Interface)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  VehicleRepo     │ (Implementation)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    DbContext     │ (EF Core)
└────────┬─────────┘
         │
         ▼
    SQL Server
```

---

### IRepository<T> - Interface Générique

**Fichier** : `Repositories/IRepository.cs`

```csharp
public interface IRepository<T> where T : BaseEntity
{
    // Lecture
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, ...);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, ...);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, ...);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, ...);

    // Écriture
    Task<T> AddAsync(T entity, ...);
    Task AddRangeAsync(IEnumerable<T> entities, ...);
    Task UpdateAsync(T entity, ...);
    Task DeleteAsync(T entity, ...);         // Soft delete
    Task DeleteRangeAsync(IEnumerable<T> entities, ...);
    Task HardDeleteAsync(T entity, ...);     // Hard delete

    // Utilitaires
    Task<IEnumerable<T>> GetPagedAsync(int pageNumber, int pageSize, ...);
    IQueryable<T> Query();
}
```

#### 📖 Explication des Méthodes

**Méthodes de Lecture**

1. **GetByIdAsync** : Récupérer par ID
   ```csharp
   var vehicle = await repo.GetByIdAsync(vehicleId);
   ```

2. **GetAllAsync** : Récupérer tous
   ```csharp
   var allVehicles = await repo.GetAllAsync();
   ```

3. **FindAsync** : Recherche avec critères (Expression Lambda)
   ```csharp
   var availableVehicles = await repo.FindAsync(v => v.Status == VehicleStatus.Available);
   ```

4. **FirstOrDefaultAsync** : Premier élément ou null
   ```csharp
   var vehicle = await repo.FirstOrDefaultAsync(v => v.RegistrationNumber == "AB-123-CD");
   ```

5. **AnyAsync** : Existe-t-il ?
   ```csharp
   bool exists = await repo.AnyAsync(v => v.RegistrationNumber == "AB-123-CD");
   ```

6. **CountAsync** : Compter
   ```csharp
   int total = await repo.CountAsync();
   int available = await repo.CountAsync(v => v.Status == VehicleStatus.Available);
   ```

**Méthodes d'Écriture**

1. **AddAsync** : Ajouter une entité
   ```csharp
   var newVehicle = new Vehicle { ... };
   await repo.AddAsync(newVehicle);
   ```

2. **AddRangeAsync** : Ajouter plusieurs entités
   ```csharp
   var vehicles = new List<Vehicle> { vehicle1, vehicle2 };
   await repo.AddRangeAsync(vehicles);
   ```

3. **UpdateAsync** : Mettre à jour
   ```csharp
   vehicle.Status = VehicleStatus.InMaintenance;
   await repo.UpdateAsync(vehicle);
   ```

4. **DeleteAsync** : Soft Delete
   ```csharp
   await repo.DeleteAsync(vehicle);
   // vehicle.IsDeleted = true automatiquement
   ```

5. **HardDeleteAsync** : Suppression physique
   ```csharp
   await repo.HardDeleteAsync(vehicle);
   // Supprimé de la base de données
   ```

**Méthodes Utilitaires**

1. **GetPagedAsync** : Pagination
   ```csharp
   var page1 = await repo.GetPagedAsync(pageNumber: 1, pageSize: 20);
   ```

2. **Query** : Requêtes complexes avec LINQ
   ```csharp
   var result = await repo.Query()
       .Include(v => v.CurrentDriver)
       .Where(v => v.Status == VehicleStatus.Available)
       .OrderBy(v => v.RegistrationNumber)
       .ToListAsync();
   ```

---

### Repository<T> - Implémentation Générique

**Fichier** : `Repositories/Repository.cs`

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

    public virtual async Task<T?> GetByIdAsync(Guid id, ...)
    {
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public virtual async Task<T> AddAsync(T entity, ...)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public virtual async Task DeleteAsync(T entity, ...)
    {
        // Soft delete
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await UpdateAsync(entity, cancellationToken);
    }

    // ... autres méthodes
}
```

#### 📖 Points Clés

**Méthodes Virtual**
```csharp
public virtual async Task<T?> GetByIdAsync(...)
```
- `virtual` permet de surcharger dans les repositories spécifiques
- Héritage et personnalisation

**Soft Delete Automatique**
```csharp
public virtual async Task DeleteAsync(T entity, ...)
{
    entity.IsDeleted = true;
    entity.UpdatedAt = DateTime.UtcNow;
    await UpdateAsync(entity, cancellationToken);
}
```
- Marque `IsDeleted = true`
- Met à jour `UpdatedAt`
- Pas de suppression physique

---

### Repositories Spécifiques

#### IVehicleRepository

**Fichier** : `Repositories/IVehicleRepository.cs`

```csharp
public interface IVehicleRepository : IRepository<Vehicle>
{
    Task<IEnumerable<Vehicle>> GetAvailableVehiclesAsync(...);
    Task<IEnumerable<Vehicle>> GetVehiclesByStatusAsync(VehicleStatus status, ...);
    Task<IEnumerable<Vehicle>> GetVehiclesByTypeAsync(VehicleType type, ...);
    Task<Vehicle?> GetByRegistrationNumberAsync(string registrationNumber, ...);
    Task<IEnumerable<Vehicle>> GetVehiclesNeedingMaintenanceAsync(...);
    Task<IEnumerable<Vehicle>> GetVehiclesWithLowFuelAsync(double threshold, ...);
    Task<Vehicle?> GetVehicleWithDetailsAsync(Guid id, ...);
}
```

**Méthodes Métier Spécifiques** :

1. **GetAvailableVehiclesAsync** : Véhicules disponibles
2. **GetVehiclesNeedingMaintenanceAsync** : Maintenance dans 7 jours
3. **GetVehiclesWithLowFuelAsync** : Carburant bas
4. **GetVehicleWithDetailsAsync** : Avec Include (Driver, Missions, Alerts)

#### VehicleRepository

**Fichier** : `Repositories/VehicleRepository.cs`

**Exemple de Méthode Métier** :
```csharp
public async Task<IEnumerable<Vehicle>> GetVehiclesNeedingMaintenanceAsync(...)
{
    var today = DateTime.UtcNow.Date;

    return await _dbSet
        .Where(v => v.NextMaintenanceDate.HasValue
                 && v.NextMaintenanceDate.Value <= today.AddDays(7))
        .OrderBy(v => v.NextMaintenanceDate)
        .ToListAsync(cancellationToken);
}
```

**Avec Include (Eager Loading)** :
```csharp
public async Task<Vehicle?> GetVehicleWithDetailsAsync(Guid id, ...)
{
    return await _dbSet
        .Include(v => v.CurrentDriver)
        .Include(v => v.Missions.Where(m => m.Status == MissionStatus.InProgress))
        .Include(v => v.Alerts.Where(a => !a.IsResolved))
        .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
}
```

**Avantages** :
- ✅ Une seule requête SQL (JOIN)
- ✅ Pas de problème N+1
- ✅ Charge les données liées en une fois

---

#### IDriverRepository

**Méthodes Métier** :
- `GetDriversWithExpiredLicensesAsync()` : Permis expirés
- `GetDriversWithExpiringSoonLicensesAsync(int days)` : Expire bientôt

**Exemple** :
```csharp
public async Task<IEnumerable<Driver>> GetDriversWithExpiringSoonLicensesAsync(
    int daysThreshold, ...)
{
    var today = DateTime.UtcNow.Date;
    var threshold = today.AddDays(daysThreshold);

    return await _dbSet
        .Where(d => d.LicenseExpiryDate >= today
                 && d.LicenseExpiryDate <= threshold)
        .OrderBy(d => d.LicenseExpiryDate)
        .ToListAsync(cancellationToken);
}
```

---

#### IMissionRepository

**Méthodes Métier** :
- `GetActiveMissionsAsync()` : Missions en cours (InProgress + Assigned)
- `GetOverdueMissionsAsync()` : Missions en retard
- `GetMissionsForDateRangeAsync(start, end)` : Par période

**Exemple avec Includes** :
```csharp
public async Task<IEnumerable<Mission>> GetActiveMissionsAsync(...)
{
    return await _dbSet
        .Where(m => m.Status == MissionStatus.InProgress
                 || m.Status == MissionStatus.Assigned)
        .Include(m => m.Vehicle)
        .Include(m => m.Driver)
        .Include(m => m.Waypoints)
        .OrderByDescending(m => m.Priority)
        .ThenBy(m => m.StartDate)
        .ToListAsync(cancellationToken);
}
```

---

## 🔧 Injection de Dépendances

### DependencyInjection.cs

**Fichier** : `DependencyInjection.cs`

```csharp
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // 1. Récupérer la chaîne de connexion
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found.");

        // 2. Configurer le DbContext
        services.AddDbContext<FleetTrackDbContext>(options =>
        {
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                // Retry automatique en cas d'erreur temporaire
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null);

                // Timeout des commandes SQL
                sqlOptions.CommandTimeout(60);
            });

#if DEBUG
            // Logs détaillés en développement
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
#endif
        });

        // 3. Enregistrer les repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<IDriverRepository, DriverRepository>();
        services.AddScoped<IMissionRepository, MissionRepository>();

        return services;
    }
}
```

#### 📖 Explication Détaillée

**1. Extension Method Pattern**
```csharp
public static IServiceCollection AddInfrastructure(
    this IServiceCollection services, ...)
```
- Méthode d'extension sur `IServiceCollection`
- Permet d'appeler : `services.AddInfrastructure(configuration)`
- Convention .NET Core

**2. Récupération Connection String**
```csharp
var connectionString = configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(...);
```
- Lit depuis `appsettings.json`
- Lance exception si manquante (fail fast)

**3. Configuration SQL Server**
```csharp
options.UseSqlServer(connectionString, sqlOptions =>
{
    sqlOptions.EnableRetryOnFailure(
        maxRetryCount: 5,
        maxRetryDelay: TimeSpan.FromSeconds(30),
        errorNumbersToAdd: null);
});
```
- **EnableRetryOnFailure** : Réessaie en cas d'erreur réseau temporaire
- 5 tentatives max, délai max 30 secondes
- Résilience réseau

**4. Logs de Développement**
```csharp
#if DEBUG
    options.EnableSensitiveDataLogging();
    options.EnableDetailedErrors();
#endif
```
- `#if DEBUG` : Uniquement en mode Debug
- `EnableSensitiveDataLogging()` : Affiche les valeurs dans les logs
- `EnableDetailedErrors()` : Messages d'erreur complets

**5. Enregistrement des Repositories**
```csharp
services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
services.AddScoped<IVehicleRepository, VehicleRepository>();
```
- `AddScoped` : Une instance par requête HTTP
- Type générique : `IRepository<T>` → `Repository<T>`
- Types spécifiques : `IVehicleRepository` → `VehicleRepository`

---

### Utilisation dans Program.cs

**Fichier** : `FleetTrack.API/Program.cs`

```csharp
var builder = WebApplication.CreateBuilder(args);

// Enregistrer Infrastructure
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();
```

**appsettings.json** :
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=FleetTrackDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

---

## 🗃️ Migrations de Base de Données

### Commandes Entity Framework Core

**1. Créer une Migration**
```bash
dotnet ef migrations add InitialCreate --project FleetTrack.Infrastructure --startup-project FleetTrack.API
```

**2. Appliquer les Migrations**
```bash
dotnet ef database update --project FleetTrack.Infrastructure --startup-project FleetTrack.API
```

**3. Supprimer la Dernière Migration**
```bash
dotnet ef migrations remove --project FleetTrack.Infrastructure --startup-project FleetTrack.API
```

**4. Générer un Script SQL**
```bash
dotnet ef migrations script --project FleetTrack.Infrastructure --startup-project FleetTrack.API --output migration.sql
```

**5. Lister les Migrations**
```bash
dotnet ef migrations list --project FleetTrack.Infrastructure --startup-project FleetTrack.API
```

### Workflow Typique

```bash
# 1. Modifier une entité ou configuration
# 2. Créer migration
dotnet ef migrations add AddAlertSeverityIndex

# 3. Vérifier le fichier de migration généré
# 4. Appliquer à la base de données
dotnet ef database update

# 5. Si erreur, rollback
dotnet ef database update PreviousMigrationName
```

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Injection et Utilisation d'un Repository

**Controller** :
```csharp
public class VehiclesController : ControllerBase
{
    private readonly IVehicleRepository _vehicleRepository;

    public VehiclesController(IVehicleRepository vehicleRepository)
    {
        _vehicleRepository = vehicleRepository;
    }

    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<Vehicle>>> GetAvailableVehicles()
    {
        var vehicles = await _vehicleRepository.GetAvailableVehiclesAsync();
        return Ok(vehicles);
    }
}
```

---

### Exemple 2 : CRUD Complet

```csharp
// CREATE
var newVehicle = new Vehicle
{
    RegistrationNumber = "AB-123-CD",
    Brand = "Renault",
    Model = "Master",
    Type = VehicleType.Van,
    Status = VehicleStatus.Available
};
var created = await _vehicleRepository.AddAsync(newVehicle);

// READ
var vehicle = await _vehicleRepository.GetByIdAsync(created.Id);
var allVehicles = await _vehicleRepository.GetAllAsync();
var available = await _vehicleRepository.GetAvailableVehiclesAsync();

// UPDATE
vehicle.Status = VehicleStatus.InMaintenance;
await _vehicleRepository.UpdateAsync(vehicle);

// DELETE (Soft)
await _vehicleRepository.DeleteAsync(vehicle);

// DELETE (Hard)
await _vehicleRepository.HardDeleteAsync(vehicle);
```

---

### Exemple 3 : Requêtes Complexes avec Query()

```csharp
var result = await _vehicleRepository.Query()
    .Include(v => v.CurrentDriver)
    .Include(v => v.Alerts.Where(a => !a.IsResolved))
    .Where(v => v.Type == VehicleType.Truck)
    .Where(v => v.Status == VehicleStatus.Available)
    .OrderBy(v => v.Mileage)
    .Take(10)
    .ToListAsync();
```

---

### Exemple 4 : Transaction Manuelle

```csharp
using var transaction = await _context.Database.BeginTransactionAsync();
try
{
    // Créer mission
    var mission = new Mission { ... };
    await _missionRepository.AddAsync(mission);

    // Assigner véhicule
    var vehicle = await _vehicleRepository.GetByIdAsync(vehicleId);
    vehicle.Status = VehicleStatus.InUse;
    await _vehicleRepository.UpdateAsync(vehicle);

    // Assigner conducteur
    var driver = await _driverRepository.GetByIdAsync(driverId);
    driver.Status = DriverStatus.OnDuty;
    await _driverRepository.UpdateAsync(driver);

    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

---

### Exemple 5 : Pagination

```csharp
public async Task<PagedResult<Vehicle>> GetVehiclesPaged(int page, int pageSize)
{
    var vehicles = await _vehicleRepository.GetPagedAsync(page, pageSize);
    var total = await _vehicleRepository.CountAsync();

    return new PagedResult<Vehicle>
    {
        Items = vehicles,
        TotalCount = total,
        PageNumber = page,
        PageSize = pageSize
    };
}
```

---

## 🎯 Bonnes Pratiques

### ✅ À Faire

1. **Toujours utiliser async/await**
   ```csharp
   var vehicle = await _vehicleRepository.GetByIdAsync(id);
   ```

2. **Utiliser CancellationToken**
   ```csharp
   public async Task<Vehicle> GetVehicle(Guid id, CancellationToken ct)
   {
       return await _vehicleRepository.GetByIdAsync(id, ct);
   }
   ```

3. **Préférer Include pour les données liées**
   ```csharp
   var vehicle = await _context.Vehicles
       .Include(v => v.CurrentDriver)
       .FirstOrDefaultAsync(v => v.Id == id);
   ```

4. **Utiliser Soft Delete par défaut**
   ```csharp
   await _vehicleRepository.DeleteAsync(vehicle); // IsDeleted = true
   ```

5. **Indexes sur colonnes fréquemment filtrées**
   ```csharp
   builder.HasIndex(v => v.Status);
   ```

### ❌ À Éviter

1. **N+1 Query Problem**
   ```csharp
   // ❌ Mauvais : N+1 requêtes
   var vehicles = await _vehicleRepository.GetAllAsync();
   foreach (var v in vehicles)
   {
       var driver = await _driverRepository.GetByIdAsync(v.CurrentDriverId);
   }

   // ✅ Bon : 1 requête avec Include
   var vehicles = await _vehicleRepository.Query()
       .Include(v => v.CurrentDriver)
       .ToListAsync();
   ```

2. **Charger trop de données**
   ```csharp
   // ❌ Mauvais
   var allVehicles = await _vehicleRepository.GetAllAsync(); // 10 000 véhicules!

   // ✅ Bon
   var pagedVehicles = await _vehicleRepository.GetPagedAsync(1, 20);
   ```

3. **Oublier le SaveChanges**
   ```csharp
   // ❌ Repository le fait automatiquement, mais en DbContext direct :
   _context.Vehicles.Add(vehicle);
   // Oublié : await _context.SaveChangesAsync();

   // ✅ Bon
   await _vehicleRepository.AddAsync(vehicle); // SaveChanges inclus
   ```

---

## 📊 Schéma de Base de Données Généré

### Tables Principales

```sql
CREATE TABLE Vehicles (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    RegistrationNumber NVARCHAR(20) NOT NULL UNIQUE,
    Brand NVARCHAR(100) NOT NULL,
    Model NVARCHAR(100) NOT NULL,
    Year INT NOT NULL,
    Type INT NOT NULL,
    Status INT NOT NULL,
    FuelType INT NOT NULL,
    FuelCapacity DECIMAL(18,2) NOT NULL,
    CurrentFuelLevel DECIMAL(18,2) NOT NULL,
    Mileage INT NOT NULL,
    CurrentDriverId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL,
    FOREIGN KEY (CurrentDriverId) REFERENCES Drivers(Id) ON DELETE SET NULL
);

CREATE INDEX IX_Vehicles_Status ON Vehicles(Status);
CREATE INDEX IX_Vehicles_RegistrationNumber ON Vehicles(RegistrationNumber);
```

---

## 📚 Ressources

- [Entity Framework Core Documentation](https://docs.microsoft.com/ef/core/)
- [Repository Pattern](https://docs.microsoft.com/aspnet/mvc/overview/older-versions/getting-started-with-ef-5-using-mvc-4/implementing-the-repository-and-unit-of-work-patterns)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Date de création** : 2025-12-18
**Version** : 1.0
**Auteur** : FleetTrack Development Team
