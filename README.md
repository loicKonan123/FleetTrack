# 🚚 FleetTrack - Système de Gestion de Flotte

**Version:** 1.0
**Date:** 2025-12-20
**Framework:** .NET 8.0
**Architecture:** Clean Architecture

---

## 📖 À propos

FleetTrack est un système complet de gestion de flotte de véhicules développé avec **ASP.NET Core 8** et **Clean Architecture**. Il permet de gérer les véhicules, chauffeurs, missions, tracking GPS, alertes et maintenance.

### Fonctionnalités principales

✅ Gestion complète des **véhicules** (camions, voitures, motos, bus)
✅ Gestion des **chauffeurs** avec permis et statuts
✅ Planification et suivi des **missions**
✅ **Tracking GPS** en temps réel
✅ Système d'**alertes** (vitesse, carburant, maintenance)
✅ Gestion de la **maintenance** (préventive et corrective)
✅ **Geofencing** avec zones géographiques
✅ API REST complète avec **Swagger**
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
│   └── src/
│       ├── FleetTrack.Domain/         # Entités, Enums (couche métier)
│       ├── FleetTrack.Application/    # Services, DTOs, Interfaces
│       ├── FleetTrack.Infrastructure/ # Repositories, DbContext, EF Core
│       └── FleetTrack.API/            # Controllers, Middlewares, Program.cs
├── documentation/                      # 📚 TOUTE LA DOCUMENTATION
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
- **AutoMapper** - Mapping Entity ↔ DTO
- **FluentValidation** - Validation des DTOs

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

## 📡 Endpoints API principaux

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

## 🧪 Tests (à venir)

- Tests unitaires avec **xUnit**
- Tests d'intégration avec **WebApplicationFactory**
- Couverture de code avec **Coverlet**

---

## 🚦 Statut du projet

| Fonctionnalité | Statut |
|----------------|--------|
| Architecture Clean | ✅ Complète |
| Domain Layer | ✅ Complète (9 entités) |
| Application Layer | ✅ Complète (Services, DTOs, Validators) |
| Infrastructure Layer | ✅ Complète (Repositories, EF Core) |
| API Layer | ✅ Complète (Controllers, Middlewares) |
| Base de données SQLite | ✅ Opérationnelle |
| Documentation | ✅ Complète (~90 KB) |
| Tests unitaires | ⏳ À venir |
| Tests d'intégration | ⏳ À venir |
| SignalR (temps réel) | ⏳ À venir |
| Background Jobs | ⏳ À venir |
| Authentification JWT | ⏳ À venir |

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
