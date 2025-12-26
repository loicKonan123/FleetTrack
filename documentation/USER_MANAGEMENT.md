# 👥 FleetTrack - Gestion des Utilisateurs

**Version:** 1.0
**Date:** Décembre 2025
**Statut:** ✅ Complet

> Documentation complète du système de gestion des utilisateurs, rôles et permissions

---

## 📖 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Backend API](#backend-api)
4. [Frontend (Interface Admin)](#frontend-interface-admin)
5. [Modèles de données](#modèles-de-données)
6. [Sécurité](#sécurité)
7. [Guide d'utilisation](#guide-dutilisation)
8. [Exemples de code](#exemples-de-code)

---

## Vue d'ensemble

### Fonctionnalités

Le système de gestion des utilisateurs de FleetTrack offre :

| Fonctionnalité | Description |
|----------------|-------------|
| **Création d'utilisateurs** | Création par un administrateur uniquement (pas d'inscription publique) |
| **CRUD complet** | Création, lecture, mise à jour, suppression d'utilisateurs |
| **Gestion des rôles** | Attribution de rôles avec permissions différenciées |
| **Réinitialisation mot de passe** | L'admin peut réinitialiser le mot de passe d'un utilisateur |
| **Activation/Désactivation** | Activer ou désactiver un compte sans le supprimer |
| **Association conducteur** | Lier un utilisateur "Driver" à un profil conducteur |
| **Suivi d'activité** | Enregistrement de la dernière connexion |
| **Soft Delete** | Suppression logique (données conservées) |

### Rôles disponibles

| Rôle | Description | Accès |
|------|-------------|-------|
| **Admin** | Administrateur système | Accès complet à toutes les fonctionnalités |
| **Dispatcher** | Répartiteur | Gestion véhicules, missions, conducteurs |
| **Driver** | Conducteur | Lecture missions assignées, mise à jour GPS |
| **Viewer** | Observateur | Lecture seule sur toutes les entités |

### Décision architecturale

**Pas de page d'inscription publique** - Ce choix a été fait pour :
- Sécurité renforcée : seul un admin peut créer des comptes
- Contrôle des accès : évite les inscriptions non autorisées
- Environnement professionnel : typique des applications d'entreprise

---

## Architecture

### Clean Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FleetTrack.API                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              UsersController                        │    │
│  │  - GET /api/users (liste paginée)                   │    │
│  │  - GET /api/users/{id} (détails)                    │    │
│  │  - POST /api/users (création)                       │    │
│  │  - PUT /api/users/{id} (mise à jour)                │    │
│  │  - DELETE /api/users/{id} (suppression)             │    │
│  │  - POST /api/users/{id}/reset-password              │    │
│  │  - POST /api/users/{id}/activate                    │    │
│  │  - POST /api/users/{id}/deactivate                  │    │
│  │  - GET /api/users/roles (liste des rôles)           │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                FleetTrack.Application                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              UserService                            │    │
│  │  - Logique métier de gestion des utilisateurs       │    │
│  │  - Validation des données                           │    │
│  │  - Hachage des mots de passe                        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              DTOs                                   │    │
│  │  - CreateUserDto, UpdateUserDto                     │    │
│  │  - UserDetailsDto, UserListDto                      │    │
│  │  - ResetPasswordDto, RoleDto                        │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│               FleetTrack.Infrastructure                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          UserRepository / RoleRepository            │    │
│  │  - Accès base de données via EF Core                │    │
│  │  - Requêtes avec Include (Role, Driver)             │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PasswordHasher                         │    │
│  │  - Hachage BCrypt des mots de passe                 │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                  FleetTrack.Domain                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              User / Role (Entities)                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Fichiers du backend

| Couche | Fichier | Description |
|--------|---------|-------------|
| **API** | `Controllers/UsersController.cs` | Endpoints REST |
| **Application** | `DTOs/User/CreateUserDto.cs` | DTO création |
| **Application** | `DTOs/User/UpdateUserDto.cs` | DTO mise à jour |
| **Application** | `DTOs/User/UserDetailsDto.cs` | DTO détails complets |
| **Application** | `DTOs/User/UserListDto.cs` | DTO liste simplifiée |
| **Application** | `DTOs/User/ResetPasswordDto.cs` | DTO réinitialisation |
| **Application** | `DTOs/User/RoleDto.cs` | DTO rôle |
| **Application** | `Interfaces/IUserService.cs` | Interface service |
| **Application** | `Interfaces/IPasswordHasher.cs` | Interface hachage |
| **Application** | `Interfaces/Repositories/IUserRepository.cs` | Interface repository |
| **Application** | `Interfaces/Repositories/IRoleRepository.cs` | Interface repository |
| **Application** | `Services/UserService.cs` | Implémentation service |
| **Infrastructure** | `Repositories/UserRepository.cs` | Implémentation repository |
| **Infrastructure** | `Repositories/RoleRepository.cs` | Implémentation repository |
| **Infrastructure** | `Services/PasswordHasher.cs` | Implémentation hachage |

### Fichiers du frontend

| Dossier | Fichier | Description |
|---------|---------|-------------|
| `types/` | `user.ts` | Types TypeScript |
| `lib/api/` | `users.ts` | Client API |
| `lib/hooks/` | `useUsers.ts` | Hooks React Query |
| `app/(admin)/users/` | `page.tsx` | Liste des utilisateurs |
| `app/(admin)/users/new/` | `page.tsx` | Formulaire création |
| `app/(admin)/users/[id]/` | `page.tsx` | Détails/édition |
| `components/layout/` | `Sidebar.tsx` | Navigation (lien Utilisateurs) |

---

## Backend API

### Endpoints disponibles

Tous les endpoints nécessitent le rôle **Admin**.

#### Liste des utilisateurs

```http
GET /api/users?pageNumber=1&pageSize=10
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "items": [
    {
      "id": "guid",
      "username": "jdoe",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "roleName": "Dispatcher",
      "isActive": true,
      "lastLoginDate": "2025-12-25T10:30:00Z",
      "createdAt": "2025-12-01T08:00:00Z"
    }
  ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 25,
  "totalPages": 3
}
```

#### Détails d'un utilisateur

```http
GET /api/users/{id}
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "id": "guid",
  "username": "jdoe",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+33612345678",
  "roleId": "role-guid",
  "roleName": "Dispatcher",
  "roleDescription": "Gère les véhicules et missions",
  "driverId": null,
  "driverName": null,
  "isActive": true,
  "lastLoginDate": "2025-12-25T10:30:00Z",
  "createdAt": "2025-12-01T08:00:00Z",
  "updatedAt": "2025-12-20T15:00:00Z"
}
```

#### Créer un utilisateur

```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newuser",
  "email": "new.user@example.com",
  "password": "SecurePass123!",
  "firstName": "New",
  "lastName": "User",
  "phoneNumber": "+33698765432",
  "roleId": "role-guid",
  "driverId": null,
  "isActive": true
}
```

**Validation:**
- `username`: 3-50 caractères, unique
- `email`: format email valide, unique
- `password`: minimum 8 caractères
- `firstName`: 2-50 caractères
- `lastName`: 2-50 caractères
- `roleId`: doit exister

#### Mettre à jour un utilisateur

```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "updateduser",
  "email": "updated@example.com",
  "firstName": "Updated",
  "lastName": "User",
  "phoneNumber": "+33611111111",
  "roleId": "new-role-guid",
  "driverId": "driver-guid",
  "isActive": true
}
```

#### Supprimer un utilisateur

```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

**Note:** Suppression logique (soft delete) - l'utilisateur est marqué comme supprimé mais conservé en base.

#### Réinitialiser le mot de passe

```http
POST /api/users/{id}/reset-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "newPassword": "NewSecurePass123!"
}
```

#### Activer un utilisateur

```http
POST /api/users/{id}/activate
Authorization: Bearer {token}
```

#### Désactiver un utilisateur

```http
POST /api/users/{id}/deactivate
Authorization: Bearer {token}
```

#### Liste des rôles

```http
GET /api/users/roles
Authorization: Bearer {token}
```

**Réponse:**
```json
[
  {
    "id": "guid",
    "name": "Admin",
    "description": "Administrateur système avec accès complet",
    "userCount": 2
  },
  {
    "id": "guid",
    "name": "Dispatcher",
    "description": "Répartiteur - gère véhicules et missions",
    "userCount": 5
  }
]
```

---

## Frontend (Interface Admin)

### Page Liste des Utilisateurs

**URL:** `/users`
**Fichier:** `fleettrack-frontend/src/app/(admin)/users/page.tsx`

**Fonctionnalités:**
- Tableau avec tous les utilisateurs
- Recherche par nom, email ou username
- Pagination
- Actions rapides:
  - Modifier (lien vers détails)
  - Réinitialiser mot de passe
  - Activer/Désactiver
  - Supprimer

**Colonnes affichées:**
| Colonne | Description |
|---------|-------------|
| Utilisateur | Nom complet + @username |
| Email | Adresse email |
| Rôle | Badge coloré (Admin=violet, Dispatcher=bleu, Driver=vert, Viewer=gris) |
| Statut | Badge Actif/Inactif |
| Dernière Connexion | Date formatée ou "Jamais" |
| Actions | Boutons d'action |

### Page Création d'Utilisateur

**URL:** `/users/new`
**Fichier:** `fleettrack-frontend/src/app/(admin)/users/new/page.tsx`

**Champs du formulaire:**
| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| Prénom | Text | Oui | Min 2 caractères |
| Nom | Text | Oui | Min 2 caractères |
| Nom d'utilisateur | Text | Oui | Min 3 caractères, unique |
| Email | Email | Oui | Format email, unique |
| Mot de passe | Password | Oui | Min 8 caractères |
| Téléphone | Tel | Non | - |
| Rôle | Select | Oui | Liste des rôles |
| Conducteur associé | Select | Conditionnel | Visible si rôle = Driver |
| Compte actif | Switch | Non | Par défaut: true |

### Page Détails/Édition Utilisateur

**URL:** `/users/{id}`
**Fichier:** `fleettrack-frontend/src/app/(admin)/users/[id]/page.tsx`

**Sections:**
1. **En-tête**
   - Nom complet et username
   - Badges statut et rôle

2. **Informations de l'utilisateur** (Card)
   - Mode lecture par défaut
   - Bouton "Modifier" pour passer en mode édition
   - Formulaire avec tous les champs
   - Bouton "Enregistrer"

3. **Mot de passe** (Card)
   - Bouton "Réinitialiser le mot de passe"
   - Formulaire de saisie nouveau mot de passe

4. **Gestion du compte** (Card)
   - Statut actuel
   - Bouton Activer/Désactiver
   - Informations (dernière connexion, date création, dernière mise à jour)

### Navigation

Le lien "Utilisateurs" dans la sidebar est visible uniquement pour les administrateurs:

```typescript
// Sidebar.tsx
const adminNavItems: NavItem[] = [
  // ...autres liens
  { title: 'Utilisateurs', href: '/users', icon: UserCog, roles: ['Admin'] },
];
```

---

## Modèles de données

### Entité User (Domain)

```csharp
public class User : BaseEntity
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Relations
    public Guid RoleId { get; set; }
    public Role Role { get; set; }
    public Guid? DriverId { get; set; }
    public Driver? Driver { get; set; }
}
```

### Entité Role (Domain)

```csharp
public class Role : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }

    // Navigation
    public ICollection<User> Users { get; set; }
}
```

### Types TypeScript (Frontend)

```typescript
// types/user.ts

