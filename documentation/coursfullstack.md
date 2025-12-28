# Cours Complet Full-Stack : De Zéro à Expert

> Basé sur le projet FleetTrack - Système de gestion de flotte véhiculaire
>
> **Technologies** : C# .NET 8 | Next.js 14 | TypeScript | SQLite/PostgreSQL | SignalR | JWT

---

## Table des Matières

1. [Introduction au Développement Full-Stack](#chapitre-1--introduction-au-développement-full-stack)
2. [Architecture Clean Architecture](#chapitre-2--architecture-clean-architecture)
3. [Backend .NET - Les Fondamentaux](#chapitre-3--backend-net---les-fondamentaux)
4. [Entity Framework Core - Base de Données](#chapitre-4--entity-framework-core---base-de-données)
5. [API REST - Conception et Implémentation](#chapitre-5--api-rest---conception-et-implémentation)
6. [Authentification JWT](#chapitre-6--authentification-jwt)
7. [Temps Réel avec SignalR](#chapitre-7--temps-réel-avec-signalr)
8. [Frontend Next.js - Les Fondamentaux](#chapitre-8--frontend-nextjs---les-fondamentaux)
9. [React Avancé - Hooks et State Management](#chapitre-9--react-avancé---hooks-et-state-management)
10. [Intégration Frontend-Backend](#chapitre-10--intégration-frontend-backend)
11. [Tests et Qualité du Code](#chapitre-11--tests-et-qualité-du-code)
12. [Déploiement et DevOps](#chapitre-12--déploiement-et-devops)
13. [Projet Final - Synthèse](#chapitre-13--projet-final---synthèse)

---

# Chapitre 1 : Introduction au Développement Full-Stack

## 1.1 Qu'est-ce qu'un Développeur Full-Stack ?

Un développeur Full-Stack maîtrise à la fois :
- **Le Backend** : Logique métier, API, base de données, sécurité
- **Le Frontend** : Interface utilisateur, expérience utilisateur, design responsive
- **L'Infrastructure** : Déploiement, CI/CD, monitoring

```
┌─────────────────────────────────────────────────────────────┐
│                      FULL-STACK                             │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND          │  BACKEND           │  INFRASTRUCTURE   │
│  ─────────         │  ───────           │  ──────────────   │
│  • HTML/CSS        │  • C# / .NET       │  • Docker         │
│  • JavaScript/TS   │  • Node.js         │  • Kubernetes     │
│  • React/Next.js   │  • Python/Django   │  • CI/CD          │
│  • Vue/Angular     │  • Java/Spring     │  • Cloud (AWS,    │
│                    │  • SQL/NoSQL       │    Azure, GCP)    │
└─────────────────────────────────────────────────────────────┘
```

## 1.2 Stack Technologique du Projet FleetTrack

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Frontend** | Next.js 14, React 18, TypeScript | Interface utilisateur |
| **UI Library** | Shadcn/ui (Radix UI) | Composants réutilisables |
| **Styling** | Tailwind CSS | Styles utilitaires |
| **Backend** | .NET 8, C# 12 | API et logique métier |
| **Base de données** | SQLite (dev) / PostgreSQL (prod) | Persistance |
| **ORM** | Entity Framework Core | Mapping objet-relationnel |
| **Temps réel** | SignalR | WebSockets |
| **Auth** | JWT (JSON Web Tokens) | Authentification |

## 1.3 Prérequis

### Outils à installer

```bash
# .NET SDK 8.0
winget install Microsoft.DotNet.SDK.8

# Node.js 20 LTS
winget install OpenJS.NodeJS.LTS

# Git
winget install Git.Git

# Visual Studio Code
winget install Microsoft.VisualStudioCode

# Extensions VS Code recommandées
# - C# Dev Kit
# - ESLint
# - Prettier
# - Tailwind CSS IntelliSense
# - GitLens
```

### Vérification de l'installation

```bash
dotnet --version    # 8.0.x
node --version      # 20.x.x
npm --version       # 10.x.x
git --version       # 2.x.x
```

---

# Chapitre 2 : Architecture Clean Architecture

## 2.1 Principes SOLID

La Clean Architecture repose sur les principes SOLID :

| Principe | Description | Exemple |
|----------|-------------|---------|
| **S** - Single Responsibility | Une classe = une responsabilité | `AuthService` ne fait que l'auth |
| **O** - Open/Closed | Ouvert à l'extension, fermé à la modification | Interfaces pour les services |
| **L** - Liskov Substitution | Les sous-classes doivent être substituables | `IRepository<T>` |
| **I** - Interface Segregation | Interfaces spécifiques plutôt que générales | `IAuthService`, `IUserService` |
| **D** - Dependency Inversion | Dépendre des abstractions | Injection de dépendances |

## 2.2 Les 4 Couches

```
┌────────────────────────────────────────────────────────────┐
│                    FleetTrack.API                          │
│              (Controllers, Hubs, Middleware)               │
│                         ▼                                  │
├────────────────────────────────────────────────────────────┤
│               FleetTrack.Application                       │
│            (DTOs, Interfaces, Validators)                  │
│                         ▼                                  │
├────────────────────────────────────────────────────────────┤
│              FleetTrack.Infrastructure                     │
│         (DbContext, Services, Repositories)                │
│                         ▼                                  │
├────────────────────────────────────────────────────────────┤
│                 FleetTrack.Domain                          │
│               (Entities, Enums, Logic)                     │
│                  [AUCUNE DÉPENDANCE]                       │
└────────────────────────────────────────────────────────────┘
```

### Règle d'or : Les dépendances pointent vers l'intérieur

- **Domain** : Aucune dépendance externe
- **Application** : Dépend uniquement de Domain
- **Infrastructure** : Dépend de Domain et Application
- **API** : Dépend de toutes les couches

## 2.3 Création du Projet

```bash
# Créer la solution
mkdir FleetTrack && cd FleetTrack
dotnet new sln -n FleetTrack

# Créer les projets
dotnet new classlib -n FleetTrack.Domain -o src/FleetTrack.Domain
dotnet new classlib -n FleetTrack.Application -o src/FleetTrack.Application
dotnet new classlib -n FleetTrack.Infrastructure -o src/FleetTrack.Infrastructure
dotnet new webapi -n FleetTrack.API -o src/FleetTrack.API

# Ajouter les projets à la solution
dotnet sln add src/FleetTrack.Domain
dotnet sln add src/FleetTrack.Application
dotnet sln add src/FleetTrack.Infrastructure
dotnet sln add src/FleetTrack.API

# Ajouter les références
dotnet add src/FleetTrack.Application reference src/FleetTrack.Domain
dotnet add src/FleetTrack.Infrastructure reference src/FleetTrack.Domain
dotnet add src/FleetTrack.Infrastructure reference src/FleetTrack.Application
dotnet add src/FleetTrack.API reference src/FleetTrack.Application
dotnet add src/FleetTrack.API reference src/FleetTrack.Infrastructure
```

## 2.4 Structure des Dossiers

```
FleetTrack/
├── src/
│   ├── FleetTrack.Domain/
│   │   ├── Entities/
│   │   │   ├── BaseEntity.cs
│   │   │   ├── User.cs
│   │   │   ├── Vehicle.cs
│   │   │   └── ...
│   │   └── Enums/
│   │       ├── VehicleStatus.cs
│   │       └── ...
│   │
│   ├── FleetTrack.Application/
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   ├── User/
│   │   │   └── ...
│   │   ├── Interfaces/
│   │   │   ├── IAuthService.cs
│   │   │   ├── IUserService.cs
│   │   │   └── Repositories/
│   │   └── Validators/
│   │
│   ├── FleetTrack.Infrastructure/
│   │   ├── Data/
│   │   │   ├── FleetTrackDbContext.cs
│   │   │   ├── Configurations/
│   │   │   └── Migrations/
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   └── ...
│   │   └── Repositories/
│   │
│   └── FleetTrack.API/
│       ├── Controllers/
│       ├── Hubs/
│       ├── Extensions/
│       ├── Middlewares/
│       └── Program.cs
│
├── tests/
│   ├── FleetTrack.UnitTests/
│   └── FleetTrack.IntegrationTests/
│
└── FleetTrack.sln
```

---

# Chapitre 3 : Backend .NET - Les Fondamentaux

## 3.1 Les Entités (Domain Layer)

### BaseEntity - La classe de base

```csharp
// FleetTrack.Domain/Entities/BaseEntity.cs
namespace FleetTrack.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;  // Soft delete
}
```

### Exemple : L'entité User

```csharp
// FleetTrack.Domain/Entities/User.cs
namespace FleetTrack.Domain.Entities;

public class User : BaseEntity
{
    // Propriétés de base
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    // État du compte
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginDate { get; set; }

    // Tokens de rafraîchissement
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Relations (Navigation Properties)
    public Guid RoleId { get; set; }
    public virtual Role Role { get; set; } = null!;

    public Guid? DriverId { get; set; }
    public virtual Driver? Driver { get; set; }

    // Propriété calculée
    public string FullName => $"{FirstName} {LastName}";
}
```

### Les Énumérations

```csharp
// FleetTrack.Domain/Enums/VehicleStatus.cs
namespace FleetTrack.Domain.Enums;

public enum VehicleStatus
{
    Active = 0,
    Inactive = 1,
    Maintenance = 2,
    Decommissioned = 3
}

// FleetTrack.Domain/Enums/MissionStatus.cs
public enum MissionStatus
{
    Planned = 0,
    Assigned = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4
}
```

## 3.2 Les DTOs (Data Transfer Objects)

Les DTOs sont des objets de transfert entre les couches. Ils évitent d'exposer les entités directement.

```csharp
// FleetTrack.Application/DTOs/User/UserDto.cs
namespace FleetTrack.Application.DTOs.User;

public class UserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTime? LastLoginDate { get; set; }
}

// DTO pour la création
public class CreateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public Guid RoleId { get; set; }
}

// DTO pour la mise à jour
public class UpdateUserDto
{
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public Guid? RoleId { get; set; }
}
```

## 3.3 Les Interfaces de Services

```csharp
// FleetTrack.Application/Interfaces/IUserService.cs
namespace FleetTrack.Application.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(Guid id);
    Task<UserDto?> GetByUsernameAsync(string username);
    Task<PaginatedResult<UserDto>> GetAllAsync(int page, int pageSize);
    Task<IEnumerable<UserDto>> GetByRoleAsync(Guid roleId);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ActivateAsync(Guid id);
    Task<bool> DeactivateAsync(Guid id);
    Task<bool> ResetPasswordAsync(Guid id, string newPassword);
}
```

## 3.4 Injection de Dépendances

L'injection de dépendances (DI) est au cœur de .NET. Elle permet de :
- Découpler les composants
- Faciliter les tests
- Gérer le cycle de vie des objets

```csharp
// FleetTrack.API/Extensions/ServiceExtensions.cs
namespace FleetTrack.API.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services)
    {
        // Scoped : Une instance par requête HTTP
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IVehicleService, VehicleService>();

        // Singleton : Une seule instance pour toute l'application
        services.AddSingleton<IPasswordHasher, PasswordHasher>();

        // Transient : Nouvelle instance à chaque injection
        services.AddTransient<IEmailService, EmailService>();

        return services;
    }
}

// Utilisation dans Program.cs
builder.Services.AddApplicationServices();
```

### Les 3 durées de vie

| Type | Description | Cas d'usage |
|------|-------------|-------------|
| **Transient** | Nouvelle instance à chaque injection | Services légers, sans état |
| **Scoped** | Une instance par requête HTTP | Services avec DbContext |
| **Singleton** | Une instance pour toute l'app | Cache, configuration |

---

# Chapitre 4 : Entity Framework Core - Base de Données

## 4.1 Le DbContext

Le DbContext est le point d'entrée vers la base de données.

```csharp
// FleetTrack.Infrastructure/Data/FleetTrackDbContext.cs
using Microsoft.EntityFrameworkCore;
using FleetTrack.Domain.Entities;

namespace FleetTrack.Infrastructure.Data;

public class FleetTrackDbContext : DbContext
{
    public FleetTrackDbContext(DbContextOptions<FleetTrackDbContext> options)
        : base(options)
    {
    }

    // DbSets - Tables de la base de données
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Mission> Missions => Set<Mission>();
    public DbSet<Waypoint> Waypoints => Set<Waypoint>();
    public DbSet<GpsPosition> GpsPositions => Set<GpsPosition>();
    public DbSet<TrackingSession> TrackingSessions => Set<TrackingSession>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<Maintenance> Maintenances => Set<Maintenance>();
    public DbSet<Zone> Zones => Set<Zone>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Appliquer toutes les configurations du dossier Configurations
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(FleetTrackDbContext).Assembly);

        // Filtre global pour le soft delete
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Vehicle>().HasQueryFilter(v => !v.IsDeleted);
        // ... autres entités
    }

    public override Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        // Mettre à jour automatiquement UpdatedAt
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
```

## 4.2 Configuration des Entités (Fluent API)

```csharp
// FleetTrack.Infrastructure/Data/Configurations/UserConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FleetTrack.Domain.Entities;

namespace FleetTrack.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Nom de la table
        builder.ToTable("Users");

        // Clé primaire
        builder.HasKey(u => u.Id);

        // Index unique
        builder.HasIndex(u => u.Username).IsUnique();
        builder.HasIndex(u => u.Email).IsUnique();

        // Propriétés requises
        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(50);

        // Relations
        builder.HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);  // Ne pas supprimer en cascade

        builder.HasOne(u => u.Driver)
            .WithOne(d => d.User)
            .HasForeignKey<User>(u => u.DriverId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
```

## 4.3 Migrations

Les migrations gèrent l'évolution du schéma de la base de données.

```bash
# Créer une migration
dotnet ef migrations add InitialCreate \
    -p src/FleetTrack.Infrastructure \
    -s src/FleetTrack.API

# Appliquer les migrations
dotnet ef database update \
    -p src/FleetTrack.Infrastructure \
    -s src/FleetTrack.API

# Annuler la dernière migration
dotnet ef migrations remove \
    -p src/FleetTrack.Infrastructure \
    -s src/FleetTrack.API

# Générer un script SQL
dotnet ef migrations script \
    -p src/FleetTrack.Infrastructure \
    -s src/FleetTrack.API \
    -o migration.sql
```

## 4.4 Seeding (Données initiales)

```csharp
// FleetTrack.Infrastructure/Data/DataSeeder.cs
namespace FleetTrack.Infrastructure.Data;

public class DataSeeder
{
    private readonly FleetTrackDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public DataSeeder(FleetTrackDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task SeedAsync()
    {
        // Créer les rôles s'ils n'existent pas
        if (!await _context.Roles.AnyAsync())
        {
            var roles = new List<Role>
            {
                new() { Name = "Admin", Description = "Administrateur système" },
                new() { Name = "Dispatcher", Description = "Répartiteur" },
                new() { Name = "Driver", Description = "Conducteur" },
                new() { Name = "Viewer", Description = "Lecteur seul" }
            };

            _context.Roles.AddRange(roles);
            await _context.SaveChangesAsync();
        }

        // Créer l'admin par défaut
        if (!await _context.Users.AnyAsync(u => u.Username == "admin"))
        {
            var adminRole = await _context.Roles
                .FirstAsync(r => r.Name == "Admin");

            var admin = new User
            {
                Username = "admin",
                Email = "admin@fleettrack.com",
                PasswordHash = _passwordHasher.Hash("Admin123!"),
                FirstName = "Admin",
                LastName = "System",
                RoleId = adminRole.Id,
                IsActive = true
            };

            _context.Users.Add(admin);
            await _context.SaveChangesAsync();
        }
    }
}
```

## 4.5 Repository Pattern

```csharp
// FleetTrack.Application/Interfaces/Repositories/IRepository.cs
namespace FleetTrack.Application.Interfaces.Repositories;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task<bool> DeleteAsync(Guid id);
    IQueryable<T> Query();
}

// FleetTrack.Infrastructure/Repositories/Repository.cs
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

    public async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<T> UpdateAsync(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity == null) return false;

        entity.IsDeleted = true;  // Soft delete
        await _context.SaveChangesAsync();
        return true;
    }

    public IQueryable<T> Query()
    {
        return _dbSet.AsQueryable();
    }
}
```

---

# Chapitre 5 : API REST - Conception et Implémentation

## 5.1 Principes REST

| Méthode HTTP | Action | Exemple | Code Retour |
|--------------|--------|---------|-------------|
| **GET** | Lire | `GET /api/users` | 200 OK |
| **GET** | Lire un | `GET /api/users/123` | 200 OK / 404 Not Found |
| **POST** | Créer | `POST /api/users` | 201 Created |
| **PUT** | Remplacer | `PUT /api/users/123` | 200 OK |
| **PATCH** | Modifier | `PATCH /api/users/123` | 200 OK |
| **DELETE** | Supprimer | `DELETE /api/users/123` | 204 No Content |

## 5.2 Structure d'un Controller

```csharp
// FleetTrack.API/Controllers/UsersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FleetTrack.Application.DTOs.User;
using FleetTrack.Application.Interfaces;

namespace FleetTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]  // Tous les endpoints nécessitent Admin
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserService userService,
        ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère la liste paginée des utilisateurs
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResult<UserDto>>), 200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _userService.GetAllAsync(pageNumber, pageSize);
        return Ok(ApiResponse<PaginatedResult<UserDto>>.Success(result));
    }

    /// <summary>
    /// Récupère un utilisateur par son ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _userService.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound(ApiResponse<UserDto>.Fail("Utilisateur non trouvé"));
        }

        return Ok(ApiResponse<UserDto>.Success(user));
    }

    /// <summary>
    /// Crée un nouvel utilisateur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        try
        {
            var user = await _userService.CreateAsync(dto);

            _logger.LogInformation(
                "Utilisateur créé : {Username} par {Admin}",
                user.Username,
                User.Identity?.Name);

            return CreatedAtAction(
                nameof(GetById),
                new { id = user.Id },
                ApiResponse<UserDto>.Success(user, "Utilisateur créé avec succès"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<UserDto>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Met à jour un utilisateur
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var user = await _userService.UpdateAsync(id, dto);
            return Ok(ApiResponse<UserDto>.Success(user, "Utilisateur mis à jour"));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<UserDto>.Fail("Utilisateur non trouvé"));
        }
    }

    /// <summary>
    /// Supprime un utilisateur (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _userService.DeleteAsync(id);

        if (!success)
        {
            return NotFound(ApiResponse<bool>.Fail("Utilisateur non trouvé"));
        }

        return NoContent();
    }

    /// <summary>
    /// Réinitialise le mot de passe d'un utilisateur
    /// </summary>
    [HttpPost("{id:guid}/reset-password")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> ResetPassword(
        Guid id,
        [FromBody] ResetPasswordDto dto)
    {
        var success = await _userService.ResetPasswordAsync(id, dto.NewPassword);

        if (!success)
        {
            return NotFound(ApiResponse<bool>.Fail("Utilisateur non trouvé"));
        }

        return Ok(ApiResponse<bool>.Success(true, "Mot de passe réinitialisé"));
    }
}
```

## 5.3 Réponse API Standardisée

```csharp
// FleetTrack.Application/DTOs/Common/ApiResponse.cs
namespace FleetTrack.Application.DTOs.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> Success(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message
        };
    }

    public static ApiResponse<T> Fail(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors
        };
    }
}

// Résultat paginé
public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
```

## 5.4 Middleware de Gestion des Erreurs

```csharp
// FleetTrack.API/Middlewares/ExceptionMiddleware.cs
namespace FleetTrack.API.Middlewares;

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
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur non gérée : {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            ArgumentException => (400, exception.Message),
            KeyNotFoundException => (404, "Ressource non trouvée"),
            UnauthorizedAccessException => (401, "Non autorisé"),
            _ => (500, "Une erreur interne s'est produite")
        };

        context.Response.StatusCode = statusCode;

        var response = ApiResponse<object>.Fail(message);

        await context.Response.WriteAsJsonAsync(response);
    }
}

// Utilisation dans Program.cs
app.UseMiddleware<ExceptionMiddleware>();
```

---

# Chapitre 6 : Authentification JWT

## 6.1 Qu'est-ce que JWT ?

JWT (JSON Web Token) est un standard ouvert pour l'échange sécurisé d'informations.

```
┌─────────────────────────────────────────────────────────────┐
│                        JWT TOKEN                            │
├─────────────────────────────────────────────────────────────┤
│  HEADER          │  PAYLOAD           │  SIGNATURE          │
│  ───────         │  ───────           │  ─────────          │
│  {               │  {                 │  HMACSHA256(        │
│    "alg": "HS256"│    "sub": "123",   │    base64(header) + │
│    "typ": "JWT"  │    "name": "John", │    "." +            │
│  }               │    "role": "Admin",│    base64(payload), │
│                  │    "exp": 17379... │    secret           │
│                  │  }                 │  )                  │
└─────────────────────────────────────────────────────────────┘
         │                  │                    │
         └──────────────────┼────────────────────┘
                            ▼
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1l
    IjoiSm9obiIsInJvbGUiOiJBZG1pbiIsImV4cCI6MTczNzkzNjAwMH0.xxxxx
```

## 6.2 Configuration JWT

```csharp
// FleetTrack.API/Extensions/ServiceExtensions.cs
public static IServiceCollection AddJwtAuthentication(
    this IServiceCollection services,
    IConfiguration configuration)
{
    var jwtSettings = configuration.GetSection("Jwt");
    var secretKey = jwtSettings["Secret"]!;
    var key = Encoding.UTF8.GetBytes(secretKey);

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
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero  // Pas de tolérance sur l'expiration
        };

        // Support JWT pour SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

    return services;
}
```

## 6.3 Service d'Authentification

```csharp
// FleetTrack.Infrastructure/Services/AuthService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

namespace FleetTrack.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly FleetTrackDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        FleetTrackDbContext context,
        IPasswordHasher passwordHasher,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        // Trouver l'utilisateur
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("Tentative de connexion échouée pour {Username}",
                request.Username);
            return null;
        }

        // Vérifier le mot de passe
        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Mot de passe incorrect pour {Username}",
                request.Username);
            return null;
        }

        // Générer les tokens
        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        // Sauvegarder le refresh token
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
            GetRefreshTokenExpirationDays());
        user.LastLoginDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Connexion réussie pour {Username}", user.Username);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes()),
            User = MapToDto(user)
        };
    }

    private string GenerateAccessToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.GivenName, user.FirstName),
            new(ClaimTypes.Surname, user.LastName),
            new(ClaimTypes.Role, user.Role.Name),
            new("role_id", user.RoleId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes()),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public async Task<LoginResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        // Valider le token existant (même expiré)
        var principal = GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null) return null;

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return null;

        // Trouver l'utilisateur
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

        if (user == null ||
            user.RefreshToken != request.RefreshToken ||
            user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return null;
        }

        // Générer de nouveaux tokens
        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
            GetRefreshTokenExpirationDays());

        await _context.SaveChangesAsync();

        return new LoginResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(GetTokenExpirationMinutes()),
            User = MapToDto(user)
        };
    }

    public async Task<bool> RevokeTokenAsync(string username)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null) return false;

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Token révoqué pour {Username}", username);
        return true;
    }

    private int GetTokenExpirationMinutes()
    {
        var value = _configuration["Jwt:ExpirationMinutes"];
        return int.TryParse(value, out var minutes) ? minutes : 60;
    }

    private int GetRefreshTokenExpirationDays()
    {
        var value = _configuration["Jwt:RefreshTokenExpirationDays"];
        return int.TryParse(value, out var days) ? days : 7;
    }
}
```

## 6.4 Hashage des Mots de Passe

```csharp
// FleetTrack.Infrastructure/Services/PasswordHasher.cs
using BCrypt.Net;

namespace FleetTrack.Infrastructure.Services;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public class PasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;  // 2^12 = 4096 itérations

    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool Verify(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}
```

## 6.5 Autorisation par Rôles

```csharp
// Attributs d'autorisation
[Authorize]  // Authentifié requis
[Authorize(Roles = "Admin")]  // Rôle Admin requis
[Authorize(Roles = "Admin,Dispatcher")]  // Admin OU Dispatcher
[AllowAnonymous]  // Pas d'auth requise

// Exemple dans un controller
[ApiController]
[Route("api/[controller]")]
[Authorize]  // Par défaut, tous les endpoints nécessitent auth
public class MissionsController : ControllerBase
{
    [HttpGet]
    // Hérite de [Authorize] - tous les utilisateurs authentifiés
    public async Task<IActionResult> GetAll() { }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")]  // Création limitée
    public async Task<IActionResult> Create(CreateMissionDto dto) { }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]  // Suppression : Admin seulement
    public async Task<IActionResult> Delete(Guid id) { }
}
```

---

# Chapitre 7 : Temps Réel avec SignalR

## 7.1 Introduction à SignalR

SignalR permet la communication bidirectionnelle en temps réel entre serveur et clients via WebSockets.

```
┌─────────────┐                              ┌─────────────┐
│   Client 1  │◄────── WebSocket ───────────►│             │
└─────────────┘                              │             │
                                             │   SignalR   │
┌─────────────┐                              │     Hub     │
│   Client 2  │◄────── WebSocket ───────────►│             │
└─────────────┘                              │             │
                                             │             │
┌─────────────┐                              │             │
│   Client 3  │◄────── WebSocket ───────────►│             │
└─────────────┘                              └─────────────┘
```

## 7.2 Création d'un Hub

```csharp
// FleetTrack.API/Hubs/IGpsClient.cs
namespace FleetTrack.API.Hubs;

/// <summary>
/// Interface définissant les méthodes que le serveur peut appeler sur le client
/// </summary>
public interface IGpsClient
{
    // Réception de position GPS
    Task ReceiveGpsPosition(GpsPositionUpdateDto position);

    // Événements de session
    Task SessionStarted(TrackingSessionStartedDto session);
    Task SessionStopped(Guid sessionId, Guid vehicleId);
    Task SessionUpdated(ActiveTrackingSessionDto session);

    // Notifications
    Task StopTrackingRequested(Guid vehicleId, string? reason);

    // Confirmations d'abonnement
    Task SubscriptionConfirmed(Guid vehicleId);
    Task SubscribedToAllVehicles();
    Task UnsubscribedFromAllVehicles();
}
```

```csharp
// FleetTrack.API/Hubs/GpsHub.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace FleetTrack.API.Hubs;

[Authorize]  // Tous les utilisateurs doivent être authentifiés
public class GpsHub : Hub<IGpsClient>
{
    private readonly ILogger<GpsHub> _logger;
    private readonly ITrackingSessionService _sessionService;

    // Dictionnaires statiques pour le suivi des connexions
    private static readonly Dictionary<string, HashSet<Guid>> UserVehicleSubscriptions = new();
    private static readonly Dictionary<string, Guid> DriverSessions = new();
    private static readonly object LockObject = new();

    public GpsHub(
        ILogger<GpsHub> logger,
        ITrackingSessionService sessionService)
    {
        _logger = logger;
        _sessionService = sessionService;
    }

    /// <summary>
    /// Appelé automatiquement quand un client se connecte
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation(
            "Client connecté : {ConnectionId}, User: {Username}",
            Context.ConnectionId, username);

        // Ajouter au groupe global
        await Groups.AddToGroupAsync(Context.ConnectionId, "all");

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Appelé automatiquement quand un client se déconnecte
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation(
            "Client déconnecté : {ConnectionId}, User: {Username}",
            Context.ConnectionId, username);

        // Nettoyer les abonnements
        lock (LockObject)
        {
            UserVehicleSubscriptions.Remove(Context.ConnectionId);
            DriverSessions.Remove(Context.ConnectionId);
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "all");
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// S'abonner à tous les véhicules
    /// </summary>
    public async Task SubscribeToAllVehicles()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "all_vehicles");
        await Clients.Caller.SubscribedToAllVehicles();

        _logger.LogInformation(
            "Client {ConnectionId} abonné à tous les véhicules",
            Context.ConnectionId);
    }

    /// <summary>
    /// S'abonner à un véhicule spécifique
    /// </summary>
    public async Task SubscribeToVehicle(Guid vehicleId)
    {
        lock (LockObject)
        {
            if (!UserVehicleSubscriptions.ContainsKey(Context.ConnectionId))
            {
                UserVehicleSubscriptions[Context.ConnectionId] = new HashSet<Guid>();
            }
            UserVehicleSubscriptions[Context.ConnectionId].Add(vehicleId);
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"vehicle_{vehicleId}");
        await Clients.Caller.SubscriptionConfirmed(vehicleId);
    }

    /// <summary>
    /// Envoyer une position GPS (appelé par les conducteurs)
    /// </summary>
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task SendGpsPosition(GpsPositionUpdateDto position)
    {
        _logger.LogInformation(
            "Position reçue : Vehicle={VehicleId}, Lat={Lat}, Lng={Lng}",
            position.VehicleId, position.Latitude, position.Longitude);

        // Sauvegarder en base
        Guid? sessionId;
        lock (LockObject)
        {
            DriverSessions.TryGetValue(Context.ConnectionId, out var sid);
            sessionId = sid == Guid.Empty ? null : sid;
        }

        if (sessionId.HasValue)
        {
            await _sessionService.UpdatePositionAsync(sessionId.Value, position);
        }

        // Diffuser aux abonnés
        await Clients.Group($"vehicle_{position.VehicleId}")
            .ReceiveGpsPosition(position);

        await Clients.Group("all_vehicles")
            .ReceiveGpsPosition(position);
    }

    /// <summary>
    /// Démarrer une session de tracking
    /// </summary>
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task StartTrackingSession(StartTrackingSessionDto dto)
    {
        var result = await _sessionService.StartSessionAsync(dto);

        lock (LockObject)
        {
            DriverSessions[Context.ConnectionId] = result.SessionId;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"driver_{dto.VehicleId}");
        await Clients.Caller.SessionStarted(result);

        // Notifier les autres
        var session = await _sessionService.GetActiveSessionByVehicleAsync(dto.VehicleId);
        if (session != null)
        {
            await Clients.Group("all_vehicles").SessionUpdated(session);
        }
    }

    /// <summary>
    /// Arrêter la session de tracking
    /// </summary>
    [Authorize(Roles = "Admin,Dispatcher,Driver")]
    public async Task StopTrackingSession()
    {
        Guid? sessionId;
        lock (LockObject)
        {
            DriverSessions.TryGetValue(Context.ConnectionId, out var sid);
            sessionId = sid == Guid.Empty ? null : sid;
            DriverSessions.Remove(Context.ConnectionId);
        }

        if (sessionId.HasValue)
        {
            var session = await _sessionService.GetByIdAsync(sessionId.Value);
            if (session != null)
            {
                await _sessionService.StopSessionAsync(sessionId.Value);
                await Clients.Group("all_vehicles")
                    .SessionStopped(sessionId.Value, session.VehicleId);
            }
        }
    }

    /// <summary>
    /// Force l'arrêt du tracking (admin/dispatcher)
    /// </summary>
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task ForceStopVehicleTracking(Guid vehicleId, string? reason = null)
    {
        await _sessionService.StopVehicleSessionsAsync(vehicleId);

        // Notifier le conducteur
        await Clients.Group($"driver_{vehicleId}")
            .StopTrackingRequested(vehicleId, reason);
    }
}
```

## 7.3 Configuration SignalR

```csharp
// Program.cs
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// Mapping du hub
app.MapHub<GpsHub>("/hubs/gps");
```

## 7.4 Client SignalR (Frontend)

```typescript
// src/lib/hooks/useSignalR.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '@/lib/api/client';

const SIGNALR_HUB_URL = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL!;

export const useSignalR = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [positions, setPositions] = useState<GpsPositionUpdateDto[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const connect = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Gestionnaires d'événements
    connection.on('ReceiveGpsPosition', (position: GpsPositionUpdateDto) => {
      setPositions(prev => [position, ...prev].slice(0, 100));
    });

    connection.on('SessionStarted', (session) => {
      console.log('Session démarrée:', session);
    });

    connection.onreconnecting(() => {
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      setIsConnected(true);
    });

    try {
      await connection.start();
      setIsConnected(true);
    } catch (err) {
      console.error('Erreur de connexion SignalR:', err);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      connectionRef.current?.stop();
    };
  }, [connect]);

  // Méthodes d'envoi
  const subscribeToAllVehicles = async () => {
    await connectionRef.current?.invoke('SubscribeToAllVehicles');
  };

  const sendGpsPosition = async (position: GpsPositionUpdateDto) => {
    await connectionRef.current?.invoke('SendGpsPosition', position);
  };

  const startTrackingSession = async (dto: StartTrackingSessionDto) => {
    await connectionRef.current?.invoke('StartTrackingSession', dto);
  };

  return {
    isConnected,
    positions,
    subscribeToAllVehicles,
    sendGpsPosition,
    startTrackingSession,
  };
};
```

---

# Chapitre 8 : Frontend Next.js - Les Fondamentaux

## 8.1 Création du Projet

```bash
# Créer le projet Next.js
npx create-next-app@latest fleettrack-frontend --typescript --tailwind --eslint --app

# Installer les dépendances
cd fleettrack-frontend
npm install @microsoft/signalr axios date-fns lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install class-variance-authority clsx tailwind-merge

# Installer Shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input select badge tabs
```

## 8.2 Structure du Projet

```
fleettrack-frontend/
├── src/
│   ├── app/                      # App Router (Next.js 14)
│   │   ├── (admin)/             # Groupe de routes admin
│   │   │   ├── dashboard/
│   │   │   ├── tracking/
│   │   │   ├── vehicles/
│   │   │   ├── drivers/
│   │   │   ├── missions/
│   │   │   ├── users/
│   │   │   └── layout.tsx       # Layout avec sidebar
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (driver)/
│   │   │   └── driver-tracking/
│   │   ├── layout.tsx           # Layout racine
│   │   ├── page.tsx             # Page d'accueil
│   │   └── providers.tsx        # Providers (Auth, etc.)
│   │
│   ├── components/
│   │   ├── ui/                  # Composants Shadcn
│   │   ├── layout/              # Header, Sidebar
│   │   ├── tracking/            # Composants tracking
│   │   └── dashboard/           # Composants dashboard
│   │
│   ├── lib/
│   │   ├── api/                 # Clients API
│   │   │   ├── client.ts        # Axios instance
│   │   │   ├── auth.ts
│   │   │   ├── vehicles.ts
│   │   │   └── ...
│   │   ├── hooks/               # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useSignalR.ts
│   │   │   └── ...
│   │   └── utils.ts             # Utilitaires
│   │
│   └── types/                   # Types TypeScript
│       ├── auth.ts
│       ├── vehicle.ts
│       └── ...
│
├── public/
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## 8.3 App Router et Layouts

### Layout Racine

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FleetTrack - Gestion de Flotte',
  description: 'Système de gestion de flotte véhiculaire',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Layout Admin avec Sidebar

```tsx
// src/app/(admin)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      Chargement...
    </div>;
  }

  if (!user) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Groupes de Routes

Les parenthèses créent des "groupes de routes" qui n'affectent pas l'URL :

```
src/app/
├── (admin)/           # URL: /dashboard, /vehicles, etc.
│   ├── dashboard/     # URL: /dashboard
│   └── vehicles/      # URL: /vehicles
├── (auth)/            # URL: /login
│   └── login/
└── (driver)/          # URL: /driver-tracking
    └── driver-tracking/
```

## 8.4 Client API avec Axios

```typescript
// src/lib/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5115/api';

// Créer l'instance Axios
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stockage du token
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
};

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs et refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Si 401 et pas déjà retenté
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            accessToken: getAccessToken(),
            refreshToken,
          });

          const { accessToken: newToken, refreshToken: newRefresh } =
            response.data.data;

          setAccessToken(newToken);
          localStorage.setItem('refreshToken', newRefresh);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh échoué - déconnexion
        setAccessToken(null);
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
```

## 8.5 API Services

```typescript
// src/lib/api/auth.ts
import { apiClient, setAccessToken } from './client';
import { LoginRequest, LoginResponse, User } from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<{ data: LoginResponse }>(
      '/auth/login',
      credentials
    );

    const { accessToken, refreshToken } = response.data.data;
    setAccessToken(accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return response.data.data;
  },

  logout: () => {
    setAccessToken(null);
    localStorage.removeItem('refreshToken');
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/auth/me');
    return response.data.data;
  },
};
```

```typescript
// src/lib/api/vehicles.ts
import { apiClient } from './client';
import { Vehicle, CreateVehicle, UpdateVehicle } from '@/types/vehicle';
import { PaginatedResult } from './types';

export const vehiclesApi = {
  getAll: async (page = 1, pageSize = 10): Promise<PaginatedResult<Vehicle>> => {
    const response = await apiClient.get('/vehicles', {
      params: { pageNumber: page, pageSize },
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get(`/vehicles/${id}`);
    return response.data.data;
  },

  create: async (data: CreateVehicle): Promise<Vehicle> => {
    const response = await apiClient.post('/vehicles', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateVehicle): Promise<Vehicle> => {
    const response = await apiClient.put(`/vehicles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${id}`);
  },
};
```

---

# Chapitre 9 : React Avancé - Hooks et State Management

## 9.1 Les Hooks Fondamentaux

### useState - État local

```tsx
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);

// Mise à jour
setCount(count + 1);
setCount(prev => prev + 1);  // Version fonctionnelle (recommandée)
setUser({ ...user, name: 'Nouveau nom' });
setItems(prev => [...prev, newItem]);
```

### useEffect - Effets de bord

```tsx
// Exécuté à chaque render
useEffect(() => {
  console.log('Render');
});

// Exécuté une seule fois (montage)
useEffect(() => {
  fetchData();
}, []);

// Exécuté quand userId change
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// Avec nettoyage
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();  // Cleanup
}, []);
```

### useCallback - Mémorisation de fonctions

```tsx
// Sans useCallback : nouvelle fonction à chaque render
const handleClick = () => doSomething(id);

// Avec useCallback : même référence si id ne change pas
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### useMemo - Mémorisation de valeurs

```tsx
// Calcul coûteux mémorisé
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

### useRef - Références

```tsx
// Référence DOM
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();

// Valeur persistante sans re-render
const countRef = useRef(0);
countRef.current += 1;  // Ne déclenche pas de re-render
```

## 9.2 Custom Hooks

### Hook d'Authentification

```typescript
// src/lib/hooks/useAuth.ts
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import { User, LoginRequest } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    setUser(response.user);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Hook de Données Paginées

```typescript
// src/lib/hooks/usePaginatedData.ts
import { useState, useEffect, useCallback } from 'react';
import { PaginatedResult } from '@/lib/api/types';

interface UsePaginatedDataOptions<T> {
  fetchFn: (page: number, pageSize: number) => Promise<PaginatedResult<T>>;
  pageSize?: number;
}

export function usePaginatedData<T>({ fetchFn, pageSize = 10 }: UsePaginatedDataOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page, pageSize);
      setData(result.items);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const refresh = () => fetchData();

  return {
    data,
    page,
    totalPages,
    isLoading,
    error,
    goToPage,
    refresh,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// Utilisation
const { data: vehicles, page, goToPage, isLoading } = usePaginatedData({
  fetchFn: vehiclesApi.getAll,
  pageSize: 20,
});
```

## 9.3 Formulaires avec React Hook Form

```tsx
// Exemple de formulaire de création de véhicule
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schéma de validation
const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Immatriculation requise'),
  brand: z.string().min(1, 'Marque requise'),
  model: z.string().min(1, 'Modèle requis'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  type: z.enum(['Car', 'Van', 'Truck', 'Motorcycle', 'Bus']),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export function VehicleForm({ onSubmit }: { onSubmit: (data: VehicleFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="registrationNumber">Immatriculation</Label>
        <Input
          id="registrationNumber"
          {...register('registrationNumber')}
          className={errors.registrationNumber ? 'border-red-500' : ''}
        />
        {errors.registrationNumber && (
          <p className="text-red-500 text-sm">{errors.registrationNumber.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="brand">Marque</Label>
        <Input id="brand" {...register('brand')} />
      </div>

      <div>
        <Label htmlFor="model">Modèle</Label>
        <Input id="model" {...register('model')} />
      </div>

      <div>
        <Label htmlFor="year">Année</Label>
        <Input
          id="year"
          type="number"
          {...register('year', { valueAsNumber: true })}
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select {...register('type')}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Car">Voiture</SelectItem>
            <SelectItem value="Van">Fourgon</SelectItem>
            <SelectItem value="Truck">Camion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Création...' : 'Créer le véhicule'}
      </Button>
    </form>
  );
}
```

---

# Chapitre 10 : Intégration Frontend-Backend

## 10.1 Types TypeScript alignés avec le Backend

```typescript
// src/types/vehicle.ts
export enum VehicleStatus {
  Active = 0,
  Inactive = 1,
  Maintenance = 2,
  Decommissioned = 3,
}

export enum VehicleType {
  Car = 0,
  Van = 1,
  Truck = 2,
  Motorcycle = 3,
  Bus = 4,
}

export interface VehicleDto {
  id: string;
  registrationNumber: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  currentDriverId?: string;
  currentDriverName?: string;
  mileage: number;
  fuelLevel?: number;
  lastMaintenanceDate?: string;
}

export interface CreateVehicleDto {
  registrationNumber: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  fuelType: number;
  fuelCapacity: number;
}
```

## 10.2 Page Complète avec Données

```tsx
// src/app/(admin)/vehicles/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/lib/api/vehicles';
import { VehicleDto, VehicleStatus } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<VehicleStatus, string> = {
  [VehicleStatus.Active]: 'bg-green-500',
  [VehicleStatus.Inactive]: 'bg-gray-500',
  [VehicleStatus.Maintenance]: 'bg-yellow-500',
  [VehicleStatus.Decommissioned]: 'bg-red-500',
};

const statusLabels: Record<VehicleStatus, string> = {
  [VehicleStatus.Active]: 'Actif',
  [VehicleStatus.Inactive]: 'Inactif',
  [VehicleStatus.Maintenance]: 'Maintenance',
  [VehicleStatus.Decommissioned]: 'Hors service',
};

export default function VehiclesPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Query pour récupérer les véhicules
  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', page],
    queryFn: () => vehiclesApi.getAll(page, 10),
  });

  // Mutation pour supprimer
  const deleteMutation = useMutation({
    mutationFn: vehiclesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Erreur de chargement</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Véhicules</h1>
        <Link href="/vehicles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau véhicule
          </Button>
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalCount || 0}</div>
          </CardContent>
        </Card>
        {/* Autres stats... */}
      </div>

      {/* Liste des véhicules */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Immatriculation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Véhicule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Conducteur
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.items.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-medium">
                    {vehicle.registrationNumber}
                  </td>
                  <td className="px-6 py-4">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[vehicle.status]}>
                      {statusLabels[vehicle.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {vehicle.currentDriverName || '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/vehicles/${vehicle.id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(vehicle.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Précédent
        </Button>
        <span className="px-4 py-2">
          Page {page} sur {data?.totalPages || 1}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (data?.totalPages || 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
```

---

# Chapitre 11 : Tests et Qualité du Code

## 11.1 Tests Unitaires (.NET)

```csharp
// tests/FleetTrack.UnitTests/Services/UserServiceTests.cs
using Xunit;
using Moq;
using FleetTrack.Application.Interfaces;
using FleetTrack.Infrastructure.Services;

namespace FleetTrack.UnitTests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly UserService _sut;  // System Under Test

    public UserServiceTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _sut = new UserService(_userRepoMock.Object, _passwordHasherMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_ExistingUser_ReturnsUserDto()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Username = "testuser",
            Email = "test@example.com"
        };

        _userRepoMock
            .Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.GetByIdAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("testuser", result.Username);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingUser_ReturnsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepoMock
            .Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _sut.GetByIdAsync(userId);

        // Assert
        Assert.Null(result);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public async Task CreateAsync_InvalidUsername_ThrowsArgumentException(string? username)
    {
        // Arrange
        var dto = new CreateUserDto { Username = username! };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _sut.CreateAsync(dto));
    }
}
```

## 11.2 Tests d'Intégration

```csharp
// tests/FleetTrack.IntegrationTests/Controllers/VehiclesControllerTests.cs
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace FleetTrack.IntegrationTests.Controllers;

public class VehiclesControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public VehiclesControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_Authenticated_ReturnsVehicles()
    {
        // Arrange - Login first
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Username = "admin",
            Password = "Admin123!"
        });
        var loginData = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", loginData.AccessToken);

        // Act
        var response = await _client.GetAsync("/api/vehicles");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<PaginatedResult<VehicleDto>>>();
        Assert.True(result.Success);
    }

    [Fact]
    public async Task GetAll_Unauthenticated_Returns401()
    {
        // Act
        var response = await _client.GetAsync("/api/vehicles");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
```

## 11.3 Tests Frontend (Jest + React Testing Library)

```typescript
// __tests__/components/VehicleCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VehicleCard } from '@/components/vehicles/VehicleCard';

describe('VehicleCard', () => {
  const mockVehicle = {
    id: '123',
    registrationNumber: 'AB-123-CD',
    brand: 'Renault',
    model: 'Kangoo',
    year: 2020,
    status: 0, // Active
  };

  it('displays vehicle information', () => {
    render(<VehicleCard vehicle={mockVehicle} />);

    expect(screen.getByText('AB-123-CD')).toBeInTheDocument();
    expect(screen.getByText('Renault Kangoo')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<VehicleCard vehicle={mockVehicle} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith('123');
  });
});
```

---

# Chapitre 12 : Déploiement et DevOps

## 12.1 Dockerisation

### Backend Dockerfile

```dockerfile
# FleetTrack.API/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copier les fichiers projet
COPY ["src/FleetTrack.API/FleetTrack.API.csproj", "src/FleetTrack.API/"]
COPY ["src/FleetTrack.Application/FleetTrack.Application.csproj", "src/FleetTrack.Application/"]
COPY ["src/FleetTrack.Infrastructure/FleetTrack.Infrastructure.csproj", "src/FleetTrack.Infrastructure/"]
COPY ["src/FleetTrack.Domain/FleetTrack.Domain.csproj", "src/FleetTrack.Domain/"]

# Restaurer les dépendances
RUN dotnet restore "src/FleetTrack.API/FleetTrack.API.csproj"

# Copier tout le code
COPY . .

# Build
WORKDIR "/src/src/FleetTrack.API"
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Image finale
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FleetTrack.API.dll"]
```

### Frontend Dockerfile

```dockerfile
# fleettrack-frontend/Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./FleetTrack
      dockerfile: src/FleetTrack.API/Dockerfile
    ports:
      - "5115:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=db;Database=fleettrack;Username=postgres;Password=postgres
    depends_on:
      - db

  frontend:
    build:
      context: ./fleettrack-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend/api
      - NEXT_PUBLIC_SIGNALR_HUB_URL=http://backend/hubs/gps
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=fleettrack
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## 12.2 CI/CD avec GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Restore
        run: dotnet restore FleetTrack/FleetTrack.sln

      - name: Build
        run: dotnet build FleetTrack/FleetTrack.sln --no-restore

      - name: Test
        run: dotnet test FleetTrack/FleetTrack.sln --no-build --verbosity normal

  test-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: fleettrack-frontend
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: fleettrack-frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Production
        run: echo "Deploy to production server"
        # Ajouter les étapes de déploiement
```

---

# Chapitre 13 : Projet Final - Synthèse

## 13.1 Récapitulatif des Compétences Acquises

### Backend

- ✅ Clean Architecture et séparation des responsabilités
- ✅ Entity Framework Core et migrations
- ✅ API REST avec ASP.NET Core
- ✅ Authentification JWT et autorisation par rôles
- ✅ SignalR pour le temps réel
- ✅ Injection de dépendances
- ✅ Tests unitaires et d'intégration

### Frontend

- ✅ Next.js 14 avec App Router
- ✅ TypeScript et typage fort
- ✅ React Hooks (useState, useEffect, useCallback, useMemo)
- ✅ Custom Hooks et Context API
- ✅ Tailwind CSS et composants réutilisables
- ✅ Gestion des formulaires et validation
- ✅ Communication avec API REST
- ✅ WebSockets avec SignalR

### DevOps

- ✅ Docker et Docker Compose
- ✅ CI/CD avec GitHub Actions
- ✅ Variables d'environnement

## 13.2 Exercices Pratiques

### Exercice 1 : Ajouter une fonctionnalité

Implémentez une fonctionnalité de **notifications push** :

1. Backend : Créer un endpoint pour les préférences de notification
2. Backend : Ajouter un service d'envoi de notifications
3. Frontend : Créer une page de paramètres
4. Frontend : Afficher les notifications en temps réel

### Exercice 2 : Améliorer le tracking

Ajoutez le support des **zones géographiques** :

1. Backend : Endpoint CRUD pour les zones
2. Backend : Détection d'entrée/sortie de zone
3. Frontend : Dessin de zones sur la carte
4. Frontend : Alertes de violation de zone

### Exercice 3 : Rapports

Créez un système de **rapports** :

1. Backend : Agrégation de données (distances, temps, etc.)
2. Backend : Export PDF/Excel
3. Frontend : Dashboard avec graphiques
4. Frontend : Filtres et période personnalisable

## 13.3 Ressources pour Aller Plus Loin

### Documentation Officielle

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)

### Livres Recommandés

- "Clean Architecture" - Robert C. Martin
- "Domain-Driven Design" - Eric Evans
- "Designing Data-Intensive Applications" - Martin Kleppmann

### Certifications

- Microsoft Certified: Azure Developer Associate
- AWS Certified Developer - Associate

---

## Conclusion

Félicitations ! Vous avez parcouru un cours complet de développement Full-Stack moderne. Le projet FleetTrack vous a permis de mettre en pratique :

- L'architecture logicielle avec Clean Architecture
- Le développement backend robuste avec .NET
- Le développement frontend réactif avec Next.js
- L'authentification sécurisée avec JWT
- La communication temps réel avec SignalR
- Les bonnes pratiques de test et de déploiement

La clé du succès en développement Full-Stack est la **pratique continue** et la **curiosité technique**. Continuez à construire des projets, explorez de nouvelles technologies, et n'hésitez pas à contribuer à des projets open-source.

**Bon code !** 🚀

---

*Cours créé dans le cadre du projet FleetTrack*
*Version 1.0 - Décembre 2025*
