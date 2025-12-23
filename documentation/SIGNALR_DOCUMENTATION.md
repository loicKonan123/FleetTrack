# 📡 Documentation SignalR - Tracking GPS en Temps Réel

## Table des Matières

1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Hub GPS](#hub-gps)
5. [Utilisation Côté Client](#utilisation-côté-client)
6. [DTOs et Modèles](#dtos-et-modèles)
7. [Événements et Messages](#événements-et-messages)
8. [Sécurité et Authentification](#sécurité-et-authentification)
9. [Exemples d'Intégration](#exemples-dintégration)
10. [Dépannage](#dépannage)

---

## Introduction

FleetTrack utilise **SignalR** pour fournir un tracking GPS en temps réel des véhicules. Cette fonctionnalité permet aux clients (web, mobile, desktop) de recevoir instantanément les mises à jour de position des véhicules sans avoir à interroger continuellement l'API.

### Avantages de SignalR

✅ **Communication bidirectionnelle** - Le serveur peut pousser des données vers les clients
✅ **Temps réel** - Latence minimale (millisecondes)
✅ **Scalable** - Supporte des milliers de connexions simultanées
✅ **Reconnexion automatique** - Gère les déconnexions réseau
✅ **Multi-protocole** - WebSockets, Server-Sent Events, Long Polling

### Cas d'Usage

- 📍 Afficher les véhicules sur une carte en temps réel
- 🚗 Suivre un véhicule spécifique pendant une mission
- 📊 Tableaux de bord de supervision avec données live
- 🔔 Notifications instantanées d'événements (départ, arrêt, alerte)
- 📱 Applications mobiles de tracking pour conducteurs et dispatchers

---

## Architecture

### Flux de Communication

```
┌─────────────────┐         SignalR WebSocket          ┌──────────────────┐
│   Client Web    │ ←──────────────────────────────→  │   GpsHub         │
│   (React/Vue)   │         /hubs/gps                 │   (ASP.NET)      │
└─────────────────┘                                     └──────────────────┘
                                                               │
┌─────────────────┐         SignalR WebSocket                 │
│  Mobile App     │ ←──────────────────────────────→         │
│  (Flutter/RN)   │         /hubs/gps                         │
└─────────────────┘                                            │
                                                               ▼
                                                     ┌──────────────────┐
                                                     │   GpsTracking    │
                                                     │   Service        │
                                                     └──────────────────┘
                                                               │
                                                               ▼
                                                     ┌──────────────────┐
                                                     │   Database       │
                                                     │   (Vehicles,     │
                                                     │   GpsPositions)  │
                                                     └──────────────────┘
```

### Composants Principaux

#### 1. **GpsHub** ([FleetTrack.API/Hubs/GpsHub.cs](../FleetTrack/src/FleetTrack.API/Hubs/GpsHub.cs))

Hub SignalR principal qui gère les connexions et la diffusion des positions GPS.

```csharp
[Authorize]
public class GpsHub : Hub<IGpsClient>
{
    // Méthodes côté serveur appelables par les clients
    Task SubscribeToVehicle(Guid vehicleId)
    Task UnsubscribeFromVehicle(Guid vehicleId)
    Task SubscribeToAllVehicles()
    Task UnsubscribeFromAllVehicles()
    Task SendGpsPosition(GpsPositionUpdateDto position)
    Task SendTrackingEvent(TrackingEventDto trackingEvent)
}
```

#### 2. **IGpsClient** ([FleetTrack.API/Hubs/IGpsClient.cs](../FleetTrack/src/FleetTrack.API/Hubs/IGpsClient.cs))

Interface définissant les méthodes que les clients peuvent recevoir.

```csharp
public interface IGpsClient
{
    Task ReceiveGpsPosition(GpsPositionUpdateDto position);
    Task ReceiveTrackingEvent(TrackingEventDto trackingEvent);
    Task SubscriptionConfirmed(Guid vehicleId);
    Task UnsubscriptionConfirmed(Guid vehicleId);
    Task SubscribedToAllVehicles();
    Task UnsubscribedFromAllVehicles();
}
```

#### 3. **GpsTrackingService** ([FleetTrack.Infrastructure/Services/GpsTrackingService.cs](../FleetTrack/src/FleetTrack.Infrastructure/Services/GpsTrackingService.cs))

Service métier pour la gestion du tracking GPS.

---

## Configuration

### Endpoint SignalR

L'endpoint SignalR est configuré dans [Program.cs](../FleetTrack/src/FleetTrack.API/Program.cs:75):

```csharp
app.MapHub<GpsHub>("/hubs/gps");
```

**URL WebSocket:**
- Développement: `ws://localhost:5115/hubs/gps`
- Production: `wss://yourdomain.com/hubs/gps`

### Options SignalR

```csharp
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});
```

| Option | Valeur | Description |
|--------|--------|-------------|
| `EnableDetailedErrors` | `true` (dev only) | Active les messages d'erreur détaillés |
| `KeepAliveInterval` | 15 secondes | Intervalle de ping pour maintenir la connexion |
| `ClientTimeoutInterval` | 30 secondes | Timeout avant de considérer le client déconnecté |

### CORS

SignalR nécessite une configuration CORS appropriée. Les origines autorisées sont configurées dans [ServiceExtensions.cs](../FleetTrack/src/FleetTrack.API/Extensions/ServiceExtensions.cs):

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Development", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Important pour SignalR!
    });
});
```

⚠️ **Important:** `.AllowCredentials()` est **obligatoire** pour SignalR WebSockets.

---

## Hub GPS

### Connexion au Hub

#### Événements de Connexion

```csharp
public override async Task OnConnectedAsync()
{
    // Le client est automatiquement ajouté au groupe "all"
    await Groups.AddToGroupAsync(Context.ConnectionId, "all");
    await base.OnConnectedAsync();
}

public override async Task OnDisconnectedAsync(Exception? exception)
{
    // Nettoyage automatique des abonnements
    await base.OnDisconnectedAsync(exception);
}
```

### Méthodes Disponibles

#### 1. SubscribeToVehicle

S'abonner aux mises à jour d'un véhicule spécifique.

**Paramètres:**
- `vehicleId` (Guid): ID du véhicule à suivre

**Réponse:**
- Le client reçoit `SubscriptionConfirmed(vehicleId)`

**Exemple:**
```csharp
await connection.InvokeAsync("SubscribeToVehicle", vehicleId);
```

#### 2. UnsubscribeFromVehicle

Se désabonner des mises à jour d'un véhicule.

**Paramètres:**
- `vehicleId` (Guid): ID du véhicule

**Réponse:**
- Le client reçoit `UnsubscriptionConfirmed(vehicleId)`

#### 3. SubscribeToAllVehicles

S'abonner à tous les véhicules de la flotte.

**Réponse:**
- Le client reçoit `SubscribedToAllVehicles()`

#### 4. UnsubscribeFromAllVehicles

Se désabonner de tous les véhicules.

**Réponse:**
- Le client reçoit `UnsubscribedFromAllVehicles()`

#### 5. SendGpsPosition

Envoyer une position GPS (réservé aux Drivers).

**Rôles autorisés:** Admin, Dispatcher, Driver

**Paramètres:**
```json
{
  "vehicleId": "guid",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "speed": 45.5,
  "heading": 180.0,
  "altitude": 100.0,
  "accuracy": 10.0,
  "timestamp": "2025-12-21T12:00:00Z"
}
```

#### 6. SendTrackingEvent

Envoyer un événement de tracking (réservé aux Admin/Dispatcher).

**Rôles autorisés:** Admin, Dispatcher

**Paramètres:**
```json
{
  "eventType": "VehicleMoving",
  "vehicleId": "guid",
  "vehiclePlateNumber": "ABC-123",
  "timestamp": "2025-12-21T12:00:00Z",
  "message": "Le véhicule a démarré"
}
```

---

## Utilisation Côté Client

### JavaScript/TypeScript (React, Vue, Angular)

#### Installation

```bash
npm install @microsoft/signalr
```

#### Connexion Basique

```typescript
import * as signalR from "@microsoft/signalr";

// Créer la connexion
const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:5115/hubs/gps", {
        accessTokenFactory: () => getJwtToken() // Votre JWT token
    })
    .withAutomaticReconnect() // Reconnexion automatique
    .configureLogging(signalR.LogLevel.Information)
    .build();

// Démarrer la connexion
async function start() {
    try {
        await connection.start();
        console.log("✅ Connecté au Hub GPS");
    } catch (err) {
        console.error("❌ Erreur de connexion:", err);
        setTimeout(start, 5000); // Retry après 5 secondes
    }
}

start();
```

#### Recevoir les Positions GPS

```typescript
// Écouter les positions GPS
connection.on("ReceiveGpsPosition", (position) => {
    console.log("📍 Position reçue:", position);

    // Mettre à jour la carte
    updateVehicleOnMap(position.vehicleId, {
        lat: position.latitude,
        lng: position.longitude,
        speed: position.speed,
        heading: position.heading
    });
});

// Écouter les événements de tracking
connection.on("ReceiveTrackingEvent", (event) => {
    console.log("🔔 Événement:", event);

    if (event.eventType === "VehicleMoving") {
        showNotification(`${event.vehiclePlateNumber} a démarré`);
    }
});
```

#### S'abonner à un Véhicule

```typescript
async function subscribeToVehicle(vehicleId: string) {
    try {
        await connection.invoke("SubscribeToVehicle", vehicleId);
        console.log(`✅ Abonné au véhicule ${vehicleId}`);
    } catch (err) {
        console.error("❌ Erreur d'abonnement:", err);
    }
}

// Confirmer l'abonnement
connection.on("SubscriptionConfirmed", (vehicleId) => {
    console.log(`✅ Abonnement confirmé pour ${vehicleId}`);
});
```

#### Exemple Complet React

```typescript
import { useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";

interface GpsPosition {
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    timestamp: string;
}

export function useGpsTracking(jwtToken: string) {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [positions, setPositions] = useState<Map<string, GpsPosition>>(new Map());

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:5115/hubs/gps", {
                accessTokenFactory: () => jwtToken
            })
            .withAutomaticReconnect()
            .build();

        // Écouter les positions
        newConnection.on("ReceiveGpsPosition", (position: GpsPosition) => {
            setPositions(prev => new Map(prev).set(position.vehicleId, position));
        });

        // Démarrer la connexion
        newConnection.start()
            .then(() => {
                console.log("✅ Connecté");
                // S'abonner à tous les véhicules
                newConnection.invoke("SubscribeToAllVehicles");
            })
            .catch(err => console.error("❌ Erreur:", err));

        setConnection(newConnection);

        // Cleanup
        return () => {
            newConnection.stop();
        };
    }, [jwtToken]);

    return { connection, positions };
}
```

### .NET Client (C#)

```csharp
using Microsoft.AspNetCore.SignalR.Client;

