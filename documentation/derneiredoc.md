# FleetTrack - Documentation Technique Complète

> Dernière mise à jour : 27 décembre 2025

---

## Table des matières

1. [Architecture Globale](#1-architecture-globale)
2. [Système d'Utilisateurs](#2-système-dutilisateurs)
3. [Schéma de Base de Données](#3-schéma-de-base-de-données)
4. [Endpoints API](#4-endpoints-api)
5. [SignalR (Temps Réel)](#5-signalr-temps-réel)
6. [Frontend (Next.js)](#6-frontend-nextjs)
7. [Sécurité](#7-sécurité)
8. [Configuration](#8-configuration)

---

## 1. Architecture Globale

FleetTrack utilise une **Clean Architecture** en 4 couches :

```
┌──────────────────────────────────────────────────────────────┐
│                    FleetTrack.API                            │
│           (Controllers, Hubs SignalR, Middleware)            │
├──────────────────────────────────────────────────────────────┤
│                FleetTrack.Application                        │
│           (DTOs, Interfaces, Validators, Services)           │
├──────────────────────────────────────────────────────────────┤
│               FleetTrack.Infrastructure                      │
│      (DbContext, Repositories, Services, Migrations)         │
├──────────────────────────────────────────────────────────────┤
│                  FleetTrack.Domain                           │
│              (Entities, Enums - Cœur métier)                 │
└──────────────────────────────────────────────────────────────┘
```

### Structure des dossiers

```
FleetTrack/
├── src/
│   ├── FleetTrack.Domain/
│   │   ├── Entities/
│   │   │   ├── BaseEntity.cs
│   │   │   ├── User.cs
│   │   │   ├── Role.cs
│   │   │   ├── Vehicle.cs
│   │   │   ├── Driver.cs
│   │   │   ├── Mission.cs
│   │   │   ├── Waypoint.cs
│   │   │   ├── GpsPosition.cs
│   │   │   ├── TrackingSession.cs
│   │   │   ├── Alert.cs
│   │   │   ├── Maintenance.cs
│   │   │   └── Zone.cs
│   │   └── Enums/
│   │       ├── VehicleStatus.cs
│   │       ├── DriverStatus.cs
│   │       ├── MissionStatus.cs
│   │       └── ...
│   ├── FleetTrack.Application/
│   │   ├── Interfaces/
│   │   │   ├── IAuthService.cs
│   │   │   ├── IUserService.cs
│   │   │   ├── IVehicleService.cs
│   │   │   └── ...
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   ├── User/
│   │   │   ├── Vehicle/
│   │   │   └── ...
│   │   └── Validators/
│   ├── FleetTrack.Infrastructure/
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   ├── GpsTrackingService.cs
│   │   │   ├── TrackingSessionService.cs
│   │   │   └── PasswordHasher.cs
│   │   ├── Data/
│   │   │   ├── FleetTrackDbContext.cs
│   │   │   ├── DataSeeder.cs
│   │   │   └── Migrations/
│   │   └── Repositories/
│   └── FleetTrack.API/
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── UsersController.cs
│       │   ├── VehiclesController.cs
│       │   ├── DriversController.cs
│       │   ├── MissionsController.cs
│       │   └── TrackingSessionsController.cs
│       ├── Hubs/
│       │   ├── GpsHub.cs
│       │   └── IGpsClient.cs
│       ├── Extensions/
│       │   └── ServiceExtensions.cs
│       └── Program.cs
└── tests/
    ├── FleetTrack.UnitTests/
    └── FleetTrack.IntegrationTests/
```

---

## 2. Système d'Utilisateurs

### 2.1 Les 4 Rôles

| Rôle | Permissions | Cas d'usage |
|------|-------------|-------------|
| **Admin** | Accès complet | Gestion utilisateurs, véhicules, conducteurs, missions |
| **Dispatcher** | Créer/modifier missions et véhicules | Répartiteur de flotte |
| **Driver** | Voir/modifier ses propres missions, envoyer GPS | Conducteur terrain |
| **Viewer** | Lecture seule | Supervision, rapports |

### 2.2 Entité User

```csharp
// FleetTrack.Domain/Entities/User.cs
public class User : BaseEntity
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }      // BCrypt
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginDate { get; set; }

    // Refresh Token pour JWT
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Relations
    public Guid RoleId { get; set; }
    public Role Role { get; set; }
    public Guid? DriverId { get; set; }           // Lien optionnel vers Driver
    public Driver? Driver { get; set; }
}
```

### 2.3 Flux d'Authentification

```
┌─────────────┐     POST /api/auth/login      ┌─────────────────┐
│   Frontend  │ ────────────────────────────► │   AuthService   │
│             │     { username, password }    │                 │
└─────────────┘                               └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Vérifier BCrypt │
                                              │   PasswordHash  │
                                              └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Générer JWT +   │
                                              │ Refresh Token   │
                                              └────────┬────────┘
                                                       │
◄──────────────────────────────────────────────────────┘
   { accessToken, refreshToken, expiresAt, user }
```

### 2.4 Claims JWT

Chaque token contient :

```json
{
  "sub": "user-guid",           // ID utilisateur
  "name": "admin",              // Username
  "email": "admin@fleet.com",
  "given_name": "Admin",
  "family_name": "User",
  "role": "Admin",              // Nom du rôle
  "role_id": "role-guid",
  "jti": "unique-token-id",
  "exp": 1737936000             // Expiration (30 jours)
}
```

### 2.5 Compte Admin par Défaut

```
Username: admin
Password: Admin123!
Rôle: Admin
```

---

## 3. Schéma de Base de Données

### 3.1 Diagramme des Entités

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │────►│      Role       │     │     Vehicle     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ Username        │     │ Name            │     │ RegistrationNo  │
│ Email           │     │ Description     │     │ Brand, Model    │
│ PasswordHash    │     └─────────────────┘     │ Type, Status    │
│ RefreshToken    │                             │ FuelType        │
│ RoleId ─────────┘                             │ CurrentDriverId │
│ DriverId ───────────────────────────────┐     └────────┬────────┘
└─────────────────┘                       │              │
                                          │              │
┌─────────────────┐                       ▼              │
│     Driver      │◄──────────────────────┘              │
├─────────────────┤                                      │
│ FirstName       │◄─────────────────────────────────────┘
│ LastName        │
│ LicenseNumber   │     ┌─────────────────┐
│ LicenseExpiry   │     │    Mission      │
│ Status          │◄────┤─────────────────┤
│ CurrentVehicleId│     │ Name            │
└─────────────────┘     │ Description     │
                        │ Status, Priority│
                        │ StartDate       │
                        │ VehicleId ──────┼───► Vehicle
                        │ DriverId ───────┼───► Driver
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   Waypoint      │
                        ├─────────────────┤
                        │ Name, Address   │
                        │ Lat, Lng        │
                        │ Order           │
                        │ IsCompleted     │
                        │ MissionId       │
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ TrackingSession │     │   GpsPosition   │     │     Alert       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ VehicleId       │     │ VehicleId       │     │ VehicleId       │
│ DriverId        │◄────│ SessionId       │     │ Type, Severity  │
│ MissionId       │     │ Lat, Lng        │     │ Title, Message  │
│ StartedAt       │     │ Speed, Heading  │     │ IsAcknowledged  │
│ EndedAt         │     │ Timestamp       │     │ IsResolved      │
│ IsActive        │     └─────────────────┘     └─────────────────┘
│ LastLat, LastLng│
│ PositionsCount  │     ┌─────────────────┐     ┌─────────────────┐
│ TotalDistance   │     │   Maintenance   │     │      Zone       │
└─────────────────┘     ├─────────────────┤     ├─────────────────┤
                        │ VehicleId       │     │ Name            │
                        │ Type            │     │ CenterLat/Lng   │
                        │ ScheduledDate   │     │ Radius          │
                        │ Cost            │     │ Type            │
                        │ IsCompleted     │     │ IsActive        │
                        └─────────────────┘     └─────────────────┘
```

### 3.2 Énumérations

| Enum | Valeurs |
|------|---------|
| **VehicleStatus** | Active, Inactive, Maintenance, Decommissioned |
| **VehicleType** | Car, Van, Truck, Motorcycle, Bus |
| **FuelType** | Diesel, Gasoline, Electric, Hybrid, LPG |
| **DriverStatus** | Active, OnMission, OnLeave, Unavailable, Retired |
| **MissionStatus** | Planned, Assigned, InProgress, Completed, Cancelled |
| **MissionPriority** | Low, Medium, High, Urgent |
| **WaypointType** | Pickup, Delivery, Stop, Checkpoint |
| **AlertType** | SpeedViolation, FuelLow, MaintenanceNeeded, GeoFenceViolation |
| **AlertSeverity** | Info, Warning, Critical |

---

## 4. Endpoints API

### 4.1 Auth (`/api/auth`)

| Méthode | Endpoint | Auth | Rôle | Description |
|---------|----------|------|------|-------------|
| POST | `/login` | ❌ | - | Connexion utilisateur |
| POST | `/register` | ❌ | - | Inscription |
| POST | `/refresh` | ❌ | - | Rafraîchir access token |
| POST | `/revoke/{username}` | ✅ | Admin | Révoquer refresh token |
| GET | `/me` | ✅ | - | Profil utilisateur connecté |
| GET | `/{id}` | ✅ | Admin | Détails utilisateur par ID |

### 4.2 Users (`/api/users`) - Admin uniquement

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste paginée des utilisateurs |
| GET | `/{id}` | Détails utilisateur |
| GET | `/role/{roleId}` | Filtrer par rôle |
| POST | `/` | Créer utilisateur |
| PUT | `/{id}` | Modifier utilisateur |
| DELETE | `/{id}` | Supprimer (soft delete) |
| POST | `/{id}/reset-password` | Réinitialiser mot de passe |
| POST | `/{id}/activate` | Activer compte |
| POST | `/{id}/deactivate` | Désactiver compte |
| GET | `/roles` | Liste des rôles disponibles |

### 4.3 Vehicles (`/api/vehicles`)

| Méthode | Endpoint | Rôle | Description |
|---------|----------|------|-------------|
| GET | `/` | All | Liste paginée |
| GET | `/{id}` | All | Détails véhicule |
| GET | `/{id}/details` | All | Détails complets |
| GET | `/available` | All | Véhicules disponibles |
| GET | `/status/{status}` | All | Filtrer par statut |
| POST | `/` | Admin/Dispatcher | Créer véhicule |
| PUT | `/{id}` | Admin/Dispatcher | Modifier véhicule |
| DELETE | `/{id}` | Admin | Supprimer véhicule |

### 4.4 Drivers (`/api/drivers`)

| Méthode | Endpoint | Rôle | Description |
|---------|----------|------|-------------|
| GET | `/` | All | Liste paginée |
| GET | `/{id}` | All | Détails conducteur |
| GET | `/available` | All | Conducteurs disponibles |
| GET | `/status/{status}` | All | Filtrer par statut |
| POST | `/` | Admin/Dispatcher | Créer conducteur |
| PUT | `/{id}` | Admin/Dispatcher | Modifier conducteur |
| DELETE | `/{id}` | Admin | Supprimer conducteur |

### 4.5 Missions (`/api/missions`)

| Méthode | Endpoint | Rôle | Description |
|---------|----------|------|-------------|
| GET | `/` | All | Liste paginée (avec filtres) |
| GET | `/{id}` | All | Détails mission |
| GET | `/active` | All | Missions actives |
| GET | `/status/{status}` | All | Filtrer par statut |
| POST | `/` | Admin/Dispatcher | Créer mission |
| PUT | `/{id}` | Admin/Dispatcher | Modifier mission |
| PATCH | `/{id}/status` | Admin/Dispatcher/Driver | Changer statut |
| POST | `/{id}/assign` | Admin/Dispatcher | Assigner véhicule/conducteur |
| DELETE | `/{id}` | Admin | Supprimer mission |

### 4.6 Tracking Sessions (`/api/trackingsessions`)

| Méthode | Endpoint | Rôle | Description |
|---------|----------|------|-------------|
| GET | `/active` | Admin/Dispatcher | Sessions actives |
| GET | `/{id}` | All | Session par ID |
| GET | `/vehicle/{vehicleId}/active` | All | Session active d'un véhicule |
| GET | `/vehicle/{vehicleId}/history` | All | Historique sessions |
| POST | `/start` | Admin/Dispatcher/Driver | Démarrer session |
| POST | `/{id}/stop` | Admin/Dispatcher/Driver | Arrêter session |
| POST | `/vehicle/{vehicleId}/stop` | Admin/Dispatcher | Arrêter sessions véhicule |

---

## 5. SignalR (Temps Réel)

### 5.1 Hub GPS (`/hubs/gps`)

#### Méthodes Client → Serveur

```typescript
// S'abonner aux véhicules
connection.invoke('SubscribeToAllVehicles');
connection.invoke('SubscribeToVehicle', vehicleId);
connection.invoke('UnsubscribeFromVehicle', vehicleId);
connection.invoke('UnsubscribeFromAllVehicles');

// Envoyer position GPS (conducteur)
connection.invoke('SendGpsPosition', {
  vehicleId: 'guid',
  latitude: 48.8566,
  longitude: 2.3522,
  speed: 50,
  heading: 180,
  timestamp: '2025-12-27T10:00:00Z'
});

// Gestion sessions
connection.invoke('StartTrackingSession', {
  vehicleId: 'guid',
  driverName: 'Jean Dupont',
  driverPhone: '0612345678',
  missionId: 'guid' // optionnel
});
connection.invoke('StopTrackingSession');
connection.invoke('ForceStopVehicleTracking', vehicleId, 'Raison');
connection.invoke('GetActiveSessions');
```

#### Événements Serveur → Client

```typescript
// Réception position GPS
connection.on('ReceiveGpsPosition', (position) => {
  console.log('Position:', position.latitude, position.longitude);
});

// Événements de session
connection.on('SessionStarted', (session) => { });
connection.on('SessionStopped', (sessionId, vehicleId) => { });
connection.on('SessionUpdated', (session) => { });

// Demande d'arrêt par admin
connection.on('StopTrackingRequested', (vehicleId, reason) => { });

// Confirmations d'abonnement
connection.on('SubscriptionConfirmed', (vehicleId) => { });
connection.on('SubscribedToAllVehicles', () => { });
```

### 5.2 Groupes SignalR

| Groupe | Description |
|--------|-------------|
| `all` | Tous les clients connectés |
| `all_vehicles` | Abonnés à tous les véhicules |
| `vehicle_{id}` | Abonnés à un véhicule spécifique |
| `driver_{vehicleId}` | Conducteur actif d'un véhicule |

---

## 6. Frontend (Next.js)

### 6.1 Structure des Pages

```
fleettrack-frontend/src/app/
├── (admin)/                    # Layout admin (sidebar)
│   ├── dashboard/page.tsx      # Tableau de bord
│   ├── tracking/page.tsx       # Suivi temps réel
│   ├── vehicles/               # Gestion véhicules
│   │   ├── page.tsx           # Liste
│   │   ├── [id]/page.tsx      # Détails/édition
│   │   └── new/page.tsx       # Création
│   ├── drivers/                # Gestion conducteurs
│   ├── missions/               # Gestion missions
│   ├── users/                  # Gestion utilisateurs (admin)
│   └── layout.tsx              # Layout avec sidebar
├── (auth)/
│   └── login/page.tsx          # Page de connexion
└── (driver)/
    ├── driver-tracking/page.tsx # Interface conducteur GPS
    └── layout.tsx
```

### 6.2 Hooks Principaux

| Hook | Fichier | Rôle |
|------|---------|------|
| `useAuth` | `lib/hooks/useAuth.ts` | Authentification, token |
| `useSignalR` | `lib/hooks/useSignalR.ts` | Connexion WebSocket |
| `useGpsTracking` | `lib/hooks/useGpsTracking.ts` | Positions GPS temps réel |
| `useTrackingSessions` | `lib/hooks/useTrackingSessions.ts` | Sessions de tracking |

### 6.3 API Client

```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour refresh automatique du token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tenter de rafraîchir le token
      await refreshToken();
      // Rejouer la requête
    }
  }
);
```

---

## 7. Sécurité

### 7.1 Authentification

- **Mots de passe** : BCrypt avec salt automatique
- **JWT** : HMAC SHA-256, expiration 30 jours
- **Refresh Tokens** : Rotation à chaque usage, révocation possible

### 7.2 Autorisation

```csharp
// Exemple d'autorisation par rôle
[Authorize(Roles = "Admin")]
public async Task<IActionResult> DeleteUser(Guid id) { }

[Authorize(Roles = "Admin,Dispatcher")]
public async Task<IActionResult> CreateMission(CreateMissionDto dto) { }

[Authorize(Roles = "Admin,Dispatcher,Driver")]
public async Task<IActionResult> UpdateMissionStatus(Guid id) { }
```

### 7.3 Protection des Données

- **Soft Delete** : Les données ne sont jamais supprimées physiquement
- **Audit** : `CreatedAt` et `UpdatedAt` sur toutes les entités
- **CORS** : Configuration stricte par environnement

---

## 8. Configuration

### 8.1 appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=fleettrack.db"
  },
  "Jwt": {
    "Secret": "VotreCléSecrèteTrèsLongueAuMoins32Caractères",
    "Issuer": "FleetTrack.API",
    "Audience": "FleetTrack.Client",
    "ExpirationMinutes": "43200",
    "RefreshTokenExpirationDays": "30"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### 8.2 Variables d'environnement Frontend

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5115/api
NEXT_PUBLIC_SIGNALR_HUB_URL=http://localhost:5115/hubs/gps
```

### 8.3 Démarrage

```bash
# Backend
cd FleetTrack/src/FleetTrack.API
dotnet run

# Frontend
cd fleettrack-frontend
npm run dev
```

---

## Annexe : Commandes Utiles

```bash
# Créer une migration
dotnet ef migrations add NomMigration -p src/FleetTrack.Infrastructure -s src/FleetTrack.API

# Appliquer les migrations
dotnet ef database update -p src/FleetTrack.Infrastructure -s src/FleetTrack.API

# Lancer les tests
dotnet test

# Build production
dotnet publish -c Release -o ./publish
```

---

*Documentation générée automatiquement pour le projet FleetTrack*