export interface UserListDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  lastLoginDate?: string;
  createdAt: string;
}

export interface UserDetailsDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleId: string;
  roleName: string;
  roleDescription: string;
  driverId?: string;
  driverName?: string;
  isActive: boolean;
  lastLoginDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleId: string;
  driverId?: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roleId?: string;
  driverId?: string;
  isActive?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface RoleDto {
  id: string;
  name: string;
  description: string;
  userCount: number;
}
```

---

## Sécurité

### Hachage des mots de passe

Les mots de passe sont hachés avec **BCrypt** avant stockage:

```csharp
// Infrastructure/Services/PasswordHasher.cs
public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
}
```

### Autorisation

Tous les endpoints de gestion des utilisateurs sont protégés par:

```csharp
[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
```

### Validation des données

Validation côté serveur avec annotations:

```csharp
public class CreateUserDto
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; }

    // ...
}
```

### Unicité

Le service vérifie l'unicité du username et email:

```csharp
// UserService.cs
if (await _userRepository.ExistsByUsernameAsync(dto.Username))
    throw new InvalidOperationException("Ce nom d'utilisateur existe déjà");

if (await _userRepository.ExistsByEmailAsync(dto.Email))
    throw new InvalidOperationException("Cet email existe déjà");
```

---

## Guide d'utilisation

### Créer un nouvel utilisateur

1. Connectez-vous en tant qu'administrateur
2. Cliquez sur "Utilisateurs" dans la sidebar
3. Cliquez sur "Nouvel Utilisateur"
4. Remplissez le formulaire:
   - Prénom et nom
   - Nom d'utilisateur unique
   - Email unique
   - Mot de passe (min 8 caractères)
   - Sélectionnez un rôle
   - Si rôle "Driver", associez un conducteur (optionnel)
5. Cliquez sur "Créer l'Utilisateur"

### Modifier un utilisateur

1. Allez sur la page "Utilisateurs"
2. Cliquez sur l'icône de modification (crayon)
3. Cliquez sur "Modifier"
4. Modifiez les champs souhaités
5. Cliquez sur "Enregistrer"

### Réinitialiser un mot de passe

**Depuis la liste:**
1. Cliquez sur l'icône clé à côté de l'utilisateur

**Depuis les détails:**
1. Ouvrez les détails de l'utilisateur
2. Dans la section "Mot de passe", cliquez sur "Réinitialiser le mot de passe"
3. Saisissez le nouveau mot de passe (min 8 caractères)
4. Cliquez sur "Réinitialiser"

### Désactiver un compte

1. Ouvrez les détails de l'utilisateur
2. Dans "Gestion du compte", cliquez sur "Désactiver"

L'utilisateur ne pourra plus se connecter mais son compte est conservé.

### Supprimer un utilisateur

1. Sur la page liste, cliquez sur l'icône corbeille
2. Confirmez la suppression

**Note:** C'est une suppression logique (soft delete).

---

## Exemples de code

### Appel API avec Axios

```typescript
// lib/api/users.ts
import { api } from './axios';