var connection = new HubConnectionBuilder()
    .WithUrl("https://localhost:5115/hubs/gps", options =>
    {
        options.AccessTokenProvider = () => Task.FromResult(jwtToken);
    })
    .WithAutomaticReconnect()
    .Build();

// Recevoir les positions
connection.On<GpsPositionUpdateDto>("ReceiveGpsPosition", position =>
{
    Console.WriteLine($"📍 Position: {position.VehicleId} - {position.Latitude}, {position.Longitude}");
});

// Démarrer
await connection.StartAsync();

// S'abonner
await connection.InvokeAsync("SubscribeToVehicle", vehicleId);
```

### Flutter (Dart)

```dart
import 'package:signalr_netcore/signalr_netcore.dart';

final connection = HubConnectionBuilder()
    .withUrl(
        "https://localhost:5115/hubs/gps",
        HttpConnectionOptions(
            accessTokenFactory: () async => jwtToken,
        ))
    .withAutomaticReconnect()
    .build();

// Recevoir les positions
connection.on("ReceiveGpsPosition", (arguments) {
    final position = arguments?[0];
    print("📍 Position: $position");
});

// Démarrer
await connection.start();

// S'abonner
await connection.invoke("SubscribeToVehicle", args: [vehicleId]);
```

---

## DTOs et Modèles

### GpsPositionUpdateDto

Position GPS en temps réel.

```csharp
public class GpsPositionUpdateDto
{
    public Guid VehicleId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? Speed { get; set; }          // km/h
    public double? Heading { get; set; }         // Degrés (0-360)
    public double? Altitude { get; set; }        // Mètres
    public double? Accuracy { get; set; }        // Mètres
    public DateTime Timestamp { get; set; }

