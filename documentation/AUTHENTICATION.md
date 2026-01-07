# Systeme d'Authentification FleetTrack

> Documentation complete du systeme d'authentification avec CAPTCHA, inscription et recuperation de mot de passe

---

## Table des Matieres

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration](#configuration)
3. [Pages Frontend](#pages-frontend)
4. [Endpoints API](#endpoints-api)
5. [CAPTCHA Google reCAPTCHA](#captcha-google-recaptcha)
6. [Mot de passe oublie](#mot-de-passe-oublie)
7. [Securite](#securite)
8. [Production](#mise-en-production)

---

## Vue d'ensemble

Le systeme d'authentification FleetTrack comprend:

- **Connexion** avec verification CAPTCHA
- **Inscription** avec validation des champs et CAPTCHA
- **Mot de passe oublie** avec envoi de lien par email
- **Reinitialisation de mot de passe** via token securise
- **Tokens JWT** pour l'authentification des requetes API

### Architecture

```
Frontend (Next.js)                    Backend (ASP.NET Core)
┌─────────────────┐                  ┌─────────────────────┐
│  Login Page     │──────────────────│  POST /auth/login   │
│  + CAPTCHA      │                  │  + CaptchaService   │
├─────────────────┤                  ├─────────────────────┤
│  Register Page  │──────────────────│  POST /auth/register│
│  + CAPTCHA      │                  │  + Validation       │
├─────────────────┤                  ├─────────────────────┤
│  Forgot Password│──────────────────│  POST /auth/forgot  │
│  + CAPTCHA      │                  │  + Email Service    │
├─────────────────┤                  ├─────────────────────┤
│  Reset Password │──────────────────│  POST /auth/reset   │
│                 │                  │  + Token Validation │
└─────────────────┘                  └─────────────────────┘
```

---

## Configuration

### Backend (appsettings.json)

```json
{
  "Jwt": {
    "Secret": "VotreCleSecrete_MinimumLength32Characters!",
    "Issuer": "FleetTrackAPI",
    "Audience": "FleetTrackClients",
    "ExpirationMinutes": "43200",
    "RefreshTokenExpirationDays": "30"
  },
  "Captcha": {
    "Enabled": false,
    "SiteKey": "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
    "SecretKey": "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
  },
  "Frontend": {
    "Url": "http://localhost:3000"
  }
}
```

| Parametre | Description |
|-----------|-------------|
| `Captcha:Enabled` | Active/desactive la verification CAPTCHA |
| `Captcha:SiteKey` | Cle publique reCAPTCHA (affichee sur le frontend) |
| `Captcha:SecretKey` | Cle privee reCAPTCHA (verification backend) |
| `Frontend:Url` | URL du frontend pour les liens de reinitialisation |

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5115/api
NEXT_PUBLIC_SIGNALR_HUB_URL=http://localhost:5115/hubs/gps

# Google reCAPTCHA v2
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

---

## Pages Frontend

### 1. Page de Connexion (`/login`)

**Fichier:** `src/app/(auth)/login/page.tsx`

**Fonctionnalites:**
- Champs: Nom d'utilisateur, Mot de passe
- CAPTCHA Google reCAPTCHA v2
- Lien vers inscription (`/register`)
- Lien vers mot de passe oublie (`/forgot-password`)
- Affichage des erreurs de connexion

**Exemple de code:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!captchaToken) {
    setError('Veuillez valider le CAPTCHA');
    return;
  }

  try {
    await login({ username, password, captchaToken });
  } catch (err) {
    setError('Echec de la connexion');
    captchaRef.current?.reset();
  }
};
```

---

### 2. Page d'Inscription (`/register`)

**Fichier:** `src/app/(auth)/register/page.tsx`

**Champs du formulaire:**
| Champ | Obligatoire | Validation |
|-------|-------------|------------|
| Prenom | Oui | - |
| Nom | Oui | - |
| Nom d'utilisateur | Oui | Unique |
| Email | Oui | Format email, unique |
| Telephone | Non | - |
| Mot de passe | Oui | Min 8 caracteres |
| Confirmation mot de passe | Oui | Doit correspondre |
| CAPTCHA | Oui | Validation Google |

**Validations cote client:**
```tsx
if (formData.password !== formData.confirmPassword) {
  setError('Les mots de passe ne correspondent pas');
  return;
}

if (formData.password.length < 8) {
  setError('Le mot de passe doit contenir au moins 8 caracteres');
  return;
}
```

---

### 3. Page Mot de Passe Oublie (`/forgot-password`)

**Fichier:** `src/app/(auth)/forgot-password/page.tsx`

**Flux:**
1. L'utilisateur entre son email
2. Valide le CAPTCHA
3. Clique sur "Envoyer le lien"
4. Message de confirmation affiche (meme si l'email n'existe pas pour securite)
5. Si l'email existe, un lien de reinitialisation est envoye

**Message de succes:**
> "Si un compte existe avec l'adresse **email@example.com**, vous recevrez un email avec les instructions pour reinitialiser votre mot de passe."

---

### 4. Page Reinitialisation (`/reset-password`)

**Fichier:** `src/app/(auth)/reset-password/page.tsx`

**Acces:** Via lien email avec token: `/reset-password?token=abc123...`

**Validations:**
- Token present et valide
- Token non expire (1 heure)
- Token non deja utilise
- Nouveau mot de passe >= 8 caracteres
- Confirmation correspondante

**Apres succes:**
- Mot de passe modifie
- Tous les refresh tokens revoques (deconnexion forcee)
- Redirection vers login

---

## Endpoints API

### POST /api/auth/login

Connexion d'un utilisateur.

**Request:**
```json
{
  "username": "admin",
  "password": "Admin123!",
  "captchaToken": "03AGdBq24..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "abc123...",
    "expiresAt": "2024-02-15T10:30:00Z",
    "user": {
      "id": "guid",
      "username": "admin",
      "email": "admin@fleettrack.com",
      "firstName": "Admin",
      "lastName": "User",
      "roleName": "Admin"
    }
  },
  "message": "Connexion reussie"
}
```

**Erreurs possibles:**
| Code | Message |
|------|---------|
| 401 | Nom d'utilisateur ou mot de passe incorrect |
| 401 | Ce compte est desactive |
| 400 | Validation CAPTCHA echouee |

---

### POST /api/auth/register

Inscription d'un nouvel utilisateur.

**Request:**
```json
{
  "username": "nouveau.user",
  "email": "user@example.com",
  "password": "MotDePasse123!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phoneNumber": "+33612345678",
  "captchaToken": "03AGdBq24..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "abc123...",
    "user": { ... }
  },
  "message": "Inscription reussie"
}
```

**Erreurs possibles:**
| Code | Message |
|------|---------|
| 400 | Le nom d'utilisateur 'xxx' est deja utilise |
| 400 | L'email 'xxx' est deja utilise |
| 400 | Validation CAPTCHA echouee |

---

### POST /api/auth/forgot-password

Demande de reinitialisation de mot de passe.

**Request:**
```json
{
  "email": "user@example.com",
  "captchaToken": "03AGdBq24..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Si un compte existe avec cet email, un lien de reinitialisation a ete envoye"
}
```

> **Note securite:** La reponse est identique que l'email existe ou non, pour eviter l'enumeration des comptes.

---

### POST /api/auth/reset-password

Reinitialisation du mot de passe avec token.

**Request:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NouveauMotDePasse123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Mot de passe reinitialise avec succes"
}
```

**Erreurs possibles:**
| Code | Message |
|------|---------|
| 400 | Token de reinitialisation invalide |
| 400 | Ce token a deja ete utilise |
| 400 | Ce token a expire |

---

## CAPTCHA Google reCAPTCHA

### Fonctionnement

1. **Frontend**: Affiche le widget reCAPTCHA
2. **Utilisateur**: Complete le challenge (cliquer sur images, etc.)
3. **Frontend**: Recoit un token de validation
4. **Backend**: Verifie le token aupres de Google
5. **Google**: Confirme la validite

### Composant React

**Fichier:** `src/components/auth/Captcha.tsx`

```tsx
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const Captcha = forwardRef<ReCAPTCHA, CaptchaProps>(({ onChange, onExpired }, ref) => {
  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        ref={ref}
        sitekey={RECAPTCHA_SITE_KEY}
        onChange={onChange}
        onExpired={onExpired}
        theme="light"
      />
    </div>
  );
});
```

### Service Backend

**Fichier:** `FleetTrack.Infrastructure/Services/CaptchaService.cs`

```csharp
public async Task<bool> ValidateAsync(string? captchaToken)
{
    // Si le captcha n'est pas active, on accepte toujours
    if (!_isEnabled)
        return true;

    if (string.IsNullOrEmpty(captchaToken))
        return false;

    var response = await _httpClient.PostAsync(
        $"https://www.google.com/recaptcha/api/siteverify?secret={_secretKey}&response={captchaToken}",
        null);

    var result = await response.Content.ReadFromJsonAsync<CaptchaResponse>();
    return result?.Success == true;
}
```

### Cles de Test

Google fournit des cles de test qui acceptent toujours la validation:

| Type | Cle |
|------|-----|
| Site Key | `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` |
| Secret Key | `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` |

> **Important:** Ces cles ne doivent etre utilisees qu'en developpement!

---

## Mot de Passe Oublie

### Flux Complet

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Utilisateur│     │   Frontend  │     │   Backend   │     │   Email     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  Entre email      │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │  Valide CAPTCHA   │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  POST /forgot     │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  Genere token     │
       │                   │                   │  (1h validite)    │
       │                   │                   │                   │
       │                   │                   │  Envoie email     │
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │  200 OK           │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │  Message succes   │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │                   │                   │      Email avec   │
       │<─────────────────────────────────────────────────lien     │
       │                   │                   │                   │
       │  Clique sur lien  │                   │                   │
       │  /reset?token=xxx │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │  Nouveau MDP      │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  POST /reset      │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  Valide token     │
       │                   │                   │  Change MDP       │
       │                   │                   │  Revoque sessions │
       │                   │                   │                   │
       │                   │  200 OK           │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │  Redirection      │                   │                   │
       │  vers /login      │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
```

### Entite PasswordResetToken

**Fichier:** `FleetTrack.Domain/Entities/PasswordResetToken.cs`

```csharp
public class PasswordResetToken : BaseEntity
{
    public Guid UserId { get; set; }
    public string Token { get; set; }        // Token hexadecimal 64 caracteres
    public DateTime ExpiresAt { get; set; }  // Validite 1 heure
    public bool IsUsed { get; set; }         // Marque comme utilise apres reset

    public User User { get; set; }
}
```

---

## Securite

### Mesures Implementees

| Mesure | Description |
|--------|-------------|
| **CAPTCHA** | Protection contre les bots et attaques par force brute |
| **Hachage BCrypt** | Mots de passe haches avec sel automatique |
| **Tokens JWT** | Authentification stateless avec expiration |
| **Refresh Tokens** | Rotation des tokens pour sessions longues |
| **Token unique reset** | Chaque token de reset ne peut etre utilise qu'une fois |
| **Expiration tokens** | Tokens de reset expirent apres 1 heure |
| **Revocation sessions** | Reset de MDP revoque tous les refresh tokens |
| **Enumeration emails** | Reponse identique que l'email existe ou non |

### Bonnes Pratiques

1. **Ne jamais stocker les mots de passe en clair**
2. **Toujours valider le CAPTCHA cote serveur**
3. **Utiliser HTTPS en production**
4. **Changer les cles de test en production**
5. **Configurer des expirations appropriees pour les tokens**
6. **Logger les tentatives de connexion echouees**

---

## Mise en Production

### Checklist

- [ ] Obtenir des cles reCAPTCHA de production sur [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- [ ] Activer CAPTCHA: `Captcha:Enabled = true`
- [ ] Remplacer les cles de test par les cles de production
- [ ] Configurer un service d'email pour l'envoi des liens de reset
- [ ] Changer la cle secrete JWT
- [ ] Activer HTTPS
- [ ] Configurer les origines CORS appropriees

### Configuration Production

**appsettings.Production.json:**
```json
{
  "Captcha": {
    "Enabled": true,
    "SiteKey": "VOTRE_CLE_SITE_PRODUCTION",
    "SecretKey": "VOTRE_CLE_SECRETE_PRODUCTION"
  },
  "Frontend": {
    "Url": "https://votre-domaine.com"
  }
}
```

**Variables d'environnement (recommande):**
```bash
CAPTCHA__SITEKEY=votre_cle_site
CAPTCHA__SECRETKEY=votre_cle_secrete
JWT__SECRET=votre_cle_jwt_super_secrete_production
```

### Service Email (TODO)

Le systeme log actuellement les liens de reset. Pour la production, implementer un service d'email:

```csharp
public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string resetUrl);
}
```

---

## Fichiers Crees/Modifies

### Frontend
| Fichier | Description |
|---------|-------------|
| `src/components/auth/Captcha.tsx` | Composant CAPTCHA reutilisable |
| `src/app/(auth)/login/page.tsx` | Page de connexion avec CAPTCHA |
| `src/app/(auth)/register/page.tsx` | Page d'inscription |
| `src/app/(auth)/forgot-password/page.tsx` | Demande de reset |
| `src/app/(auth)/reset-password/page.tsx` | Nouveau mot de passe |
| `src/types/auth.ts` | Types TypeScript |
| `src/lib/api/auth.ts` | Appels API |
| `.env.local` | Configuration CAPTCHA |

### Backend
| Fichier | Description |
|---------|-------------|
| `DTOs/Auth/LoginDto.cs` | + CaptchaToken |
| `DTOs/Auth/RegisterDto.cs` | + CaptchaToken |
| `DTOs/Auth/ForgotPasswordDto.cs` | Nouveau |
| `DTOs/Auth/ResetPasswordDto.cs` | Nouveau |
| `Entities/PasswordResetToken.cs` | Nouveau |
| `Interfaces/ICaptchaService.cs` | Nouveau |
| `Interfaces/IAuthService.cs` | + ForgotPassword, ResetPassword |
| `Services/CaptchaService.cs` | Nouveau |
| `Services/AuthService.cs` | + Validation CAPTCHA, Reset |
| `Controllers/AuthController.cs` | + Endpoints forgot/reset |
| `Data/FleetTrackDbContext.cs` | + DbSet PasswordResetTokens |
| `DependencyInjection.cs` | + CaptchaService |
| `appsettings.json` | + Config Captcha, Frontend |

---

## Ressources

- [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- [Documentation reCAPTCHA](https://developers.google.com/recaptcha/docs/display)
- [react-google-recaptcha](https://www.npmjs.com/package/react-google-recaptcha)
- [ASP.NET Core Authentication](https://docs.microsoft.com/aspnet/core/security/authentication)
- [JWT.io](https://jwt.io/) - Debugger de tokens JWT

---

> **Note:** Cette documentation a ete generee pour le projet FleetTrack. Pour toute question, consultez le code source ou contactez l'equipe de developpement.