export const usersApi = {
  getAll: async (page: number, pageSize: number) => {
    const { data } = await api.get('/users', {
      params: { pageNumber: page, pageSize }
    });
    return data;
  },

  create: async (userData: CreateUserRequest) => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  resetPassword: async (id: string, newPassword: string) => {
    const { data } = await api.post(`/users/${id}/reset-password`, {
      newPassword
    });
    return data;
  }
};
```

### Hook React Query

```typescript
// lib/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';

export const useUsers = (page = 1, pageSize = 10) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => usersApi.getAll(page, pageSize),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users: usersQuery.data,
    isLoading: usersQuery.isLoading,
    createUser: createMutation.mutateAsync,
  };
};
```

### Composant de formulaire

```tsx
// Exemple simplifié du formulaire de création
export default function NewUserPage() {
  const { createUser } = useUsers();
  const { data: roles } = useRoles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(formData);
      toast.success('Utilisateur créé avec succès');
      router.push('/users');
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Champs du formulaire */}
      <Button type="submit">Créer l'Utilisateur</Button>
    </form>
  );
}
```

---

## Dépannage

### Erreur "Ce nom d'utilisateur existe déjà"

Le username doit être unique. Choisissez un autre nom d'utilisateur.

### Erreur "Cet email existe déjà"

L'email est déjà utilisé par un autre compte.

### L'utilisateur ne peut pas se connecter

Vérifiez:
1. Le compte est-il actif ? (IsActive = true)
2. Le compte a-t-il été supprimé ? (Soft delete)
3. Le mot de passe est-il correct ?

### Le lien "Utilisateurs" n'apparaît pas

Le lien n'est visible que pour les utilisateurs avec le rôle **Admin**.

---

## Évolutions futures

- [ ] Historique des modifications (audit log)
- [ ] Permissions granulaires par fonctionnalité
- [ ] Export des utilisateurs (CSV/Excel)
- [ ] Importation en masse
- [ ] Double authentification (2FA)
- [ ] Politique de mot de passe configurable

---

**Dernière mise à jour:** Décembre 2025