    // Optionnel
    public string? VehiclePlateNumber { get; set; }
    public string? VehicleType { get; set; }
    public string? DriverName { get; set; }
    public Guid? CurrentMissionId { get; set; }
}
```

### TrackingEventDto

Événements de tracking.

```csharp
public class TrackingEventDto
{
    public string EventType { get; set; }       // "VehicleMoving", "VehicleStopped", etc.
    public Guid VehicleId { get; set; }
    public string? VehiclePlateNumber { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Message { get; set; }
    public Dictionary<string, object>? AdditionalData { get; set; }
}
```

**Types d'événements:**
- `VehicleConnected` - Véhicule connecté
- `VehicleDisconnected` - Véhicule déconnecté
- `VehicleMoving` - Véhicule en mouvement
- `VehicleStopped` - Véhicule arrêté
- `SpeedLimitExceeded` - Excès de vitesse
- `GeofenceEntered` - Entrée dans une zone
- `GeofenceExited` - Sortie d'une zone

### VehicleTrackingStatusDto

Statut de tracking d'un véhicule.

```csharp
public class VehicleTrackingStatusDto
{
    public Guid VehicleId { get; set; }
    public string PlateNumber { get; set; }
    public string VehicleType { get; set; }
    public bool IsTracking { get; set; }         // Actif si dernière position < 5 min
    public DateTime? LastPositionTime { get; set; }
    public double? LastLatitude { get; set; }
    public double? LastLongitude { get; set; }
    public double? LastSpeed { get; set; }
    public string? CurrentDriverName { get; set; }
    public Guid? CurrentMissionId { get; set; }
    public string? MissionStatus { get; set; }
}
```

---

## Événements et Messages

### Messages Serveur → Client

| Méthode | Description | Données |
|---------|-------------|---------|
| `ReceiveGpsPosition` | Nouvelle position GPS | `GpsPositionUpdateDto` |
| `ReceiveTrackingEvent` | Événement de tracking | `TrackingEventDto` |
| `SubscriptionConfirmed` | Confirmation d'abonnement | `Guid vehicleId` |
| `UnsubscriptionConfirmed` | Confirmation de désabonnement | `Guid vehicleId` |
| `SubscribedToAllVehicles` | Confirmation abonnement global | - |
| `UnsubscribedFromAllVehicles` | Confirmation désabonnement global | - |

### Messages Client → Serveur

| Méthode | Rôles Requis | Paramètres | Description |
|---------|--------------|------------|-------------|
| `SubscribeToVehicle` | Tous (authentifiés) | `Guid vehicleId` | S'abonner à un véhicule |
| `UnsubscribeFromVehicle` | Tous | `Guid vehicleId` | Se désabonner |
| `SubscribeToAllVehicles` | Tous | - | S'abonner à tous |
| `UnsubscribeFromAllVehicles` | Tous | - | Se désabonner de tous |
| `SendGpsPosition` | Driver, Dispatcher, Admin | `GpsPositionUpdateDto` | Envoyer position |
| `SendTrackingEvent` | Dispatcher, Admin | `TrackingEventDto` | Envoyer événement |
| `GetSubscribedVehicles` | Tous | - | Obtenir liste des abonnements |

---

## Sécurité et Authentification

### Authentification JWT

**Toutes les connexions SignalR nécessitent un JWT valide.**

Le Hub est protégé par `[Authorize]`:

```csharp
[Authorize]
public class GpsHub : Hub<IGpsClient>
```

### Envoi du Token

#### JavaScript
```typescript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/gps", {
        accessTokenFactory: () => localStorage.getItem("jwtToken")
    })
    .build();
