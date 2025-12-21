# FleetTrack - Système de Gestion de Flotte

API backend ASP.NET Core pour la gestion et le suivi de flotte de véhicules en temps réel.

## 🏗️ Architecture

Ce projet suit les principes de **Clean Architecture** avec une séparation claire des responsabilités :

```
FleetTrack/
├── src/
│   ├── FleetTrack.API/          # API Web - Point d'entrée (Startup Project)
│   ├── FleetTrack.Application/  # Logique métier et services
│   ├── FleetTrack.Domain/        # Entités et règles métier
│   └── FleetTrack.Infrastructure/ # Accès données (EF Core, Repositories)
└── tests/
    ├── FleetTrack.UnitTests/
    └── FleetTrack.IntegrationTests/
```

## 🚀 Démarrage Rapide

### Prérequis

- .NET 8.0 SDK
- SQL Server (LocalDB, Express ou complet)
- Visual Studio 2022 / VS Code / Rider

### Installation

1. **Cloner le repository**
   ```bash
   git clone <url>
   cd FleetTrack
   ```

2. **Restaurer les packages NuGet**
   ```bash
   dotnet restore
   ```

3. **Configurer la base de données**

   Modifier la connection string dans `src/FleetTrack.API/appsettings.json` :
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=FleetTrackDb;Trusted_Connection=True;TrustServerCertificate=True"
     }
   }
   ```

4. **Créer la base de données**
   ```bash
   cd src/FleetTrack.API
   dotnet ef migrations add InitialCreate --project ../FleetTrack.Infrastructure
   dotnet ef database update --project ../FleetTrack.Infrastructure
   ```

5. **Lancer l'application**
   ```bash
   dotnet run --project src/FleetTrack.API
   ```

6. **Accéder à Swagger**

   Ouvrir dans le navigateur : `https://localhost:7086/swagger`

## 📦 Fonctionnalités

### Entités Principales

- **Vehicles** - Gestion des véhicules de la flotte
- **Drivers** - Gestion des conducteurs
- **Missions** - Planification et suivi des missions
- **Waypoints** - Points de passage des missions
- **GpsPositions** - Historique de positions GPS
- **Alerts** - Système d'alertes en temps réel
- **Maintenance** - Suivi de la maintenance préventive/corrective
- **Zones** - Geofencing et zones géographiques

### Fonctionnalités Techniques

- ✅ Entity Framework Core 8.0
- ✅ Pattern Repository
- ✅ Soft Delete automatique
- ✅ AutoMapper pour les mappings
- ✅ FluentValidation pour les validations
- ✅ Swagger/OpenAPI
- ✅ CORS configuré
- ✅ Logging structuré

## 🗄️ Base de Données

### Schéma

Le projet utilise **SQL Server** avec Entity Framework Core :

- 8 tables principales
- Relations complexes (One-to-One, One-to-Many)
- Index optimisés pour les requêtes fréquentes
- Soft Delete avec filtres globaux

### Migrations

```bash
# Créer une nouvelle migration
dotnet ef migrations add NomDeLaMigration --project src/FleetTrack.Infrastructure --startup-project src/FleetTrack.API

# Appliquer les migrations
dotnet ef database update --project src/FleetTrack.Infrastructure --startup-project src/FleetTrack.API

# Générer un script SQL
dotnet ef migrations script --project src/FleetTrack.Infrastructure --startup-project src/FleetTrack.API --output migration.sql
```

## 📚 Documentation

Chaque couche dispose de sa propre documentation détaillée :

- [Domain Layer Documentation](src/FleetTrack.Domain/README.md)
- [Infrastructure Layer Documentation](src/FleetTrack.Infrastructure/README.md)

## 🧪 Tests

```bash
# Tests unitaires
dotnet test tests/FleetTrack.UnitTests

# Tests d'intégration
dotnet test tests/FleetTrack.IntegrationTests

# Tous les tests
dotnet test
```

## 🛠️ Développement

### Structure des Couches

#### Domain Layer
- Entités métier (BaseEntity, Vehicle, Driver, etc.)
- Enums (VehicleStatus, DriverStatus, etc.)
- Aucune dépendance externe

#### Application Layer
- Services métier
- DTOs (Data Transfer Objects)
- Mappings AutoMapper
- Validators FluentValidation
- Dépend de : Domain

#### Infrastructure Layer
- DbContext Entity Framework
- Repositories (IRepository<T>, VehicleRepository, etc.)
- Configurations FluentAPI
- Dépend de : Domain, Application

#### API Layer
- Controllers REST
- Configuration Swagger
- Middleware
- Dépend de : Application, Infrastructure

### Bonnes Pratiques

- Toujours utiliser `async/await`
- Utiliser `CancellationToken` dans les méthodes async
- Préférer les repositories pour l'accès données
- Utiliser Soft Delete par défaut
- Valider avec FluentValidation
- Logger les erreurs importantes

## 📝 Exemples de Code

### Utiliser un Repository

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

### Créer une Entité

```csharp
var vehicle = new Vehicle
{
    RegistrationNumber = "AB-123-CD",
    Brand = "Renault",
    Model = "Master",
    Type = VehicleType.Van,
    Status = VehicleStatus.Available
};

await _vehicleRepository.AddAsync(vehicle);
```

## 🔒 Sécurité

- [ ] TODO: Ajouter Authentication (JWT)
- [ ] TODO: Ajouter Authorization (Policies/Roles)
- [ ] TODO: Rate Limiting
- [ ] TODO: Input Validation
- [ ] TODO: HTTPS obligatoire en production

## 📊 Performance

- Index sur colonnes fréquemment filtrées
- Eager Loading avec Include pour éviter N+1
- Pagination sur les listes
- Retry automatique sur erreurs temporaires SQL

## 🚧 Roadmap

- [ ] Controllers REST pour toutes les entités
- [ ] Authentification JWT
- [ ] SignalR pour mises à jour temps réel
- [ ] Rapports et statistiques
- [ ] Export Excel/PDF
- [ ] API de géolocalisation
- [ ] Notifications push

## 📄 License

[À définir]

## 👥 Contributeurs

[À compléter]

---

**Date de création** : 2025-12-18
**Version** : 1.0
**Framework** : .NET 8.0
