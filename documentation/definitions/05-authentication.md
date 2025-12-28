# Définitions : Authentification et Sécurité

> Guide complet des concepts de sécurité utilisés dans FleetTrack

---

## Table des Matières

1. [Authentification vs Autorisation](#1-authentification-vs-autorisation)
2. [JWT (JSON Web Token)](#2-jwt-json-web-token)
3. [Hachage de Mot de Passe](#3-hachage-de-mot-de-passe)
4. [Refresh Tokens](#4-refresh-tokens)
5. [RBAC (Role-Based Access Control)](#5-rbac-role-based-access-control)
6. [CORS](#6-cors)
7. [Implémentation dans FleetTrack](#7-implémentation-dans-fleettrack)

---

## 1. Authentification vs Autorisation

### 1.1 Authentification

#### Définition
L'**authentification** répond à la question : **"Qui es-tu ?"**

C'est le processus de vérification de l'identité d'un utilisateur.

#### Analogie
C'est comme montrer ta **carte d'identité** à l'entrée d'un bâtiment.

```
Utilisateur                        Serveur
    │                                  │
    │  1. "Je suis Jean" + password    │
    ├─────────────────────────────────►│
    │                                  │ Vérifie
    │  2. "OK, voici ton badge (JWT)"  │
    │◄─────────────────────────────────┤
    │                                  │
```

### 1.2 Autorisation

#### Définition
L'**autorisation** répond à la question : **"As-tu le droit ?"**

C'est le processus de vérification des permissions après l'authentification.

#### Analogie
Tu es entré dans le bâtiment (authentifié), mais as-tu accès à la salle des serveurs ? (autorisé)

```
Utilisateur (authentifié)              Serveur
    │                                      │
    │  "Je veux accéder à /admin"          │
    ├─────────────────────────────────────►│
    │                                      │ Vérifie le rôle
    │  403 Forbidden (pas Admin)           │
    │◄─────────────────────────────────────┤
    │                                      │
```

### 1.3 Tableau Comparatif

| Aspect | Authentification | Autorisation |
|--------|------------------|--------------|
| Question | Qui es-tu ? | As-tu le droit ? |
| Moment | Avant l'accès | Après authentification |
| Vérification | Identité (login/password) | Permissions (rôles) |
| Erreur HTTP | 401 Unauthorized | 403 Forbidden |
| Exemple | Connexion | Accès page admin |

---

## 2. JWT (JSON Web Token)

### 2.1 Définition

Un **JWT** est un token (jeton) auto-contenu qui transporte des informations (claims) de manière sécurisée entre le client et le serveur.

#### Analogie
C'est comme un **pass VIP** tamponné. Le pass contient ton nom et tes privilèges, et le tampon (signature) prouve qu'il est authentique.

### 2.2 Structure d'un JWT

Un JWT est composé de 3 parties séparées par des points :

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJyb2xlIjoiQWRtaW4ifQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

│_________________________________│  │_________________________________│  │______________________________│
           HEADER                            PAYLOAD                           SIGNATURE
       (Algorithme)                     (Données/Claims)                    (Vérification)
```

### 2.3 Les 3 Parties

#### 1. Header (En-tête)
```json
{
  "alg": "HS256",    // Algorithme de signature
  "typ": "JWT"       // Type de token
}
```

#### 2. Payload (Données/Claims)
```json
{
  // Claims standards (réservés)
  "sub": "user-id-123",              // Subject (ID utilisateur)
  "iat": 1703674800,                 // Issued At (date création)
  "exp": 1703761200,                 // Expiration
  "iss": "https://fleettrack.com",   // Issuer (émetteur)
  "aud": "https://api.fleettrack.com", // Audience (destinataire)
  "jti": "unique-token-id",          // JWT ID (identifiant unique)

  // Claims personnalisés
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "role": "Admin",
  "permissions": ["read", "write", "delete"]
}
```

#### 3. Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### 2.4 Flux d'Authentification JWT

```
┌─────────────┐                           ┌─────────────┐
│   CLIENT    │                           │   SERVEUR   │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       │  1. POST /api/auth/login                │
       │     { username, password }              │
       ├────────────────────────────────────────►│
       │                                         │ Vérifie credentials
       │                                         │ Génère JWT
       │  2. { accessToken, refreshToken }       │
       │◄────────────────────────────────────────┤
       │                                         │
       │  3. GET /api/vehicles                   │
       │     Authorization: Bearer <token>       │
       ├────────────────────────────────────────►│
       │                                         │ Valide signature
       │                                         │ Vérifie expiration
       │                                         │ Extrait les claims
       │  4. { vehicles: [...] }                 │
       │◄────────────────────────────────────────┤
       │                                         │
```

### 2.5 Avantages du JWT

| Avantage | Explication |
|----------|-------------|
| **Stateless** | Le serveur n'a pas besoin de stocker de session |
| **Scalable** | Fonctionne avec plusieurs serveurs sans synchronisation |
| **Mobile-friendly** | Pas de cookies, juste un header |
| **Cross-domain** | Peut être utilisé sur différents domaines |
| **Auto-contenu** | Contient toutes les infos nécessaires |

### 2.6 Sécurité JWT

```csharp
// ❌ MAUVAIS : Stocker des infos sensibles
{
  "password": "secret123",        // JAMAIS!
  "creditCard": "4532-xxxx"       // JAMAIS!
}

// ✅ BON : Uniquement des infos non sensibles
{
  "sub": "user-id",
  "role": "Admin",
  "name": "Jean"
}

// Le JWT est encodé, PAS chiffré!
// N'importe qui peut lire le payload en le décodant (base64)
// La signature garantit l'intégrité, pas la confidentialité
```

---

## 3. Hachage de Mot de Passe

### 3.1 Définition

Le **hachage** transforme un mot de passe en une chaîne de caractères fixe et irréversible. On ne peut PAS retrouver le mot de passe original à partir du hash.

#### Analogie
C'est comme un **hachoir à viande**. Tu mets un steak, tu obtiens de la viande hachée. Tu ne peux pas reconstituer le steak original à partir du haché.

### 3.2 Pourquoi hacher ?

```
❌ STOCKAGE EN CLAIR
┌────────────────────────────────┐
│ Users Table                    │
├─────────────┬──────────────────┤
│ Username    │ Password         │
├─────────────┼──────────────────┤
│ jean        │ motdepasse123    │ ← Visible par les hackers!
│ marie       │ azerty456        │
└─────────────┴──────────────────┘

✅ STOCKAGE HACHÉ
┌────────────────────────────────────────────────────────┐
│ Users Table                                            │
├─────────────┬──────────────────────────────────────────┤
│ Username    │ PasswordHash                             │
├─────────────┼──────────────────────────────────────────┤
│ jean        │ $2a$12$LQv3c1yqBWVHxkd0LHAkCOY...       │
│ marie       │ $2a$12$N9qo8uLOickgx2ZMRZoMye...       │
└─────────────┴──────────────────────────────────────────┘
       Inutilisable même si la BDD est volée!
```

### 3.3 BCrypt

#### Définition
**BCrypt** est un algorithme de hachage conçu pour les mots de passe. Il est lent intentionnellement pour résister aux attaques par force brute.

```csharp
// FleetTrack.Infrastructure/Services/BCryptPasswordHasher.cs
using BCrypt.Net;

public class BCryptPasswordHasher : IPasswordHasher
{
    // Coût = nombre d'itérations (2^12 = 4096)
    private const int WorkFactor = 12;

    public string Hash(string password)
    {
        // Génère un salt aléatoire et hache
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool Verify(string password, string hash)
    {
        // Compare le mot de passe avec le hash
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}

// Utilisation
var hasher = new BCryptPasswordHasher();

// À l'inscription
string hash = hasher.Hash("MonMotDePasse123!");
// Résultat: $2a$12$LQv3c1yqBWVHxkd0LHAkCO...

// À la connexion
bool isValid = hasher.Verify("MonMotDePasse123!", hash);
// true si correct, false sinon
```

### 3.4 Salt (Sel)

#### Définition
Le **salt** est une valeur aléatoire ajoutée au mot de passe avant le hachage. Il empêche les attaques par tables arc-en-ciel.

```
Sans salt:
"password123" → hash("password123") → abc123...
                (Même hash pour tout le monde qui utilise "password123")

Avec salt (inclus dans BCrypt):
"password123" + salt1 → hash(...) → xyz789...
"password123" + salt2 → hash(...) → def456...
                (Hash différent pour chaque utilisateur!)
```

### 3.5 Comparaison des Algorithmes

| Algorithme | Sécurité | Utilisation |
|------------|----------|-------------|
| MD5 | ❌ Cassé | JAMAIS pour mots de passe |
| SHA-1 | ❌ Cassé | JAMAIS pour mots de passe |
| SHA-256 | ⚠️ Trop rapide | Intégrité fichiers, pas MDP |
| **BCrypt** | ✅ Recommandé | Mots de passe |
| Argon2 | ✅ Moderne | Mots de passe (nouveau standard) |

---

## 4. Refresh Tokens

### 4.1 Problème

Les JWT ont une durée de vie courte (15-60 min) pour des raisons de sécurité. Mais on ne veut pas que l'utilisateur se reconnecte toutes les heures!

### 4.2 Solution : Refresh Token

Le **refresh token** est un token à longue durée de vie (jours/semaines) qui permet d'obtenir un nouveau access token sans redemander le mot de passe.

```
┌─────────────┐                           ┌─────────────┐
│   CLIENT    │                           │   SERVEUR   │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       │  1. Login avec username/password        │
       ├────────────────────────────────────────►│
       │                                         │
       │  2. accessToken (15min) + refreshToken (30j)
       │◄────────────────────────────────────────┤
       │                                         │
       │     ... utilise accessToken ...         │
       │                                         │
       │  3. accessToken expiré!                 │
       │                                         │
       │  4. POST /api/auth/refresh              │
       │     { accessToken, refreshToken }       │
       ├────────────────────────────────────────►│
       │                                         │ Valide refreshToken
       │  5. Nouveau accessToken + refreshToken  │
       │◄────────────────────────────────────────┤
       │                                         │
```

### 4.3 Différences

| Aspect | Access Token | Refresh Token |
|--------|--------------|---------------|
| Durée | Courte (15-60 min) | Longue (7-30 jours) |
| Stockage | Mémoire/LocalStorage | HttpOnly Cookie ou Secure Storage |
| Contenu | Claims utilisateur | Juste un identifiant |
| Utilisation | Chaque requête API | Uniquement pour refresh |
| Si volé | Dommages limités (expire vite) | Plus dangereux |

### 4.4 Implémentation FleetTrack

```csharp
public class AuthService : IAuthService
{
    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            return null;

        // Génère les deux tokens
        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        // Sauvegarde le refresh token en BDD
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(30);
        await _context.SaveChangesAsync();

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        };
    }

    public async Task<LoginResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        // Valide l'ancien access token (même expiré)
        var principal = GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null) return null;

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id.ToString() == userId);

        // Vérifie le refresh token
        if (user?.RefreshToken != request.RefreshToken ||
            user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return null;  // Refresh token invalide ou expiré
        }

        // Génère de nouveaux tokens
        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        await _context.SaveChangesAsync();

        return new LoginResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        };
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}
```

---

## 5. RBAC (Role-Based Access Control)

### 5.1 Définition

**RBAC** est un modèle d'autorisation où les permissions sont attribuées à des rôles, et les utilisateurs sont assignés à des rôles.

```
┌─────────────────────────────────────────────────────────────┐
│                          RBAC                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  UTILISATEURS          RÔLES              PERMISSIONS       │
│  ─────────────         ─────              ───────────       │
│  ┌────────┐         ┌────────┐         ┌──────────────┐    │
│  │  Jean  ├────────►│ Admin  ├────────►│ Tout faire   │    │
│  └────────┘         └────────┘         └──────────────┘    │
│                         │                                   │
│  ┌────────┐         ┌────────┐         ┌──────────────┐    │
│  │ Marie  ├────────►│Dispatch├────────►│ Gérer missions│   │
│  └────────┘         └────────┘         │ Voir véhicules│   │
│                                        └──────────────┘    │
│  ┌────────┐         ┌────────┐         ┌──────────────┐    │
│  │ Pierre ├────────►│ Driver ├────────►│ Voir missions │   │
│  └────────┘         └────────┘         │ Tracker GPS   │   │
│                                        └──────────────┘    │
│  ┌────────┐         ┌────────┐         ┌──────────────┐    │
│  │  Luc   ├────────►│ Viewer ├────────►│ Lecture seule│    │
│  └────────┘         └────────┘         └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Rôles FleetTrack

| Rôle | Permissions |
|------|-------------|
| **Admin** | Tout : CRUD utilisateurs, véhicules, missions, paramètres |
| **Dispatcher** | Gérer missions et véhicules, voir utilisateurs |
| **Driver** | Voir ses missions, envoyer positions GPS |
| **Viewer** | Lecture seule sur tout |

### 5.3 Implémentation

```csharp
// Entités
public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<User> Users { get; set; } = new List<User>();
}

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
}

// Dans le JWT
private string GenerateAccessToken(User user)
{
    var claims = new List<Claim>
    {
        new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new(ClaimTypes.Name, user.Username),
        new(ClaimTypes.Role, user.Role.Name),  // Le rôle!
    };

    // ... génération du token
}

// Protection des endpoints
[ApiController]
[Route("api/[controller]")]
[Authorize]  // Authentification requise
public class VehiclesController : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Dispatcher,Driver,Viewer")]  // Tous peuvent lire
    public async Task<ActionResult<List<VehicleDto>>> GetAll() { }

    [HttpPost]
    [Authorize(Roles = "Admin,Dispatcher")]  // Seuls Admin et Dispatcher
    public async Task<ActionResult<VehicleDto>> Create() { }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]  // Seul Admin
    public async Task<ActionResult> Delete(Guid id) { }
}

// Vérification programmatique
[HttpGet("my-missions")]
public async Task<ActionResult<List<MissionDto>>> GetMyMissions()
{
    // Récupérer l'ID de l'utilisateur connecté
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    // Vérifier le rôle
    if (User.IsInRole("Admin"))
    {
        return Ok(await _missionService.GetAllAsync());
    }
    else
    {
        return Ok(await _missionService.GetByDriverIdAsync(userId));
    }
}
```

---

## 6. CORS

### 6.1 Définition

**CORS** (Cross-Origin Resource Sharing) est un mécanisme de sécurité qui contrôle quels domaines peuvent accéder à ton API.

### 6.2 Problème

Par défaut, les navigateurs bloquent les requêtes vers un domaine différent (Same-Origin Policy).

```
Frontend: https://app.fleettrack.com
API:      https://api.fleettrack.com
          └── Domaine différent = bloqué par défaut!
```

### 6.3 Solution

Le serveur envoie des headers CORS pour autoriser certaines origines.

```http
# Requête du navigateur (preflight)
OPTIONS /api/vehicles HTTP/1.1
Origin: https://app.fleettrack.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization, Content-Type

# Réponse du serveur
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.fleettrack.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### 6.4 Configuration dans FleetTrack

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// Configuration CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",           // Dev
                "https://app.fleettrack.com"       // Prod
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();  // Pour les cookies/auth
    });
});

var app = builder.Build();

// Activer CORS (AVANT UseAuthorization!)
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
```

---

## 7. Implémentation dans FleetTrack

### 7.1 Configuration JWT

```csharp
// appsettings.json
{
  "Jwt": {
    "Secret": "VotreCleSecrete256BitsMinimum32Caracteres!!!",
    "Issuer": "FleetTrack",
    "Audience": "FleetTrackUsers",
    "ExpirationMinutes": 30,
    "RefreshTokenExpirationDays": 30
  }
}

// Program.cs - Configuration
builder.Services.AddJwtAuthentication(builder.Configuration);

// Extension method
public static class ServiceExtensions
{
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

            // Support JWT pour SignalR (via query string)
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
}
```

### 7.2 Controller d'Authentification

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);

        if (result == null)
        {
            _logger.LogWarning("Tentative de connexion échouée pour {Username}", request.Username);
            return Unauthorized(new { message = "Identifiants invalides" });
        }

        _logger.LogInformation("Connexion réussie pour {Username}", request.Username);
        return Ok(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        var result = await _authService.RefreshTokenAsync(request);

        if (result == null)
        {
            return Unauthorized(new { message = "Token invalide ou expiré" });
        }

        return Ok(result);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        await _authService.RevokeRefreshTokenAsync(Guid.Parse(userId!));
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _authService.GetUserByIdAsync(Guid.Parse(userId!));

        if (user == null)
            return NotFound();

        return Ok(user);
    }
}
```

### 7.3 Frontend - Gestion des Tokens

```typescript
// lib/api/auth.ts
import { apiClient } from './client';

interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

// Stockage sécurisé des tokens
const TOKEN_KEY = 'fleettrack_token';
const REFRESH_TOKEN_KEY = 'fleettrack_refresh_token';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

    // Stocker les tokens
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      accessToken,
      refreshToken,
    });

    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

    return response;
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};
```

```typescript
// lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('fleettrack_token');

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    // Token expiré - tenter un refresh
    if (response.status === 401) {
      try {
        await authApi.refreshToken();
        // Réessayer la requête originale
        return this.fetch<T>(url, options);
      } catch {
        // Refresh échoué - déconnecter
        authApi.logout();
        window.location.href = '/login';
        throw new Error('Session expirée');
      }
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  get: <T>(url: string) => apiClient.fetch<T>(url),
  post: <T>(url: string, data: unknown) =>
    apiClient.fetch<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data: unknown) =>
    apiClient.fetch<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string) =>
    apiClient.fetch<T>(url, { method: 'DELETE' }),
};
```

---

## Résumé

| Concept | Description |
|---------|-------------|
| **Authentification** | Vérifier l'identité (qui es-tu?) |
| **Autorisation** | Vérifier les permissions (as-tu le droit?) |
| **JWT** | Token auto-contenu pour l'authentification |
| **Hachage** | Transformation irréversible du mot de passe |
| **BCrypt** | Algorithme de hachage recommandé |
| **Refresh Token** | Token longue durée pour renouveler l'access token |
| **RBAC** | Contrôle d'accès basé sur les rôles |
| **CORS** | Contrôle des origines autorisées |

---

[← Précédent : API REST](./04-api-rest.md) | [Suivant : Frontend →](./06-frontend.md)
