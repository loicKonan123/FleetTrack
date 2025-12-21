# 🗄️ FleetTrack - Schéma de Base de Données

## 📚 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Diagramme ERD](#diagramme-erd)
3. [Tables](#tables)
4. [Relations](#relations)
5. [Index](#index)
6. [Enums et Types](#enums-et-types)
7. [Exemples de données](#exemples-de-données)

---

## 🎯 Vue d'ensemble

**Base de données:** FleetTrack.db (SQLite)
**Version:** 1.0
**Date de création:** 2025-12-20
**Nombre de tables:** 8
**Type:** SQLite 3

### Architecture des données
- **Soft Delete:** Toutes les tables héritent de `BaseEntity` avec support du soft delete (`IsDeleted`)
- **Audit Trail:** Champs `CreatedAt` et `UpdatedAt` sur toutes les tables
- **Identifiants:** GUID (UUID) pour tous les IDs

### Tables principales
| Table | Description | Nombre de colonnes |
|-------|-------------|-------------------|
| **Vehicles** | Gestion des véhicules de la flotte | 16 |
| **Drivers** | Gestion des chauffeurs | 12 |
| **Missions** | Missions et trajets assignés | 14 |
| **GpsPositions** | Positions GPS des véhicules | 11 |
| **Alerts** | Alertes et notifications | 14 |
| **MaintenanceRecords** | Historique de maintenance | 12 |
| **Waypoints** | Points de passage des missions | 15 |
| **Zones** | Zones géographiques (geofencing) | 12 |

---

## 📊 Diagramme ERD

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLEET MANAGEMENT SYSTEM                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐              ┌──────────────────┐              ┌──────────────────┐
│    VEHICLES      │◄────────────►│     DRIVERS      │              │      ZONES       │
│                  │  1:1 Current  │                  │              │                  │
├──────────────────┤  Assignment   ├──────────────────┤              ├──────────────────┤
│ Id (PK)          │              │ Id (PK)          │              │ Id (PK)          │
│ RegistrationNum  │              │ FirstName        │              │ Name             │
│ Brand            │              │ LastName         │              │ Type             │
│ Model            │              │ Email            │              │ CenterLatitude   │
│ Year             │              │ PhoneNumber      │              │ CenterLongitude  │
│ Type             │              │ LicenseNumber    │              │ RadiusInMeters   │
│ Status           │              │ LicenseExpiry    │              │ Coordinates      │
│ FuelType         │              │ Status           │              │ IsActive         │
│ FuelCapacity     │              │ CurrentVehicleId │              │ Color            │
│ CurrentFuelLevel │              │ LastActiveDate   │              └──────────────────┘
│ Mileage          │              │ CreatedAt        │
│ LastMaintenance  │              │ UpdatedAt        │
│ NextMaintenance  │              │ IsDeleted        │
│ CurrentDriverId  │              └──────────────────┘
│ CreatedAt        │                       │
│ UpdatedAt        │                       │
│ IsDeleted        │                       │
└─────────┬────────┘                       │
          │                                │
          │1                               │*
          │                                │
          │*                        ┌──────▼──────────┐
    ┌─────▼──────────┐              │    MISSIONS     │
    │  GPSPOSITIONS  │              │                 │
    │                │              ├─────────────────┤
    ├────────────────┤              │ Id (PK)         │
    │ Id (PK)        │              │ Name            │
    │ VehicleId (FK) │              │ Description     │
    │ Latitude       │              │ Status          │
    │ Longitude      │              │ Priority        │
    │ Altitude       │              │ VehicleId (FK)  │───┐
    │ Speed          │              │ DriverId (FK)   │───┤
    │ Heading        │              │ StartDate       │   │
    │ Timestamp      │              │ EndDate         │   │
    │ Accuracy       │              │ ActualStartDate │   │
    │ CreatedAt      │              │ ActualEndDate   │   │
    │ UpdatedAt      │              │ EstimatedDist   │   │
    │ IsDeleted      │              │ ActualDistance  │   │
    └────────────────┘              │ CreatedAt       │   │
          │                         │ UpdatedAt       │   │
          │                         │ IsDeleted       │   │
          │                         └────────┬────────┘   │
          │                                  │            │
          │1                                 │1           │
          │                                  │            │
          │*                                 │*           │
    ┌─────▼──────────┐              ┌───────▼────────┐   │
    │     ALERTS     │              │   WAYPOINTS    │   │
    │                │              │                │   │
    ├────────────────┤              ├────────────────┤   │
    │ Id (PK)        │              │ Id (PK)        │   │
    │ VehicleId (FK) │              │ MissionId (FK) │   │
    │ Type           │              │ Name           │   │
    │ Severity       │              │ Address        │   │
    │ Title          │              │ Latitude       │   │
    │ Message        │              │ Longitude      │   │
    │ TriggeredAt    │              │ Type           │   │
    │ IsAcknowledged │              │ Order          │   │
    │ AcknowledgedAt │              │ PlannedArrival │   │
    │ AcknowledgedBy │              │ ActualArrival  │   │
    │ IsResolved     │              │ PlannedDepartu │   │
    │ ResolvedAt     │              │ ActualDeparture│   │
    │ Resolution     │              │ IsCompleted    │   │
    │ CreatedAt      │              │ Notes          │   │
    │ UpdatedAt      │              │ CreatedAt      │   │
    │ IsDeleted      │              │ UpdatedAt      │   │
    └────────────────┘              │ IsDeleted      │   │
                                    └────────────────┘   │
          │                                              │
          │1                                             │
          │                                              │
          │*                                             │
    ┌─────▼────────────────┐                            │
    │ MAINTENANCERECORDS   │◄───────────────────────────┘
    │                      │           1:*
    ├──────────────────────┤
    │ Id (PK)              │
    │ VehicleId (FK)       │
    │ Type                 │
    │ Description          │
    │ ScheduledDate        │
    │ CompletedDate        │
    │ MileageAtMaintenance │
    │ Cost                 │
    │ ServiceProvider      │
    │ Notes                │
    │ IsCompleted          │
    │ CreatedAt            │
    │ UpdatedAt            │
    │ IsDeleted            │
    └──────────────────────┘

Légende:
─────  Relation 1:1 (One-to-One)
━━━━━  Relation 1:* (One-to-Many)
PK     Primary Key
FK     Foreign Key
```

---

## 📋 Tables

### 1. Vehicles (Véhicules)

**Description:** Table centrale contenant tous les véhicules de la flotte.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `Id` | TEXT (GUID) | PRIMARY KEY | Identifiant unique du véhicule |
| `RegistrationNumber` | TEXT | REQUIRED, UNIQUE | Numéro d'immatriculation |
| `Brand` | TEXT | REQUIRED | Marque du véhicule (Toyota, Mercedes, etc.) |
| `Model` | TEXT | REQUIRED | Modèle du véhicule |
| `Year` | INTEGER | REQUIRED | Année de fabrication |
| `Type` | INTEGER | REQUIRED | Type de véhicule (enum VehicleType) |
| `Status` | INTEGER | REQUIRED | Statut actuel (enum VehicleStatus) |
| `FuelType` | INTEGER | REQUIRED | Type de carburant (enum FuelType) |
| `FuelCapacity` | REAL | REQUIRED | Capacité du réservoir en litres |
| `CurrentFuelLevel` | REAL | REQUIRED | Niveau de carburant actuel en litres |
| `Mileage` | INTEGER | REQUIRED | Kilométrage total |
| `LastMaintenanceDate` | TEXT (DateTime) | NULLABLE | Date de dernière maintenance |
| `NextMaintenanceDate` | TEXT (DateTime) | NULLABLE | Date de prochaine maintenance |
| `CurrentDriverId` | TEXT (GUID) | NULLABLE, FK → Drivers | Chauffeur actuellement assigné |
| `CreatedAt` | TEXT (DateTime) | REQUIRED | Date de création |
| `UpdatedAt` | TEXT (DateTime) | REQUIRED | Date de dernière modification |
| `IsDeleted` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Soft delete flag |

**Index:**
- `IX_Vehicles_RegistrationNumber` (UNIQUE)
- `IX_Vehicles_Status`
- `IX_Vehicles_CurrentDriverId`
- Global query filter sur `IsDeleted = 0`

---

### 2. Drivers (Chauffeurs)

**Description:** Gestion des chauffeurs de la flotte.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `Id` | TEXT (GUID) | PRIMARY KEY | Identifiant unique du chauffeur |
| `FirstName` | TEXT | REQUIRED | Prénom |
| `LastName` | TEXT | REQUIRED | Nom de famille |
| `Email` | TEXT | REQUIRED, UNIQUE | Adresse email |
| `PhoneNumber` | TEXT | REQUIRED | Numéro de téléphone |
| `LicenseNumber` | TEXT | REQUIRED, UNIQUE | Numéro de permis de conduire |
| `LicenseExpiryDate` | TEXT (DateTime) | REQUIRED | Date d'expiration du permis |
| `Status` | INTEGER | REQUIRED | Statut du chauffeur (enum DriverStatus) |
| `CurrentVehicleId` | TEXT (GUID) | NULLABLE, FK → Vehicles | Véhicule actuellement assigné |
| `LastActiveDate` | TEXT (DateTime) | NULLABLE | Dernière activité enregistrée |
| `CreatedAt` | TEXT (DateTime) | REQUIRED | Date de création |
| `UpdatedAt` | TEXT (DateTime) | REQUIRED | Date de dernière modification |
| `IsDeleted` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Soft delete flag |

**Index:**
- `IX_Drivers_Email` (UNIQUE)
- `IX_Drivers_LicenseNumber` (UNIQUE)
- `IX_Drivers_Status`
- `IX_Drivers_CurrentVehicleId`

---

### 3. Missions

**Description:** Missions et trajets assignés aux véhicules et chauffeurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `Id` | TEXT (GUID) | PRIMARY KEY | Identifiant unique de la mission |
| `Name` | TEXT | REQUIRED | Nom de la mission |
| `Description` | TEXT | REQUIRED | Description détaillée |
| `Status` | INTEGER | REQUIRED | Statut de la mission (enum MissionStatus) |
| `Priority` | INTEGER | REQUIRED | Priorité (enum MissionPriority) |
| `VehicleId` | TEXT (GUID) | REQUIRED, FK → Vehicles | Véhicule assigné |
| `DriverId` | TEXT (GUID) | REQUIRED, FK → Drivers | Chauffeur assigné |
| `StartDate` | TEXT (DateTime) | REQUIRED | Date de début prévue |
| `EndDate` | TEXT (DateTime) | NULLABLE | Date de fin prévue |
| `ActualStartDate` | TEXT (DateTime) | NULLABLE | Date de début réelle |
| `ActualEndDate` | TEXT (DateTime) | NULLABLE | Date de fin réelle |
| `EstimatedDistance` | REAL | REQUIRED | Distance estimée en km |
| `ActualDistance` | REAL | NULLABLE | Distance réelle parcourue en km |
| `CreatedAt` | TEXT (DateTime) | REQUIRED | Date de création |
| `UpdatedAt` | TEXT (DateTime) | REQUIRED | Date de dernière modification |
| `IsDeleted` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Soft delete flag |

**Index:**
- `IX_Missions_VehicleId`
- `IX_Missions_DriverId`
- `IX_Missions_Status`
- `IX_Missions_StartDate`

---

### 4. Waypoints (Points de passage)

**Description:** Points de passage d'une mission (livraisons, arrêts, etc.).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `Id` | TEXT (GUID) | PRIMARY KEY | Identifiant unique du waypoint |
| `MissionId` | TEXT (GUID) | REQUIRED, FK → Missions | Mission associée |
| `Name` | TEXT | REQUIRED | Nom du point (ex: "Client ABC") |
| `Address` | TEXT | REQUIRED | Adresse complète |
| `Latitude` | REAL | REQUIRED | Latitude GPS |
| `Longitude` | REAL | REQUIRED | Longitude GPS |
| `Type` | INTEGER | REQUIRED | Type de point (enum WaypointType) |
| `Order` | INTEGER | REQUIRED | Ordre de passage (1, 2, 3...) |
| `PlannedArrivalTime` | TEXT (DateTime) | NULLABLE | Heure d'arrivée prévue |
| `ActualArrivalTime` | TEXT (DateTime) | NULLABLE | Heure d'arrivée réelle |
| `PlannedDepartureTime` | TEXT (DateTime) | NULLABLE | Heure de départ prévue |
| `ActualDepartureTime` | TEXT (DateTime) | NULLABLE | Heure de départ réelle |
| `IsCompleted` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Point complété ou non |
| `Notes` | TEXT | NULLABLE | Notes additionnelles |
| `CreatedAt` | TEXT (DateTime) | REQUIRED | Date de création |
| `UpdatedAt` | TEXT (DateTime) | REQUIRED | Date de dernière modification |
| `IsDeleted` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Soft delete flag |

**Index:**
- `IX_Waypoints_MissionId`
- `IX_Waypoints_Order`

---

### 5. GpsPositions (Positions GPS)

**Description:** Historique des positions GPS des véhicules (tracking en temps réel).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `Id` | TEXT (GUID) | PRIMARY KEY | Identifiant unique de la position |
| `VehicleId` | TEXT (GUID) | REQUIRED, FK → Vehicles | Véhicule tracké |
| `Latitude` | REAL | REQUIRED | Latitude GPS |
| `Longitude` | REAL | REQUIRED | Longitude GPS |
| `Altitude` | REAL | NULLABLE | Altitude en mètres |
| `Speed` | REAL | NULLABLE | Vitesse en km/h |
| `Heading` | REAL | NULLABLE | Direction (0-360 degrés) |
| `Timestamp` | TEXT (DateTime) | REQUIRED | Date/heure de capture GPS |
| `Accuracy` | REAL | NULLABLE | Précision GPS en mètres |
| `CreatedAt` | TEXT (DateTime) | REQUIRED | Date de création |
| `UpdatedAt` | TEXT (DateTime) | REQUIRED | Date de dernière modification |
| `IsDeleted` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Soft delete flag |

**Index:**
- `IX_GpsPositions_VehicleId`
- `IX_GpsPositions_Timestamp`
- Index composite: `IX_GpsPositions_VehicleId_Timestamp` (optimisation des requêtes de tracking)

---

### 6. Alerts (Alertes)

**Description:** Alertes et notifications (excès de vitesse, maintenance due, etc.).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `Id` | TEXT (GUID) | PRIMARY KEY | Identifiant unique de l'alerte |
| `VehicleId` | TEXT (GUID) | REQUIRED, FK → Vehicles | Véhicule concerné |
| `Type` | INTEGER | REQUIRED | Type d'alerte (enum AlertType) |
| `Severity` | INTEGER | REQUIRED | Sévérité (enum AlertSeverity) |
| `Title` | TEXT | REQUIRED | Titre court de l'alerte |
| `Message` | TEXT | REQUIRED | Message détaillé |
| `TriggeredAt` | TEXT (DateTime) | REQUIRED | Date/heure de déclenchement |
| `IsAcknowledged` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Alerte acquittée |
| `AcknowledgedAt` | TEXT (DateTime) | NULLABLE | Date d'acquittement |
| `AcknowledgedBy` | TEXT | NULLABLE | Utilisateur ayant acquitté |
| `IsResolved` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Alerte résolue |
| `ResolvedAt` | TEXT (DateTime) | NULLABLE | Date de résolution |
| `Resolution` | TEXT | NULLABLE | Description de la résolution |
| `CreatedAt` | TEXT (DateTime) | REQUIRED | Date de création |
| `UpdatedAt` | TEXT (DateTime) | REQUIRED | Date de dernière modification |
| `IsDeleted` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Soft delete flag |

**Index:**
- `IX_Alerts_VehicleId`
- `IX_Alerts_Type`
- `IX_Alerts_Severity`
- `IX_Alerts_TriggeredAt`
- `IX_Alerts_IsResolved`

---

### 7. MaintenanceRecords (Registres de maintenance)

**Description:** Historique complet de la maintenance des véhicules.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `Id` | TEXT (GUID) | PRIMARY KEY | Identifiant unique du registre |
| `VehicleId` | TEXT (GUID) | REQUIRED, FK → Vehicles | Véhicule concerné |
| `Type` | INTEGER | REQUIRED | Type de maintenance (enum MaintenanceType) |
| `Description` | TEXT | REQUIRED | Description des travaux |
| `ScheduledDate` | TEXT (DateTime) | REQUIRED | Date prévue |
| `CompletedDate` | TEXT (DateTime) | NULLABLE | Date d'achèvement |
| `MileageAtMaintenance` | INTEGER | REQUIRED | Kilométrage au moment de la maintenance |
| `Cost` | REAL | REQUIRED | Coût en devise locale |
| `ServiceProvider` | TEXT | NULLABLE | Nom du prestataire |
| `Notes` | TEXT | NULLABLE | Notes additionnelles |
| `IsCompleted` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Maintenance terminée |
| `CreatedAt` | TEXT (DateTime) | REQUIRED | Date de création |
| `UpdatedAt` | TEXT (DateTime) | REQUIRED | Date de dernière modification |
| `IsDeleted` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Soft delete flag |

**Index:**
- `IX_MaintenanceRecords_VehicleId`
- `IX_MaintenanceRecords_ScheduledDate`
- `IX_MaintenanceRecords_IsCompleted`

---

### 8. Zones (Zones géographiques)

**Description:** Zones géographiques pour le geofencing (zones autorisées, interdites, etc.).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `Id` | TEXT (GUID) | PRIMARY KEY | Identifiant unique de la zone |
| `Name` | TEXT | REQUIRED | Nom de la zone |
| `Description` | TEXT | REQUIRED | Description de la zone |
| `Type` | INTEGER | REQUIRED | Type de zone (enum ZoneType) |
| `CenterLatitude` | REAL | REQUIRED | Latitude du centre |
| `CenterLongitude` | REAL | REQUIRED | Longitude du centre |
| `RadiusInMeters` | REAL | REQUIRED | Rayon en mètres (pour zones circulaires) |
| `Coordinates` | TEXT | NULLABLE | Coordonnées JSON pour polygones complexes |
| `IsActive` | INTEGER (Boolean) | REQUIRED, DEFAULT 1 | Zone active ou non |
| `Color` | TEXT | NULLABLE | Couleur hex pour affichage sur carte |
| `CreatedAt` | TEXT (DateTime) | REQUIRED | Date de création |
| `UpdatedAt` | TEXT (DateTime) | REQUIRED | Date de dernière modification |
| `IsDeleted` | INTEGER (Boolean) | REQUIRED, DEFAULT 0 | Soft delete flag |

**Index:**
- `IX_Zones_IsActive`
- `IX_Zones_Type`

**Format Coordinates (JSON):**
```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [longitude1, latitude1],
      [longitude2, latitude2],
      [longitude3, latitude3],
      [longitude1, latitude1]
    ]
  ]
}
```

---

## 🔗 Relations

### Relations 1:1 (One-to-One)

| Table Parent | Table Enfant | Clé étrangère | Description |
|--------------|--------------|---------------|-------------|
| **Vehicles** | **Drivers** | `CurrentDriverId` | Un véhicule peut avoir un chauffeur actuel |
| **Drivers** | **Vehicles** | `CurrentVehicleId` | Un chauffeur peut avoir un véhicule actuel |

> **Note:** Cette relation bidirectionnelle 1:1 permet de savoir rapidement quel chauffeur utilise quel véhicule et vice-versa.

### Relations 1:N (One-to-Many)

| Table Parent (1) | Table Enfant (N) | Clé étrangère | Description |
|------------------|------------------|---------------|-------------|
| **Vehicles** | **GpsPositions** | `VehicleId` | Un véhicule a plusieurs positions GPS |
| **Vehicles** | **Alerts** | `VehicleId` | Un véhicule peut avoir plusieurs alertes |
| **Vehicles** | **MaintenanceRecords** | `VehicleId` | Un véhicule a un historique de maintenance |
| **Vehicles** | **Missions** | `VehicleId` | Un véhicule peut avoir plusieurs missions |
| **Drivers** | **Missions** | `DriverId` | Un chauffeur peut avoir plusieurs missions |
| **Missions** | **Waypoints** | `MissionId` | Une mission a plusieurs points de passage |

### Schéma des contraintes de clés étrangères

```sql
-- Vehicle → Driver (Current assignment)
FOREIGN KEY (CurrentDriverId) REFERENCES Drivers(Id) ON DELETE SET NULL

-- Driver → Vehicle (Current assignment)
FOREIGN KEY (CurrentVehicleId) REFERENCES Vehicles(Id) ON DELETE SET NULL

-- Mission → Vehicle
FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE RESTRICT

-- Mission → Driver
FOREIGN KEY (DriverId) REFERENCES Drivers(Id) ON DELETE RESTRICT

-- Waypoint → Mission
FOREIGN KEY (MissionId) REFERENCES Missions(Id) ON DELETE CASCADE

-- GpsPosition → Vehicle
FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE CASCADE

-- Alert → Vehicle
FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE CASCADE

-- MaintenanceRecord → Vehicle
FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE CASCADE
```

**Comportements:**
- `ON DELETE CASCADE` : Si le parent est supprimé, les enfants sont supprimés
- `ON DELETE RESTRICT` : Empêche la suppression du parent si des enfants existent
- `ON DELETE SET NULL` : Si le parent est supprimé, la FK est mise à NULL

---

## 📑 Index

### Index automatiques (Primary Keys)
Toutes les tables ont un index automatique sur la colonne `Id` (PRIMARY KEY).

### Index uniques
| Table | Colonne(s) | Nom |
|-------|-----------|-----|
| Vehicles | RegistrationNumber | `IX_Vehicles_RegistrationNumber` |
| Drivers | Email | `IX_Drivers_Email` |
| Drivers | LicenseNumber | `IX_Drivers_LicenseNumber` |

### Index de recherche
| Table | Colonne(s) | Nom | Objectif |
|-------|-----------|-----|---------|
| Vehicles | Status | `IX_Vehicles_Status` | Filtrer par statut |
| Vehicles | CurrentDriverId | `IX_Vehicles_CurrentDriverId` | Recherche d'assignation |
| Drivers | Status | `IX_Drivers_Status` | Filtrer par statut |
| Drivers | CurrentVehicleId | `IX_Drivers_CurrentVehicleId` | Recherche d'assignation |
| Missions | VehicleId | `IX_Missions_VehicleId` | Missions d'un véhicule |
| Missions | DriverId | `IX_Missions_DriverId` | Missions d'un chauffeur |
| Missions | Status | `IX_Missions_Status` | Filtrer par statut |
| Missions | StartDate | `IX_Missions_StartDate` | Trier par date |
| Waypoints | MissionId | `IX_Waypoints_MissionId` | Points d'une mission |
| Waypoints | Order | `IX_Waypoints_Order` | Trier par ordre |
| GpsPositions | VehicleId | `IX_GpsPositions_VehicleId` | Positions d'un véhicule |
| GpsPositions | Timestamp | `IX_GpsPositions_Timestamp` | Trier par date |
| GpsPositions | VehicleId, Timestamp | `IX_GpsPositions_VehicleId_Timestamp` | Optimisation tracking |
| Alerts | VehicleId | `IX_Alerts_VehicleId` | Alertes d'un véhicule |
| Alerts | Type | `IX_Alerts_Type` | Filtrer par type |
| Alerts | Severity | `IX_Alerts_Severity` | Filtrer par sévérité |
| Alerts | TriggeredAt | `IX_Alerts_TriggeredAt` | Trier par date |
| Alerts | IsResolved | `IX_Alerts_IsResolved` | Alertes non résolues |
| MaintenanceRecords | VehicleId | `IX_MaintenanceRecords_VehicleId` | Maintenance d'un véhicule |
| MaintenanceRecords | ScheduledDate | `IX_MaintenanceRecords_ScheduledDate` | Trier par date |
| MaintenanceRecords | IsCompleted | `IX_MaintenanceRecords_IsCompleted` | Maintenances en attente |
| Zones | IsActive | `IX_Zones_IsActive` | Zones actives seulement |
| Zones | Type | `IX_Zones_Type` | Filtrer par type |

---

## 🎨 Enums et Types

### VehicleType (Type de véhicule)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Car | Voiture |
| 1 | Truck | Camion |
| 2 | Van | Camionnette |
| 3 | Motorcycle | Moto |
| 4 | Bus | Bus |
| 5 | Trailer | Remorque |
| 6 | Other | Autre |

### VehicleStatus (Statut du véhicule)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Available | Disponible |
| 1 | InUse | En utilisation |
| 2 | InMaintenance | En maintenance |
| 3 | OutOfService | Hors service |
| 4 | Reserved | Réservé |

### FuelType (Type de carburant)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Gasoline | Essence |
| 1 | Diesel | Diesel |
| 2 | Electric | Électrique |
| 3 | Hybrid | Hybride |
| 4 | LPG | GPL (Gaz de pétrole liquéfié) |
| 5 | CNG | GNC (Gaz naturel comprimé) |
| 6 | Hydrogen | Hydrogène |

### DriverStatus (Statut du chauffeur)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Available | Disponible |
| 1 | OnDuty | En service |
| 2 | OnBreak | En pause |
| 3 | OffDuty | Hors service |
| 4 | OnLeave | En congé |
| 5 | Inactive | Inactif |

### MissionStatus (Statut de la mission)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Planned | Planifiée |
| 1 | Assigned | Assignée |
| 2 | InProgress | En cours |
| 3 | Completed | Terminée |
| 4 | Cancelled | Annulée |
| 5 | OnHold | En attente |

### MissionPriority (Priorité de la mission)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Low | Basse |
| 1 | Medium | Moyenne |
| 2 | High | Haute |
| 3 | Urgent | Urgente |
| 4 | Critical | Critique |

### WaypointType (Type de point de passage)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Pickup | Point de ramassage |
| 1 | Delivery | Point de livraison |
| 2 | Stop | Arrêt |
| 3 | Checkpoint | Point de contrôle |
| 4 | RestArea | Aire de repos |
| 5 | FuelStation | Station-service |

### AlertType (Type d'alerte)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Speeding | Excès de vitesse |
| 1 | HarshBraking | Freinage brusque |
| 2 | HarshAcceleration | Accélération brusque |
| 3 | IdleTime | Temps d'inactivité excessif |
| 4 | LowFuel | Niveau de carburant bas |
| 5 | MaintenanceDue | Maintenance due |
| 6 | GeofenceViolation | Violation de zone |
| 7 | UnauthorizedMovement | Mouvement non autorisé |
| 8 | EngineFailure | Panne moteur |
| 9 | BatteryLow | Batterie faible |
| 10 | Other | Autre |

### AlertSeverity (Sévérité de l'alerte)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Info | Information |
| 1 | Warning | Avertissement |
| 2 | Error | Erreur |
| 3 | Critical | Critique |

### MaintenanceType (Type de maintenance)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Preventive | Préventive |
| 1 | Corrective | Corrective |
| 2 | OilChange | Vidange |
| 3 | TireChange | Changement de pneus |
| 4 | BrakeService | Service de freins |
| 5 | Inspection | Inspection |
| 6 | Repair | Réparation |
| 7 | Other | Autre |

### ZoneType (Type de zone)
| Valeur | Nom | Description |
|--------|-----|-------------|
| 0 | Restricted | Zone restreinte |
| 1 | Authorized | Zone autorisée |
| 2 | Parking | Parking |
| 3 | LoadingZone | Zone de chargement |
| 4 | ServiceArea | Aire de service |
| 5 | Depot | Dépôt |
| 6 | Customer | Client |
| 7 | Other | Autre |

---

## 📝 Exemples de données

### Exemple 1: Créer un véhicule

```sql
INSERT INTO Vehicles (
    Id, RegistrationNumber, Brand, Model, Year, Type, Status,
    FuelType, FuelCapacity, CurrentFuelLevel, Mileage,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',  -- GUID
    'ABC-123',                                -- Immatriculation
    'Toyota',                                 -- Marque
    'Hilux',                                  -- Modèle
    2023,                                     -- Année
    1,                                        -- Type: Truck
    0,                                        -- Status: Available
    1,                                        -- FuelType: Diesel
    80.0,                                     -- Capacité: 80L
    60.0,                                     -- Niveau actuel: 60L
    15000,                                    -- Kilométrage
    '2025-12-20T10:00:00Z',                  -- CreatedAt
    '2025-12-20T10:00:00Z',                  -- UpdatedAt
    0                                         -- IsDeleted: false
);
```

### Exemple 2: Créer un chauffeur

```sql
INSERT INTO Drivers (
    Id, FirstName, LastName, Email, PhoneNumber,
    LicenseNumber, LicenseExpiryDate, Status,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'Jean',
    'Dupont',
    'jean.dupont@example.com',
    '+33612345678',
    'DL123456789',
    '2028-12-31T00:00:00Z',
    0,                                        -- Status: Available
    '2025-12-20T10:00:00Z',
    '2025-12-20T10:00:00Z',
    0
);
```

### Exemple 3: Assigner un chauffeur à un véhicule

```sql
-- Mettre à jour le véhicule
UPDATE Vehicles
SET CurrentDriverId = '550e8400-e29b-41d4-a716-446655440002',
    Status = 1,  -- InUse
    UpdatedAt = '2025-12-20T11:00:00Z'
WHERE Id = '550e8400-e29b-41d4-a716-446655440001';

-- Mettre à jour le chauffeur
UPDATE Drivers
SET CurrentVehicleId = '550e8400-e29b-41d4-a716-446655440001',
    Status = 1,  -- OnDuty
    UpdatedAt = '2025-12-20T11:00:00Z'
WHERE Id = '550e8400-e29b-41d4-a716-446655440002';
```

### Exemple 4: Créer une mission

```sql
INSERT INTO Missions (
    Id, Name, Description, Status, Priority,
    VehicleId, DriverId, StartDate, EstimatedDistance,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'Livraison Paris-Lyon',
    'Transport de marchandises urgentes',
    1,  -- Status: Assigned
    2,  -- Priority: High
    '550e8400-e29b-41d4-a716-446655440001',  -- VehicleId
    '550e8400-e29b-41d4-a716-446655440002',  -- DriverId
    '2025-12-21T08:00:00Z',
    450.0,  -- 450 km
    '2025-12-20T11:00:00Z',
    '2025-12-20T11:00:00Z',
    0
);
```

### Exemple 5: Ajouter des waypoints à la mission

```sql
-- Point de départ
INSERT INTO Waypoints (
    Id, MissionId, Name, Address, Latitude, Longitude,
    Type, [Order], PlannedArrivalTime, IsCompleted,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003',
    'Dépôt Paris',
    '123 Avenue des Champs-Élysées, Paris',
    48.8566,
    2.3522,
    0,  -- Type: Pickup
    1,  -- Premier point
    '2025-12-21T08:00:00Z',
    0,
    '2025-12-20T11:00:00Z',
    '2025-12-20T11:00:00Z',
    0
);

-- Point d'arrivée
INSERT INTO Waypoints (
    Id, MissionId, Name, Address, Latitude, Longitude,
    Type, [Order], PlannedArrivalTime, IsCompleted,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES (
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440003',
    'Client Lyon',
    '456 Rue de la République, Lyon',
    45.7640,
    4.8357,
    1,  -- Type: Delivery
    2,  -- Deuxième point
    '2025-12-21T14:00:00Z',
    0,
    '2025-12-20T11:00:00Z',
    '2025-12-20T11:00:00Z',
    0
);
```

### Exemple 6: Enregistrer une position GPS

```sql
INSERT INTO GpsPositions (
    Id, VehicleId, Latitude, Longitude, Altitude,
    Speed, Heading, Timestamp, Accuracy,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES (
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440001',
    48.8566,
    2.3522,
    35.0,     -- 35 mètres d'altitude
    65.5,     -- 65.5 km/h
    180.0,    -- Direction Sud
    '2025-12-21T09:30:00Z',
    5.0,      -- Précision de 5 mètres
    '2025-12-21T09:30:00Z',
    '2025-12-21T09:30:00Z',
    0
);
```

### Exemple 7: Créer une alerte

```sql
INSERT INTO Alerts (
    Id, VehicleId, Type, Severity, Title, Message,
    TriggeredAt, IsAcknowledged, IsResolved,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES (
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440001',
    0,  -- Type: Speeding
    1,  -- Severity: Warning
    'Excès de vitesse détecté',
    'Véhicule ABC-123 a dépassé 90 km/h sur autoroute limitée à 80 km/h',
    '2025-12-21T09:35:00Z',
    0,  -- Non acquittée
    0,  -- Non résolue
    '2025-12-21T09:35:00Z',
    '2025-12-21T09:35:00Z',
    0
);
```

### Exemple 8: Planifier une maintenance

```sql
INSERT INTO MaintenanceRecords (
    Id, VehicleId, Type, Description, ScheduledDate,
    MileageAtMaintenance, Cost, IsCompleted,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES (
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440001',
    2,  -- Type: OilChange
    'Vidange moteur + remplacement filtre',
    '2025-12-25T10:00:00Z',
    15000,      -- 15000 km
    150.00,     -- 150 euros
    0,          -- Pas encore terminée
    '2025-12-20T11:00:00Z',
    '2025-12-20T11:00:00Z',
    0
);
```

### Exemple 9: Créer une zone géographique

```sql
INSERT INTO Zones (
    Id, Name, Description, Type, CenterLatitude, CenterLongitude,
    RadiusInMeters, IsActive, Color,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES (
    '550e8400-e29b-41d4-a716-446655440009',
    'Dépôt Principal Paris',
    'Zone du dépôt central à Paris',
    5,  -- Type: Depot
    48.8566,
    2.3522,
    500.0,  -- Rayon de 500 mètres
    1,      -- Active
    '#FF5733',  -- Rouge-orange
    '2025-12-20T11:00:00Z',
    '2025-12-20T11:00:00Z',
    0
);
```

---

## 🔍 Requêtes SQL utiles

### Trouver tous les véhicules disponibles

```sql
SELECT * FROM Vehicles
WHERE Status = 0  -- Available
  AND IsDeleted = 0
ORDER BY RegistrationNumber;
```

### Trouver les missions en cours avec leurs détails

```sql
SELECT
    m.Name AS MissionName,
    v.RegistrationNumber AS Vehicle,
    v.Brand || ' ' || v.Model AS VehicleModel,
    d.FirstName || ' ' || d.LastName AS Driver,
    m.StartDate,
    m.EstimatedDistance
FROM Missions m
INNER JOIN Vehicles v ON m.VehicleId = v.Id
INNER JOIN Drivers d ON m.DriverId = d.Id
WHERE m.Status = 2  -- InProgress
  AND m.IsDeleted = 0;
```

### Dernières positions GPS d'un véhicule

```sql
SELECT * FROM GpsPositions
WHERE VehicleId = '550e8400-e29b-41d4-a716-446655440001'
  AND IsDeleted = 0
ORDER BY Timestamp DESC
LIMIT 100;
```

### Alertes non résolues par sévérité

```sql
SELECT
    v.RegistrationNumber,
    a.Type,
    a.Severity,
    a.Title,
    a.TriggeredAt
FROM Alerts a
INNER JOIN Vehicles v ON a.VehicleId = v.Id
WHERE a.IsResolved = 0
  AND a.IsDeleted = 0
ORDER BY a.Severity DESC, a.TriggeredAt DESC;
```

### Maintenances à venir (7 prochains jours)

```sql
SELECT
    v.RegistrationNumber,
    m.Type,
    m.Description,
    m.ScheduledDate,
    m.Cost
FROM MaintenanceRecords m
INNER JOIN Vehicles v ON m.VehicleId = v.Id
WHERE m.IsCompleted = 0
  AND m.ScheduledDate BETWEEN datetime('now') AND datetime('now', '+7 days')
  AND m.IsDeleted = 0
ORDER BY m.ScheduledDate;
```

### Statistiques par véhicule

```sql
SELECT
    v.RegistrationNumber,
    v.Brand,
    v.Model,
    COUNT(DISTINCT m.Id) AS TotalMissions,
    COUNT(DISTINCT gps.Id) AS TotalGPSPoints,
    COUNT(DISTINCT a.Id) AS TotalAlerts,
    COUNT(DISTINCT mnt.Id) AS TotalMaintenances
FROM Vehicles v
LEFT JOIN Missions m ON v.Id = m.VehicleId AND m.IsDeleted = 0
LEFT JOIN GpsPositions gps ON v.Id = gps.VehicleId AND gps.IsDeleted = 0
LEFT JOIN Alerts a ON v.Id = a.VehicleId AND a.IsDeleted = 0
LEFT JOIN MaintenanceRecords mnt ON v.Id = mnt.VehicleId AND mnt.IsDeleted = 0
WHERE v.IsDeleted = 0
GROUP BY v.Id
ORDER BY TotalMissions DESC;
```

---

## 📌 Notes importantes

### Soft Delete
Toutes les tables utilisent le soft delete. Les enregistrements ne sont jamais supprimés physiquement, seulement marqués comme supprimés avec `IsDeleted = 1`.

Pour récupérer les données supprimées:
```sql
SELECT * FROM Vehicles WHERE IsDeleted = 1;
```

### Dates et heures
Toutes les dates sont stockées au format **ISO 8601** UTC:
```
2025-12-20T10:30:45.123Z
```

### GUIDs
Tous les identifiants sont des GUIDs au format texte:
```
550e8400-e29b-41d4-a716-446655440000
```

### Performance
- Les index sont optimisés pour les requêtes les plus fréquentes
- L'index composite `VehicleId_Timestamp` sur `GpsPositions` accélère le tracking en temps réel
- Les query filters globaux sur `IsDeleted = 0` sont appliqués automatiquement par EF Core

---

**Version:** 1.0
**Dernière mise à jour:** 2025-12-20
**Auteur:** FleetTrack Development Team
