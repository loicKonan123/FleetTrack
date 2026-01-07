# Documentation Complète du Frontend FleetTrack

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du Projet](#architecture-du-projet)
3. [Technologies Utilisées](#technologies-utilisées)
4. [Structure des Dossiers](#structure-des-dossiers)
5. [Flux de Données](#flux-de-données)
6. [Authentification JWT](#authentification-jwt)
7. [React Query](#react-query)
8. [SignalR pour le Temps Réel](#signalr-pour-le-temps-réel)
9. [Composants UI avec shadcn/ui](#composants-ui-avec-shadcnui)
10. [Thème Clair/Sombre](#thème-clairsombre)
11. [Comment Ajouter une Nouvelle Fonctionnalité](#comment-ajouter-une-nouvelle-fonctionnalité)
12. [Bonnes Pratiques](#bonnes-pratiques)
13. [Dépannage](#dépannage)

---

## Vue d'ensemble

FleetTrack Frontend est une application Next.js 15 moderne qui utilise l'App Router pour créer une interface utilisateur complète de gestion de flotte. Elle se connecte à l'API backend ASP.NET Core pour gérer les véhicules, conducteurs, missions et le tracking GPS en temps réel.

### Caractéristiques principales

- ✅ **Authentification JWT** avec refresh token automatique
- ✅ **Interface Admin** complète avec sidebar de navigation
- ✅ **Gestion CRUD** pour véhicules, conducteurs, missions
- ✅ **Tracking GPS en temps réel** via SignalR
- ✅ **Thème Dark/Light** avec persistance
- ✅ **Responsive Design** adapté mobile/tablette/desktop
- ✅ **Type Safety** complet avec TypeScript
- ✅ **Optimistic Updates** via React Query

---

## Architecture du Projet

### Architecture en Couches

L'application suit une architecture en couches séparant clairement les responsabilités :

```
┌─────────────────────────────────────────┐
│         Pages (UI Layer)                │
│   - Affichage et interaction utilisateur│
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│       Hooks (Business Logic)            │
│   - useAuth, useVehicles, etc.          │
│   - Gestion d'état avec React Query     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│     API Services (Data Layer)           │
│   - authApi, vehiclesApi, etc.          │
│   - Appels HTTP avec Axios              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    API Client (HTTP Infrastructure)     │
│   - Intercepteurs JWT                   │
│   - Gestion des tokens                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
          Backend API (ASP.NET Core)
```

### Principe de Séparation des Responsabilités

1. **Pages** : Uniquement de l'affichage et des événements utilisateur
2. **Hooks** : Logique métier, gestion d'état, effets
3. **API Services** : Communication avec le backend
4. **API Client** : Infrastructure HTTP (tokens, intercepteurs)

---

## Technologies Utilisées

### Framework et Bibliothèques Principales

| Technologie | Version | Rôle |
|------------|---------|------|
| **Next.js** | 15.x | Framework React avec App Router |
| **React** | 19.x | Bibliothèque UI |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling utilitaire |
| **shadcn/ui** | Latest | Composants UI |

### Gestion d'État et Données

| Technologie | Rôle |
|------------|------|
| **@tanstack/react-query** | Cache et synchronisation serveur |
| **axios** | Client HTTP |
| **zustand** | État client léger (optionnel) |

### Communication Temps Réel

| Technologie | Rôle |
|------------|------|
| **@microsoft/signalr** | WebSockets pour GPS tracking |

### Autres Bibliothèques

| Technologie | Rôle |
|------------|------|
| **react-hook-form** | Gestion des formulaires |
| **zod** | Validation de schémas |
| **date-fns** | Manipulation de dates |
| **mapbox-gl** | Cartes interactives |
| **next-themes** | Gestion du thème |
| **lucide-react** | Icônes |

---

## Structure des Dossiers

### Arborescence Complète

```
fleettrack-frontend/
├── public/                          # Fichiers statiques
│   ├── icons/
│   └── images/
│
├── src/
│   ├── app/                         # Pages Next.js (App Router)
│   │   ├── (admin)/                # Groupe de routes admin
│   │   │   ├── layout.tsx          # Layout avec Header + Sidebar
│   │   │   ├── dashboard/          # Page dashboard
│   │   │   │   └── page.tsx
│   │   │   ├── vehicles/           # Pages véhicules
│   │   │   │   ├── page.tsx        # Liste des véhicules
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # Créer un véhicule
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Détails du véhicule
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx # Modifier le véhicule
│   │   │   ├── drivers/            # Pages conducteurs
│   │   │   ├── missions/           # Pages missions
│   │   │   └── tracking/           # Page tracking GPS
│   │   │       └── page.tsx
│   │   │
│   │   ├── (auth)/                 # Groupe de routes authentification
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Page de connexion
│   │   │   └── register/
│   │   │       └── page.tsx        # Page d'inscription
│   │   │
│   │   ├── layout.tsx              # Layout racine
│   │   ├── page.tsx                # Page d'accueil (redirection)
│   │   ├── providers.tsx           # Providers React Query + Theme
│   │   └── globals.css             # Styles globaux
│   │
│   ├── components/                 # Composants réutilisables
│   │   ├── ui/                     # Composants shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                 # Composants de mise en page
│   │   │   ├── Header.tsx          # En-tête avec menu utilisateur
│   │   │   ├── Sidebar.tsx         # Barre latérale de navigation
│   │   │   └── ThemeToggle.tsx     # Bouton dark/light mode
│   │   │
│   │   ├── auth/                   # Composants d'authentification
│   │   ├── vehicles/               # Composants véhicules
│   │   ├── drivers/                # Composants conducteurs
│   │   ├── missions/               # Composants missions
│   │   └── tracking/               # Composants tracking
│   │       ├── MapView.tsx         # Carte Mapbox
│   │       └── VehicleMarker.tsx   # Marqueur de véhicule
│   │
│   ├── lib/                        # Logique métier et utilitaires
│   │   ├── api/                    # Services API
│   │   │   ├── client.ts           # Client Axios avec intercepteurs
│   │   │   ├── auth.ts             # Service d'authentification
│   │   │   ├── vehicles.ts         # Service véhicules
│   │   │   ├── drivers.ts          # Service conducteurs
│   │   │   └── missions.ts         # Service missions
│   │   │
│   │   ├── hooks/                  # Hooks personnalisés
│   │   │   ├── useAuth.ts          # Hook authentification
│   │   │   ├── useVehicles.ts      # Hook véhicules
│   │   │   ├── useDrivers.ts       # Hook conducteurs
│   │   │   ├── useMissions.ts      # Hook missions
│   │   │   ├── useSignalR.ts       # Hook SignalR
│   │   │   └── useGpsTracking.ts   # Hook tracking GPS
│   │   │
│   │   └── utils/                  # Fonctions utilitaires
│   │       ├── cn.ts               # Classe CSS conditionnelle
│   │       ├── format.ts           # Formatage dates/nombres
│   │       └── validation.ts       # Validation de formulaires
│   │
│   └── types/                      # Définitions TypeScript
│       ├── auth.ts                 # Types authentification
│       ├── vehicle.ts              # Types véhicules
│       ├── driver.ts               # Types conducteurs
│       ├── mission.ts              # Types missions
│       ├── gps.ts                  # Types GPS/tracking
│       └── index.ts                # Export de tous les types
│
├── .env.local                      # Variables d'environnement
├── next.config.ts                  # Configuration Next.js
├── tailwind.config.ts              # Configuration Tailwind
├── tsconfig.json                   # Configuration TypeScript
└── package.json                    # Dépendances
```

### Explication des Groupes de Routes

#### Groupes `(admin)` et `(auth)`

Les parenthèses dans Next.js App Router créent des **groupes de routes** qui :
- Ne modifient PAS l'URL (transparents)
- Permettent d'avoir des layouts différents
- Organisent logiquement le code

**Exemple** :
- `app/(admin)/dashboard/page.tsx` → URL : `/dashboard`
- `app/(auth)/login/page.tsx` → URL : `/login`

---

## Flux de Données

### 1. Flux d'Authentification

```
┌─────────────┐
│ Page Login  │
└──────┬──────┘
       │ 1. Utilisateur entre username/password
       ▼
┌──────────────────┐
│ useAuth hook     │
└──────┬───────────┘
       │ 2. Appelle login()
       ▼
┌──────────────────┐
│ authApi.login()  │
└──────┬───────────┘
       │ 3. POST /api/auth/login
       ▼
┌──────────────────┐
│ API Backend      │
└──────┬───────────┘
       │ 4. Retourne accessToken + refreshToken
       ▼
┌──────────────────┐
│ setTokens()      │
│ localStorage     │
└──────┬───────────┘
       │ 5. Stocke les tokens
       ▼
┌──────────────────┐
│ React Query      │
│ setQueryData     │
└──────┬───────────┘
       │ 6. Met en cache l'utilisateur
       ▼
┌──────────────────┐
│ router.push      │
│ /dashboard       │
└──────────────────┘
```

### 2. Flux de Requête API avec Refresh Token

```
┌─────────────────┐
│ Page Vehicles   │
└────────┬────────┘
         │ 1. useVehicles() au montage
         ▼
┌─────────────────┐
│ React Query     │
│ queryFn         │
└────────┬────────┘
         │ 2. Appelle vehiclesApi.getAll()
         ▼
┌─────────────────┐
│ Axios Request   │
│ GET /vehicles   │
└────────┬────────┘
         │ 3. Request Interceptor
         │    → Ajoute Authorization: Bearer {accessToken}
         ▼
┌─────────────────┐
│ API Backend     │
└────────┬────────┘
         │
         │ Si token expiré → 401
         ▼
┌─────────────────────────────────┐
│ Response Interceptor            │
│ Détecte 401                     │
└────────┬────────────────────────┘
         │ 4. Appelle /auth/refresh
         │    avec refreshToken
         ▼
┌─────────────────┐
│ API Backend     │
│ /auth/refresh   │
└────────┬────────┘
         │ 5. Retourne nouveau accessToken
         ▼
┌─────────────────┐
│ setTokens()     │
│ localStorage    │
└────────┬────────┘
         │ 6. Réessaie la requête originale
         │    avec nouveau token
         ▼
┌─────────────────┐
│ Succès !        │
│ Données reçues  │
└─────────────────┘
```

### 3. Flux SignalR Temps Réel

```
┌─────────────────┐
│ Page Tracking   │
└────────┬────────┘
         │ 1. useGpsTracking() au montage
         ▼
┌─────────────────┐
│ useSignalR()    │
└────────┬────────┘
         │ 2. Crée connexion SignalR
         │    avec accessToken
         ▼
┌─────────────────┐
│ SignalR Hub     │
│ /hubs/gps       │
└────────┬────────┘
         │ 3. Connexion établie
         │    invoke("SubscribeToAllVehicles")
         ▼
┌─────────────────┐
│ Backend envoie  │
│ ReceiveGpsPos   │
└────────┬────────┘
         │ 4. Hub écoute l'événement
         ▼
┌─────────────────┐
│ connection.on() │
│ Callback        │
└────────┬────────┘
         │ 5. Met à jour état positions
         ▼
┌─────────────────┐
│ React re-render │
│ Marqueur bouge  │
│ sur la carte    │
└─────────────────┘
```

---

## Authentification JWT

### Fonctionnement Détaillé

#### 1. Structure des Tokens

**Access Token** (durée : 60 minutes)
```json
{
  "sub": "user-id",
  "name": "username",
  "role": "Admin",
  "exp": 1234567890
}
```

**Refresh Token** (durée : 7 jours)
- Token opaque (non décodable)
- Stocké en base de données
- Permet d'obtenir un nouveau access token

#### 2. Client API avec Intercepteurs

**Fichier** : `src/lib/api/client.ts`

```typescript
// 1. CRÉATION DU CLIENT AXIOS
export const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5115/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. GESTION DES TOKENS EN MÉMOIRE ET LOCALSTORAGE
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  // Persistance dans localStorage pour survie au rechargement
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

// 3. REQUEST INTERCEPTOR
// Ajoute le token à TOUTES les requêtes
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// 4. RESPONSE INTERCEPTOR
// Gère le refresh automatique sur 401
apiClient.interceptors.response.use(
  (response) => response, // Succès → passe
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré !
      // 1. Récupère le refresh token
      const refresh = getRefreshToken();

      // 2. Appelle /auth/refresh
      const response = await axios.post('/auth/refresh', {
        refreshToken: refresh
      });

      // 3. Stocke les nouveaux tokens
      setTokens(
        response.data.accessToken,
        response.data.refreshToken
      );

      // 4. Réessaie la requête originale
      return apiClient(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

#### 3. Hook useAuth

**Fichier** : `src/lib/hooks/useAuth.ts`

```typescript
export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. RÉCUPÉRATION DE L'UTILISATEUR COURANT
  // Au chargement de l'app, appelle /api/auth/me
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false, // Pas de retry si non authentifié
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });

  // 2. MUTATION LOGIN
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // Stocke l'utilisateur dans le cache React Query
      queryClient.setQueryData(['currentUser'], data.user);
      // Redirige vers le dashboard
      router.push('/dashboard');
    },
  });

  // 3. MUTATION LOGOUT
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearTokens(); // Efface les tokens
      queryClient.clear(); // Vide le cache
      router.push('/login'); // Redirige vers login
    },
  });

  return {
    user, // Utilisateur courant
    isAuthenticated: !!user, // true si connecté
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
};
```

#### 4. Utilisation dans une Page

**Fichier** : `src/app/(auth)/login/page.tsx`

```typescript
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoginLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Appelle le hook useAuth
      await login({ username, password });
      // Si succès → redirection automatique dans le hook
    } catch (err) {
      // Affiche l'erreur
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={username} onChange={...} />
      <Input type="password" value={password} onChange={...} />
      <Button type="submit" disabled={isLoginLoading}>
        {isLoginLoading ? 'Loading...' : 'Login'}
      </Button>
    </form>
  );
}
```

---

## React Query

### Pourquoi React Query ?

React Query résout plusieurs problèmes :

1. **Cache côté client** : Évite les requêtes inutiles
2. **Synchronisation** : Garde les données à jour automatiquement
3. **Loading states** : Gère isLoading, isError automatiquement
4. **Optimistic updates** : Mise à jour instantanée avant réponse serveur
5. **Pagination** : Gestion native de la pagination
6. **Invalidation** : Rafraîchit les données quand nécessaire

### Structure d'un Hook React Query

**Fichier** : `src/lib/hooks/useVehicles.ts`

```typescript
export const useVehicles = (page = 1, pageSize = 10) => {
  const queryClient = useQueryClient();

  // 1. QUERY - Récupération des données
  const vehiclesQuery = useQuery({
    // Clé unique pour identifier cette query dans le cache
    queryKey: ['vehicles', page, pageSize],

    // Fonction qui fait l'appel API
    queryFn: () => vehiclesApi.getAll(page, pageSize),

    // Options optionnelles
    staleTime: 5 * 60 * 1000, // Données considérées fraîches pendant 5min
    cacheTime: 10 * 60 * 1000, // Garde en cache pendant 10min
  });

  // 2. MUTATION CREATE - Création d'un véhicule
  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleRequest) =>
      vehiclesApi.create(data),

    onSuccess: () => {
      // Invalide le cache pour recharger la liste
      queryClient.invalidateQueries({
        queryKey: ['vehicles']
      });
    },
  });

  // 3. MUTATION UPDATE - Modification
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      vehiclesApi.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['vehicles']
      });
    },
  });

  // 4. MUTATION DELETE - Suppression
  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['vehicles']
      });
    },
  });

  // Retourne tout ce dont la page a besoin
  return {
    vehicles: vehiclesQuery.data,
    isLoading: vehiclesQuery.isLoading,
    error: vehiclesQuery.error,
    createVehicle: createMutation.mutateAsync,
    updateVehicle: updateMutation.mutateAsync,
    deleteVehicle: deleteMutation.mutateAsync,
  };
};
```

### Cycle de Vie d'une Query

```
┌─────────────────────────────────────────────────┐
│ 1. Component Mount                              │
│    useVehicles() est appelé                     │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 2. React Query vérifie le cache                │
│    Clé : ['vehicles', 1, 10]                   │
└────────────────────┬────────────────────────────┘
                     │
            ┌────────┴────────┐
            │                 │
         Existe          N'existe pas
            │                 │
            ▼                 ▼
