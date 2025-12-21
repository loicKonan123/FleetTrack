# FleetTrack.Domain - Documentation Détaillée

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture et Principes](#architecture-et-principes)
3. [Structure du Projet](#structure-du-projet)
4. [Entités (Entities)](#entités-entities)
5. [Énumérations (Enums)](#énumérations-enums)
6. [Relations entre Entités](#relations-entre-entités)
7. [Exemples d'Utilisation](#exemples-dutilisation)

---

## 📌 Vue d'ensemble

Le projet **FleetTrack.Domain** représente la **couche domaine** de l'application FleetTrack selon les principes de **Clean Architecture**. Cette couche contient la logique métier fondamentale et les modèles de données du système de gestion de flotte de véhicules.

### Objectif du Projet
FleetTrack est un système de gestion et de suivi de flotte de véhicules qui permet de :
- Suivre les véhicules en temps réel via GPS
- Gérer les conducteurs et leurs affectations
- Planifier et suivre les missions
- Recevoir des alertes en temps réel
- Gérer la maintenance des véhicules
- Définir des zones géographiques

---

## 🏗️ Architecture et Principes

### Clean Architecture
Cette couche Domain respecte les principes suivants :
- **Indépendance** : Aucune dépendance vers les autres couches (Infrastructure, Application, API)
- **Logique métier pure** : Contient uniquement les règles métier et les modèles de données
- **Réutilisabilité** : Peut être utilisé dans différents contextes (Web API, Desktop, Mobile)

### Principes DDD (Domain-Driven Design)
- **Entités** : Objets avec identité unique (BaseEntity)
- **Value Objects** : Représentés par les Enums
- **Agrégats** : Vehicle, Mission sont des racines d'agrégats

---

## 📁 Structure du Projet

```
FleetTrack.Domain/
├── Entities/               # Entités métier
│   ├── BaseEntity.cs      # Classe de base abstraite
│   ├── Vehicle.cs         # Véhicule
│   ├── Driver.cs          # Conducteur
│   ├── Mission.cs         # Mission de transport
│   ├── Waypoint.cs        # Point de passage
│   ├── GpsPosition.cs     # Position GPS
│   ├── Alert.cs           # Alerte système
│   ├── Maintenance.cs     # Maintenance véhicule
│   └── Zone.cs            # Zone géographique
├── Enums/                 # Énumérations
│   ├── VehicleStatus.cs   # Statuts véhicule
│   ├── VehicleType.cs     # Types de véhicule
│   ├── FuelType.cs        # Types de carburant
│   ├── DriverStatus.cs    # Statuts conducteur
│   ├── MissionStatus.cs   # Statuts mission
│   ├── MissionPriority.cs # Priorités mission
│   ├── WaypointType.cs    # Types de waypoint
│   ├── AlertType.cs       # Types d'alerte
│   ├── AlertSeverity.cs   # Sévérité des alertes
│   ├── MaintenanceType.cs # Types de maintenance
│   └── ZoneType.cs        # Types de zone
└── FleetTrack.Domain.csproj
```

---

## 🔷 Entités (Entities)

### 1. BaseEntity (Classe Abstraite)

**Fichier** : `Entities/BaseEntity.cs`

```csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        IsDeleted = false;
    }
}
```

#### 📖 Explication
- **Classe abstraite** : Ne peut pas être instanciée directement, sert de base pour toutes les autres entités
- **Id (Guid)** : Identifiant unique universel généré automatiquement
- **CreatedAt** : Date/heure de création (UTC) générée automatiquement
- **UpdatedAt** : Date/heure de dernière modification (nullable, null si jamais modifié)
- **IsDeleted** : Soft delete - permet de marquer un élément comme supprimé sans le supprimer physiquement de la base de données

#### 🎯 Avantages
- **DRY** (Don't Repeat Yourself) : Évite la duplication de code
- **Soft Delete** : Permet de conserver l'historique
- **Audit Trail** : Suivi des dates de création/modification

---

### 2. Vehicle (Véhicule)

**Fichier** : `Entities/Vehicle.cs`

```csharp
public class Vehicle : BaseEntity
{
    // Propriétés d'identification
    public string RegistrationNumber { get; set; } = string.Empty;  // Numéro d'immatriculation
    public string Brand { get; set; } = string.Empty;               // Marque (ex: Toyota)
    public string Model { get; set; } = string.Empty;               // Modèle (ex: Corolla)
    public int Year { get; set; }                                   // Année de fabrication

    // Propriétés de classification
    public VehicleType Type { get; set; }                           // Car, Truck, Van...
    public VehicleStatus Status { get; set; }                       // Available, InUse...
    public FuelType FuelType { get; set; }                          // Gasoline, Diesel...

    // Propriétés de carburant
    public double FuelCapacity { get; set; }                        // Capacité du réservoir (litres)
    public double CurrentFuelLevel { get; set; }                    // Niveau actuel (litres)

    // Propriétés de maintenance
    public int Mileage { get; set; }                                // Kilométrage total
    public DateTime? LastMaintenanceDate { get; set; }              // Dernière maintenance
    public DateTime? NextMaintenanceDate { get; set; }              // Prochaine maintenance prévue

    // Relations (Navigation Properties)
    public Guid? CurrentDriverId { get; set; }                      // ID conducteur actuel (nullable)
    public Driver? CurrentDriver { get; set; }                      // Conducteur actuel
    public ICollection<Mission> Missions { get; set; }              // Liste des missions
    public ICollection<GpsPosition> GpsPositions { get; set; }      // Historique GPS
    public ICollection<Alert> Alerts { get; set; }                  // Alertes du véhicule
    public ICollection<Maintenance> MaintenanceRecords { get; set; } // Historique maintenance
}
```

#### 📖 Explication Détaillée

**Identification du Véhicule**
- `RegistrationNumber` : Plaque d'immatriculation unique (ex: "AB-123-CD")
- `Brand` et `Model` : Permettent d'identifier précisément le véhicule
- `Year` : Année de fabrication pour calculer l'âge du véhicule

**Gestion du Carburant**
- `FuelCapacity` : Capacité totale du réservoir (ex: 60 litres)
- `CurrentFuelLevel` : Niveau actuel pour déclencher des alertes de carburant bas
- Permet de calculer l'autonomie restante

**Maintenance Préventive**
- `Mileage` : Kilométrage pour planifier les maintenances
- `LastMaintenanceDate` et `NextMaintenanceDate` : Suivi de la maintenance
- Permet d'éviter les pannes par maintenance préventive

**Relations (One-to-Many)**
- Un véhicule peut avoir UN conducteur actuel (ou aucun)
- Un véhicule peut avoir PLUSIEURS missions
- Un véhicule génère PLUSIEURS positions GPS
- Un véhicule peut avoir PLUSIEURS alertes
- Un véhicule a un HISTORIQUE de maintenances

---

### 3. Driver (Conducteur)

**Fichier** : `Entities/Driver.cs`

```csharp
public class Driver : BaseEntity
{
    // Informations personnelles
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

    // Informations de permis
    public string LicenseNumber { get; set; } = string.Empty;       // Numéro de permis
    public DateTime LicenseExpiryDate { get; set; }                 // Date d'expiration

    // Statut et activité
    public DriverStatus Status { get; set; }                        // Available, OnDuty...
    public DateTime? LastActiveDate { get; set; }                   // Dernière activité

    // Relations
    public Guid? CurrentVehicleId { get; set; }                     // Véhicule actuel (nullable)
    public Vehicle? CurrentVehicle { get; set; }                    // Référence véhicule
    public ICollection<Mission> Missions { get; set; }              // Missions assignées
}
```

#### 📖 Explication Détaillée

**Informations de Contact**
- `FirstName`, `LastName` : Identification du conducteur
- `Email`, `PhoneNumber` : Moyens de communication

**Conformité Légale**
- `LicenseNumber` : Numéro unique du permis de conduire
- `LicenseExpiryDate` : Permet de vérifier la validité du permis
- **Important** : Évite d'assigner des missions à un conducteur avec permis expiré

**Gestion du Statut**
- `Status` : Indique la disponibilité actuelle (voir DriverStatus enum)
- `LastActiveDate` : Permet de suivre l'activité et détecter les inactifs

**Relations**
- Relation bidirectionnelle avec Vehicle (un conducteur ↔ un véhicule)
- Un conducteur peut avoir plusieurs missions (historique)

---

### 4. Mission (Mission de Transport)

**Fichier** : `Entities/Mission.cs`

```csharp
public class Mission : BaseEntity
{
    // Informations générales
    public string Name { get; set; } = string.Empty;                // Nom de la mission
    public string Description { get; set; } = string.Empty;         // Description détaillée
    public MissionStatus Status { get; set; }                       // Planned, InProgress...
    public MissionPriority Priority { get; set; }                   // Low, Medium, High...

    // Dates planifiées
    public DateTime StartDate { get; set; }                         // Date début prévue
    public DateTime? EndDate { get; set; }                          // Date fin prévue

    // Dates réelles
    public DateTime? ActualStartDate { get; set; }                  // Date début réelle
    public DateTime? ActualEndDate { get; set; }                    // Date fin réelle

    // Distances
    public double EstimatedDistance { get; set; }                   // Distance estimée (km)
    public double? ActualDistance { get; set; }                     // Distance réelle (km)

    // Relations (Required - non nullable)
    public Guid VehicleId { get; set; }                            // ID véhicule assigné
    public Vehicle Vehicle { get; set; } = null!;                  // Véhicule (obligatoire)
    public Guid DriverId { get; set; }                             // ID conducteur assigné
    public Driver Driver { get; set; } = null!;                    // Conducteur (obligatoire)
    public ICollection<Waypoint> Waypoints { get; set; }           // Points de passage
}
```

#### 📖 Explication Détaillée

**Informations de Base**
- `Name` : Nom court de la mission (ex: "Livraison Paris-Lyon")
- `Description` : Détails complets de la mission
- `Priority` : Permet de prioriser les missions urgentes

**Planification vs Réalité**
- **Dates planifiées** : `StartDate`, `EndDate` - Ce qui est prévu
- **Dates réelles** : `ActualStartDate`, `ActualEndDate` - Ce qui s'est passé
- Permet d'analyser les retards et améliorer la planification

**Suivi de Distance**
- `EstimatedDistance` : Distance calculée avant la mission
- `ActualDistance` : Distance réellement parcourue
- Utile pour le calcul de consommation carburant et coûts

**Relations Obligatoires**
- `Vehicle` et `Driver` sont **obligatoires** (non nullable avec `= null!`)
- Une mission **doit** avoir un véhicule ET un conducteur assignés
- `Waypoints` : Liste ordonnée des points de passage de la mission

---

### 5. Waypoint (Point de Passage)

**Fichier** : `Entities/Waypoint.cs`

```csharp
public class Waypoint : BaseEntity
{
    // Informations de localisation
    public string Name { get; set; } = string.Empty;                // Nom du point
    public string Address { get; set; } = string.Empty;             // Adresse complète
    public double Latitude { get; set; }                            // Latitude GPS
    public double Longitude { get; set; }                           // Longitude GPS

    // Type et ordre
    public WaypointType Type { get; set; }                          // Pickup, Delivery...
    public int Order { get; set; }                                  // Ordre dans la mission

    // Planification
    public DateTime? PlannedArrivalTime { get; set; }               // Arrivée prévue
    public DateTime? ActualArrivalTime { get; set; }                // Arrivée réelle
    public DateTime? PlannedDepartureTime { get; set; }             // Départ prévu
    public DateTime? ActualDepartureTime { get; set; }              // Départ réel

    // Statut
    public bool IsCompleted { get; set; }                           // Point complété?
    public string? Notes { get; set; }                              // Notes diverses

    // Relation
    public Guid MissionId { get; set; }                            // Mission parente
    public Mission Mission { get; set; } = null!;                  // Référence mission
}
```

#### 📖 Explication Détaillée

**Géolocalisation**
- `Latitude` et `Longitude` : Coordonnées GPS précises
- `Address` : Adresse lisible par l'humain
- Permet la navigation GPS et le calcul d'itinéraire

**Séquencement**
- `Order` : Détermine l'ordre de visite (1, 2, 3...)
- Permet de créer un itinéraire optimisé
- Important pour les missions avec points multiples

**Suivi Temporel**
- Comparaison Planifié vs Réel pour chaque étape
- `PlannedArrivalTime` vs `ActualArrivalTime` : Mesure les retards
- `PlannedDepartureTime` vs `ActualDepartureTime` : Temps passé au point

**Types de Waypoints**
- `Pickup` : Point de chargement
- `Delivery` : Point de livraison
- `Stop` : Arrêt intermédiaire
- `Checkpoint` : Point de contrôle
- `RestArea`, `FuelStation` : Pauses et ravitaillement

---

### 6. GpsPosition (Position GPS)

**Fichier** : `Entities/GpsPosition.cs`

```csharp
public class GpsPosition : BaseEntity
{
    // Coordonnées principales
    public double Latitude { get; set; }                            // Latitude
    public double Longitude { get; set; }                           // Longitude
    public double? Altitude { get; set; }                           // Altitude (mètres)

    // Données de mouvement
    public double? Speed { get; set; }                              // Vitesse (km/h)
    public double? Heading { get; set; }                            // Direction (0-360°)

    // Métadonnées
    public DateTime Timestamp { get; set; }                         // Date/heure capture
    public double? Accuracy { get; set; }                           // Précision (mètres)

    // Relation
    public Guid VehicleId { get; set; }                            // Véhicule
    public Vehicle Vehicle { get; set; } = null!;                  // Référence véhicule
}
```

#### 📖 Explication Détaillée

**Données de Position**
- `Latitude`, `Longitude` : Position exacte sur le globe
- `Altitude` : Hauteur au-dessus du niveau de la mer (optionnel)
- `Accuracy` : Marge d'erreur de la position (ex: ±5 mètres)

**Données de Mouvement**
- `Speed` : Vitesse instantanée en km/h
- `Heading` : Direction en degrés (0° = Nord, 90° = Est, etc.)
- Permet de détecter les excès de vitesse et la direction

**Horodatage**
- `Timestamp` : Moment exact de la capture GPS
- Crucial pour reconstituer le trajet chronologiquement

**Utilisation**
- Enregistrement fréquent (ex: toutes les 10 secondes)
- Permet de tracer l'historique complet des déplacements
- Base pour calculer la distance parcourue réelle

---

### 7. Alert (Alerte)

**Fichier** : `Entities/Alert.cs`

```csharp
public class Alert : BaseEntity
{
    // Classification de l'alerte
    public AlertType Type { get; set; }                             // Type d'alerte
    public AlertSeverity Severity { get; set; }                     // Gravité

    // Contenu de l'alerte
    public string Title { get; set; } = string.Empty;               // Titre court
    public string Message { get; set; } = string.Empty;             // Message détaillé
    public DateTime TriggeredAt { get; set; }                       // Date déclenchement

    // Gestion de l'alerte
    public bool IsAcknowledged { get; set; }                        // Acquittée?
    public DateTime? AcknowledgedAt { get; set; }                   // Date acquittement
    public string? AcknowledgedBy { get; set; }                     // Par qui (UserID)

    // Résolution
    public bool IsResolved { get; set; }                            // Résolue?
    public DateTime? ResolvedAt { get; set; }                       // Date résolution
    public string? Resolution { get; set; }                         // Description résolution

    // Relation
    public Guid VehicleId { get; set; }                            // Véhicule concerné
    public Vehicle Vehicle { get; set; } = null!;                  // Référence véhicule
}
```

#### 📖 Explication Détaillée

**Système d'Alerte en 3 Étapes**

1. **Déclenchement** : L'alerte est créée automatiquement
   - `TriggeredAt` : Moment du déclenchement
   - `Type` : Catégorie (Speeding, LowFuel, etc.)
   - `Severity` : Gravité (Info, Warning, Error, Critical)

2. **Acquittement** : Un opérateur prend connaissance
   - `IsAcknowledged = true` : L'alerte a été vue
   - `AcknowledgedAt` : Quand?
   - `AcknowledgedBy` : Par qui?

3. **Résolution** : Le problème est résolu
   - `IsResolved = true` : Problème corrigé
   - `ResolvedAt` : Quand?
   - `Resolution` : Comment? (description)

**Exemple de Workflow**
```
1. Véhicule dépasse 120 km/h → Alerte créée (Speeding, Critical)
2. Superviseur voit l'alerte → Acquittée (AcknowledgedBy: "John")
3. Conducteur ralentit → Résolue (Resolution: "Conducteur contacté, vitesse normalisée")
```

**Types d'Alertes**
- `Speeding` : Excès de vitesse
- `LowFuel` : Carburant bas
- `MaintenanceDue` : Maintenance requise
- `GeofenceViolation` : Sortie de zone autorisée
- etc. (voir AlertType enum)

---

### 8. Maintenance (Maintenance)

**Fichier** : `Entities/Maintenance.cs`

```csharp
public class Maintenance : BaseEntity
{
    // Type et description
    public MaintenanceType Type { get; set; }                       // Type maintenance
    public string Description { get; set; } = string.Empty;         // Détails

    // Planning
    public DateTime ScheduledDate { get; set; }                     // Date prévue
    public DateTime? CompletedDate { get; set; }                    // Date réalisée
    public int MileageAtMaintenance { get; set; }                   // Km au moment

    // Finances
    public decimal Cost { get; set; }                               // Coût

    // Prestataire
    public string? ServiceProvider { get; set; }                    // Garage/Atelier
    public string? Notes { get; set; }                              // Notes techniques
    public bool IsCompleted { get; set; }                           // Terminée?

    // Relation
    public Guid VehicleId { get; set; }                            // Véhicule
    public Vehicle Vehicle { get; set; } = null!;                  // Référence
}
```

#### 📖 Explication Détaillée

**Planification de Maintenance**
- `ScheduledDate` : Date planifiée (ex: "2025-01-15")
- `CompletedDate` : Date réelle d'exécution
- Permet de suivre les retards de maintenance

**Suivi Kilométrique**
- `MileageAtMaintenance` : Kilométrage lors de l'intervention
- Permet de planifier les prochaines (ex: tous les 10 000 km)
- Important pour les maintenances préventives

**Gestion Financière**
- `Cost` : Coût de la maintenance (type `decimal` pour précision)
- Permet de budgétiser et analyser les coûts par véhicule

**Types de Maintenance**
- `Preventive` : Maintenance planifiée (vidange régulière)
- `Corrective` : Suite à une panne
- `OilChange`, `TireChange`, `BrakeService` : Spécifiques
- `Inspection` : Contrôle technique

---

### 9. Zone (Zone Géographique)

**Fichier** : `Entities/Zone.cs`

```csharp
public class Zone : BaseEntity
{
    // Informations générales
    public string Name { get; set; } = string.Empty;                // Nom de la zone
    public string Description { get; set; } = string.Empty;         // Description
    public ZoneType Type { get; set; }                              // Type de zone

    // Géométrie simple (cercle)
    public double CenterLatitude { get; set; }                      // Centre latitude
    public double CenterLongitude { get; set; }                     // Centre longitude
    public double RadiusInMeters { get; set; }                      // Rayon (mètres)

    // Géométrie complexe (polygone)
    public string? Coordinates { get; set; }                        // JSON polygone

    // Propriétés d'affichage
    public bool IsActive { get; set; }                              // Zone active?
    public string? Color { get; set; }                              // Couleur affichage
}
```

#### 📖 Explication Détaillée

**Deux Types de Géométrie**

1. **Zones Circulaires** : Simple
   - `CenterLatitude`, `CenterLongitude` : Centre du cercle
   - `RadiusInMeters` : Rayon (ex: 500 mètres)
   - Parfait pour : dépôt, parking, zone de livraison

2. **Zones Polygonales** : Complexe
   - `Coordinates` : JSON contenant les coordonnées des sommets
   - Exemple JSON : `[{lat:48.8,lng:2.3},{lat:48.9,lng:2.4}...]`
   - Parfait pour : zones urbaines, quartiers

**Types de Zones**
- `Restricted` : Zone interdite (déclenche alerte si entrée)
- `Authorized` : Zone autorisée uniquement
- `Parking` : Zone de stationnement
- `LoadingZone` : Zone de chargement/déchargement
- `Depot` : Dépôt de l'entreprise
- `Customer` : Site client

**Geofencing**
- Permet de détecter quand un véhicule entre/sort d'une zone
- `IsActive` : Permet de désactiver temporairement une zone
- `Color` : Pour affichage sur carte (ex: "#FF0000" pour rouge)

**Exemple d'Utilisation**
```
Zone Dépôt Principal :
- Type: Depot
- Center: 48.8566, 2.3522 (Paris)
- Radius: 200 mètres
- IsActive: true
- Color: "#00FF00" (vert)

→ Alerte si véhicule sort du dépôt en dehors des heures autorisées
```

---

## 🔢 Énumérations (Enums)

### 1. VehicleStatus

**Fichier** : `Enums/VehicleStatus.cs`

```csharp
public enum VehicleStatus
{
    Available = 0,      // Disponible pour affectation
    InUse = 1,          // En cours d'utilisation
    InMaintenance = 2,  // En maintenance
    OutOfService = 3,   // Hors service (panne grave)
    Reserved = 4        // Réservé pour mission future
}
```

**Utilisation** : Gestion de la disponibilité des véhicules

---

### 2. VehicleType

**Fichier** : `Enums/VehicleType.cs`

```csharp
public enum VehicleType
{
    Car = 0,        // Voiture
    Truck = 1,      // Camion
    Van = 2,        // Camionnette
    Motorcycle = 3, // Moto
    Bus = 4,        // Bus
    Trailer = 5,    // Remorque
    Other = 6       // Autre
}
```

**Utilisation** : Classification et filtrage des véhicules

---

### 3. FuelType

**Fichier** : `Enums/FuelType.cs`

```csharp
public enum FuelType
{
    Gasoline = 0,   // Essence
    Diesel = 1,     // Diesel
    Electric = 2,   // Électrique
    Hybrid = 3,     // Hybride
    LPG = 4,        // GPL (Gaz de Pétrole Liquéfié)
    CNG = 5,        // GNC (Gaz Naturel Comprimé)
    Hydrogen = 6    // Hydrogène
}
```

**Utilisation** : Gestion du carburant et calcul de coûts

---

### 4. DriverStatus

**Fichier** : `Enums/DriverStatus.cs`

```csharp
public enum DriverStatus
{
    Available = 0,  // Disponible
    OnDuty = 1,     // En service
    OnBreak = 2,    // En pause
    OffDuty = 3,    // Hors service
    OnLeave = 4,    // En congé
    Inactive = 5    // Inactif (ex: maladie longue durée)
}
```

**Utilisation** : Gestion de planning et affectation des conducteurs

---

### 5. MissionStatus

**Fichier** : `Enums/MissionStatus.cs`

```csharp
public enum MissionStatus
{
    Planned = 0,    // Planifiée (pas encore assignée)
    Assigned = 1,   // Assignée à un conducteur/véhicule
    InProgress = 2, // En cours d'exécution
    Completed = 3,  // Terminée avec succès
    Cancelled = 4,  // Annulée
    OnHold = 5      // En attente (suspendue temporairement)
}
```

**Cycle de Vie d'une Mission** :
```
Planned → Assigned → InProgress → Completed
                              ↓
                          Cancelled / OnHold
```

---

### 6. MissionPriority

**Fichier** : `Enums/MissionPriority.cs`

```csharp
public enum MissionPriority
{
    Low = 0,        // Basse priorité
    Medium = 1,     // Priorité moyenne
    High = 2,       // Haute priorité
    Urgent = 3,     // Urgent
    Critical = 4    // Critique (immédiat)
}
```

**Utilisation** : Ordonnancement et priorisation des missions

---

### 7. WaypointType

**Fichier** : `Enums/WaypointType.cs`

```csharp
public enum WaypointType
{
    Pickup = 0,      // Point de chargement
    Delivery = 1,    // Point de livraison
    Stop = 2,        // Arrêt simple
    Checkpoint = 3,  // Point de contrôle
    RestArea = 4,    // Aire de repos
    FuelStation = 5  // Station-service
}
```

**Exemple de Mission** :
```
1. Pickup (Entrepôt) → 2. Delivery (Client A) → 3. Delivery (Client B) → 4. FuelStation
```

---

### 8. AlertType

**Fichier** : `Enums/AlertType.cs`

```csharp
public enum AlertType
{
    Speeding = 0,              // Excès de vitesse
    HarshBraking = 1,          // Freinage brusque
    HarshAcceleration = 2,     // Accélération brusque
    IdleTime = 3,              // Moteur au ralenti trop longtemps
    LowFuel = 4,               // Carburant bas
    MaintenanceDue = 5,        // Maintenance requise
    GeofenceViolation = 6,     // Sortie de zone autorisée
    UnauthorizedMovement = 7,  // Mouvement non autorisé
    EngineFailure = 8,         // Panne moteur
    BatteryLow = 9,            // Batterie faible
    Other = 10                 // Autre
}
```

**Détection Automatique** :
- GPS détecte la vitesse → Speeding
- Analyse du niveau carburant → LowFuel
- Vérification kilométrage → MaintenanceDue

---

### 9. AlertSeverity

**Fichier** : `Enums/AlertSeverity.cs`

```csharp
public enum AlertSeverity
{
    Info = 0,       // Information (pas d'action requise)
    Warning = 1,    // Avertissement (attention nécessaire)
    Error = 2,      // Erreur (action requise bientôt)
    Critical = 3    // Critique (action immédiate!)
}
```

**Exemples** :
- `Info` : "Maintenance prévue dans 1 mois"
- `Warning` : "Carburant à 25%"
- `Error` : "Vitesse dépassée de 20 km/h"
- `Critical` : "Panne moteur détectée"

---

### 10. MaintenanceType

**Fichier** : `Enums/MaintenanceType.cs`

```csharp
public enum MaintenanceType
{
    Preventive = 0, // Maintenance préventive planifiée
    Corrective = 1, // Maintenance corrective (réparation)
    OilChange = 2,  // Vidange
    TireChange = 3, // Changement pneus
    BrakeService = 4, // Service freins
    Inspection = 5, // Contrôle technique
    Repair = 6,     // Réparation générale
    Other = 7       // Autre
}
```

---

### 11. ZoneType

**Fichier** : `Enums/ZoneType.cs`

```csharp
public enum ZoneType
{
    Restricted = 0,  // Zone interdite
    Authorized = 1,  // Zone autorisée uniquement
    Parking = 2,     // Zone de parking
    LoadingZone = 3, // Zone de chargement
    ServiceArea = 4, // Aire de service
    Depot = 5,       // Dépôt
    Customer = 6,    // Site client
    Other = 7        // Autre
}
```

---

## 🔗 Relations entre Entités

### Diagramme des Relations

```
┌─────────────┐         ┌──────────────┐
│   Driver    │◄───────►│   Vehicle    │
│             │ 1     1 │              │
└──────┬──────┘         └──────┬───────┘
       │                       │
       │ 1                   1 │
       │                       │
       │ *                   * │
   ┌───▼──────┐           ┌───▼─────────┐
   │ Mission  │           │ GpsPosition │
   └───┬──────┘           │ Alert       │
       │                  │ Maintenance │
       │ 1                └─────────────┘
       │
       │ *
   ┌───▼──────┐
   │ Waypoint │
   └──────────┘

┌──────────┐
│   Zone   │ (Indépendant)
└──────────┘
```

### Relations Détaillées

#### 1. **Driver ↔ Vehicle** (One-to-One optionnel)
```csharp
// Un conducteur peut conduire UN véhicule (ou aucun)
Driver.CurrentVehicleId (nullable)
Driver.CurrentVehicle (nullable)

// Un véhicule peut être conduit par UN conducteur (ou aucun)
Vehicle.CurrentDriverId (nullable)
Vehicle.CurrentDriver (nullable)
```

**Exemple** :
```
Driver "Jean Dupont" → Vehicle "AB-123-CD" (Peugeot 308)
```

---

#### 2. **Vehicle → Mission** (One-to-Many)
```csharp
// Un véhicule peut avoir PLUSIEURS missions (historique)
Vehicle.Missions (ICollection<Mission>)

// Une mission appartient à UN véhicule
Mission.VehicleId (required)
Mission.Vehicle (required)
```

**Exemple** :
```
Vehicle "AB-123-CD"
├── Mission 1: "Livraison Paris" (Completed)
├── Mission 2: "Transport Lyon" (InProgress)
└── Mission 3: "Collecte Marseille" (Planned)
```

---

#### 3. **Driver → Mission** (One-to-Many)
```csharp
// Un conducteur peut avoir PLUSIEURS missions
Driver.Missions (ICollection<Mission>)

// Une mission est assignée à UN conducteur
Mission.DriverId (required)
Mission.Driver (required)
```

---

#### 4. **Mission → Waypoint** (One-to-Many)
```csharp
// Une mission a PLUSIEURS waypoints ordonnés
Mission.Waypoints (ICollection<Waypoint>)

// Un waypoint appartient à UNE mission
Waypoint.MissionId (required)
Waypoint.Mission (required)
```

**Exemple** :
```
Mission "Livraison Multi-Stop"
├── Waypoint 1 (Order: 1): Dépôt (Pickup)
├── Waypoint 2 (Order: 2): Client A (Delivery)
├── Waypoint 3 (Order: 3): Client B (Delivery)
└── Waypoint 4 (Order: 4): Retour Dépôt (Stop)
```

---

#### 5. **Vehicle → GpsPosition** (One-to-Many)
```csharp
// Un véhicule génère PLUSIEURS positions GPS
Vehicle.GpsPositions (ICollection<GpsPosition>)

// Une position GPS appartient à UN véhicule
GpsPosition.VehicleId (required)
GpsPosition.Vehicle (required)
```

**Exemple** : Historique de trajet
```
Vehicle "AB-123-CD"
├── GpsPosition (10:00:00): Lat 48.8566, Lng 2.3522, Speed 50 km/h
├── GpsPosition (10:00:10): Lat 48.8570, Lng 2.3530, Speed 55 km/h
└── GpsPosition (10:00:20): Lat 48.8575, Lng 2.3540, Speed 60 km/h
```

---

#### 6. **Vehicle → Alert** (One-to-Many)
```csharp
// Un véhicule peut avoir PLUSIEURS alertes
Vehicle.Alerts (ICollection<Alert>)

// Une alerte concerne UN véhicule
Alert.VehicleId (required)
Alert.Vehicle (required)
```

---

#### 7. **Vehicle → Maintenance** (One-to-Many)
```csharp
// Un véhicule a un HISTORIQUE de maintenances
Vehicle.MaintenanceRecords (ICollection<Maintenance>)

// Une maintenance concerne UN véhicule
Maintenance.VehicleId (required)
Maintenance.Vehicle (required)
```

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Créer un Nouveau Véhicule

```csharp
var vehicle = new Vehicle
{
    RegistrationNumber = "AB-123-CD",
    Brand = "Renault",
    Model = "Master",
    Year = 2023,
    Type = VehicleType.Van,
    Status = VehicleStatus.Available,
    FuelType = FuelType.Diesel,
    FuelCapacity = 80,
    CurrentFuelLevel = 65,
    Mileage = 15000
};

// L'ID, CreatedAt, IsDeleted sont générés automatiquement par BaseEntity
```

---

### Exemple 2 : Créer une Mission Complète

```csharp
// 1. Créer la mission
var mission = new Mission
{
    Name = "Livraison Paris-Lyon",
    Description = "Transport de marchandises urgentes",
    Status = MissionStatus.Planned,
    Priority = MissionPriority.High,
    StartDate = DateTime.UtcNow.AddHours(2),
    EndDate = DateTime.UtcNow.AddHours(8),
    EstimatedDistance = 465.5,
    VehicleId = vehicleId,
    DriverId = driverId
};

// 2. Ajouter les waypoints
mission.Waypoints.Add(new Waypoint
{
    Name = "Entrepôt Paris",
    Address = "123 Rue de la Logistique, 75001 Paris",
    Latitude = 48.8566,
    Longitude = 2.3522,
    Type = WaypointType.Pickup,
    Order = 1,
    PlannedArrivalTime = DateTime.UtcNow.AddHours(2)
});

mission.Waypoints.Add(new Waypoint
{
    Name = "Client Lyon",
    Address = "456 Avenue du Commerce, 69001 Lyon",
    Latitude = 45.7640,
    Longitude = 4.8357,
    Type = WaypointType.Delivery,
    Order = 2,
    PlannedArrivalTime = DateTime.UtcNow.AddHours(7)
});
```

---

### Exemple 3 : Détecter et Créer une Alerte

```csharp
// Vérification automatique de vitesse
if (currentSpeed > speedLimit)
{
    var alert = new Alert
    {
        VehicleId = vehicleId,
        Type = AlertType.Speeding,
        Severity = AlertSeverity.Critical,
        Title = "Excès de vitesse détecté",
        Message = $"Vitesse actuelle: {currentSpeed} km/h (Limite: {speedLimit} km/h)",
        TriggeredAt = DateTime.UtcNow,
        IsAcknowledged = false,
        IsResolved = false
    };

    // Enregistrer l'alerte et notifier le superviseur
}
```

---

### Exemple 4 : Planifier une Maintenance

```csharp
var maintenance = new Maintenance
{
    VehicleId = vehicleId,
    Type = MaintenanceType.Preventive,
    Description = "Vidange et remplacement filtres",
    ScheduledDate = DateTime.UtcNow.AddDays(7),
    MileageAtMaintenance = 20000,
    Cost = 150.00m,
    ServiceProvider = "Garage Renault Paris",
    IsCompleted = false
};
```

---

### Exemple 5 : Créer une Zone de Geofencing

```csharp
// Zone circulaire autour du dépôt
var depotZone = new Zone
{
    Name = "Dépôt Principal",
    Description = "Zone du dépôt central de l'entreprise",
    Type = ZoneType.Depot,
    CenterLatitude = 48.8566,
    CenterLongitude = 2.3522,
    RadiusInMeters = 500,
    IsActive = true,
    Color = "#00FF00" // Vert
};

// Zone polygonale (zone urbaine complexe)
var restrictedZone = new Zone
{
    Name = "Centre-ville Interdit Poids Lourds",
    Description = "Zone de circulation interdite aux camions",
    Type = ZoneType.Restricted,
    CenterLatitude = 48.8600,
    CenterLongitude = 2.3400,
    RadiusInMeters = 0,
    Coordinates = @"
    [
        {""lat"": 48.8600, ""lng"": 2.3400},
        {""lat"": 48.8650, ""lng"": 2.3450},
        {""lat"": 48.8650, ""lng"": 2.3500},
        {""lat"": 48.8600, ""lng"": 2.3550}
    ]",
    IsActive = true,
    Color = "#FF0000" // Rouge
};
```

---

## 🎓 Concepts Clés à Retenir

### 1. **Soft Delete**
Toutes les entités héritent de `IsDeleted` de BaseEntity.
```csharp
// Ne PAS faire :
database.Vehicles.Remove(vehicle);

// Faire :
vehicle.IsDeleted = true;
vehicle.UpdatedAt = DateTime.UtcNow;
```

**Avantage** : Conserver l'historique, possibilité de restauration

---

### 2. **Navigation Properties**
Permettent de naviguer facilement entre entités liées.

```csharp
// Accéder au conducteur d'un véhicule
var driverName = vehicle.CurrentDriver?.FirstName;

// Accéder aux missions d'un conducteur
var activeMissions = driver.Missions.Where(m => m.Status == MissionStatus.InProgress);

// Accéder aux waypoints d'une mission
var firstWaypoint = mission.Waypoints.OrderBy(w => w.Order).First();
```

---

### 3. **Nullable vs Non-Nullable**

**Nullable (?)** : Optionnel, peut être null
```csharp
public DateTime? UpdatedAt { get; set; }  // Peut être null
public Driver? CurrentDriver { get; set; } // Peut ne pas avoir de conducteur
```

**Non-Nullable (!)** : Obligatoire
```csharp
public Vehicle Vehicle { get; set; } = null!;  // Doit avoir un véhicule
```

---

### 4. **Collections Initialisées**
Toujours initialiser les collections pour éviter les NullReferenceException.

```csharp
public ICollection<Mission> Missions { get; set; } = new List<Mission>();

// Permet de faire directement :
vehicle.Missions.Add(newMission);  // Pas d'erreur
```

---

## 📚 Prochaines Étapes

Maintenant que la couche Domain est créée, les prochaines étapes sont :

1. **FleetTrack.Infrastructure** :
   - DbContext Entity Framework
   - Configurations des entités (FluentAPI)
   - Migrations de base de données
   - Repositories

2. **FleetTrack.Application** :
   - Services métier
   - DTOs (Data Transfer Objects)
   - Mappings (AutoMapper)
   - Validations (FluentValidation)
   - CQRS (Commands/Queries)

3. **FleetTrack.API** :
   - Controllers
   - Endpoints REST
   - Authentication/Authorization
   - SignalR pour temps réel

---

## 📖 Glossaire

- **Entity** : Objet avec identité unique persistante
- **Enum** : Énumération de valeurs constantes
- **Navigation Property** : Propriété permettant de naviguer vers entités liées
- **Soft Delete** : Suppression logique (flag) vs suppression physique
- **Nullable** : Type pouvant avoir la valeur null
- **Collection** : Liste d'objets (ICollection, IEnumerable)
- **Geofencing** : Délimitation de zones géographiques virtuelles
- **GUID** : Global Unique Identifier (128 bits)
- **UTC** : Temps Universel Coordonné (pas de fuseau horaire)

---

## ✅ Checklist de Vérification

- ✅ Toutes les entités héritent de `BaseEntity`
- ✅ Tous les enums sont dans le namespace `FleetTrack.Domain.Enums`
- ✅ Toutes les entités sont dans le namespace `FleetTrack.Domain.Entities`
- ✅ Les propriétés string sont initialisées à `string.Empty`
- ✅ Les collections sont initialisées à `new List<>()`
- ✅ Les relations obligatoires utilisent `= null!`
- ✅ Les relations optionnelles sont `nullable (?)`
- ✅ Les enums commencent à 0
- ✅ DateTime utilise `DateTime.UtcNow`
- ✅ Les coûts utilisent `decimal` (pas `double`)

---

**Date de création** : 2025-12-18
**Version** : 1.0
**Auteur** : FleetTrack Development Team