```

#### C#
```csharp
connection.WithUrl("https://localhost:5115/hubs/gps", options =>
{
    options.AccessTokenProvider = () => Task.FromResult(jwtToken);
});
```

### Permissions par Rôle

| Méthode | Admin | Dispatcher | Driver | Viewer |
|---------|-------|------------|--------|--------|
| SubscribeToVehicle | ✅ | ✅ | ✅ | ✅ |
| ReceiveGpsPosition | ✅ | ✅ | ✅ | ✅ |
| **SendGpsPosition** | ✅ | ✅ | ✅ | ❌ |
| **SendTrackingEvent** | ✅ | ✅ | ❌ | ❌ |

### Accès aux Informations Utilisateur

Dans le Hub, vous pouvez accéder aux informations de l'utilisateur connecté:

```csharp
var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
```

---

## Exemples d'Intégration

### Exemple 1: Carte en Temps Réel (React + Leaflet)

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useGpsTracking } from './hooks/useGpsTracking';

function LiveMap() {
    const { positions } = useGpsTracking(jwtToken);

    return (
        <MapContainer center={[48.8566, 2.3522]} zoom={13}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {Array.from(positions.values()).map(position => (
                <Marker
                    key={position.vehicleId}
                    position={[position.latitude, position.longitude]}
                >
                    <Popup>
                        <div>
                            <strong>{position.vehiclePlateNumber}</strong><br/>
                            Vitesse: {position.speed} km/h<br/>
                            {new Date(position.timestamp).toLocaleTimeString()}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
```

