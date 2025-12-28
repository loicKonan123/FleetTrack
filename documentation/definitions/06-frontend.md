# Définitions : Frontend React et Next.js

> Guide complet des concepts frontend utilisés dans FleetTrack

---

## Table des Matières

1. [React - Fondamentaux](#1-react---fondamentaux)
2. [Composants](#2-composants)
3. [Hooks React](#3-hooks-react)
4. [Next.js](#4-nextjs)
5. [TypeScript pour React](#5-typescript-pour-react)
6. [State Management](#6-state-management)
7. [Styling avec Tailwind CSS](#7-styling-avec-tailwind-css)
8. [Temps Réel avec SignalR](#8-temps-réel-avec-signalr)

---

## 1. React - Fondamentaux

### 1.1 Qu'est-ce que React ?

#### Définition
**React** est une bibliothèque JavaScript pour construire des interfaces utilisateur. Elle utilise une approche "composants" et un DOM virtuel pour des performances optimales.

#### Analogie
React est comme des **briques LEGO**. Tu construis des petites pièces (composants) que tu assembles pour créer des structures plus grandes (pages).

### 1.2 JSX

#### Définition
**JSX** (JavaScript XML) est une extension syntaxique qui permet d'écrire du HTML dans du JavaScript.

```tsx
// JSX - mélange de HTML et JavaScript
function Welcome() {
  const name = "Jean";
  const isLoggedIn = true;

  return (
    <div className="welcome">
      <h1>Bonjour, {name}!</h1>
      {isLoggedIn && <p>Tu es connecté</p>}
      {!isLoggedIn ? (
        <button>Se connecter</button>
      ) : (
        <button>Se déconnecter</button>
      )}
    </div>
  );
}

// Équivalent JavaScript pur (ce que React génère)
function Welcome() {
  const name = "Jean";
  return React.createElement(
    "div",
    { className: "welcome" },
    React.createElement("h1", null, "Bonjour, ", name, "!")
  );
}
```

### 1.3 Virtual DOM

#### Définition
Le **Virtual DOM** est une représentation légère du DOM réel en mémoire. React compare l'ancien et le nouveau Virtual DOM pour ne mettre à jour que ce qui a changé.

```
┌─────────────────────────────────────────────────────────────┐
│                    VIRTUAL DOM                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. État change                                             │
│     count: 5 → count: 6                                     │
│                                                             │
│  2. Nouveau Virtual DOM créé                                │
│     ┌──────────────┐                                        │
│     │    <div>     │                                        │
│     │  count: 6    │  ← Seul changement                     │
│     └──────────────┘                                        │
│                                                             │
│  3. Comparaison (Diffing)                                   │
│     Ancien: count: 5                                        │
│     Nouveau: count: 6                                       │
│     Diff: Mettre à jour le texte                            │
│                                                             │
│  4. Mise à jour minimale du DOM réel                        │
│     Seulement le nœud texte est modifié                     │
│     (pas tout le composant)                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Composants

### 2.1 Définition

Un **composant** est une fonction (ou classe) qui retourne du JSX. C'est une pièce réutilisable de l'interface.

### 2.2 Composant Fonctionnel

```tsx
// Composant simple
function VehicleCard({ vehicle }: { vehicle: VehicleDto }) {
  return (
    <div className="card">
      <h3>{vehicle.plateNumber}</h3>
      <p>{vehicle.brand} {vehicle.model}</p>
    </div>
  );
}

// Avec déstructuration des props
interface VehicleCardProps {
  vehicle: VehicleDto;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

function VehicleCard({ vehicle, onSelect, isSelected = false }: VehicleCardProps) {
  return (
    <div
      className={`card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect?.(vehicle.id)}
    >
      <h3>{vehicle.plateNumber}</h3>
      <p>{vehicle.brand} {vehicle.model}</p>
    </div>
  );
}

// Utilisation
<VehicleCard vehicle={myVehicle} onSelect={handleSelect} isSelected={true} />
```

### 2.3 Props (Propriétés)

#### Définition
Les **props** sont les paramètres passés à un composant. Elles sont en lecture seule (immutables).

```tsx
// Les props sont passées du parent à l'enfant
function Parent() {
  const vehicle = { id: '1', plateNumber: 'AB-123' };

  return (
    <Child
      vehicle={vehicle}           // Objet
      title="Mon véhicule"        // String
      count={5}                   // Nombre
      isActive={true}             // Booléen
      onAction={() => {}}         // Fonction
      items={['a', 'b']}         // Tableau
    />
  );
}

function Child(props) {
  // props.vehicle, props.title, etc.
  // ❌ props.vehicle = newValue;  // INTERDIT!
}

// Déstructuration (recommandé)
function Child({ vehicle, title, count, isActive, onAction, items }) {
  return <div>{title}: {vehicle.plateNumber}</div>;
}
```

### 2.4 Children

```tsx
// children = contenu entre les balises ouvrante et fermante
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}

// Utilisation
<Card title="Véhicules">
  <p>Contenu de la carte</p>
  <VehicleList vehicles={vehicles} />
</Card>
```

### 2.5 Composition vs Héritage

React favorise la **composition** (composants dans composants) plutôt que l'héritage.

```tsx
// ✅ Composition
function Dialog({ title, children }) {
  return (
    <div className="dialog">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <Dialog title="Confirmer">
      <p>Êtes-vous sûr?</p>
      <button onClick={onConfirm}>Oui</button>
      <button onClick={onCancel}>Non</button>
    </Dialog>
  );
}

// ❌ Éviter l'héritage de classes
class Dialog extends Component { }
class ConfirmDialog extends Dialog { }  // Non recommandé
```

---

## 3. Hooks React

### 3.1 Qu'est-ce qu'un Hook ?

#### Définition
Les **Hooks** sont des fonctions qui permettent d'utiliser l'état et d'autres fonctionnalités React dans les composants fonctionnels.

### 3.2 useState

#### Définition
**useState** permet de gérer un état local dans un composant.

```tsx
import { useState } from 'react';

function Counter() {
  // Déclaration de l'état
  // count = valeur actuelle
  // setCount = fonction pour modifier
  const [count, setCount] = useState(0);  // 0 = valeur initiale

  return (
    <div>
      <p>Compteur: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Avec différents types
function Form() {
  const [name, setName] = useState('');           // String
  const [age, setAge] = useState<number>(0);      // Number avec type
  const [isActive, setIsActive] = useState(true); // Boolean
  const [items, setItems] = useState<string[]>([]); // Array
  const [user, setUser] = useState<User | null>(null); // Object ou null

  // Mise à jour d'un objet (créer un nouvel objet!)
  const [form, setForm] = useState({ name: '', email: '' });
  const updateName = (name: string) => {
    setForm(prev => ({ ...prev, name }));  // Spread pour copier
  };

  // Mise à jour d'un tableau
  const addItem = (item: string) => {
    setItems(prev => [...prev, item]);  // Ajouter
  };
  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));  // Supprimer
  };
}
```

### 3.3 useEffect

#### Définition
**useEffect** permet d'exécuter des effets de bord (API calls, subscriptions, timers) après le rendu.

```tsx
import { useState, useEffect } from 'react';

function VehicleList() {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Se déclenche après CHAQUE rendu
  useEffect(() => {
    console.log('Rendu effectué');
  });

  // Se déclenche UNE SEULE FOIS (au montage)
  useEffect(() => {
    console.log('Composant monté');
    fetchVehicles();

    // Cleanup (au démontage)
    return () => {
      console.log('Composant démonté');
    };
  }, []);  // [] = tableau de dépendances vide

  // Se déclenche quand une dépendance change
  const [filter, setFilter] = useState('');
  useEffect(() => {
    console.log('Filter a changé:', filter);
    fetchVehicles(filter);
  }, [filter]);  // Se déclenche quand filter change

  const fetchVehicles = async (search?: string) => {
    setLoading(true);
    try {
      const data = await vehiclesApi.getAll({ search });
      setVehicles(data.items);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <ul>
      {vehicles.map(v => (
        <li key={v.id}>{v.plateNumber}</li>
      ))}
    </ul>
  );
}
```

### 3.4 useCallback

#### Définition
**useCallback** mémorise une fonction pour éviter de la recréer à chaque rendu. Utile pour les optimisations de performance.

```tsx
import { useState, useCallback } from 'react';

function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // ❌ Sans useCallback: nouvelle fonction à chaque rendu
  const handleClick = () => {
    console.log('Clicked');
  };

  // ✅ Avec useCallback: même fonction tant que les dépendances ne changent pas
  const handleClickMemo = useCallback(() => {
    console.log('Clicked, count is:', count);
  }, [count]);  // Recréée seulement si count change

  // Utile pour passer aux composants enfants
  const handleSelect = useCallback((id: string) => {
    console.log('Selected:', id);
    // ...
  }, []);

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <ChildComponent onClick={handleClickMemo} />
    </div>
  );
}

// L'enfant ne re-rend pas si onClick ne change pas (avec React.memo)
const ChildComponent = React.memo(({ onClick }: { onClick: () => void }) => {
  console.log('ChildComponent rendu');
  return <button onClick={onClick}>Click me</button>;
});
```

### 3.5 useMemo

#### Définition
**useMemo** mémorise une valeur calculée pour éviter de la recalculer à chaque rendu.

```tsx
import { useState, useMemo } from 'react';

function VehicleStats({ vehicles }: { vehicles: VehicleDto[] }) {
  const [filter, setFilter] = useState('');

  // ❌ Sans useMemo: calcul à chaque rendu
  const totalMileage = vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);

  // ✅ Avec useMemo: calcul seulement si vehicles change
  const totalMileageMemo = useMemo(() => {
    console.log('Calcul du kilométrage total...');
    return vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);
  }, [vehicles]);

  // Filtrage mémorisé
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v =>
      v.plateNumber.toLowerCase().includes(filter.toLowerCase())
    );
  }, [vehicles, filter]);

  return (
    <div>
      <p>Kilométrage total: {totalMileageMemo} km</p>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filtrer..."
      />
      <ul>
        {filteredVehicles.map(v => (
          <li key={v.id}>{v.plateNumber}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.6 useRef

#### Définition
**useRef** crée une référence mutable qui persiste entre les rendus. Utilisé pour accéder au DOM ou stocker des valeurs sans déclencher de re-rendu.

```tsx
import { useRef, useEffect } from 'react';

function TextInput() {
  // Référence vers un élément DOM
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus automatique au montage
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
}

function Timer() {
  // Stocker une valeur sans re-rendu
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countRef = useRef(0);  // Pas de re-rendu quand ça change

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      countRef.current += 1;
      console.log('Count:', countRef.current);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}
```

### 3.7 Custom Hooks

#### Définition
Un **Custom Hook** est une fonction réutilisable qui utilise d'autres hooks. Convention: commence par "use".

```tsx
// hooks/useVehicles.ts
import { useState, useEffect } from 'react';

export function useVehicles(page: number = 1) {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await vehiclesApi.getAll(page);
        setVehicles(result.items);
        setTotalCount(result.totalCount);
      } catch (err) {
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const refresh = async () => {
    // ... refetch
  };

  return { vehicles, loading, error, totalCount, refresh };
}

// Utilisation dans un composant
function VehiclePage() {
  const [page, setPage] = useState(1);
  const { vehicles, loading, error, totalCount, refresh } = useVehicles(page);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <VehicleList vehicles={vehicles} />
      <Pagination
        current={page}
        total={Math.ceil(totalCount / 10)}
        onChange={setPage}
      />
    </div>
  );
}
```

```tsx
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Utilisation - recherche avec délai
function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      // Appel API seulement après 300ms sans frappe
      fetchResults(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Rechercher..."
    />
  );
}
```

---

## 4. Next.js

### 4.1 Définition

**Next.js** est un framework React qui ajoute le rendu côté serveur (SSR), la génération statique (SSG), le routing automatique, et plus.

### 4.2 App Router (Next.js 13+)

```
app/
├── layout.tsx          # Layout racine
├── page.tsx            # Page d'accueil (/)
├── globals.css         # Styles globaux
├── loading.tsx         # UI de chargement
├── error.tsx           # UI d'erreur
├── not-found.tsx       # Page 404
│
├── (auth)/             # Groupe de routes (pas dans l'URL)
│   ├── login/
│   │   └── page.tsx    # /login
│   └── register/
│       └── page.tsx    # /register
│
├── (admin)/            # Groupe admin
│   ├── layout.tsx      # Layout admin (sidebar, etc.)
│   ├── dashboard/
│   │   └── page.tsx    # /dashboard
│   ├── vehicles/
│   │   ├── page.tsx    # /vehicles (liste)
│   │   └── [id]/
│   │       └── page.tsx # /vehicles/123 (détail)
│   └── missions/
│       └── page.tsx    # /missions
│
└── api/                # Routes API (optionnel)
    └── health/
        └── route.ts    # GET /api/health
```

### 4.3 Server Components vs Client Components

```tsx
// Par défaut: Server Component
// Rendu sur le serveur, pas de JavaScript côté client
async function VehiclesPage() {
  // Peut faire des appels BDD directement!
  const vehicles = await prisma.vehicles.findMany();

  return (
    <ul>
      {vehicles.map(v => <li key={v.id}>{v.plateNumber}</li>)}
    </ul>
  );
}

// Client Component - pour interactivité
'use client';  // Directive obligatoire en haut du fichier

import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);  // useState = interactivité = client

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### 4.4 Quand utiliser quoi ?

| Besoin | Type |
|--------|------|
| Fetch data | Server Component |
| Accès BDD direct | Server Component |
| Pas d'interactivité | Server Component |
| useState, useEffect | Client Component |
| onClick, onChange | Client Component |
| Browser APIs | Client Component |

### 4.5 Layout

```tsx
// app/layout.tsx - Layout racine
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// app/(admin)/layout.tsx - Layout admin
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
```

### 4.6 Route Dynamique

```tsx
// app/vehicles/[id]/page.tsx
interface Props {
  params: { id: string };
}

export default async function VehiclePage({ params }: Props) {
  const vehicle = await vehiclesApi.getById(params.id);

  if (!vehicle) {
    notFound();  // Affiche app/not-found.tsx
  }

  return (
    <div>
      <h1>{vehicle.plateNumber}</h1>
      <p>{vehicle.brand} {vehicle.model}</p>
    </div>
  );
}

// Générer les pages statiques (optionnel)
export async function generateStaticParams() {
  const vehicles = await vehiclesApi.getAll();
  return vehicles.items.map(v => ({ id: v.id }));
}
```

---

## 5. TypeScript pour React

### 5.1 Types de Props

```tsx
// Interface pour les props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  icon,
  children
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {label}
      {children}
    </button>
  );
}
```

### 5.2 Types d'Événements

```tsx
function Form() {
  // Événement de changement input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  // Événement de soumission form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ...
  };

  // Événement click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Clicked at', e.clientX, e.clientY);
  };

  // Événement clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // ...
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

### 5.3 Types Génériques

```tsx
// Composant de liste générique
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'Aucun élément'
}: ListProps<T>) {
  if (items.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Utilisation
<List
  items={vehicles}
  keyExtractor={v => v.id}
  renderItem={v => <VehicleCard vehicle={v} />}
  emptyMessage="Aucun véhicule"
/>
```

---

## 6. State Management

### 6.1 État Local vs Global

```
┌─────────────────────────────────────────────────────────────┐
│                    ÉTAT DE L'APPLICATION                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ÉTAT LOCAL (useState)          ÉTAT GLOBAL (Context/Store) │
│  ─────────────────────          ────────────────────────────│
│  • Formulaires                  • Utilisateur connecté      │
│  • UI toggle (modal ouverte)    • Thème (dark/light)        │
│  • Pagination courante          • Préférences               │
│  • Input de recherche           • Données partagées         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 React Context

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authApi.me();
        setUser(userData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password });
    setUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Utilisation
function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return <p>Non connecté</p>;

  return (
    <div>
      <h1>Bonjour, {user.username}!</h1>
      <p>Rôle: {user.role}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

---

## 7. Styling avec Tailwind CSS

### 7.1 Définition

**Tailwind CSS** est un framework CSS "utility-first". Au lieu d'écrire du CSS, tu utilises des classes prédéfinies directement dans le HTML/JSX.

### 7.2 Syntaxe de Base

```tsx
// Tailwind = classes utilitaires
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900">Titre</h1>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Action
  </button>
</div>

// Équivalent CSS traditionnel
// .container { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: white; border-radius: 0.5rem; box-shadow: ... }
// .title { font-size: 1.5rem; font-weight: bold; color: #111827; }
// .button { padding: 0.5rem 1rem; background: #3B82F6; color: white; border-radius: 0.25rem; }
// .button:hover { background: #2563EB; }
```

### 7.3 Classes Courantes

```tsx
// Layout
<div className="flex">              // display: flex
<div className="flex-col">          // flex-direction: column
<div className="items-center">      // align-items: center
<div className="justify-between">   // justify-content: space-between
<div className="grid grid-cols-3">  // CSS Grid 3 colonnes
<div className="gap-4">             // gap: 1rem

// Spacing (1 unit = 0.25rem = 4px)
<div className="p-4">    // padding: 1rem (16px)
<div className="px-4">   // padding-left/right: 1rem
<div className="py-2">   // padding-top/bottom: 0.5rem
<div className="m-4">    // margin: 1rem
<div className="mt-2">   // margin-top: 0.5rem
<div className="space-y-4">  // espacement vertical entre enfants

// Sizing
<div className="w-full">   // width: 100%
<div className="w-64">     // width: 16rem
<div className="h-screen"> // height: 100vh
<div className="max-w-md"> // max-width: 28rem

// Colors
<div className="bg-blue-500">    // background bleu
<div className="text-gray-700">  // texte gris foncé
<div className="border-red-500"> // bordure rouge

// Typography
<p className="text-sm">      // font-size: 0.875rem
<p className="text-xl">      // font-size: 1.25rem
<p className="font-bold">    // font-weight: bold
<p className="text-center">  // text-align: center

// Borders
<div className="border">           // border: 1px solid
<div className="border-2">         // border: 2px solid
<div className="rounded">          // border-radius: 0.25rem
<div className="rounded-lg">       // border-radius: 0.5rem
<div className="rounded-full">     // border-radius: 9999px (cercle)

// Effects
<div className="shadow">        // box-shadow léger
<div className="shadow-lg">     // box-shadow prononcé
<div className="opacity-50">    // opacity: 0.5

// Responsive
<div className="hidden md:block">  // Caché, visible à partir de md (768px)
<div className="text-sm md:text-lg lg:text-xl">

// États
<button className="hover:bg-blue-600">     // Au survol
<button className="focus:ring-2">          // Au focus
<button className="active:bg-blue-700">    // Au clic
<button className="disabled:opacity-50">   // Si disabled

// Dark mode
<div className="bg-white dark:bg-gray-800">
<p className="text-gray-900 dark:text-gray-100">
```

### 7.4 Composant FleetTrack avec Tailwind

```tsx
function VehicleCard({ vehicle, isSelected, onClick }: VehicleCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all duration-200
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {vehicle.plateNumber}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {vehicle.brand} {vehicle.model}
          </p>
        </div>
        <Badge
          variant={vehicle.status === 'Available' ? 'success' : 'secondary'}
        >
          {vehicle.statusName}
        </Badge>
      </div>
    </div>
  );
}
```

---

## 8. Temps Réel avec SignalR

### 8.1 Définition

**SignalR** est une bibliothèque Microsoft pour la communication temps réel (WebSockets). Dans FleetTrack, elle est utilisée pour le tracking GPS.

### 8.2 Hook useSignalR

```tsx
// hooks/useSignalR.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

interface UseSignalROptions {
  onPositionUpdate?: (position: GpsPositionUpdateDto) => void;
  onSessionStarted?: (session: TrackingSessionStartedDto) => void;
  onSessionEnded?: (vehicleId: string) => void;
}

export function useSignalR(options: UseSignalROptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('fleettrack_token');
    if (!token) return;

    // Créer la connexion
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/gps-tracking`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Écouter les événements du serveur
    connection.on('ReceivePositionUpdate', (position: GpsPositionUpdateDto) => {
      options.onPositionUpdate?.(position);
    });

    connection.on('TrackingSessionStarted', (session) => {
      options.onSessionStarted?.(session);
    });

    connection.on('TrackingSessionEnded', (vehicleId) => {
      options.onSessionEnded?.(vehicleId);
    });

    // Gestion de la connexion
    connection.onreconnecting(() => {
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      setIsConnected(true);
    });

    connection.onclose(() => {
      setIsConnected(false);
    });

    // Démarrer la connexion
    const startConnection = async () => {
      try {
        await connection.start();
        setIsConnected(true);
        connectionRef.current = connection;
      } catch (err) {
        setError('Erreur de connexion SignalR');
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    // Cleanup
    return () => {
      connection.stop();
    };
  }, []);

  // Envoyer une position GPS
  const sendPosition = useCallback(async (position: SendPositionDto) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('SendGpsPosition', position);
    }
  }, []);

  // Démarrer une session de tracking
  const startTrackingSession = useCallback(async (data: StartTrackingSessionDto) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('StartTrackingSession', data);
    }
  }, []);

  return {
    isConnected,
    error,
    sendPosition,
    startTrackingSession,
  };
}
```

### 8.3 Utilisation dans un Composant

```tsx
function TrackingPage() {
  const [positions, setPositions] = useState<Map<string, GpsPositionUpdateDto>>(new Map());
  const [sessions, setSessions] = useState<ActiveTrackingSessionDto[]>([]);

  const {
    isConnected,
    error,
  } = useSignalR({
    onPositionUpdate: (position) => {
      // Mettre à jour la position du véhicule
      setPositions(prev => new Map(prev).set(position.vehicleId, position));
    },
    onSessionStarted: (session) => {
      console.log('Nouvelle session:', session);
      refreshSessions();
    },
    onSessionEnded: (vehicleId) => {
      console.log('Session terminée:', vehicleId);
      setPositions(prev => {
        const newMap = new Map(prev);
        newMap.delete(vehicleId);
        return newMap;
      });
      refreshSessions();
    },
  });

  return (
    <div>
      <ConnectionStatus connected={isConnected} error={error} />
      <Map positions={Array.from(positions.values())} />
    </div>
  );
}
```

---

## Résumé

| Concept | Description |
|---------|-------------|
| **React** | Bibliothèque UI basée sur les composants |
| **JSX** | Syntaxe HTML dans JavaScript |
| **Composant** | Fonction qui retourne du JSX |
| **Props** | Paramètres passés aux composants |
| **useState** | État local du composant |
| **useEffect** | Effets de bord (API, subscriptions) |
| **useCallback** | Mémoriser une fonction |
| **useMemo** | Mémoriser une valeur calculée |
| **useRef** | Référence persistante/DOM |
| **Next.js** | Framework React avec SSR/SSG |
| **Tailwind** | CSS utility-first |
| **SignalR** | Communication temps réel |

---

[← Précédent : Authentification](./05-authentication.md) | [Suivant : Testing →](./07-testing.md)