┌───────────────────┐  ┌──────────────────┐
│ 3a. Cache Hit     │  │ 3b. Cache Miss   │
│ Retourne data     │  │ Appelle queryFn  │
│ isLoading: false  │  │ isLoading: true  │
└─────────┬─────────┘  └────────┬─────────┘
          │                     │
          │                     ▼
          │          ┌──────────────────────┐
          │          │ 4. Requête API       │
          │          │ GET /api/vehicles    │
          │          └────────┬─────────────┘
          │                   │
          │                   ▼
          │          ┌──────────────────────┐
          │          │ 5. Mise en cache     │
          │          │ Stocke les données   │
          │          └────────┬─────────────┘
          │                   │
          └───────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 6. Component affiche les données                │
│    isLoading: false                             │
│    data: [...véhicules...]                      │
└─────────────────────────────────────────────────┘
```

### Invalidation du Cache

Quand vous créez/modifiez/supprimez un véhicule :

```typescript
// Après la création réussie
queryClient.invalidateQueries({ queryKey: ['vehicles'] });

// Ce qui se passe :
// 1. Marque toutes les queries avec cette clé comme "stale"
// 2. Si des composants utilisent ces queries, refetch automatique
// 3. La liste se met à jour automatiquement
```

---

## SignalR pour le Temps Réel

### Architecture SignalR

```
┌──────────────────────┐
│   React Component    │
│   (Page Tracking)    │
└──────────┬───────────┘
           │
           │ useGpsTracking()
           ▼