### Exemple 2: Suivi de Mission (Vue.js)

```vue
<template>
  <div class="mission-tracker">
    <h2>Mission: {{ missionId }}</h2>
    <div v-if="currentPosition">
      <p>Position actuelle: {{ currentPosition.latitude }}, {{ currentPosition.longitude }}</p>
      <p>Vitesse: {{ currentPosition.speed }} km/h</p>
      <p>Dernière mise à jour: {{ formatTime(currentPosition.timestamp) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as signalR from '@microsoft/signalr';

const props = defineProps(['vehicleId', 'jwtToken']);
const currentPosition = ref(null);
let connection = null;

onMounted(async () => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/gps', {
      accessTokenFactory: () => props.jwtToken
    })
    .withAutomaticReconnect()
    .build();

  connection.on('ReceiveGpsPosition', (position) => {
    if (position.vehicleId === props.vehicleId) {
      currentPosition.value = position;
    }
  });

  await connection.start();
  await connection.invoke('SubscribeToVehicle', props.vehicleId);
});

onUnmounted(() => {
  if (connection) {
    connection.stop();
  }
});
</script>
```

### Exemple 3: Application Mobile Driver (Flutter)

```dart
class GpsTracker extends StatefulWidget {
  @override
  _GpsTrackerState createState() => _GpsTrackerState();
}

class _GpsTrackerState extends State<GpsTracker> {
  HubConnection? _connection;
  Position? _lastPosition;

  @override
  void initState() {
    super.initState();
    _initSignalR();
    _startLocationUpdates();
  }

  Future<void> _initSignalR() async {
    _connection = HubConnectionBuilder()
        .withUrl("https://api.fleettrack.com/hubs/gps",
            HttpConnectionOptions(
              accessTokenFactory: () async => await getJwtToken(),
            ))
        .withAutomaticReconnect()
        .build();

    await _connection!.start();
    print("✅ Connecté au Hub GPS");
  }

  Future<void> _startLocationUpdates() async {
    // Obtenir la position toutes les 10 secondes
    Timer.periodic(Duration(seconds: 10), (timer) async {
      final position = await _getCurrentPosition();
      await _sendPosition(position);
    });
  }

  Future<void> _sendPosition(Position position) async {
    await _connection?.invoke("SendGpsPosition", args: [
      {
        "vehicleId": currentVehicleId,
        "latitude": position.latitude,
        "longitude": position.longitude,
        "speed": position.speed,
        "heading": position.heading,
        "altitude": position.altitude,
        "accuracy": position.accuracy,
        "timestamp": DateTime.now().toIso8601String(),
      }
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('GPS Tracker')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.gps_fixed, size: 64, color: Colors.green),
            SizedBox(height: 16),
            Text('Position envoyée en temps réel'),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _connection?.stop();
    super.dispose();
  }
}
```

