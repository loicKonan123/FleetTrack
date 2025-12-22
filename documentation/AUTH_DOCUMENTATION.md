# Documentation Authentification JWT - FleetTrack

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Fonctionnalités](#fonctionnalités)
4. [Flux d'authentification](#flux-dauthentification)
5. [Endpoints API](#endpoints-api)
6. [Rôles et autorisations](#rôles-et-autorisations)
7. [Sécurité](#sécurité)
8. [Configuration](#configuration)
9. [Bonnes pratiques](#bonnes-pratiques)
10. [Exemples d'utilisation](#exemples-dutilisation)
11. [Dépannage](#dépannage)

---

## Vue d'ensemble

FleetTrack utilise un système d'authentification basé sur **JWT (JSON Web Tokens)** avec les caractéristiques suivantes:

- **Authentification stateless** - Pas de session serveur
- **Access Token + Refresh Token** - Double token pour plus de sécurité
- **Authentification basée sur les rôles (RBAC)** - 4 rôles prédéfinis
- **Hachage BCrypt** - Stockage sécurisé des mots de passe
- **Claims personnalisés** - Informations utilisateur dans le token

### Avantages de cette implémentation

✅ **Scalabilité** - Pas d'état serveur, fonctionne en environnement distribué
✅ **Sécurité** - Tokens signés cryptographiquement
✅ **Performance** - Validation locale sans appel base de données
✅ **Flexibilité** - Claims personnalisables, expiration configurable
✅ **Standards** - Conforme aux spécifications JWT (RFC 7519)

---

## Architecture

### Composants du système

```
┌─────────────────────────────────────────────────────────────────┐
│                        FleetTrack.API                           │
├─────────────────────────────────────────────────────────────────┤
│  AuthController                                                 │
│  ├── POST /api/auth/login       (Login)                         │
│  ├── POST /api/auth/register    (Inscription)                   │
│  ├── POST /api/auth/refresh     (Rafraîchir token)              │
│  ├── POST /api/auth/revoke      (Révoquer tokens)               │
│  ├── GET  /api/auth/me          (Profil utilisateur)            │
│  └── GET  /api/auth/{id}        (Obtenir utilisateur)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FleetTrack.Application                        │
├─────────────────────────────────────────────────────────────────┤
│  IAuthService (Interface)                                       │
│  ├── LoginAsync()                                               │
│  ├── RegisterAsync()                                            │
│  ├── RefreshTokenAsync()                                        │
│  ├── RevokeTokenAsync()                                         │
│  └── GetUserByIdAsync()                                         │
│                                                                 │
│  DTOs                                                           │
│  ├── LoginDto                                                   │
│  ├── RegisterDto                                                │
│  ├── AuthResponseDto                                            │
│  ├── UserDto                                                    │
│  └── RefreshTokenDto                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  FleetTrack.Infrastructure                      │
├─────────────────────────────────────────────────────────────────┤
│  AuthService (Implémentation)                                   │
│  ├── Validation credentials                                     │
│  ├── Génération JWT Access Token                                │
│  ├── Génération Refresh Token                                   │
│  ├── Hachage BCrypt                                             │
│  └── Gestion des claims                                         │
│                                                                 │
│  DataSeeder                                                     │
│  ├── Seed des rôles (Admin, Dispatcher, Driver, Viewer)         │
│  └── Création utilisateur admin par défaut                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FleetTrack.Domain                          │
├─────────────────────────────────────────────────────────────────┤
│  Entités                                                        │
│  ├── User                                                       │
│  │   ├── Id, Username, Email                                   │
│  │   ├── PasswordHash                                          │
│  │   ├── RefreshToken, RefreshTokenExpiryTime                  │
│  │   ├── RoleId (FK vers Role)                                 │
│  │   └── IsActive, LastLoginDate                               │
│  │                                                              │
│  └── Role                                                       │
│      ├── Id, Name, Description                                 │
│      └── Users (Navigation)                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Base de données

**Table Users:**
```sql
CREATE TABLE Users (
    Id              TEXT PRIMARY KEY,
    Username        TEXT NOT NULL UNIQUE,
    Email           TEXT NOT NULL UNIQUE,
    PasswordHash    TEXT NOT NULL,
    FirstName       TEXT NOT NULL,
    LastName        TEXT NOT NULL,
    PhoneNumber     TEXT,
    IsActive        INTEGER NOT NULL,
    LastLoginDate   TEXT,
    RefreshToken    TEXT,
    RefreshTokenExpiryTime TEXT,
    RoleId          TEXT NOT NULL,
    DriverId        TEXT,
    CreatedAt       TEXT NOT NULL,
    UpdatedAt       TEXT,
    IsDeleted       INTEGER NOT NULL,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id),
    FOREIGN KEY (DriverId) REFERENCES Drivers(Id)
);
```

**Table Roles:**
```sql
CREATE TABLE Roles (
    Id          TEXT PRIMARY KEY,
    Name        TEXT NOT NULL UNIQUE,
    Description TEXT NOT NULL,
    CreatedAt   TEXT NOT NULL,
    UpdatedAt   TEXT,
    IsDeleted   INTEGER NOT NULL
);
```

---

## Fonctionnalités

### 1. Inscription (Registration)

Permet la création d'un nouveau compte utilisateur.

**Caractéristiques:**
- Validation des données (email valide, mot de passe fort)
- Vérification unicité username et email
- Hachage sécurisé du mot de passe avec BCrypt
- Attribution d'un rôle
- Génération automatique des tokens

**Validations:**
- Username unique (pas de doublons)
- Email unique et format valide
- Rôle existant
- Mot de passe conforme aux exigences (à définir via FluentValidation)

### 2. Connexion (Login)

Authentifie un utilisateur et retourne des tokens.

**Processus:**
1. Vérification username existe
2. Vérification compte actif (`IsActive = true`)
3. Validation mot de passe avec BCrypt
4. Génération Access Token (JWT)
5. Génération Refresh Token (aléatoire sécurisé)
6. Mise à jour `LastLoginDate`
7. Stockage Refresh Token en base
8. Retour des deux tokens

**Retour:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "xYz123AbC...",
  "expiresAt": "2024-01-15T14:30:00Z",
  "user": {
    "id": "guid",
    "username": "admin",
    "email": "admin@fleettrack.com",
    "firstName": "Admin",
    "lastName": "FleetTrack",
    "roleName": "Admin",
    "isActive": true,
    "lastLoginDate": "2024-01-15T13:30:00Z"
  }
}
```

### 3. Rafraîchissement du token (Refresh)

Permet d'obtenir un nouveau Access Token sans re-login.

**Quand l'utiliser:**
- L'Access Token a expiré (après 60 minutes par défaut)
- Avant qu'il n'expire pour éviter l'interruption

**Processus:**
1. Validation Refresh Token existe en base
2. Vérification non expiré
3. Vérification compte toujours actif
4. Génération nouveau Access Token
5. Génération nouveau Refresh Token
6. Mise à jour en base
7. Retour nouveaux tokens

**Sécurité:**
- Rotation des Refresh Tokens (nouveau à chaque refresh)
- Invalidation de l'ancien Refresh Token
- Validation de l'expiration (7 jours par défaut)

### 4. Révocation de tokens (Revoke)

Déconnecte un utilisateur en invalidant ses tokens.

**Usage:**
- Déconnexion manuelle
- Suspension de compte
- Réinitialisation de mot de passe
- Détection d'activité suspecte

**Processus:**
1. Trouver l'utilisateur par username
2. Supprimer `RefreshToken` et `RefreshTokenExpiryTime`
3. L'Access Token reste valide jusqu'à expiration naturelle

**Note:** Les Access Tokens ne peuvent pas être révoqués avant expiration (nature stateless). Pour une révocation immédiate, implémenter une blacklist Redis.

### 5. Profil utilisateur (Get Me)

Récupère les informations de l'utilisateur connecté.

**Usage:**
- Afficher profil dans l'interface
- Vérifier permissions actuelles
- Obtenir informations utilisateur

**Extraction des claims:**
```csharp
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
var username = User.FindFirst(ClaimTypes.Name)?.Value;
var email = User.FindFirst(ClaimTypes.Email)?.Value;
var role = User.FindFirst(ClaimTypes.Role)?.Value;
```

---

## Flux d'authentification

### Flux complet - Première connexion

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│  Client  │                 │   API    │                 │    DB    │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │  1. POST /auth/login       │                            │
     │  {username, password}      │                            │
     ├───────────────────────────>│                            │
     │                            │  2. Query User             │
     │                            ├───────────────────────────>│
     │                            │  3. Return User + Role     │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │  4. BCrypt.Verify(password)│
     │                            │                            │
     │                            │  5. Generate Access Token  │
     │                            │     (JWT with claims)      │
     │                            │                            │
     │                            │  6. Generate Refresh Token │
     │                            │     (Random secure)        │
     │                            │                            │
     │                            │  7. Save Refresh Token     │
     │                            ├───────────────────────────>│
     │                            │  8. Updated User           │
     │                            │<───────────────────────────┤
     │                            │                            │
     │  9. Return AuthResponse    │                            │
     │     {accessToken,          │                            │
     │      refreshToken,         │                            │
     │      expiresAt, user}      │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ 10. Store tokens           │                            │
     │     (localStorage/cookie)  │                            │
     │                            │                            │
```

### Flux - Requête authentifiée

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│  Client  │                 │   API    │                 │    DB    │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │  1. GET /vehicles          │                            │
     │  Header: Authorization:    │                            │
     │  Bearer eyJhbGc...         │                            │
     ├───────────────────────────>│                            │
     │                            │  2. Extract & Validate JWT │
     │                            │     - Verify signature     │
     │                            │     - Check expiration     │
     │                            │     - Validate issuer      │
     │                            │     - Validate audience    │
     │                            │                            │
     │                            │  3. Extract Claims         │
     │                            │     - UserId               │
     │                            │     - Username             │
     │                            │     - Role                 │
     │                            │                            │
     │                            │  4. Check [Authorize]      │
     │                            │     attribute              │
     │                            │                            │
     │                            │  5. Query Vehicles         │
     │                            ├───────────────────────────>│
     │                            │  6. Return Vehicles        │
     │                            │<───────────────────────────┤
     │                            │                            │
     │  7. Return 200 OK          │                            │
     │     {vehicles}             │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
```

### Flux - Refresh Token

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│  Client  │                 │   API    │                 │    DB    │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │  Access Token expired!     │                            │
     │                            │                            │
     │  1. POST /auth/refresh     │                            │
     │  {refreshToken}            │                            │
     ├───────────────────────────>│                            │
     │                            │  2. Query User by          │
     │                            │     RefreshToken           │
     │                            ├───────────────────────────>│
     │                            │  3. Return User + Role     │
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │  4. Check expiration       │
     │                            │  5. Check IsActive         │
     │                            │                            │
     │                            │  6. Generate NEW           │
     │                            │     Access Token           │
     │                            │                            │
     │                            │  7. Generate NEW           │
     │                            │     Refresh Token          │
     │                            │                            │
     │                            │  8. Save new Refresh Token │
     │                            │     (rotate old one)       │
     │                            ├───────────────────────────>│
     │                            │  9. Updated User           │
     │                            │<───────────────────────────┤
     │                            │                            │
     │ 10. Return NEW tokens      │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ 11. Update stored tokens   │                            │
     │                            │                            │
```

---

## Endpoints API

### POST /api/auth/login

**Description:** Authentifie un utilisateur et retourne les tokens d'accès.

**Accès:** Public (AllowAnonymous)

**Request:**
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI...",
    "refreshToken": "xYz123AbC456DeF789GhI...",
    "expiresAt": "2024-01-15T14:30:00Z",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "username": "admin",
      "email": "admin@fleettrack.com",
      "firstName": "Admin",
      "lastName": "FleetTrack",
      "phoneNumber": null,
      "roleName": "Admin",
      "isActive": true,
      "lastLoginDate": "2024-01-15T13:30:00Z"
    }
  },
  "message": "Connexion réussie"
}
```

**Errors:**
- **400 Bad Request** - Données invalides
- **401 Unauthorized** - Identifiants incorrects
- **403 Forbidden** - Compte désactivé

---

### POST /api/auth/register

**Description:** Crée un nouveau compte utilisateur.

**Accès:** Public (AllowAnonymous)

**Request:**
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+33612345678",
  "roleName": "Driver"
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "xYz123...",
    "expiresAt": "2024-01-15T14:30:00Z",
    "user": {
      "id": "guid",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+33612345678",
      "roleName": "Driver",
      "isActive": true,
      "lastLoginDate": null
    }
  },
  "message": "Inscription réussie"
}
```

**Errors:**
- **400 Bad Request** - Username ou email déjà utilisé, rôle inexistant
- **422 Unprocessable Entity** - Validation échouée

---

### POST /api/auth/refresh

**Description:** Rafraîchit l'Access Token avec un Refresh Token valide.

**Accès:** Public (AllowAnonymous)

**Request:**
```json
{
  "refreshToken": "xYz123AbC456DeF789GhI..."
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc... [NOUVEAU]",
    "refreshToken": "AbC123XyZ... [NOUVEAU]",
    "expiresAt": "2024-01-15T15:30:00Z",
    "user": {
      "id": "guid",
      "username": "admin",
      "email": "admin@fleettrack.com",
      // ... autres champs
    }
  },
  "message": "Token rafraîchi avec succès"
}
```

**Errors:**
- **401 Unauthorized** - Token invalide ou expiré
- **403 Forbidden** - Compte désactivé

---

### POST /api/auth/revoke/{username}

**Description:** Révoque les tokens d'un utilisateur (déconnexion).

**Accès:** Admin uniquement

**Authorization:** Bearer Token (rôle Admin)

**Request:** Aucun body

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Tokens révoqués avec succès"
}
```

**Errors:**
- **401 Unauthorized** - Non authentifié
- **403 Forbidden** - Pas le rôle Admin
- **404 Not Found** - Utilisateur inexistant

---

### GET /api/auth/me

**Description:** Récupère le profil de l'utilisateur connecté.

**Accès:** Tous utilisateurs authentifiés

**Authorization:** Bearer Token

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "guid",
    "username": "admin",
    "email": "admin@fleettrack.com",
    "firstName": "Admin",
    "lastName": "FleetTrack",
    "phoneNumber": null,
    "roleName": "Admin",
    "isActive": true,
    "lastLoginDate": "2024-01-15T13:30:00Z"
  },
  "message": "Profil récupéré avec succès"
}
```

**Errors:**
- **401 Unauthorized** - Token manquant ou invalide
- **404 Not Found** - Utilisateur inexistant

---

### GET /api/auth/{id}

**Description:** Récupère un utilisateur par son ID.

**Accès:** Admin uniquement

**Authorization:** Bearer Token (rôle Admin)

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "username": "johndoe",
    "email": "john.doe@example.com",
    // ... autres champs
  },
  "message": "Utilisateur récupéré avec succès"
}
```

**Errors:**
- **401 Unauthorized** - Non authentifié
- **403 Forbidden** - Pas le rôle Admin
- **404 Not Found** - Utilisateur inexistant

---

## Rôles et autorisations

### Hiérarchie des rôles

```
┌─────────────────────────────────────────────────────────────┐
│                          Admin                              │
│  - Accès complet à toutes les fonctionnalités              │
│  - Gestion des utilisateurs                                │
│  - Suppression de toutes les entités                       │
│  - Configuration système                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Dispatcher                            │
│  - Création et modification des missions                    │
│  - Gestion des véhicules et conducteurs                     │
│  - Assignation des missions                                │
│  - Consultation de toutes les données                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                         Driver                              │
│  - Consultation de ses missions assignées                   │
│  - Mise à jour du statut de ses missions                   │
│  - Consultation des véhicules                              │
│  - Mise à jour de son profil                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                         Viewer                              │
│  - Consultation uniquement (lecture seule)                  │
│  - Aucune modification possible                            │
│  - Accès aux rapports et statistiques                      │
└─────────────────────────────────────────────────────────────┘
```

### Matrice des permissions

| Endpoint | Admin | Dispatcher | Driver | Viewer |
|----------|-------|------------|--------|--------|
| **Auth** |
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/register | ✅ | ✅ | ✅ | ✅ |
| POST /auth/refresh | ✅ | ✅ | ✅ | ✅ |
| POST /auth/revoke/{username} | ✅ | ❌ | ❌ | ❌ |
| GET /auth/me | ✅ | ✅ | ✅ | ✅ |
| GET /auth/{id} | ✅ | ❌ | ❌ | ❌ |
| **Vehicles** |
| GET /vehicles | ✅ | ✅ | ✅ | ✅ |
| GET /vehicles/{id} | ✅ | ✅ | ✅ | ✅ |
| POST /vehicles | ✅ | ✅ | ❌ | ❌ |
| PUT /vehicles/{id} | ✅ | ✅ | ❌ | ❌ |
| DELETE /vehicles/{id} | ✅ | ❌ | ❌ | ❌ |
| **Drivers** |
| GET /drivers | ✅ | ✅ | ✅ | ✅ |
| GET /drivers/{id} | ✅ | ✅ | ✅ | ✅ |
| POST /drivers | ✅ | ✅ | ❌ | ❌ |
| PUT /drivers/{id} | ✅ | ✅ | ❌ | ❌ |
| DELETE /drivers/{id} | ✅ | ❌ | ❌ | ❌ |
| **Missions** |
| GET /missions | ✅ | ✅ | ✅ | ✅ |
| GET /missions/{id} | ✅ | ✅ | ✅ | ✅ |
| POST /missions | ✅ | ✅ | ❌ | ❌ |
| PUT /missions/{id} | ✅ | ✅ | ❌ | ❌ |
| POST /missions/{id}/assign | ✅ | ✅ | ❌ | ❌ |
| DELETE /missions/{id} | ✅ | ❌ | ❌ | ❌ |

### Utilisation dans le code

**Controller level (tous les endpoints):**
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize] // Tous les endpoints nécessitent une authentification
public class VehiclesController : ControllerBase
{
    // ...
}
```

**Action level (endpoint spécifique):**
```csharp
[HttpPost]
[Authorize(Roles = "Admin,Dispatcher")] // Seuls Admin et Dispatcher
public async Task<ActionResult> Create([FromBody] CreateVehicleDto dto)
{
    // ...
}

[HttpDelete("{id}")]
[Authorize(Roles = "Admin")] // Seul Admin
public async Task<ActionResult> Delete(Guid id)
{
    // ...
}
```

**Multiple rôles:**
```csharp
[Authorize(Roles = "Admin,Dispatcher,Driver")] // Tous sauf Viewer
```

**Vérification programmatique:**
```csharp
var isAdmin = User.IsInRole("Admin");
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
var username = User.Identity?.Name;
```

---

## Sécurité

### 1. Hachage des mots de passe

**Algorithme:** BCrypt
**Work Factor:** 10 (par défaut BCrypt.Net)
**Salt:** Généré automatiquement par BCrypt

**Pourquoi BCrypt:**
- ✅ Résistant aux attaques par force brute
- ✅ Adaptive (peut augmenter le coût avec le temps)
- ✅ Salt unique par mot de passe
- ✅ Standard de l'industrie

**Implémentation:**
```csharp
// Hachage lors de l'inscription
var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

// Vérification lors du login
if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
{
    throw new BusinessException("Identifiants incorrects");
}
```

**⚠️ À NE JAMAIS FAIRE:**
- ❌ Stocker les mots de passe en clair
- ❌ Utiliser MD5 ou SHA1 sans salt
- ❌ Utiliser un salt global
- ❌ Logger les mots de passe

### 2. JWT (Access Token)

**Algorithme de signature:** HMAC-SHA256 (HS256)
**Durée de vie:** 60 minutes (configurable)
**Taille clé secrète:** Minimum 32 caractères

**Structure du token:**
```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (Claims):
{
  "sub": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  // UserId
  "nameid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "unique_name": "admin",                         // Username
  "email": "admin@fleettrack.com",
  "given_name": "Admin",                          // FirstName
  "family_name": "FleetTrack",                    // LastName
  "role": "Admin",                                // Role
  "role_id": "guid-role",
  "iss": "FleetTrackAPI",                         // Issuer
  "aud": "FleetTrackClients",                     // Audience
  "exp": 1705329000,                              // Expiration
  "iat": 1705325400                               // Issued At
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**Validations effectuées:**
- ✅ Signature cryptographique (prévient la falsification)
- ✅ Expiration (exp claim)
- ✅ Issuer (iss claim) - doit être "FleetTrackAPI"
- ✅ Audience (aud claim) - doit être "FleetTrackClients"
- ✅ Clock Skew = 0 (pas de tolérance de délai)

**Configuration:**
```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
```

### 3. Refresh Token

**Type:** Token aléatoire sécurisé
**Génération:** `RandomNumberGenerator.Create()`
**Taille:** 64 bytes → Base64 encoded
**Durée de vie:** 7 jours (configurable)
**Stockage:** Base de données (table Users)

**Génération sécurisée:**
```csharp
private static string GenerateRefreshToken()
{
    var randomNumber = new byte[64];
    using var rng = RandomNumberGenerator.Create();
    rng.GetBytes(randomNumber);
    return Convert.ToBase64String(randomNumber);
}
```

**Stratégie de rotation:**
- ✅ Nouveau Refresh Token à chaque utilisation
- ✅ Ancien token invalidé immédiatement
- ✅ Prévient la réutilisation
- ✅ Détection de tokens volés

**Flux de rotation:**
```
Client utilise Refresh Token A
    ↓
Serveur valide Token A
    ↓
Serveur génère nouveau Token B
    ↓
Serveur stocke Token B
    ↓
Serveur invalide Token A
    ↓
Client reçoit Token B
```

### 4. Protection HTTPS

**⚠️ IMPÉRATIF EN PRODUCTION:**

**Pourquoi HTTPS:**
- ✅ Chiffrement end-to-end
- ✅ Protection contre Man-in-the-Middle
- ✅ Validation du serveur
- ✅ Intégrité des données

**Configuration Production:**
```csharp
// Program.cs
app.UseHttpsRedirection();

// appsettings.Production.json
{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://0.0.0.0:443",
        "Certificate": {
          "Path": "/path/to/certificate.pfx",
          "Password": "certificate-password"
        }
      }
    }
  }
}
```

**JWT Authentication:**
```csharp
options.RequireHttpsMetadata = true; // ⚠️ DOIT être true en production
```

### 5. Politiques de sécurité

**Compte utilisateur:**
- ✅ Flag `IsActive` pour désactiver temporairement
- ✅ Validation email et username uniques
- ✅ Tracking `LastLoginDate`

**Protection contre les attaques:**

**A. Brute Force:**
```csharp
// À implémenter: Rate Limiting
services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 5; // 5 tentatives par minute
    });
});

// Sur le controller
[EnableRateLimiting("auth")]
[HttpPost("login")]
public async Task<ActionResult> Login(...)
```

**B. CSRF (Cross-Site Request Forgery):**
- JWT dans Header Authorization (pas dans cookie)
- SameSite cookies si utilisé
- Validation Origin/Referer

**C. XSS (Cross-Site Scripting):**
- Validation et sanitization des inputs
- Content-Security-Policy headers
- Ne jamais stocker tokens dans localStorage (risque XSS)
- Préférer httpOnly cookies

**D. SQL Injection:**
- EF Core avec requêtes paramétrées
- Jamais de concatenation SQL

**E. Injection de commandes:**
- Validation stricte des inputs
- FluentValidation

### 6. Gestion des secrets

**⚠️ CRITIQUE: Ne JAMAIS commiter les secrets dans Git**

**appsettings.json (DEV uniquement):**
```json
{
  "Jwt": {
    "Secret": "CHANGER_EN_PRODUCTION_MinimumLength32Characters!",
    "Issuer": "FleetTrackAPI",
    "Audience": "FleetTrackClients",
    "ExpirationMinutes": "60"
  }
}
```

**Production - Variables d'environnement:**
```bash
export JWT__SECRET="SuperSecretProductionKey123!MinimumLength32Characters"
export JWT__ISSUER="FleetTrackAPI"
export JWT__AUDIENCE="FleetTrackClients"
export JWT__EXPIRATIONMINUTES="60"
```

**Production - Azure Key Vault:**
```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri("https://your-vault.vault.azure.net/"),
    new DefaultAzureCredential()
);
```

**Production - User Secrets (local dev):**
```bash
dotnet user-secrets init
dotnet user-secrets set "Jwt:Secret" "YourSecretKey"
```

### 7. Logging et Audit

**Ce qu'il faut logger:**
- ✅ Tentatives de connexion (succès et échecs)
- ✅ Création de comptes
- ✅ Modifications de profil
- ✅ Révocations de tokens
- ✅ Échecs de validation JWT

**Ce qu'il NE FAUT PAS logger:**
- ❌ Mots de passe
- ❌ Tokens complets
- ❌ Données sensibles (numéros de carte, etc.)

**Implémentation:**
```csharp
_logger.LogInformation(
    "Login successful for user {Username} from IP {IPAddress}",
    loginDto.Username,
    httpContext.Connection.RemoteIpAddress
);

_logger.LogWarning(
    "Failed login attempt for user {Username} from IP {IPAddress}",
    loginDto.Username,
    httpContext.Connection.RemoteIpAddress
);
```

---

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=FleetTrack.db"
  },
  "Jwt": {
    "Secret": "FleetTrack_SuperSecretKey_2024_ChangeThisInProduction_MinimumLength32Characters!",
    "Issuer": "FleetTrackAPI",
    "Audience": "FleetTrackClients",
    "ExpirationMinutes": "60"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### appsettings.Production.json

```json
{
  "Jwt": {
    "Secret": "", // ⚠️ Utiliser variables d'environnement
    "ExpirationMinutes": "30" // Plus court en production
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Error"
    }
  }
}
```

### Variables d'environnement

```bash
# JWT Configuration
JWT__SECRET=your-production-secret-key-minimum-32-characters
JWT__ISSUER=FleetTrackAPI
JWT__AUDIENCE=FleetTrackClients
JWT__EXPIRATIONMINUTES=30

# Database
CONNECTIONSTRINGS__DEFAULTCONNECTION=Data Source=/app/data/fleettrack.db

# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=https://+:443;http://+:80
```

---

## Bonnes pratiques

### 1. Sécurité des tokens

**✅ À FAIRE:**

1. **Stockage côté client:**
   - **Option A (recommandée):** httpOnly cookies + SameSite
   ```csharp
   Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
   {
       HttpOnly = true,
       Secure = true,
       SameSite = SameSiteMode.Strict,
       Expires = DateTimeOffset.UtcNow.AddDays(7)
   });
   ```

   - **Option B:** localStorage (si impossible cookies)
   ```javascript
   localStorage.setItem('accessToken', response.accessToken);
   localStorage.setItem('refreshToken', response.refreshToken);
   ```

2. **Transmission:**
   - Header Authorization: `Bearer {accessToken}`
   - Jamais dans URL query parameters
   - Jamais dans body POST sauf pour refresh

3. **Durée de vie:**
   - Access Token: Court (15-60 min)
   - Refresh Token: Long (7-30 jours)
   - Sliding expiration pour Refresh Token

**❌ À ÉVITER:**

- ❌ Tokens dans URL
- ❌ Tokens dans localStorage si XSS possible
- ❌ Access Token longue durée (> 1h)
- ❌ Pas de rotation de Refresh Token
- ❌ Pas de révocation possible

### 2. Gestion des mots de passe

**✅ Exigences minimales:**

```csharp
// À implémenter avec FluentValidation
public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"[A-Z]").WithMessage("Au moins une majuscule")
            .Matches(@"[a-z]").WithMessage("Au moins une minuscule")
            .Matches(@"[0-9]").WithMessage("Au moins un chiffre")
            .Matches(@"[\!\?\*\.\@\#\$\%]").WithMessage("Au moins un caractère spécial");
    }
}
```

**✅ Bonnes pratiques:**
- Minimum 8 caractères (12+ recommandé)
- Majuscules + minuscules + chiffres + spéciaux
- Pas de mots du dictionnaire
- Pas d'informations personnelles
- Historique des mots de passe
- Expiration périodique (90 jours)

**✅ Réinitialisation:**
```csharp
// Générer token de réinitialisation
var resetToken = GenerateSecureRandomToken();
var resetExpiry = DateTime.UtcNow.AddHours(1);

// Envoyer par email
await _emailService.SendPasswordResetEmail(user.Email, resetToken);

// Vérifier et réinitialiser
if (user.ResetToken == resetToken && user.ResetExpiry > DateTime.UtcNow)
{
    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
    user.ResetToken = null;
    user.ResetExpiry = null;
    user.RefreshToken = null; // Révoquer sessions existantes
}
```

### 3. Gestion des erreurs

**✅ Messages génériques:**
```csharp
// ✅ BON - Message générique
throw new BusinessException("Nom d'utilisateur ou mot de passe incorrect");

// ❌ MAUVAIS - Trop spécifique (facilite les attaques)
throw new BusinessException("Le nom d'utilisateur n'existe pas");
throw new BusinessException("Le mot de passe est incorrect");
```

**✅ Logging détaillé (backend uniquement):**
```csharp
try
{
    var user = await _context.Users.FindAsync(username);
    if (user == null)
    {
        _logger.LogWarning("Login attempt for non-existent user: {Username}", username);
        throw new BusinessException("Nom d'utilisateur ou mot de passe incorrect");
    }
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error during login for user {Username}", username);
    throw;
}
```

### 4. Rate Limiting

**Prévenir les attaques par force brute:**

```csharp
// Startup
builder.Services.AddRateLimiter(options =>
{
    // Limite globale
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            });
    });

    // Limite spécifique auth
    options.AddPolicy("auth", context =>
    {
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            });
    });
});

// Controller
[EnableRateLimiting("auth")]
[HttpPost("login")]
public async Task<ActionResult> Login(...)
```

### 5. Validation des inputs

**FluentValidation:**

```csharp
public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .Length(3, 50)
            .Matches(@"^[a-zA-Z0-9_-]+$");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .MaximumLength(128);
    }
}

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(255);

        RuleFor(x => x.Username)
            .NotEmpty()
            .Length(3, 50)
            .Matches(@"^[a-zA-Z0-9_-]+$");

        // ... autres règles
    }
}
```

### 6. CORS (Cross-Origin Resource Sharing)

**Configuration sécurisée:**

```csharp
// Development
builder.Services.AddCors(options =>
{
    options.AddPolicy("Development", builder =>
    {
        builder
            .WithOrigins("http://localhost:3000", "http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // Si utilisation de cookies
    });
});

// Production
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", builder =>
    {
        builder
            .WithOrigins("https://fleettrack.com", "https://app.fleettrack.com")
            .WithMethods("GET", "POST", "PUT", "DELETE")
            .WithHeaders("Authorization", "Content-Type")
            .AllowCredentials();
    });
});

// Application
if (app.Environment.IsDevelopment())
{
    app.UseCors("Development");
}
else
{
    app.UseCors("Production");
}
```

**❌ JAMAIS en production:**
```csharp
builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
```

### 7. Monitoring et Alertes

**Événements à surveiller:**

```csharp
// Tentatives de connexion échouées
if (failedAttempts > 5)
{
    _logger.LogWarning(
        "Multiple failed login attempts for user {Username} from IP {IP}",
        username, ipAddress
    );
    await _alertService.SendSecurityAlert($"Brute force detected for {username}");
}

// Token expiré mais réutilisé
if (refreshToken.ExpiryTime < DateTime.UtcNow)
{
    _logger.LogWarning(
        "Expired refresh token used for user {UserId}",
        userId
    );
}

// Refresh token réutilisé (possible vol)
if (refreshToken.Used)
{
    _logger.LogError(
        "Refresh token reuse detected for user {UserId} - Possible token theft",
        userId
    );
    await RevokeAllTokensAsync(userId);
    await _alertService.SendSecurityAlert($"Token theft suspected for user {userId}");
}
```

### 8. Tests de sécurité

**Tests à implémenter:**

```csharp
[Fact]
public async Task Login_WithInvalidCredentials_ShouldReturn401()
{
    // Arrange
    var loginDto = new LoginDto
    {
        Username = "admin",
        Password = "wrongpassword"
    };

    // Act
    var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

    // Assert
    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
}

[Fact]
public async Task AccessProtectedEndpoint_WithoutToken_ShouldReturn401()
{
    // Act
    var response = await _client.GetAsync("/api/vehicles");

    // Assert
    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
}

[Fact]
public async Task AccessProtectedEndpoint_WithExpiredToken_ShouldReturn401()
{
    // Arrange
    var expiredToken = GenerateExpiredToken();
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", expiredToken);

    // Act
    var response = await _client.GetAsync("/api/vehicles");

    // Assert
    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
}

[Fact]
public async Task AccessAdminEndpoint_WithDriverRole_ShouldReturn403()
{
    // Arrange
    var token = await GetDriverTokenAsync();
    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);

    // Act
    var response = await _client.DeleteAsync("/api/vehicles/guid");

    // Assert
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
}
```

---

## Exemples d'utilisation

### 1. Frontend - React/TypeScript

**Service d'authentification:**

```typescript
// auth.service.ts
import axios from 'axios';

const API_URL = 'https://api.fleettrack.com/api/auth';

interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

class AuthService {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await axios.post<{ data: AuthResponse }>(
      `${API_URL}/login`,
      { username, password }
    );

    // Stocker les tokens
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));

    return response.data.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axios.post<{ data: AuthResponse }>(
      `${API_URL}/register`,
      data
    );

    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));

    return response.data.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');

    const response = await axios.post<{ data: AuthResponse }>(
      `${API_URL}/refresh`,
      { refreshToken }
    );

    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);

    return response.data.data;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getCurrentUser(): UserDto | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export default new AuthService();
```

**Axios Interceptor:**

```typescript
// axios.config.ts
import axios from 'axios';
import authService from './auth.service';

// Request interceptor - Ajouter token
axios.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Gérer token expiré
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expiré
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Rafraîchir le token
        const authResponse = await authService.refreshToken();

        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers['Authorization'] =
          `Bearer ${authResponse.accessToken}`;

        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh token également expiré - rediriger vers login
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**Composant Login:**

```tsx
// Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion FleetTrack</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom d'utilisateur:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mot de passe:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

**Protected Route:**

```tsx
// ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles
}) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.roleName)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// Usage in App.tsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={['Admin']}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

### 2. Frontend - Angular

**Auth Service:**

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const userStr = localStorage.getItem('user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      userStr ? JSON.parse(userStr) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    return this.http.post<ApiResponse<AuthResponse>>(
      `/api/auth/login`,
      { username, password }
    ).pipe(map(response => {
      const authData = response.data;
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('user', JSON.stringify(authData.user));
      this.currentUserSubject.next(authData.user);
      return authData.user;
    }));
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
```

**HTTP Interceptor:**

```typescript
// jwt.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('accessToken');

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
```

### 3. Backend - Consommation depuis autre API C#

```csharp
public class FleetTrackApiClient
{
    private readonly HttpClient _httpClient;
    private string? _accessToken;
    private string? _refreshToken;

    public FleetTrackApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://api.fleettrack.com");
    }

    public async Task<bool> LoginAsync(string username, string password)
    {
        var loginDto = new { username, password };
        var response = await _httpClient.PostAsJsonAsync("/api/auth/login", loginDto);

        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>();
            _accessToken = result.Data.AccessToken;
            _refreshToken = result.Data.RefreshToken;

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _accessToken);

            return true;
        }

        return false;
    }

    public async Task<List<VehicleDto>> GetVehiclesAsync()
    {
        var response = await _httpClient.GetAsync("/api/vehicles");

        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            await RefreshTokenAsync();
            response = await _httpClient.GetAsync("/api/vehicles");
        }

        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<PagedResult<VehicleDto>>>();
        return result.Data.Items.ToList();
    }

    private async Task RefreshTokenAsync()
    {
        var refreshDto = new { refreshToken = _refreshToken };
        var response = await _httpClient.PostAsJsonAsync("/api/auth/refresh", refreshDto);

        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>();
            _accessToken = result.Data.AccessToken;
            _refreshToken = result.Data.RefreshToken;

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _accessToken);
        }
    }
}
```

### 4. Mobile - Flutter/Dart

```dart
// auth_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl = 'https://api.fleettrack.com/api/auth';

  Future<User?> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body)['data'];

      // Stocker les tokens
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('accessToken', data['accessToken']);
      await prefs.setString('refreshToken', data['refreshToken']);
      await prefs.setString('user', jsonEncode(data['user']));

      return User.fromJson(data['user']);
    }

    return null;
  }

  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('accessToken');
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('accessToken');
    await prefs.remove('refreshToken');
    await prefs.remove('user');
  }
}
```

---

## Dépannage

### Problème: Token invalide (401 Unauthorized)

**Causes possibles:**
1. Token expiré
2. Token mal formé
3. Signature invalide
4. Issuer/Audience incorrect

**Solutions:**
```bash
# Décoder le token (jwt.io ou outil CLI)
echo "eyJhbGc..." | base64 -d

# Vérifier l'expiration
# exp claim doit être > timestamp actuel

# Vérifier la signature
# Secret doit correspondre à la configuration

# Vérifier issuer et audience
# Doivent correspondre à appsettings.json
```

### Problème: Refresh Token expiré

**Cause:** Durée de vie dépassée (7 jours par défaut)

**Solution:**
- L'utilisateur doit se reconnecter
- Implémenter "Remember Me" pour prolonger

### Problème: CORS errors

**Erreur:**
```
Access to XMLHttpRequest at 'https://api.fleettrack.com/api/auth/login'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("Development", builder =>
    {
        builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

app.UseCors("Development");
```

### Problème: Claims manquants dans le token

**Vérifier:**
```csharp
// AuthService.cs - Vérifier que tous les claims sont ajoutés
var claims = new List<Claim>
{
    new(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new(ClaimTypes.Name, user.Username),
    new(ClaimTypes.Email, user.Email),
    new(ClaimTypes.Role, user.Role.Name),
    // ...
};
```

### Problème: [Authorize] ne fonctionne pas

**Vérifier l'ordre des middlewares:**
```csharp
// ❌ MAUVAIS ORDRE
app.UseAuthorization();
app.UseAuthentication();

// ✅ BON ORDRE
app.UseAuthentication();  // D'abord
app.UseAuthorization();   // Ensuite
```

### Problème: BCrypt erreur "Invalid salt"

**Cause:** Tentative de vérification avec hash incorrect

**Solution:**
```csharp
// Toujours vérifier que le hash existe et est valide
if (string.IsNullOrEmpty(user.PasswordHash))
{
    throw new BusinessException("Hash invalide");
}

if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
{
    throw new BusinessException("Mot de passe incorrect");
}
```

### Problème: Swagger n'envoie pas le token

**Solution:**
1. Cliquer sur "Authorize" dans Swagger UI
2. Entrer le token (sans "Bearer")
3. Cliquer "Authorize"
4. Le token sera ajouté automatiquement à toutes les requêtes

### Logs utiles pour debug

```csharp
// appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore.Authentication": "Debug",
      "Microsoft.AspNetCore.Authorization": "Debug"
    }
  }
}
```

---

## Ressources supplémentaires

### Documentation officielle

- [JWT.io](https://jwt.io/) - Décodeur et documentation JWT
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - Spécification JWT
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Microsoft ASP.NET Core Security](https://docs.microsoft.com/en-us/aspnet/core/security/)

### Outils

- [Postman](https://www.postman.com/) - Test d'API
- [jwt.io](https://jwt.io/) - Décodeur JWT
- [BCrypt Calculator](https://bcrypt-generator.com/) - Tester BCrypt

### Articles recommandés

- [The Ultimate Guide to handling JWTs on frontend clients](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)
- [Stop using JWT for sessions](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/)
- [Token Storage Best Practices](https://auth0.com/docs/secure/security-guidance/data-security/token-storage)

---

**Dernière mise à jour:** 2024-01-15
**Version:** 1.0
**Auteur:** FleetTrack Team
