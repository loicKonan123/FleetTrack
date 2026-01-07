# FleetTrack Frontend

> Interface utilisateur moderne pour le systeme de gestion de flotte FleetTrack

## Technologies

- **Next.js 15** - Framework React avec App Router
- **React 19** - Bibliotheque UI
- **TailwindCSS 4** - Framework CSS utilitaire
- **React Query (TanStack)** - Gestion des requetes API et cache
- **Framer Motion** - Animations fluides
- **Lucide Icons** - Icones modernes
- **Sonner** - Notifications toast

## Fonctionnalites

### Authentification
- Connexion avec CAPTCHA Google reCAPTCHA
- Inscription avec validation
- Mot de passe oublie / Reinitialisation
- Tokens JWT avec refresh automatique

### Dashboard Admin
- Vue d'ensemble des statistiques
- Graphiques et KPIs

### Gestion des Vehicules
- Liste avec filtres et pagination
- Creation / Modification / Suppression
- Suivi du statut

### Gestion des Conducteurs
- Profils avec informations de permis
- Assignation aux missions

### Missions
- Planification et suivi
- Gestion des priorites
- Statuts en temps reel

### Tracking GPS
- Carte temps reel avec SignalR
- Historique des trajets
- Interface conducteur mobile

### Alertes & Maintenance
- Notifications en temps reel
- Planification de maintenance
- Historique des interventions

## Demarrage

### Prerequis

- Node.js 20+
- npm ou yarn

### Installation

```bash
# Installer les dependances
npm install

# Lancer en mode developpement
npm run dev

# Build pour production
npm run build

# Lancer la version production
npm start
```

### Variables d'environnement

Creer un fichier `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5115/api
NEXT_PUBLIC_SIGNALR_HUB_URL=http://localhost:5115/hubs/gps
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

## Docker

```bash
# Build l'image
docker build -t fleettrack-frontend .

# Lancer le container
docker run -p 3000:3000 fleettrack-frontend
```

## Structure du Projet

```
src/
├── app/                    # Pages (App Router)
│   ├── (admin)/           # Pages admin authentifiees
│   │   ├── dashboard/     # Tableau de bord
│   │   ├── vehicles/      # Gestion vehicules
│   │   ├── drivers/       # Gestion conducteurs
│   │   ├── missions/      # Gestion missions
│   │   ├── users/         # Gestion utilisateurs
│   │   ├── alerts/        # Alertes
│   │   ├── maintenance/   # Maintenance
│   │   └── tracking/      # Tracking GPS
│   ├── (auth)/            # Pages authentification
│   │   ├── login/         # Connexion
│   │   ├── register/      # Inscription
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (driver)/          # Interface conducteur
│   └── layout.tsx         # Layout racine
├── components/            # Composants React
│   ├── auth/              # Composants auth (Captcha)
│   ├── layout/            # Header, Sidebar
│   └── ui/                # Composants UI (shadcn/ui)
├── lib/                   # Utilitaires
│   ├── api/               # Clients API (axios)
│   └── hooks/             # Hooks React (useAuth, useVehicles...)
└── types/                 # Types TypeScript
```

## Compte par Defaut

| Username | Password | Role |
|----------|----------|------|
| admin | Admin123! | Admin |

## Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Developpement avec hot reload |
| `npm run build` | Build production |
| `npm start` | Lancer la build |
| `npm run lint` | Linter ESLint |
