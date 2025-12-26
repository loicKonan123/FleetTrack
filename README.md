# 🚚 FleetTrack - Système de Gestion de Flotte

![.NET CI/CD](https://github.com/loicKonan123/FleetTrack/actions/workflows/dotnet-ci.yml/badge.svg)
![.NET Version](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![Tests](https://img.shields.io/badge/tests-101%20passing-success)
![License](https://img.shields.io/badge/license-MIT-green)

**Version:** 1.0
**Date:** Décembre 2025
**Framework:** .NET 8.0
**Architecture:** Clean Architecture

> Système complet de gestion de flotte avec tests automatisés et CI/CD

[Documentation Complète](documentation/) | [Guide GitHub](GITHUB_GUIDE.md) | [Guide Tests](TESTS_GUIDE.md) | [API Swagger](http://localhost:5115/swagger)

---

## 📖 À propos

FleetTrack est un système complet de gestion de flotte de véhicules développé avec **ASP.NET Core 8** et **Clean Architecture**. Il permet de gérer les véhicules, chauffeurs, missions, tracking GPS, alertes et maintenance.

### Fonctionnalités principales

✅ **Authentification JWT** avec rôles (Admin, Dispatcher, Driver, Viewer)
✅ **Gestion des utilisateurs** (CRUD complet, rôles, activation, réinitialisation mot de passe)
✅ **SignalR GPS Tracking** en temps réel avec WebSockets
✅ Gestion complète des **véhicules** (camions, voitures, motos, bus)
✅ Gestion des **chauffeurs** avec permis et statuts
✅ Planification et suivi des **missions**
✅ **Tracking GPS** avec historique et positions temps réel
✅ Système d'**alertes** (vitesse, carburant, maintenance)
✅ Gestion de la **maintenance** (préventive et corrective)
✅ **Geofencing** avec zones géographiques
✅ API REST complète avec **Swagger** et authentification Bearer
✅ Base de données **SQLite** (développement) / **SQL Server** (production)

---

## 📚 Documentation complète

**Toute la documentation se trouve dans le dossier [documentation/](documentation/)**

### 🎯 Point d'entrée recommandé

👉 **Consultez d'abord [documentation/INDEX.md](documentation/INDEX.md)** pour une vue d'ensemble de toute la documentation disponible.

### 📄 Documents disponibles

| Document | Description | Taille |
|----------|-------------|--------|
| **[INDEX.md](documentation/INDEX.md)** | Index principal - Point d'entrée de la documentation | 7 KB |
| **[AUTH_DOCUMENTATION.md](documentation/AUTH_DOCUMENTATION.md)** | Documentation complète de l'authentification JWT et de la sécurité | 28 KB |
| **[USER_MANAGEMENT.md](documentation/USER_MANAGEMENT.md)** | Documentation complète de la gestion des utilisateurs et rôles | 18 KB |
| **[SIGNALR_DOCUMENTATION.md](documentation/SIGNALR_DOCUMENTATION.md)** | Documentation complète du tracking GPS temps réel avec SignalR | 28 KB |
| **[DATABASE_SCHEMA.md](documentation/DATABASE_SCHEMA.md)** | Schéma complet de la base de données avec ERD, tables, relations, types | 37 KB |
| **[ARCHITECTURE_FLOW.md](documentation/ARCHITECTURE_FLOW.md)** | Parcours du code à travers les couches (Controller → Service → Repository) | 26 KB |
| **[README.md](documentation/README.md)** | Vue d'ensemble du projet et guide de démarrage | 6 KB |
| **[SAMPLE_DATA.sql](documentation/SAMPLE_DATA.sql)** | Script SQL avec données d'exemple complètes | 18 KB |

---

## 🚀 Démarrage rapide

### Prérequis

- **.NET 8.0 SDK** : [Télécharger](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Visual Studio Code** ou **Visual Studio 2022**
- **DB Browser for SQLite** (optionnel) : Pour visualiser la base de données

### Installation

```bash
# 1. Cloner le repository
git clone <repository-url>
cd backend_c#

# 2. Restaurer les dépendances
dotnet restore

# 3. Appliquer les migrations (créer la base de données)
cd FleetTrack/src/FleetTrack.API
dotnet ef database update --project ../FleetTrack.Infrastructure/FleetTrack.Infrastructure.csproj

# 4. Lancer l'API
dotnet run
```

L'API sera accessible sur **http://localhost:5115**
Swagger UI : **http://localhost:5115/swagger**

### Compte administrateur par défaut

Un compte admin est créé automatiquement au premier démarrage:
- **Username:** `admin`
- **Password:** `Admin123!`
- **Rôle:** Admin (accès complet)

⚠️ **Important:** Changez le mot de passe en production !

### Insérer des données d'exemple

1. Ouvrez **DB Browser for SQLite**
2. Ouvrez la base : `FleetTrack/src/FleetTrack.API/FleetTrack.db`
3. Allez dans l'onglet **"Execute SQL"**
4. Copiez le contenu de **[documentation/SAMPLE_DATA.sql](documentation/SAMPLE_DATA.sql)**
5. Cliquez sur **Execute** (▶️)

Vous aurez alors :
- 6 véhicules
- 6 chauffeurs
- 4 missions
- 4 zones géographiques
- 5 waypoints
- 6 positions GPS
- 5 alertes
- 6 registres de maintenance

---

## 🏗️ Architecture

### Structure du projet

```
backend_c#/
├── FleetTrack/
│   ├── src/
│   │   ├── FleetTrack.Domain/         # Entités, Enums (couche métier)
│   │   ├── FleetTrack.Application/    # Services, DTOs, Interfaces
│   │   ├── FleetTrack.Infrastructure/ # Repositories, DbContext, EF Core
│   │   └── FleetTrack.API/            # Controllers, Middlewares, Program.cs, Dockerfile
│   ├── tests/
│   │   ├── FleetTrack.UnitTests/      # ✅ 60 tests unitaires
│   │   └── FleetTrack.IntegrationTests/ # ✅ 22 tests d'intégration
│   └── FleetTrack.sln                 # Solution .NET
├── .github/
│   └── workflows/
│       └── dotnet-ci.yml              # 🚀 Pipeline CI/CD GitHub Actions
├── documentation/                      # 📚 Documentation du projet
├── run-tests.ps1                      # Script PowerShell d'exécution des tests
├── run-tests.sh                       # Script Bash d'exécution des tests
├── TESTS_GUIDE.md                     # Guide complet des tests
├── GITHUB_GUIDE.md                    # Guide GitHub (1000+ lignes)
└── README.md                          # Ce fichier
```

### Couches Clean Architecture

```
┌─────────────────────────────────────────┐
│         FleetTrack.API (HTTP)           │  ← Controllers, Middlewares
├─────────────────────────────────────────┤
│   FleetTrack.Application (Business)    │  ← Services, DTOs, Validators
├─────────────────────────────────────────┤
│  FleetTrack.Infrastructure (Data)      │  ← Repositories, DbContext
├─────────────────────────────────────────┤
│     FleetTrack.Domain (Core)           │  ← Entities, Enums
└─────────────────────────────────────────┘
```

**Pour plus de détails**, consultez [documentation/ARCHITECTURE_FLOW.md](documentation/ARCHITECTURE_FLOW.md)

---

## 🗄️ Base de données

### Tables principales

- **Users** : Gestion des utilisateurs et authentification (13 colonnes)
- **Roles** : Rôles et permissions (Admin, Dispatcher, Driver, Viewer)
- **Vehicles** : Gestion des véhicules (16 colonnes)
- **Drivers** : Gestion des chauffeurs (12 colonnes)
- **Missions** : Missions et trajets (14 colonnes)
- **Waypoints** : Points de passage (15 colonnes)
- **GpsPositions** : Tracking GPS (11 colonnes)
- **Alerts** : Alertes et notifications (14 colonnes)
- **MaintenanceRecords** : Historique maintenance (12 colonnes)
- **Zones** : Zones géographiques (12 colonnes)

**Pour le schéma complet**, consultez [documentation/DATABASE_SCHEMA.md](documentation/DATABASE_SCHEMA.md)

### Visualiser la base de données

**Option 1 : DB Browser for SQLite** (recommandé)
1. Téléchargez : https://sqlitebrowser.org/dl/
2. Ouvrez : `FleetTrack/src/FleetTrack.API/FleetTrack.db`

**Option 2 : Extension VSCode**
1. Installez l'extension "SQLite Viewer"
2. Clic droit sur `FleetTrack.db` → Open Database

**Option 3 : Swagger (via API)**
1. Lancez l'API : `dotnet run`
2. Ouvrez : http://localhost:5115/swagger
3. Testez les endpoints GET/POST/PUT/DELETE

---

## 🛠️ Technologies utilisées

### Backend
- **ASP.NET Core 8.0** - Framework Web API
- **Entity Framework Core 8.0** - ORM
- **SQLite / SQL Server** - Bases de données
- **SignalR** - Communication temps réel (WebSockets)
- **AutoMapper** - Mapping Entity ↔ DTO
- **FluentValidation** - Validation des DTOs
- **JWT Bearer Authentication** - Authentification sécurisée
- **BCrypt.Net** - Hachage des mots de passe

### Patterns & Architecture
- **Clean Architecture** - Séparation des responsabilités
- **Repository Pattern** - Abstraction de l'accès aux données
- **Dependency Injection** - Inversion de contrôle
- **CQRS** (partiel) - Séparation lecture/écriture
- **Soft Delete** - Suppression logique

### Outils de développement
- **Swagger / OpenAPI** - Documentation API interactive
- **Serilog** (à venir) - Logging structuré
- **xUnit** (à venir) - Tests unitaires

---

## 🔐 Authentification et Sécurité

FleetTrack utilise **JWT (JSON Web Tokens)** pour sécuriser tous les endpoints de l'API.

### Endpoints d'authentification

- `POST /api/auth/login` - Connexion (retourne access token + refresh token)
- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/refresh` - Rafraîchir le token (rotation automatique)
- `POST /api/auth/revoke/{username}` - Révoquer le token d'un utilisateur (Admin)
- `GET /api/auth/me` - Obtenir les informations de l'utilisateur connecté
- `GET /api/auth/{id}` - Obtenir un utilisateur par ID (Admin)

### Rôles et Permissions

| Rôle | Permissions |
|------|-------------|
| **Admin** | Accès complet à tous les endpoints (CRUD sur toutes les entités) |
| **Dispatcher** | Gestion des véhicules, missions, conducteurs (lecture + création + modification) |
| **Driver** | Lecture des missions assignées, mise à jour des positions GPS |
| **Viewer** | Lecture seule sur toutes les entités |

### Utilisation dans Swagger

1. Cliquez sur le bouton **"Authorize"** 🔓 en haut de Swagger
2. Connectez-vous d'abord via `/api/auth/login` pour obtenir un token
3. Copiez le token (sans "Bearer")
4. Collez-le dans le champ "Value" et cliquez **Authorize**
5. Tous vos requêtes incluront maintenant le token

**Documentation complète:** [documentation/AUTH_DOCUMENTATION.md](documentation/AUTH_DOCUMENTATION.md)

---

## 📡 Tracking GPS Temps Réel (SignalR)

FleetTrack utilise **SignalR** pour le tracking GPS en temps réel via **WebSockets**.

### Hub SignalR

**Endpoint:** `ws://localhost:5115/hubs/gps`

Le hub permet aux clients de :
- ✅ S'abonner au tracking d'un véhicule spécifique
- ✅ S'abonner à tous les véhicules
- ✅ Recevoir les positions GPS en temps réel
- ✅ Recevoir des événements (véhicule démarré, arrêté, alerte, etc.)

### Connexion avec JWT

```javascript
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5115/hubs/gps", {
    accessTokenFactory: () => yourJwtToken
  })
  .withAutomaticReconnect()
  .build();

// S'abonner à un véhicule
await connection.invoke("SubscribeToVehicle", vehicleId);

// Recevoir les positions
connection.on("ReceiveGpsPosition", (position) => {
  console.log(`Véhicule ${position.vehicleId}:`, position.latitude, position.longitude);
  // Mettre à jour la carte en temps réel
});

await connection.start();
```

### Méthodes du Hub

| Méthode | Rôle requis | Description |
|---------|-------------|-------------|
| `SubscribeToVehicle(Guid vehicleId)` | Authentifié | S'abonner aux positions d'un véhicule |
| `UnsubscribeFromVehicle(Guid vehicleId)` | Authentifié | Se désabonner |
| `SubscribeToAllVehicles()` | Authentifié | S'abonner à tous les véhicules |
| `SendGpsPosition(GpsPositionUpdateDto)` | Admin/Dispatcher/Driver | Envoyer une position GPS |
| `SendTrackingEvent(TrackingEventDto)` | Admin/Dispatcher | Envoyer un événement de tracking |

### Événements Clients

- `ReceiveGpsPosition` - Nouvelle position GPS
- `ReceiveTrackingEvent` - Événement (VehicleMoving, VehicleStopped, SpeedLimitExceeded, etc.)
- `SubscriptionConfirmed` - Confirmation d'abonnement
- `SubscribedToAllVehicles` - Abonnement global confirmé

**Documentation complète:** [documentation/SIGNALR_DOCUMENTATION.md](documentation/SIGNALR_DOCUMENTATION.md)

---

## 📡 Endpoints API principaux

### Authentication
- `POST /api/auth/login` - Connexion (retourne JWT tokens)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/refresh` - Rafraîchir le token
- `GET /api/auth/me` - Profil utilisateur

### Users (Admin uniquement)
- `GET /api/users` - Liste paginée des utilisateurs
- `GET /api/users/{id}` - Détails d'un utilisateur
- `GET /api/users/roles` - Liste des rôles disponibles
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/{id}` - Mettre à jour un utilisateur
- `DELETE /api/users/{id}` - Supprimer (soft delete)
- `POST /api/users/{id}/reset-password` - Réinitialiser le mot de passe
- `POST /api/users/{id}/activate` - Activer un compte
- `POST /api/users/{id}/deactivate` - Désactiver un compte

**Documentation complète:** [documentation/USER_MANAGEMENT.md](documentation/USER_MANAGEMENT.md)

### Vehicles
- `GET /api/vehicles` - Liste paginée
- `GET /api/vehicles/{id}` - Détails d'un véhicule
- `POST /api/vehicles` - Créer un véhicule
- `PUT /api/vehicles/{id}` - Mettre à jour
- `DELETE /api/vehicles/{id}` - Supprimer (soft delete)

### Drivers, Missions, Alerts, Maintenance...
Même structure pour toutes les entités.

**Swagger complet :** http://localhost:5115/swagger

---

## 🐛 Debugging

### Debugger dans VSCode

1. **Ouvrir le projet** dans VSCode
2. **Appuyer sur F5** (Start Debugging)
3. **Mettre des breakpoints** dans vos controllers
4. **Faire une requête** via Swagger
5. **Le code s'arrête** sur vos breakpoints

**Guide complet :** Consultez [documentation/ARCHITECTURE_FLOW.md](documentation/ARCHITECTURE_FLOW.md) - Section Debugging

### Configurations disponibles

- `C#: FleetTrack.API (Debug)` - Mode debug avec Swagger
- `C#: FleetTrack.API (Release)` - Mode release
- `C#: FleetTrack [Default Configuration]` - Configuration par défaut

---

## 📝 Guide de développement

### Ajouter une nouvelle entité

1. Créer l'entité dans `FleetTrack.Domain/Entities/`
2. Créer les DTOs dans `FleetTrack.Application/DTOs/`
3. Créer le service dans `FleetTrack.Application/Services/`
4. Créer le repository dans `FleetTrack.Infrastructure/Repositories/`
5. Créer la configuration EF dans `FleetTrack.Infrastructure/Data/Configurations/`
6. Créer le controller dans `FleetTrack.API/Controllers/`
7. Créer une migration : `dotnet ef migrations add NomMigration`
8. Appliquer : `dotnet ef database update`

### Créer une migration

```bash
cd FleetTrack/src/FleetTrack.API
dotnet ef migrations add NomDeLaMigration --project ../FleetTrack.Infrastructure/FleetTrack.Infrastructure.csproj
dotnet ef database update --project ../FleetTrack.Infrastructure/FleetTrack.Infrastructure.csproj
```

---

## 🧪 Tests

FleetTrack dispose d'une suite de tests complète avec **101 tests** (100% de réussite) et une excellente couverture de code.

### Tests Unitaires (79 tests) ✅

**Framework:** xUnit 2.5.3, Moq 4.20.72, FluentAssertions 8.8.0

- ✅ **AuthServiceTests** (19 tests)
  - Login avec validation des credentials
  - Register avec validation unicité username/email
  - RefreshToken avec rotation automatique
  - RevokeToken, GetUserById, GetUserByUsername

- ✅ **VehicleServiceTests** (20 tests)
  - GetAllAsync, GetByIdAsync, GetAvailableAsync
  - CreateAsync avec validation métier
  - UpdateAsync, DeleteAsync (soft delete)

- ✅ **DriverServiceTests** (18 tests)
  - GetAllAsync avec filtres
  - GetAvailableAsync
  - Validation du numéro de permis

- ✅ **MissionServiceTests** (22 tests)
  - Validation complexe de création
  - Vérification disponibilité véhicule/conducteur
  - Contrôle d'expiration du permis

### Tests d'Intégration (22 tests) ✅

**Framework:** Microsoft.AspNetCore.Mvc.Testing, EF Core InMemory

- ✅ **VehiclesControllerTests** (12 tests)
  - GET /api/vehicles
  - POST /api/vehicles
  - PUT /api/vehicles/{id}
  - DELETE /api/vehicles/{id}

- ✅ **DriversControllerTests** (10 tests)
  - CRUD complet des conducteurs
  - Validation des endpoints API

### Exécution des Tests

**Tous les tests (82)**
```bash
dotnet test
```

**Tests unitaires uniquement**
```bash
dotnet test FleetTrack/tests/FleetTrack.UnitTests/FleetTrack.UnitTests.csproj
```

**Tests d'intégration uniquement**
```bash
dotnet test FleetTrack/tests/FleetTrack.IntegrationTests/FleetTrack.IntegrationTests.csproj
```

**Avec scripts automatisés**
```powershell
# Windows
.\run-tests.ps1 all          # Tous les tests
.\run-tests.ps1 unit         # Tests unitaires
.\run-tests.ps1 integration  # Tests d'intégration
.\run-tests.ps1 coverage     # Avec rapport de couverture HTML
.\run-tests.ps1 watch        # Mode watch pour TDD
```

```bash
# Linux/Mac
./run-tests.sh all
./run-tests.sh coverage
```

**Résultats attendus:**
```
✅ 79 tests unitaires passés (AuthService: 19, VehicleService: 20, DriverService: 18, MissionService: 22)
✅ 22 tests d'intégration passés
✅ 101 tests au total - 100% de réussite
⏱️ Temps d'exécution: ~6 secondes
```

Pour plus de détails, consultez [TESTS_GUIDE.md](TESTS_GUIDE.md).

---

## 🚀 CI/CD Pipeline

FleetTrack utilise **GitHub Actions** pour l'intégration et le déploiement continus.

### Workflow Automatisé

À chaque `push` ou `pull request` sur `main` ou `develop`:

1. ✅ **Setup .NET 8.0** - Configuration de l'environnement
2. ✅ **Restore dependencies** - Restauration des packages NuGet
3. ✅ **Build solution** - Compilation en mode Release
4. ✅ **Run Unit Tests** - Exécution des 79 tests unitaires (incluant AuthService)
5. ✅ **Run Integration Tests** - Exécution des 22 tests d'intégration
6. ✅ **Upload Test Results** - Sauvegarde des rapports .trx
7. ✅ **Publish Test Report** - Publication des résultats
8. ✅ **Code Coverage Report** - Génération du rapport de couverture
9. ✅ **Build Docker Image** - Construction de l'image Docker (main uniquement)

### Visualisation

Consultez les résultats en temps réel:
```
https://github.com/loicKonan123/FleetTrack/actions
```

Tous les workflows récents affichent un statut ✅ **Success**.

### Docker

**Image Docker disponible** pour déploiement en production.

**Construire l'image:**
```bash
docker build -t fleettrack-api:latest -f FleetTrack/src/FleetTrack.API/Dockerfile ./FleetTrack
```

**Lancer le conteneur:**
```bash
docker run -p 8080:8080 --name fleettrack fleettrack-api:latest
```

**Accéder à l'API:**
- API: `http://localhost:8080/api`
- Health: `http://localhost:8080/health`

---

## 🚦 Statut du projet

| Fonctionnalité | Statut |
|----------------|--------|
| Architecture Clean | ✅ Complète |
| Domain Layer | ✅ Complète (11 entités: +Users, +Roles) |
| Application Layer | ✅ Complète (Services, DTOs, Validators) |
| Infrastructure Layer | ✅ Complète (Repositories, EF Core, AuthService, GpsTrackingService) |
| API Layer | ✅ Complète (Controllers, Middlewares, JWT, SignalR Hub) |
| Base de données SQLite | ✅ Opérationnelle |
| **Authentification JWT** | ✅ **Complète (Login, Register, Refresh, Roles)** |
| **SignalR GPS Tracking** | ✅ **Complète (Hub, DTOs, Service, WebSockets temps réel)** |
| Documentation | ✅ Complète (~158+ KB avec AUTH + SIGNALR) |
| Tests unitaires | ✅ **79 tests - 100% passés** |
| Tests d'intégration | ✅ **22 tests - 100% passés** |
| CI/CD Pipeline | ✅ **GitHub Actions opérationnel** |
| Docker | ✅ **Dockerfile créé et fonctionnel** |
| Scripts de test | ✅ **PowerShell + Bash** |
| Couverture de code | ✅ **Rapports automatisés** |
| Background Jobs | ⏳ À venir |
| Notifications Push | ⏳ À venir |

---

## 📞 Support

Pour toute question ou problème :
1. Consultez la [documentation complète](documentation/)
2. Vérifiez les issues GitHub
3. Contactez l'équipe de développement

---

## 📄 Licence

Ce projet est développé dans un cadre éducatif/professionnel.

---

## 👥 Contributeurs

- **Équipe FleetTrack Development**
- Date de création : Décembre 2025

---

**🎯 Prochaine étape recommandée :** Consultez [documentation/INDEX.md](documentation/INDEX.md) pour explorer toute la documentation !