┌──────────────────────┐
│   useSignalR Hook    │
│   - Connexion        │
│   - Événements       │
└──────────┬───────────┘
           │
           │ SignalR Connection
           ▼
┌──────────────────────┐
│   Backend Hub        │
│   /hubs/gps          │
└──────────┬───────────┘
           │
           │ Broadcast
           ▼
┌──────────────────────┐
│   Tous les clients   │
│   connectés          │
└──────────────────────┘
```

### Hook useSignalR

**Fichier** : `src/lib/hooks/useSignalR.ts`

```typescript
export const useSignalR = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [positions, setPositions] = useState<GpsPositionUpdateDto[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // 1. CRÉATION DE LA CONNEXION
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5115/hubs/gps', {
        // Ajoute le JWT token pour l'authentification
        accessTokenFactory: () => getAccessToken() || '',
      })
      .withAutomaticReconnect() // Reconnexion auto si perte
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // 2. ENREGISTREMENT DES ÉVÉNEMENTS

    // Quand le serveur envoie une position GPS
    connection.on('ReceiveGpsPosition', (position: GpsPositionUpdateDto) => {
      console.log('Position reçue:', position);
      // Ajoute la position au state (max 100 dernières)
      setPositions((prev) => [position, ...prev].slice(0, 100));
    });

    // Quand le serveur envoie un événement de tracking
    connection.on('ReceiveTrackingEvent', (event: TrackingEventDto) => {
      console.log('Événement reçu:', event);
    });

    // Confirmation d'abonnement
    connection.on('SubscriptionConfirmed', (vehicleId: string) => {
      console.log('Abonné au véhicule:', vehicleId);
    });

    // 3. DÉMARRAGE DE LA CONNEXION
    connection
      .start()
      .then(() => {
        setIsConnected(true);
        console.log('✅ SignalR connecté');
      })
      .catch((err) => {
        console.error('❌ Erreur SignalR:', err);
      });

    // 4. NETTOYAGE À LA DESTRUCTION DU COMPOSANT
    return () => {
      connection.stop();
    };
  }, []); // useEffect ne s'exécute qu'une fois au montage

  // 5. FONCTIONS D'INTERACTION

  // S'abonner à un véhicule spécifique
  const subscribeToVehicle = async (vehicleId: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('SubscribeToVehicle', vehicleId);
    }
  };

  // S'abonner à tous les véhicules
  const subscribeToAllVehicles = async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('SubscribeToAllVehicles');
    }
  };

  // Envoyer une position GPS (pour les conducteurs)
  const sendGpsPosition = async (position: GpsPositionUpdateDto) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('SendGpsPosition', position);
    }
  };

  return {
    isConnected,
    positions, // Liste des positions reçues
    subscribeToVehicle,
    subscribeToAllVehicles,
    sendGpsPosition,
  };
};
```

### Hook useGpsTracking (Niveau Supérieur)

**Fichier** : `src/lib/hooks/useGpsTracking.ts`

```typescript
export const useGpsTracking = (vehicleIds?: string[]) => {
  const {
    isConnected,
    positions,
    subscribeToVehicle,
    subscribeToAllVehicles
  } = useSignalR();

  // Map pour stocker la dernière position de chaque véhicule
  const [vehiclePositions, setVehiclePositions] = useState<
    Map<string, GpsPositionUpdateDto>
  >(new Map());

  // S'abonner aux véhicules au montage
  useEffect(() => {
    if (!isConnected) return;

    if (vehicleIds && vehicleIds.length > 0) {
      // Abonnement à des véhicules spécifiques
      vehicleIds.forEach((id) => subscribeToVehicle(id));
    } else {
      // Abonnement à tous les véhicules
      subscribeToAllVehicles();
    }
  }, [isConnected, vehicleIds]);

  // Mettre à jour la map quand de nouvelles positions arrivent
  useEffect(() => {
    positions.forEach((pos) => {
      setVehiclePositions((prev) =>
        new Map(prev).set(pos.vehicleId, pos)
      );
    });
  }, [positions]);

  return {
    isConnected,
    vehiclePositions, // Map: vehicleId -> dernière position
    latestPositions: positions, // Toutes les positions (historique)
  };
};
```

### Utilisation dans un Composant

```typescript
export default function TrackingPage() {
  const { isConnected, vehiclePositions } = useGpsTracking();

  return (
    <div>
      <p>Connexion: {isConnected ? '✅ Connecté' : '❌ Déconnecté'}</p>

      {/* Afficher la carte */}
      <MapView positions={vehiclePositions} />

      {/* Liste des véhicules */}
      {Array.from(vehiclePositions.entries()).map(([vehicleId, position]) => (
        <div key={vehicleId}>
          <p>Véhicule: {vehicleId}</p>
          <p>Position: {position.latitude}, {position.longitude}</p>
          <p>Vitesse: {position.speed} km/h</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Composants UI avec shadcn/ui

### Qu'est-ce que shadcn/ui ?

shadcn/ui n'est **PAS une bibliothèque NPM classique**. C'est une collection de composants :
- Copiés directement dans votre projet (dans `src/components/ui/`)
- Basés sur Radix UI (primitives accessibles)
- Stylés avec Tailwind CSS
- **Vous possédez le code** → modification totale possible

### Installation d'un Nouveau Composant

```bash
# Installer un composant dialog
npx shadcn@latest add dialog

# Cela crée le fichier :
# src/components/ui/dialog.tsx
```

### Anatomie d'un Composant shadcn

**Fichier** : `src/components/ui/button.tsx`

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 1. DÉFINITION DES VARIANTES avec CVA
const buttonVariants = cva(
  // Classes de base (toujours appliquées)
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      // Variante "variant"
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      // Variante "size"
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// 2. INTERFACE DU COMPOSANT
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// 3. COMPOSANT REACT
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Utilisation du Composant

```typescript
import { Button } from "@/components/ui/button"

// Différentes variantes
<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>

// Différentes tailles
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// Personnalisation avec className
<Button className="w-full">Full Width</Button>
```

### Composants Composés (Composition Pattern)

Certains composants shadcn suivent le **Composition Pattern** :

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenu de la carte</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Fonction Utilitaire `cn()`

**Fichier** : `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Combine clsx et tailwind-merge
// clsx : combine des classes conditionnelles
// twMerge : résout les conflits Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Exemple d'utilisation
cn(
  "bg-red-500", // Classe de base
  isActive && "bg-blue-500", // Conditionnelle
  className // Props externe
)
// Si isActive=true et className="text-white"
// Résultat: "bg-blue-500 text-white"
// (bg-red-500 est écrasé par bg-blue-500)
```

---

## Thème Clair/Sombre

### Architecture du Thème

```
┌──────────────────────────────────────┐
│  ThemeProvider (next-themes)         │
│  - Détecte préférence système        │
│  - Persiste le choix utilisateur     │
│  - Ajoute classe "dark" à <html>     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  CSS Variables (globals.css)         │
│  :root { --background: white }       │
│  .dark { --background: black }       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Tailwind Classes                    │
│  bg-background → var(--background)   │
│  dark:bg-slate-900                   │
└──────────────────────────────────────┘
```

### Configuration

**Fichier** : `src/app/providers.tsx`

```typescript
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"           // Utilise la classe CSS
      defaultTheme="system"       // Par défaut : préférence système
      enableSystem                // Active détection système
      disableTransitionOnChange   // Pas d'animation au changement
    >
      {children}
    </ThemeProvider>
  );
}
```

**Fichier** : `src/app/layout.tsx`

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning : évite warning avec next-themes */}
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Composant Toggle

**Fichier** : `src/components/layout/ThemeToggle.tsx`

```typescript
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {/* Icône soleil visible en mode light */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all
                      dark:-rotate-90 dark:scale-0" />

      {/* Icône lune visible en mode dark */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all
                       dark:rotate-0 dark:scale-100" />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

### Variables CSS

**Fichier** : `src/app/globals.css`

```css
:root {
  /* Mode Light */
  --background: oklch(1 0 0);           /* Blanc */
  --foreground: oklch(0.145 0 0);       /* Noir */
  --primary: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);             /* Gris clair */
}

.dark {
  /* Mode Dark */
  --background: oklch(0.145 0 0);       /* Noir */
  --foreground: oklch(0.985 0 0);       /* Blanc */
  --primary: oklch(0.922 0 0);
  --muted: oklch(0.269 0 0);            /* Gris foncé */
}
```

### Utilisation dans les Composants

```typescript
// 1. Avec les classes Tailwind de base
<div className="bg-background text-foreground">
  {/* S'adapte automatiquement au thème */}
</div>

// 2. Avec les modificateurs dark:
<div className="bg-white dark:bg-slate-900">
  {/* Blanc en light, ardoise foncé en dark */}
</div>

// 3. Avec les couleurs sémantiques
<div className="bg-primary text-primary-foreground">
  {/* Utilise les variables CSS --primary */}
</div>
```

---

## Comment Ajouter une Nouvelle Fonctionnalité

### Exemple : Ajouter la Gestion des Alerts

#### Étape 1 : Créer les Types TypeScript

**Fichier** : `src/types/alert.ts`

```typescript
export enum AlertSeverity {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export interface AlertDto {
  id: string;
  vehicleId: string;
  severity: AlertSeverity;
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface CreateAlertRequest {
  vehicleId: string;
  severity: AlertSeverity;
  message: string;
}
```

#### Étape 2 : Créer le Service API

**Fichier** : `src/lib/api/alerts.ts`

```typescript
import { apiClient } from './client';
import { AlertDto, CreateAlertRequest } from '@/types/alert';
import { PaginatedResponse } from './vehicles';

export const alertsApi = {
  getAll: async (
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<AlertDto>> => {
    const response = await apiClient.get<PaginatedResponse<AlertDto>>(
      '/alerts',
      { params: { pageNumber: page, pageSize } }
    );
    return response.data;
  },

  getById: async (id: string): Promise<AlertDto> => {
    const response = await apiClient.get<AlertDto>(`/alerts/${id}`);
    return response.data;
  },

  create: async (data: CreateAlertRequest): Promise<AlertDto> => {
    const response = await apiClient.post<AlertDto>('/alerts', data);
    return response.data;
  },

  resolve: async (id: string): Promise<void> => {
    await apiClient.patch(`/alerts/${id}/resolve`);
  },
};
```

#### Étape 3 : Créer le Hook React Query

**Fichier** : `src/lib/hooks/useAlerts.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api/alerts';
import { CreateAlertRequest } from '@/types/alert';

export const useAlerts = (page = 1, pageSize = 10) => {
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ['alerts', page, pageSize],
    queryFn: () => alertsApi.getAll(page, pageSize),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAlertRequest) => alertsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => alertsApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    alerts: alertsQuery.data,
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    createAlert: createMutation.mutateAsync,
    resolveAlert: resolveMutation.mutateAsync,
  };
};
```

#### Étape 4 : Créer la Page

**Fichier** : `src/app/(admin)/alerts/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useAlerts } from '@/lib/hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertSeverity } from '@/types/alert';

const severityColors = {
  [AlertSeverity.Low]: 'bg-blue-500',
  [AlertSeverity.Medium]: 'bg-yellow-500',
  [AlertSeverity.High]: 'bg-orange-500',
  [AlertSeverity.Critical]: 'bg-red-500',
};

export default function AlertsPage() {
  const [page, setPage] = useState(1);
  const { alerts, isLoading, resolveAlert } = useAlerts(page, 10);

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Alerts</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Alerts ({alerts?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts?.data.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between border-l-4 p-4 rounded"
                style={{ borderColor: severityColors[alert.severity] }}
              >
                <div>
                  <Badge className={severityColors[alert.severity]}>
                    {AlertSeverity[alert.severity]}
                  </Badge>
                  <p className="mt-2">{alert.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>

                {!alert.isResolved && (
                  <Button onClick={() => handleResolve(alert.id)}>
                    Resolve
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Étape 5 : Ajouter au Menu de Navigation

**Fichier** : `src/components/layout/Sidebar.tsx`

```typescript
import { AlertCircle } from 'lucide-react';

const adminNavItems: NavItem[] = [
  // ... autres items
  {
    title: 'Alerts',
    href: '/alerts',
    icon: AlertCircle
  },
];
```

---

## Bonnes Pratiques

### 1. Structuration des Composants

#### ✅ Bon : Composants Petits et Réutilisables

```typescript
// components/vehicles/VehicleCard.tsx
export function VehicleCard({ vehicle }: { vehicle: VehicleDto }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{vehicle.registrationNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{vehicle.brand} {vehicle.model}</p>
        <Badge>{VehicleStatus[vehicle.status]}</Badge>
      </CardContent>
    </Card>
  );
}

// pages/vehicles/page.tsx
export default function VehiclesPage() {
  const { vehicles } = useVehicles();

  return (
    <div className="grid grid-cols-3 gap-4">
      {vehicles?.data.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
```

#### ❌ Mauvais : Tout dans une Page

```typescript
// NE PAS FAIRE ÇA
export default function VehiclesPage() {
  const { vehicles } = useVehicles();

  return (
    <div>
      {vehicles?.data.map((vehicle) => (
        <div key={vehicle.id} className="border p-4 rounded">
          <h3 className="text-lg font-bold">{vehicle.registrationNumber}</h3>
          <p className="text-sm">{vehicle.brand} {vehicle.model}</p>
          <span className={/* ... beaucoup de logique ... */}>
            {VehicleStatus[vehicle.status]}
          </span>
          {/* ... encore plus de code ... */}
        </div>
      ))}
    </div>
  );
}
```

### 2. Gestion d'État

#### ✅ Bon : Utiliser React Query pour les Données Serveur

```typescript
// Pour les données du serveur
const { vehicles } = useVehicles();

// Pour l'état UI local
const [isModalOpen, setIsModalOpen] = useState(false);
```

#### ❌ Mauvais : useState pour les Données Serveur

```typescript
// NE PAS FAIRE ÇA
const [vehicles, setVehicles] = useState([]);

useEffect(() => {
  fetch('/api/vehicles')
    .then(res => res.json())
    .then(data => setVehicles(data));
}, []); // Pas de cache, pas de gestion d'erreur, etc.
```

### 3. Typage TypeScript

#### ✅ Bon : Types Stricts

```typescript
interface VehicleFormProps {
  vehicle?: VehicleDto; // Optionnel pour création
  onSubmit: (data: CreateVehicleRequest) => Promise<void>;
  onCancel: () => void;
}

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  // ...
}
```

#### ❌ Mauvais : any Partout

```typescript
// NE PAS FAIRE ÇA
export function VehicleForm({ vehicle, onSubmit }: any) {
  // Perte totale du type safety
}
```

### 4. Gestion des Erreurs

#### ✅ Bon : Try-Catch avec Feedback Utilisateur

```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return;

  try {
    await deleteVehicle(id);
    toast.success('Vehicle deleted successfully');
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete vehicle');
    console.error('Delete error:', error);
  }
};
```

#### ❌ Mauvais : Ignorer les Erreurs

```typescript
// NE PAS FAIRE ÇA
const handleDelete = async (id: string) => {
  await deleteVehicle(id); // Crash silencieux si erreur
};
```

### 5. Performance

#### ✅ Bon : Mémoïsation et Optimisation

```typescript
import { useMemo } from 'react';

export function VehicleStats({ vehicles }: { vehicles: VehicleDto[] }) {
  // Calcul coûteux mémoïsé
  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === VehicleStatus.Available).length,
      inUse: vehicles.filter(v => v.status === VehicleStatus.InUse).length,
    };
  }, [vehicles]); // Recalcule uniquement si vehicles change

  return <div>{/* Affichage des stats */}</div>;
}
```

#### ❌ Mauvais : Recalcul à Chaque Render

```typescript
// NE PAS FAIRE ÇA
export function VehicleStats({ vehicles }: { vehicles: VehicleDto[] }) {
  // Recalculé à CHAQUE render, même si vehicles ne change pas
  const total = vehicles.length;
  const available = vehicles.filter(v => v.status === VehicleStatus.Available).length;

  return <div>{/* ... */}</div>;
}
```

### 6. Accessibilité

#### ✅ Bon : Labels et ARIA

```typescript
<div>
  <Label htmlFor="registration">Registration Number</Label>
  <Input
    id="registration"
    type="text"
    aria-required="true"
    aria-describedby="registration-error"
  />
  {error && (
    <p id="registration-error" className="text-destructive">
      {error}
    </p>
  )}
</div>
```

---

## Dépannage

### Problème 1 : "Hydration Mismatch"

**Erreur** :
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

**Cause** : Contenu différent entre serveur et client (souvent avec le thème)

**Solution** :
```typescript
// Ajouter suppressHydrationWarning
<html lang="en" suppressHydrationWarning>
```

### Problème 2 : "Cannot read property 'map' of undefined"

**Erreur** :
```
TypeError: Cannot read property 'map' of undefined
```

**Cause** : Les données ne sont pas encore chargées

**Solution** :
```typescript
// Toujours vérifier si les données existent
{vehicles?.data?.map((vehicle) => (
  <div key={vehicle.id}>{vehicle.name}</div>
))}

// Ou utiliser un état de chargement
if (isLoading) return <div>Loading...</div>;
if (!vehicles) return <div>No data</div>;
```

### Problème 3 : Token Expiré

**Symptôme** : Redirection vers login après 60 minutes

**Vérification** :
```typescript
// Vérifier dans la console
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

**Solution** : L'intercepteur Axios gère automatiquement le refresh. Vérifiez :
1. Le refresh token est-il valide (< 7 jours) ?
2. Le backend est-il accessible ?
3. Les logs de la console montrent-ils une erreur ?

### Problème 4 : SignalR ne se Connecte Pas

**Vérifications** :
1. Le backend est-il démarré ?
2. L'URL du hub est-elle correcte ?
3. Le token JWT est-il valide ?

**Debug** :
```typescript
// Activer les logs SignalR
.configureLogging(signalR.LogLevel.Debug)

// Vérifier l'état de connexion
console.log('SignalR State:', connection.state);
```

### Problème 5 : React Query ne Recharge Pas les Données

**Cause** : Cache non invalidé après mutation

**Solution** :
```typescript
const createMutation = useMutation({
  mutationFn: createVehicle,
  onSuccess: () => {
    // NE PAS OUBLIER D'INVALIDER LE CACHE
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  },
});
```

---

## Commandes Utiles

### Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Démarrer en mode production
npm start

# Linter
npm run lint
```

### shadcn/ui

```bash
# Ajouter un composant
npx shadcn@latest add [component-name]

# Exemples
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add toast
```

### TypeScript

```bash
# Vérifier les types
npx tsc --noEmit
```

---

## Ressources et Documentation

### Documentation Officielle

- **Next.js** : https://nextjs.org/docs
- **React Query** : https://tanstack.com/query/latest
- **shadcn/ui** : https://ui.shadcn.com
- **Tailwind CSS** : https://tailwindcss.com/docs
- **SignalR** : https://learn.microsoft.com/aspnet/core/signalr
- **TypeScript** : https://www.typescriptlang.org/docs

### Outils de Développement

- **React DevTools** : Extension navigateur pour déboguer React
- **React Query DevTools** : Déjà intégré, accessible en dev
- **Tailwind CSS IntelliSense** : Extension VS Code

---

## Conclusion

Ce frontend FleetTrack est construit avec des technologies modernes et des patterns éprouvés :

✅ **Architecture en couches** claire et maintenable
✅ **Type safety** complet avec TypeScript
✅ **Gestion d'état** optimisée avec React Query
✅ **Temps réel** via SignalR
✅ **UI moderne** avec shadcn/ui et Tailwind
✅ **Authentification sécurisée** avec JWT

Vous avez maintenant toutes les bases pour comprendre, maintenir et étendre cette application !
