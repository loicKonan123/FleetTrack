# Définitions : API REST et HTTP

> Guide complet des concepts d'API REST utilisés dans FleetTrack

---

## Table des Matières

1. [Concepts Fondamentaux](#1-concepts-fondamentaux)
2. [HTTP - Le Protocole](#2-http---le-protocole)
3. [REST - Architecture](#3-rest---architecture)
4. [Controllers ASP.NET Core](#4-controllers-aspnet-core)
5. [Routing (Routage)](#5-routing-routage)
6. [Request/Response](#6-requestresponse)
7. [Middleware](#7-middleware)
8. [Validation](#8-validation)

---

## 1. Concepts Fondamentaux

### 1.1 API (Application Programming Interface)

#### Définition
Une **API** est un ensemble de règles qui permet à différents logiciels de communiquer entre eux. C'est un "contrat" qui définit comment demander et recevoir des données.

#### Analogie
L'API est comme un **serveur au restaurant**. Tu ne vas pas en cuisine faire ton plat toi-même. Tu passes ta commande (requête), le serveur la transmet à la cuisine (serveur), et il te ramène ton plat (réponse).

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   CLIENT    │ ──────► │     API     │ ──────► │   SERVEUR   │
│  (Browser,  │ Requête │  (Serveur)  │ Traite  │    (BDD,    │
│   Mobile)   │ ◄────── │             │ ◄────── │   Logic)    │
│             │ Réponse │             │ Données │             │
└─────────────┘         └─────────────┘         └─────────────┘
```

### 1.2 Web API

#### Définition
Une **Web API** est une API accessible via le protocole HTTP sur Internet. Elle permet à des applications distantes de communiquer.

```
Frontend (Next.js)                    Backend (ASP.NET Core)
┌───────────────────┐                ┌───────────────────┐
│                   │   HTTP/HTTPS   │                   │
│  fetch('/api/     │ ──────────────►│  [HttpGet]        │
│    vehicles')     │                │  GetVehicles()    │
│                   │ ◄──────────────│                   │
│  { vehicles: [...]}     JSON       │  return Ok(...)   │
└───────────────────┘                └───────────────────┘
```

---

## 2. HTTP - Le Protocole

### 2.1 Qu'est-ce que HTTP ?

#### Définition
**HTTP** (HyperText Transfer Protocol) est le protocole de communication du web. Il définit comment les clients et serveurs échangent des données.

### 2.2 Méthodes HTTP (Verbes)

| Méthode | Action | Idempotent | Safe | Exemple |
|---------|--------|------------|------|---------|
| **GET** | Lire | Oui | Oui | Récupérer un véhicule |
| **POST** | Créer | Non | Non | Créer un véhicule |
| **PUT** | Remplacer | Oui | Non | Remplacer un véhicule |
| **PATCH** | Modifier partiellement | Non | Non | Modifier le statut |
| **DELETE** | Supprimer | Oui | Non | Supprimer un véhicule |

#### Idempotent
Une opération est **idempotente** si l'exécuter plusieurs fois produit le même résultat.
- GET /vehicles/123 → Toujours le même véhicule
- DELETE /vehicles/123 → La 2ème fois, déjà supprimé (même effet)
- POST /vehicles → Crée un NOUVEAU véhicule à chaque fois (non idempotent)

#### Safe (Sûr)
Une opération est **safe** si elle ne modifie pas les données côté serveur.
- GET = safe (lecture seule)
- POST/PUT/DELETE = non safe (modification)

### 2.3 Codes de Statut HTTP

```
┌─────────────────────────────────────────────────────────────┐
│                    CODES DE STATUT HTTP                     │
├─────────────────────────────────────────────────────────────┤
│  1xx - INFORMATION (rare)                                   │
│  ─────────────────────                                      │
│  100 Continue          En cours de traitement               │
│                                                             │
│  2xx - SUCCÈS                                               │
│  ───────────                                                │
│  200 OK                Requête réussie (GET, PUT)           │
│  201 Created           Ressource créée (POST)               │
│  204 No Content        Succès sans contenu (DELETE)         │
│                                                             │
│  3xx - REDIRECTION                                          │
│  ──────────────────                                         │
│  301 Moved Permanently URL a changé définitivement          │
│  302 Found             Redirection temporaire               │
│  304 Not Modified      Utiliser le cache                    │
│                                                             │
│  4xx - ERREUR CLIENT                                        │
│  ────────────────────                                       │
│  400 Bad Request       Requête mal formée                   │
│  401 Unauthorized      Non authentifié                      │
│  403 Forbidden         Pas les droits                       │
│  404 Not Found         Ressource introuvable                │
│  409 Conflict          Conflit (ex: doublon)                │
│  422 Unprocessable     Validation échouée                   │
│                                                             │
│  5xx - ERREUR SERVEUR                                       │
│  ─────────────────────                                      │
│  500 Internal Error    Erreur côté serveur                  │
│  502 Bad Gateway       Serveur intermédiaire en erreur      │
│  503 Service Unavail.  Service indisponible                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Headers (En-têtes)

```http
# Requête
GET /api/vehicles HTTP/1.1
Host: api.fleettrack.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
Accept-Language: fr-FR

# Réponse
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 1234
Cache-Control: no-cache
X-Request-Id: abc-123-def
```

#### Headers courants

| Header | Rôle | Exemple |
|--------|------|---------|
| `Content-Type` | Type de données envoyées | `application/json` |
| `Accept` | Type de données attendues | `application/json` |
| `Authorization` | Authentification | `Bearer <token>` |
| `Cache-Control` | Gestion du cache | `no-cache`, `max-age=3600` |
| `Origin` | Source de la requête (CORS) | `https://app.fleettrack.com` |

---

## 3. REST - Architecture

### 3.1 Qu'est-ce que REST ?

#### Définition
**REST** (Representational State Transfer) est un style d'architecture pour concevoir des APIs web. Ce n'est pas un protocole, mais un ensemble de conventions.

### 3.2 Principes REST

#### 1. Resources (Ressources)
Tout est une **ressource** identifiée par une URL.

```
/api/vehicles          → Collection de véhicules
/api/vehicles/123      → Un véhicule spécifique
/api/vehicles/123/missions → Missions d'un véhicule
```

#### 2. Représentations
Une ressource peut avoir plusieurs représentations (JSON, XML, etc.).

```json
// Représentation JSON d'un véhicule
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "plateNumber": "AB-123-CD",
  "brand": "Toyota",
  "model": "Corolla",
  "type": "Car",
  "status": "Available"
}
```

#### 3. Stateless (Sans état)
Chaque requête contient TOUTES les informations nécessaires. Le serveur ne garde pas d'état entre les requêtes.

```http
# ❌ MAUVAIS - Le serveur se "souvient" de l'utilisateur
GET /api/my-vehicles

# ✅ BON - L'identité est dans chaque requête
GET /api/vehicles?userId=123
Authorization: Bearer <token>
```

#### 4. HATEOAS (Hypermedia)
Les réponses contiennent des liens vers les actions possibles.

```json
{
  "id": "123",
  "plateNumber": "AB-123-CD",
  "_links": {
    "self": "/api/vehicles/123",
    "missions": "/api/vehicles/123/missions",
    "delete": "/api/vehicles/123"
  }
}
```

### 3.3 Design d'URLs REST

```
# COLLECTION
GET    /api/vehicles           → Liste tous les véhicules
POST   /api/vehicles           → Crée un véhicule

# RESSOURCE UNIQUE
GET    /api/vehicles/{id}      → Récupère un véhicule
PUT    /api/vehicles/{id}      → Remplace un véhicule
PATCH  /api/vehicles/{id}      → Modifie partiellement
DELETE /api/vehicles/{id}      → Supprime un véhicule

# SOUS-RESSOURCES
GET    /api/vehicles/{id}/missions     → Missions du véhicule
POST   /api/vehicles/{id}/missions     → Assigne une mission

# ACTIONS SPÉCIALES (quand CRUD ne suffit pas)
POST   /api/vehicles/{id}/start-tracking  → Démarre le tracking
POST   /api/auth/login                    → Connexion

# FILTRAGE, TRI, PAGINATION (Query Parameters)
GET    /api/vehicles?type=truck&status=available
GET    /api/vehicles?sort=plateNumber&order=asc
GET    /api/vehicles?page=2&pageSize=10
GET    /api/vehicles?search=toyota
```

---

## 4. Controllers ASP.NET Core

### 4.1 Controller

#### Définition
Un **Controller** est une classe qui gère les requêtes HTTP entrantes et retourne des réponses. C'est le point d'entrée de l'API.

```csharp
using Microsoft.AspNetCore.Mvc;

namespace FleetTrack.API.Controllers;

// [ApiController] active les comportements API
// [Route] définit l'URL de base
[ApiController]
[Route("api/[controller]")]  // → /api/vehicles
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    private readonly ILogger<VehiclesController> _logger;

    // Injection de dépendances via constructeur
    public VehiclesController(
        IVehicleService vehicleService,
        ILogger<VehiclesController> logger)
    {
        _vehicleService = vehicleService;
        _logger = logger;
    }

    // Actions (méthodes qui gèrent les requêtes)
    // ...
}
```

### 4.2 ControllerBase vs Controller

```csharp
// ControllerBase = Pour les APIs (pas de vues)
public class VehiclesController : ControllerBase { }

// Controller = Pour MVC avec vues Razor
public class HomeController : Controller { }
```

### 4.3 Attributs de Controller

```csharp
[ApiController]           // Active validation auto, binding, etc.
[Route("api/[controller]")]  // Route de base
[Authorize]               // Requiert authentification
[Authorize(Roles = "Admin")]  // Requiert le rôle Admin
[AllowAnonymous]          // Accessible sans auth (sur une action)
[Produces("application/json")]  // Type de réponse
[Consumes("application/json")]  // Type accepté en entrée
```

### 4.4 Actions (Méthodes d'endpoint)

```csharp
[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    // GET /api/vehicles
    [HttpGet]
    public async Task<ActionResult<PagedResult<VehicleDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] VehicleType? type = null)
    {
        var result = await _vehicleService.GetAllAsync(page, pageSize, search, type);
        return Ok(result);
    }

    // GET /api/vehicles/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VehicleDto>> GetById(Guid id)
    {
        var vehicle = await _vehicleService.GetByIdAsync(id);

        if (vehicle == null)
            return NotFound();

        return Ok(vehicle);
    }

    // POST /api/vehicles
    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<VehicleDto>> Create([FromBody] CreateVehicleDto dto)
    {
        try
        {
            var vehicle = await _vehicleService.CreateAsync(dto);

            // 201 Created avec l'URL de la nouvelle ressource
            return CreatedAtAction(
                nameof(GetById),
                new { id = vehicle.Id },
                vehicle);
        }
        catch (DuplicatePlateNumberException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // PUT /api/vehicles/{id}
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult<VehicleDto>> Update(Guid id, [FromBody] UpdateVehicleDto dto)
    {
        var vehicle = await _vehicleService.UpdateAsync(id, dto);

        if (vehicle == null)
            return NotFound();

        return Ok(vehicle);
    }

    // DELETE /api/vehicles/{id}
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var success = await _vehicleService.DeleteAsync(id);

        if (!success)
            return NotFound();

        return NoContent();  // 204 No Content
    }

    // POST /api/vehicles/{id}/assign-mission
    [HttpPost("{id:guid}/assign-mission")]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<ActionResult> AssignMission(
        Guid id,
        [FromBody] AssignMissionDto dto)
    {
        try
        {
            await _vehicleService.AssignMissionAsync(id, dto.MissionId);
            return Ok();
        }
        catch (VehicleNotFoundException)
        {
            return NotFound(new { message = "Véhicule non trouvé" });
        }
        catch (VehicleNotAvailableException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
```

### 4.5 Types de Retour

```csharp
// ActionResult<T> - Retour typé avec différents codes
public async Task<ActionResult<VehicleDto>> GetById(Guid id)
{
    var vehicle = await _service.GetByIdAsync(id);
    if (vehicle == null)
        return NotFound();   // 404
    return Ok(vehicle);      // 200 + données
}

// IActionResult - Retour non typé
public async Task<IActionResult> Delete(Guid id)
{
    await _service.DeleteAsync(id);
    return NoContent();  // 204
}

// Méthodes helper courantes
return Ok(data);                    // 200 + données
return Created(url, data);          // 201 + données
return CreatedAtAction(...);        // 201 + lien
return NoContent();                 // 204
return BadRequest(error);           // 400
return Unauthorized();              // 401
return Forbid();                    // 403
return NotFound();                  // 404
return Conflict(error);             // 409
return UnprocessableEntity(errors); // 422
return StatusCode(500, error);      // 500
```

---

## 5. Routing (Routage)

### 5.1 Définition

Le **routing** est le mécanisme qui associe une URL à une action de controller.

### 5.2 Route Templates

```csharp
// Route de base sur le controller
[Route("api/[controller]")]  // [controller] = nom du controller sans "Controller"
public class VehiclesController : ControllerBase  // → /api/vehicles

// Routes sur les actions
[HttpGet]                    // GET /api/vehicles
[HttpGet("{id}")]           // GET /api/vehicles/123
[HttpGet("{id:guid}")]      // GET /api/vehicles/guid-format-only
[HttpPost]                   // POST /api/vehicles
[HttpPut("{id}")]           // PUT /api/vehicles/123
[HttpDelete("{id}")]        // DELETE /api/vehicles/123

// Routes personnalisées
[HttpGet("active")]          // GET /api/vehicles/active
[HttpGet("by-plate/{plate}")] // GET /api/vehicles/by-plate/AB-123
[HttpPost("{id}/start")]     // POST /api/vehicles/123/start
```

### 5.3 Contraintes de Route

```csharp
// Type constraints
[HttpGet("{id:int}")]      // Uniquement si id est un int
[HttpGet("{id:guid}")]     // Uniquement si id est un GUID
[HttpGet("{name:alpha}")] // Uniquement lettres

// Range constraints
[HttpGet("{page:int:min(1)}")]           // page >= 1
[HttpGet("{size:int:range(1,100)}")]    // 1 <= size <= 100

// Length constraints
[HttpGet("{code:length(6)}")]           // Exactement 6 caractères
[HttpGet("{name:minlength(3)}")]        // Au moins 3 caractères

// Regex
[HttpGet("{plate:regex(^[A-Z]{{2}}-\\d{{3}}-[A-Z]{{2}}$)}")]

// Optional et default
[HttpGet("{id?}")]           // id optionnel
[HttpGet("{page:int=1}")]    // page par défaut = 1
```

### 5.4 Sources de Données

```csharp
[HttpPost("{id}")]
public async Task<ActionResult> Update(
    [FromRoute] Guid id,           // Depuis l'URL: /api/vehicles/{id}
    [FromQuery] bool force,        // Depuis query: ?force=true
    [FromBody] UpdateVehicleDto dto, // Depuis le corps JSON
    [FromHeader(Name = "X-Correlation-Id")] string? correlationId,  // Depuis headers
    [FromServices] ILogger<Controller> logger)  // Injection de service
{
    // ...
}

// [FromRoute] est implicite pour les paramètres de route
// [FromBody] est implicite pour les objets complexes avec [ApiController]
// [FromQuery] est implicite pour les types simples avec [ApiController]
```

---

## 6. Request/Response

### 6.1 DTO (Data Transfer Object)

#### Définition
Un **DTO** est un objet simple utilisé pour transférer des données entre le client et le serveur. Il ne contient pas de logique métier.

#### Pourquoi utiliser des DTOs ?

1. **Sécurité** : Ne pas exposer les entités internes
2. **Flexibilité** : Format adapté au client
3. **Versioning** : Changer le DTO sans changer l'entité
4. **Validation** : Attributs de validation spécifiques

```csharp
// Entité (interne, BDD)
public class Vehicle
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public VehicleType Type { get; set; }
    public VehicleStatus Status { get; set; }
    public string? InternalNotes { get; set; }  // Info sensible
    public string PasswordHash { get; set; }    // Ne jamais exposer!
    public DateTime CreatedAt { get; set; }
}

// DTO de lecture (ce que le client reçoit)
public class VehicleDto
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public VehicleType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;  // Ajouté pour affichage
    public VehicleStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    // Pas de InternalNotes ni PasswordHash!
}

// DTO de création (ce que le client envoie)
public class CreateVehicleDto
{
    [Required(ErrorMessage = "La plaque est obligatoire")]
    [StringLength(20, MinimumLength = 5)]
    [RegularExpression(@"^[A-Z]{2}-\d{3}-[A-Z]{2}$",
        ErrorMessage = "Format de plaque invalide")]
    public string PlateNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Model { get; set; } = string.Empty;

    [Required]
    public VehicleType Type { get; set; }
    // Pas d'Id (généré automatiquement)
    // Pas de Status (défaut: Available)
}

// DTO de mise à jour
public class UpdateVehicleDto
{
    [Required]
    [StringLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Model { get; set; } = string.Empty;

    public VehicleType Type { get; set; }
    public VehicleStatus Status { get; set; }
    // Pas de PlateNumber (non modifiable après création)
}
```

### 6.2 Mapping Entity ↔ DTO

```csharp
public class VehicleService : IVehicleService
{
    // Mapping manuel
    private static VehicleDto MapToDto(Vehicle vehicle)
    {
        return new VehicleDto
        {
            Id = vehicle.Id,
            PlateNumber = vehicle.PlateNumber,
            Brand = vehicle.Brand,
            Model = vehicle.Model,
            Type = vehicle.Type,
            TypeName = vehicle.Type.ToString(),
            Status = vehicle.Status,
            StatusName = vehicle.Status.ToString()
        };
    }

    private static Vehicle MapToEntity(CreateVehicleDto dto)
    {
        return new Vehicle
        {
            Id = Guid.NewGuid(),
            PlateNumber = dto.PlateNumber,
            Brand = dto.Brand,
            Model = dto.Model,
            Type = dto.Type,
            Status = VehicleStatus.Available,
            CreatedAt = DateTime.UtcNow
        };
    }

    public async Task<VehicleDto?> GetByIdAsync(Guid id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        return vehicle == null ? null : MapToDto(vehicle);
    }

    public async Task<VehicleDto> CreateAsync(CreateVehicleDto dto)
    {
        var vehicle = MapToEntity(dto);
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        return MapToDto(vehicle);
    }
}
```

### 6.3 Pagination Response

```csharp
// DTO générique pour pagination
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}

// Utilisation
[HttpGet]
public async Task<ActionResult<PagedResult<VehicleDto>>> GetAll(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
{
    var result = await _vehicleService.GetAllAsync(page, pageSize);
    return Ok(result);
}

// Réponse JSON
{
  "items": [
    { "id": "...", "plateNumber": "AB-123-CD", ... },
    { "id": "...", "plateNumber": "XY-789-ZZ", ... }
  ],
  "totalCount": 47,
  "page": 2,
  "pageSize": 10,
  "totalPages": 5,
  "hasPreviousPage": true,
  "hasNextPage": true
}
```

---

## 7. Middleware

### 7.1 Définition

Un **middleware** est un composant qui traite les requêtes et réponses dans un pipeline. Chaque middleware peut agir sur la requête avant de la passer au suivant, et sur la réponse au retour.

```
           REQUÊTE
              │
              ▼
┌─────────────────────────┐
│    Logging Middleware   │  ← Log de la requête
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     Auth Middleware     │  ← Vérifie le JWT
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    CORS Middleware      │  ← Gère les headers CORS
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Exception Middleware  │  ← Attrape les erreurs
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│      Controller         │  ← Traitement métier
└───────────┬─────────────┘
            │
            ▼
          RÉPONSE
```

### 7.2 Configuration dans Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Ajout des services
builder.Services.AddControllers();
builder.Services.AddDbContext<FleetTrackDbContext>(...);
builder.Services.AddScoped<IVehicleService, VehicleService>();

var app = builder.Build();

// Pipeline de middlewares (ORDRE IMPORTANT!)

// 1. Gestion des erreurs (premier pour tout attraper)
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();  // Erreurs détaillées
}
else
{
    app.UseExceptionHandler("/error");  // Page d'erreur générique
    app.UseHsts();
}

// 2. Redirection HTTPS
app.UseHttpsRedirection();

// 3. Fichiers statiques (si nécessaire)
app.UseStaticFiles();

// 4. Routing (prépare le routage)
app.UseRouting();

// 5. CORS (avant auth!)
app.UseCors("AllowFrontend");

// 6. Authentification (qui es-tu?)
app.UseAuthentication();

// 7. Autorisation (as-tu le droit?)
app.UseAuthorization();

// 8. Mapping des controllers
app.MapControllers();
app.MapHub<GpsTrackingHub>("/hubs/gps-tracking");

app.Run();
```

### 7.3 Middleware Personnalisé

```csharp
// Middleware de logging
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(
        RequestDelegate next,
        ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // AVANT le traitement
        var startTime = DateTime.UtcNow;
        _logger.LogInformation(
            "Requête: {Method} {Path}",
            context.Request.Method,
            context.Request.Path);

        // Passe au middleware suivant
        await _next(context);

        // APRÈS le traitement (réponse)
        var elapsed = DateTime.UtcNow - startTime;
        _logger.LogInformation(
            "Réponse: {StatusCode} en {Elapsed}ms",
            context.Response.StatusCode,
            elapsed.TotalMilliseconds);
    }
}

// Extension pour l'enregistrement
public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseRequestLogging(
        this IApplicationBuilder app)
    {
        return app.UseMiddleware<RequestLoggingMiddleware>();
    }
}

// Utilisation dans Program.cs
app.UseRequestLogging();
```

### 7.4 Exception Handling Middleware

```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
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
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        _logger.LogError(ex, "Une erreur s'est produite");

        var response = context.Response;
        response.ContentType = "application/json";

        var (statusCode, message) = ex switch
        {
            NotFoundException => (404, ex.Message),
            ValidationException => (400, ex.Message),
            UnauthorizedAccessException => (401, "Non autorisé"),
            ForbiddenException => (403, "Accès refusé"),
            _ => (500, "Une erreur interne s'est produite")
        };

        response.StatusCode = statusCode;

        await response.WriteAsJsonAsync(new
        {
            error = message,
            statusCode = statusCode,
            timestamp = DateTime.UtcNow
        });
    }
}
```

---

## 8. Validation

### 8.1 Data Annotations

```csharp
public class CreateVehicleDto
{
    [Required(ErrorMessage = "La plaque est obligatoire")]
    [StringLength(20, MinimumLength = 5,
        ErrorMessage = "La plaque doit faire entre 5 et 20 caractères")]
    [RegularExpression(@"^[A-Z]{2}-\d{3}-[A-Z]{2}$",
        ErrorMessage = "Format invalide (ex: AB-123-CD)")]
    public string PlateNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "La marque est obligatoire")]
    [StringLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Model { get; set; } = string.Empty;

    [Range(1900, 2100, ErrorMessage = "Année invalide")]
    public int? Year { get; set; }

    [Range(0, 10000000, ErrorMessage = "Kilométrage invalide")]
    public int? Mileage { get; set; }

    [EmailAddress(ErrorMessage = "Email invalide")]
    public string? OwnerEmail { get; set; }

    [Phone(ErrorMessage = "Téléphone invalide")]
    public string? OwnerPhone { get; set; }

    [Url(ErrorMessage = "URL invalide")]
    public string? ImageUrl { get; set; }
}
```

### 8.2 Validation Automatique avec [ApiController]

```csharp
[ApiController]
public class VehiclesController : ControllerBase
{
    // Avec [ApiController], la validation est automatique
    // Si invalide → 400 Bad Request automatiquement

    [HttpPost]
    public async Task<ActionResult<VehicleDto>> Create(CreateVehicleDto dto)
    {
        // Pas besoin de if (!ModelState.IsValid)
        // [ApiController] retourne automatiquement 400 si invalide

        var vehicle = await _vehicleService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = vehicle.Id }, vehicle);
    }
}
```

### 8.3 Réponse de Validation

```json
// Requête invalide
POST /api/vehicles
{
  "plateNumber": "AB",
  "brand": "",
  "model": "Corolla"
}

// Réponse automatique 400 Bad Request
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "PlateNumber": [
      "La plaque doit faire entre 5 et 20 caractères"
    ],
    "Brand": [
      "La marque est obligatoire"
    ]
  }
}
```

### 8.4 Validation Personnalisée

```csharp
// Attribut de validation personnalisé
public class FutureDateAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(
        object? value,
        ValidationContext validationContext)
    {
        if (value is DateTime date)
        {
            if (date <= DateTime.UtcNow)
            {
                return new ValidationResult(
                    ErrorMessage ?? "La date doit être dans le futur");
            }
        }

        return ValidationResult.Success;
    }
}

// Utilisation
public class CreateMissionDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [FutureDate(ErrorMessage = "La date de début doit être dans le futur")]
    public DateTime StartDate { get; set; }
}
```

---

## Résumé

| Concept | Description |
|---------|-------------|
| **API** | Interface de communication entre applications |
| **REST** | Style d'architecture basé sur les ressources |
| **HTTP** | Protocole de communication web |
| **Controller** | Classe gérant les requêtes HTTP |
| **Action** | Méthode d'un controller pour un endpoint |
| **Routing** | Association URL → Action |
| **DTO** | Objet de transfert de données |
| **Middleware** | Composant du pipeline de traitement |
| **Validation** | Vérification des données entrantes |

---

[← Précédent : Base de données](./03-database.md) | [Suivant : Authentification →](./05-authentication.md)