---

## Dépannage

### Problèmes Fréquents

#### 1. Erreur: "Failed to negotiate with the server"

**Cause:** Problème d'authentification JWT ou CORS.

**Solution:**
```typescript
// Vérifier que le token est valide
console.log("Token:", jwtToken);

// Vérifier la configuration CORS côté serveur
// AllowCredentials() doit être activé
```

#### 2. Déconnexions Fréquentes

**Cause:** Réseau instable ou timeout trop court.

**Solution:**
```typescript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/gps")
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry intervals
    .build();
```

#### 3. Les Messages ne sont Pas Reçus

**Cause:** Abonnement manquant ou nom de méthode incorrect.

**Solution:**
```typescript
// Vérifier le nom exact de la méthode (sensible à la casse)
connection.on("ReceiveGpsPosition", (position) => { // Correct
    console.log(position);
});

// Vérifier l'abonnement
await connection.invoke("SubscribeToVehicle", vehicleId);
```

#### 4. Erreur: "401 Unauthorized"

**Cause:** Token JWT manquant, expiré ou invalide.

**Solution:**
```typescript
// Régénérer le token si expiré
const isTokenExpired = checkTokenExpiration(jwtToken);
if (isTokenExpired) {
    jwtToken = await refreshToken();
}

// Recréer la connexion avec le nouveau token
connection.stop();
connection = createConnection(jwtToken);
await connection.start();
```

### Logs et Debugging

#### Activer les Logs Détaillés

**Client (JavaScript):**
```typescript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/gps")
    .configureLogging(signalR.LogLevel.Debug) // Logs détaillés
    .build();
```

**Serveur (appsettings.Development.json):**
```json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.AspNetCore.SignalR": "Debug",
      "Microsoft.AspNetCore.Http.Connections": "Debug"
    }
  }
}
```

### Performance et Optimisation

#### Limiter la Fréquence des Mises à Jour

```typescript
// Throttle: Envoyer max 1 position toutes les 5 secondes
let lastSentTime = 0;
const THROTTLE_MS = 5000;

function sendPosition(position) {
    const now = Date.now();
    if (now - lastSentTime >= THROTTLE_MS) {
        connection.invoke("SendGpsPosition", position);
        lastSentTime = now;
    }
}
```

#### Groupes Intelligents

Le serveur utilise des groupes SignalR pour optimiser la diffusion:

- `vehicle_{id}` - Groupe spécifique à un véhicule
- `all_vehicles` - Groupe pour tous les véhicules
- `all` - Groupe global (tous les clients connectés)

---

## Ressources Supplémentaires

### Documentation Officielle

- [ASP.NET Core SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction)
- [@microsoft/signalr (npm)](https://www.npmjs.com/package/@microsoft/signalr)
- [SignalR Client .NET](https://learn.microsoft.com/en-us/aspnet/core/signalr/dotnet-client)

### Bibliothèques Client

- **JavaScript:** [@microsoft/signalr](https://www.npmjs.com/package/@microsoft/signalr)
- **Java/Android:** [signalr-client-sdk](https://github.com/SignalR/java-client)
- **Flutter/Dart:** [signalr_netcore](https://pub.dev/packages/signalr_netcore)
- **Python:** [signalrcore](https://pypi.org/project/signalrcore/)

### Exemples de Code

Consultez les exemples complets dans:
- [tests/FleetTrack.IntegrationTests](../FleetTrack/tests/FleetTrack.IntegrationTests/) - Tests d'intégration C#
- [documentation/examples/](./examples/) - Exemples clients (à venir)

---

## Support

Pour toute question ou problème :
1. Consultez cette documentation
2. Vérifiez les logs serveur et client
3. Consultez les [issues GitHub](https://github.com/your-repo/FleetTrack/issues)
4. Contactez l'équipe de développement

---

**🎯 Prêt à implémenter le tracking en temps réel!**

*Dernière mise à jour: Décembre 2025*
