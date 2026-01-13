# Guide de Preparation - Entrevue Stage Developpeur Full-Stack

> **Entreprise:** Demeter Service Veterinaire (Swine Veterinary Partners)
> **Poste:** Stagiaire Developpeur Full-Stack
> **Stack:** Next.js 15, React 18, TypeScript, Flask, Firestore, Google App Engine

---

## Table des Matieres

1. [React - Fondamentaux](#1-react---fondamentaux)
2. [Next.js 15 - Framework React](#2-nextjs-15---framework-react)
3. [TypeScript - Typage Statique](#3-typescript---typage-statique)
4. [Flask - Backend Python](#4-flask---backend-python)
5. [Firebase/Firestore - Base de Donnees NoSQL](#5-firebasefirestore---base-de-donnees-nosql)
6. [Git/GitHub - Controle de Version](#6-gitgithub---controle-de-version)
7. [API REST - Concepts Cles](#7-api-rest---concepts-cles)
8. [Questions Techniques Probables](#8-questions-techniques-probables)
9. [Projet FleetTrack - Exemples Concrets](#9-projet-fleettrack---exemples-concrets)

---

## 1. React - Fondamentaux

### 1.1 Qu'est-ce que React?

React est une bibliotheque JavaScript pour construire des interfaces utilisateur. Elle utilise:
- **Composants** - Blocs de construction reutilisables
- **Virtual DOM** - Mise a jour efficace du DOM
- **JSX** - Syntaxe qui melange HTML et JavaScript
- **Unidirectional Data Flow** - Donnees qui circulent du parent vers l'enfant

### 1.2 Composants Fonctionnels (IMPORTANT)

Les composants fonctionnels sont la norme actuelle en React:

```tsx
// Composant fonctionnel simple
function Welcome({ name }: { name: string }) {
  return <h1>Bonjour, {name}!</h1>;
}

// Avec arrow function (plus courant)
const Welcome = ({ name }: { name: string }) => {
  return <h1>Bonjour, {name}!</h1>;
};

// Utilisation
<Welcome name="Jean" />
```

### 1.3 Les Hooks React (TRES IMPORTANT)

Les hooks permettent d'utiliser l'etat et d'autres fonctionnalites dans les composants fonctionnels.

#### useState - Gerer l'etat local

```tsx
import { useState } from 'react';

function Counter() {
  // Declare une variable d'etat "count" initialisee a 0
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Compteur: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Incrementer
      </button>
      <button onClick={() => setCount(prev => prev - 1)}>
        Decrementer (forme fonctionnelle)
      </button>
    </div>
  );
}
```

#### useEffect - Effets de bord (API calls, subscriptions)

```tsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cet effet s'execute quand userId change
    async function fetchUser() {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
      setLoading(false);
    }

    fetchUser();

    // Cleanup function (optionnel)
    return () => {
      console.log('Composant demonte ou userId change');
    };
  }, [userId]); // Tableau de dependances

  if (loading) return <p>Chargement...</p>;
  return <div>{user?.name}</div>;
}
```

**Regles des dependances useEffect:**
- `[]` - Execute une seule fois au montage
- `[userId]` - Execute quand userId change
- Pas de tableau - Execute a chaque rendu (a eviter)

#### useContext - Partager des donnees globales

```tsx
import { createContext, useContext, useState } from 'react';

// 1. Creer le contexte
const AuthContext = createContext(null);

// 2. Provider (dans le parent)
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Consumer (dans n'importe quel enfant)
function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav>
      {user ? (
        <>
          <span>Bonjour, {user.name}</span>
          <button onClick={logout}>Deconnexion</button>
        </>
      ) : (
        <a href="/login">Connexion</a>
      )}
    </nav>
  );
}
```

#### Autres Hooks Importants

```tsx
// useRef - Reference a un element DOM ou valeur persistante
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();

// useMemo - Memoriser une valeur calculee (optimisation)
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// useCallback - Memoriser une fonction (optimisation)
const handleClick = useCallback(() => {
  console.log('Clicked!');
}, []);
```

### 1.4 La methode .map() - Transformer les donnees API (TRES IMPORTANT)

La methode `.map()` est **essentielle** pour transformer les donnees brutes d'une API en format exploitable par l'interface.

#### Pourquoi utiliser .map()?

Quand vous recevez des donnees d'un endpoint API, elles sont souvent dans un format complexe ou different de ce dont vous avez besoin. `.map()` permet de:

1. **Transformer la structure** - Simplifier les objets complexes
2. **Extraire les champs utiles** - Garder seulement ce qui est necessaire
3. **Renommer les proprietes** - Adapter au format attendu par les composants
4. **Calculer des valeurs derivees** - Ajouter des champs calcules

#### Exemple Concret: Transformer une reponse Firestore

```typescript
// Reponse brute de Firestore (complexe)
// Chaque doc a: id, data(), exists, ref, metadata...

// SANS .map() - Structure complexe difficile a utiliser
const docsSnapshot = await getDocs(collection(db, 'users'));
console.log(docsSnapshot.docs);
// [DocumentSnapshot, DocumentSnapshot, ...] - Pas exploitable directement!

// AVEC .map() - Structure simple et propre
const users = docsSnapshot.docs.map(doc => ({
  id: doc.id,              // Extraire l'ID du document
  ...doc.data()            // Extraire les donnees
}));
console.log(users);
// [{ id: "abc123", name: "Jean", email: "jean@test.com" }, ...]
// Maintenant exploitable dans l'interface!
```

#### Transformer une reponse API REST

```typescript
// Reponse API brute
const response = await fetch('/api/prescriptions');
const rawData = await response.json();

// rawData pourrait etre:
// {
//   items: [
//     { prescription_id: 1, animal_name: "Bella", vet_id: 5, created_at: "2024-01-15T10:30:00Z" },
//     { prescription_id: 2, animal_name: "Max", vet_id: 3, created_at: "2024-01-16T14:00:00Z" }
//   ],
//   total: 2
// }

// Transformer pour le frontend
const prescriptions = rawData.items.map(item => ({
  // Renommer les proprietes (snake_case -> camelCase)
  id: item.prescription_id,
  animalName: item.animal_name,
  vetId: item.vet_id,

  // Formater les dates
  createdAt: new Date(item.created_at),
  formattedDate: new Date(item.created_at).toLocaleDateString('fr-CA'),

  // Ajouter des champs calcules
  isRecent: new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
}));

// Resultat propre et exploitable:
// [
//   { id: 1, animalName: "Bella", vetId: 5, createdAt: Date, formattedDate: "2024-01-15", isRecent: true },
//   { id: 2, animalName: "Max", vetId: 3, createdAt: Date, formattedDate: "2024-01-16", isRecent: true }
// ]
```

#### Utiliser .map() pour afficher une liste dans React

```tsx
function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/prescriptions');
      const rawData = await response.json();

      // Transformer les donnees avec .map()
      const formattedData = rawData.items.map(item => ({
        id: item.prescription_id,
        animalName: item.animal_name,
        date: new Date(item.created_at).toLocaleDateString('fr-CA'),
      }));

      setPrescriptions(formattedData);
    }
    fetchData();
  }, []);

  return (
    <ul>
      {/* .map() pour generer les elements JSX */}
      {prescriptions.map(prescription => (
        <li key={prescription.id}>
          {prescription.animalName} - {prescription.date}
        </li>
      ))}
    </ul>
  );
}
```

#### Chainer plusieurs .map(), .filter(), .sort()

```typescript
const processedData = rawData.items
  // 1. Filtrer - Garder seulement les actifs
  .filter(item => item.status === 'active')

  // 2. Transformer - Simplifier la structure
  .map(item => ({
    id: item.id,
    name: item.name,
    priority: item.priority_level,
  }))

  // 3. Trier - Par priorite decroissante
  .sort((a, b) => b.priority - a.priority)

  // 4. Limiter - Prendre les 10 premiers
  .slice(0, 10);
```

#### Resume .map()

| Avant (API brute) | Apres (.map) |
|-------------------|--------------|
| Structure complexe | Structure simple |
| Noms de champs API | Noms adaptes au frontend |
| Dates en string ISO | Objets Date ou formats lisibles |
| Donnees inutiles incluses | Seulement les champs necessaires |
| Pas de champs calcules | Champs derives ajoutes |

### 1.5 Creer un Composant Complet

```tsx
// components/VehicleCard.tsx
import { useState } from 'react';

// Types/Interfaces
interface Vehicle {
  id: string;
  brand: string;
  model: string;
  status: 'available' | 'in_mission' | 'maintenance';
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

// Composant
export function VehicleCard({ vehicle, onSelect, isSelected = false }: VehicleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Handler
  const handleClick = () => {
    onSelect?.(vehicle.id);
  };

  // Styles conditionnels
  const cardClass = `
    card
    ${isSelected ? 'selected' : ''}
    ${isHovered ? 'hovered' : ''}
  `;

  return (
    <div
      className={cardClass}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3>{vehicle.brand} {vehicle.model}</h3>
      <span className={`status status-${vehicle.status}`}>
        {vehicle.status}
      </span>
    </div>
  );
}
```

### 1.5 Gestion des Formulaires

```tsx
import { useState, FormEvent } from 'react';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Empecher le rechargement de page
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur de connexion');
      }

      const data = await response.json();
      console.log('Connecte:', data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />

      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Mot de passe"
        required
      />

      <button type="submit">Se connecter</button>
    </form>
  );
}
```

---

## 2. Next.js 15 - Framework React

### 2.1 Qu'est-ce que Next.js?

Next.js est un framework React qui offre:
- **Server-Side Rendering (SSR)** - Rendu cote serveur
- **Static Site Generation (SSG)** - Pages pre-generees
- **App Router** - Nouveau systeme de routing (Next.js 13+)
- **API Routes** - Backend integre
- **Optimisations** - Images, fonts, bundling automatique

### 2.2 Structure d'un Projet Next.js 15

```
my-app/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── layout.tsx          # Layout racine
│   │   ├── page.tsx            # Page d'accueil (/)
│   │   ├── globals.css         # Styles globaux
│   │   ├── (auth)/             # Route group (pas dans l'URL)
│   │   │   ├── login/
│   │   │   │   └── page.tsx    # /login
│   │   │   └── register/
│   │   │       └── page.tsx    # /register
│   │   ├── dashboard/
│   │   │   ├── layout.tsx      # Layout pour /dashboard/*
│   │   │   ├── page.tsx        # /dashboard
│   │   │   └── [id]/
│   │   │       └── page.tsx    # /dashboard/123 (route dynamique)
│   │   └── api/                # API Routes
│   │       └── users/
│   │           └── route.ts    # GET/POST /api/users
│   ├── components/             # Composants reutilisables
│   ├── lib/                    # Utilitaires, API clients
│   └── types/                  # Types TypeScript
├── public/                     # Fichiers statiques
├── next.config.ts              # Configuration Next.js
└── package.json
```

### 2.3 App Router - Pages et Layouts

#### Page Simple

```tsx
// app/page.tsx - Page d'accueil
export default function HomePage() {
  return (
    <main>
      <h1>Bienvenue sur Atlas</h1>
      <p>Plateforme de gestion veterinaire</p>
    </main>
  );
}
```

#### Layout (Structure partagee)

```tsx
// app/layout.tsx - Layout racine
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Atlas - Demeter',
  description: 'Plateforme veterinaire',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <header>Navigation globale</header>
        {children}
        <footer>Footer global</footer>
      </body>
    </html>
  );
}
```

#### Route Dynamique

```tsx
// app/clients/[id]/page.tsx
// Accessible via /clients/123, /clients/abc, etc.

interface PageProps {
  params: { id: string };
}

export default async function ClientPage({ params }: PageProps) {
  const { id } = params;

  // Fetch des donnees cote serveur
  const client = await fetch(`https://api.example.com/clients/${id}`);
  const data = await client.json();

  return (
    <div>
      <h1>Client: {data.name}</h1>
      <p>ID: {id}</p>
    </div>
  );
}
```

### 2.4 Server Components vs Client Components

#### Server Components (par defaut)

```tsx
// app/products/page.tsx
// Ceci est un Server Component (par defaut)
// Peut faire des appels DB/API directement

async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    cache: 'no-store', // Toujours frais
  });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

#### Client Components (interactivite)

```tsx
// components/AddToCartButton.tsx
'use client'; // OBLIGATOIRE pour utiliser useState, onClick, etc.

import { useState } from 'react';

export function AddToCartButton({ productId }: { productId: string }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = async () => {
    setIsAdding(true);
    await fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    setIsAdding(false);
  };

  return (
    <button onClick={handleClick} disabled={isAdding}>
      {isAdding ? 'Ajout...' : 'Ajouter au panier'}
    </button>
  );
}
```

### 2.5 API Routes (Backend dans Next.js)

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users
export async function GET(request: NextRequest) {
  const users = [
    { id: 1, name: 'Jean' },
    { id: 2, name: 'Marie' },
  ];

  return NextResponse.json(users);
}

// POST /api/users
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validation
  if (!body.name || !body.email) {
    return NextResponse.json(
      { error: 'Nom et email requis' },
      { status: 400 }
    );
  }

  // Creer l'utilisateur (simuler)
  const newUser = {
    id: Date.now(),
    ...body,
  };

  return NextResponse.json(newUser, { status: 201 });
}
```

```tsx
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users/123
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Fetch user from database
  const user = { id, name: 'Jean Dupont' };

  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur non trouve' },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

// PUT /api/users/123
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  // Update user
  const updatedUser = { id, ...body };

  return NextResponse.json(updatedUser);
}

// DELETE /api/users/123
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Delete user from database

  return NextResponse.json({ message: 'Utilisateur supprime' });
}
```

---

## 3. TypeScript - Typage Statique

### 3.1 Pourquoi TypeScript?

- **Detection des erreurs** au moment du developpement
- **Autocompletion** amelioree dans l'IDE
- **Documentation** du code via les types
- **Refactoring** plus sur

### 3.2 Types de Base

```typescript
// Types primitifs
let name: string = 'Jean';
let age: number = 25;
let isActive: boolean = true;
let data: null = null;
let value: undefined = undefined;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ['Jean', 'Marie'];

// Objects
let user: { name: string; age: number } = {
  name: 'Jean',
  age: 25,
};
```

### 3.3 Interfaces et Types

```typescript
// Interface (pour les objets)
interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // Optionnel
  readonly createdAt: Date; // Non modifiable
}

// Type (plus flexible)
type Status = 'active' | 'inactive' | 'pending'; // Union type
type ID = string | number; // Peut etre string OU number

// Utilisation
const user: User = {
  id: '123',
  name: 'Jean',
  email: 'jean@example.com',
  createdAt: new Date(),
};

const status: Status = 'active';
```

### 3.4 Generics

```typescript
// Fonction generique
function getFirst<T>(array: T[]): T | undefined {
  return array[0];
}

const firstNumber = getFirst([1, 2, 3]); // Type: number
const firstName = getFirst(['a', 'b']); // Type: string

// Interface generique
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: string;
  name: string;
}

const response: ApiResponse<User> = {
  data: { id: '1', name: 'Jean' },
  status: 200,
  message: 'Success',
};
```

### 3.5 Types pour React

```typescript
// Props de composant
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children?: React.ReactNode;
}

function Button({ label, onClick, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

// Event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log('Clicked!');
};
```

---

## 4. Flask - Backend Python

### 4.1 Qu'est-ce que Flask?

Flask est un micro-framework Python pour creer des applications web et APIs:
- **Leger** et minimaliste
- **Flexible** - pas de structure imposee
- **Extensible** avec des plugins
- **Facile** a apprendre

### 4.2 Structure d'un Projet Flask

```
backend/
├── app/
│   ├── __init__.py          # Factory d'application
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py          # Routes d'authentification
│   │   ├── users.py         # Routes utilisateurs
│   │   └── products.py      # Routes produits
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py          # Modeles de donnees
│   ├── services/
│   │   └── firestore.py     # Service Firestore
│   └── utils/
│       └── validators.py    # Validateurs
├── config.py                # Configuration
├── requirements.txt         # Dependances
└── run.py                   # Point d'entree
```

### 4.3 Application Flask Basique

```python
# app/__init__.py
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Permettre les requetes cross-origin

    # Configuration
    app.config.from_object('config.Config')

    # Enregistrer les blueprints (routes)
    from app.routes import auth, users
    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)

    return app
```

```python
# run.py
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### 4.4 Creer des Routes (Endpoints)

```python
# app/routes/users.py
from flask import Blueprint, request, jsonify

bp = Blueprint('users', __name__, url_prefix='/api/users')

# Liste des utilisateurs (simulee)
users_db = [
    {'id': 1, 'name': 'Jean', 'email': 'jean@example.com'},
    {'id': 2, 'name': 'Marie', 'email': 'marie@example.com'},
]

# GET /api/users
@bp.route('/', methods=['GET'])
def get_users():
    return jsonify(users_db), 200

# GET /api/users/<id>
@bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = next((u for u in users_db if u['id'] == user_id), None)

    if not user:
        return jsonify({'error': 'Utilisateur non trouve'}), 404

    return jsonify(user), 200

# POST /api/users
@bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json()

    # Validation
    if not data or not data.get('name') or not data.get('email'):
        return jsonify({'error': 'Nom et email requis'}), 400

    # Creer l'utilisateur
    new_user = {
        'id': len(users_db) + 1,
        'name': data['name'],
        'email': data['email'],
    }
    users_db.append(new_user)

    return jsonify(new_user), 201

# PUT /api/users/<id>
@bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    user = next((u for u in users_db if u['id'] == user_id), None)

    if not user:
        return jsonify({'error': 'Utilisateur non trouve'}), 404

    user['name'] = data.get('name', user['name'])
    user['email'] = data.get('email', user['email'])

    return jsonify(user), 200

# DELETE /api/users/<id>
@bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    global users_db
    users_db = [u for u in users_db if u['id'] != user_id]

    return jsonify({'message': 'Utilisateur supprime'}), 200
```

### 4.5 Middleware et Decorateurs

```python
from functools import wraps
from flask import request, jsonify

# Decorateur d'authentification
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'error': 'Token manquant'}), 401

        # Verifier le token (simplifie)
        if not token.startswith('Bearer '):
            return jsonify({'error': 'Token invalide'}), 401

        return f(*args, **kwargs)
    return decorated

# Utilisation
@bp.route('/protected', methods=['GET'])
@require_auth
def protected_route():
    return jsonify({'message': 'Acces autorise'}), 200
```

### 4.6 Gestion des Erreurs

```python
from flask import Flask, jsonify

app = Flask(__name__)

# Gestionnaire d'erreur global
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Ressource non trouvee'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Erreur interne du serveur'}), 500

@app.errorhandler(Exception)
def handle_exception(error):
    return jsonify({'error': str(error)}), 500
```

---

## 5. Firebase/Firestore - Base de Donnees NoSQL

### 5.1 Qu'est-ce que Firestore?

Firestore est une base de donnees NoSQL de Google Firebase:
- **Documents et Collections** - Structure hierarchique
- **Temps reel** - Synchronisation automatique
- **Scalable** - Gere des millions de documents
- **Serverless** - Pas de serveur a gerer

### 5.2 Structure des Donnees

```
Firestore Database
├── users (collection)
│   ├── user123 (document)
│   │   ├── name: "Jean Dupont"
│   │   ├── email: "jean@example.com"
│   │   ├── createdAt: Timestamp
│   │   └── roles: ["admin", "user"]
│   └── user456 (document)
│       └── ...
├── clients (collection)
│   ├── client001 (document)
│   │   ├── name: "Ferme ABC"
│   │   ├── address: {...}
│   │   └── animals (sous-collection)
│   │       ├── animal001 (document)
│   │       └── animal002 (document)
│   └── ...
└── prescriptions (collection)
    └── ...
```

### 5.3 Operations CRUD avec Python

```python
# services/firestore.py
from google.cloud import firestore

# Initialiser Firestore
db = firestore.Client()

# ============ CREATE ============
def create_user(user_data):
    """Creer un nouveau document avec ID auto-genere"""
    doc_ref = db.collection('users').document()
    user_data['id'] = doc_ref.id
    user_data['createdAt'] = firestore.SERVER_TIMESTAMP
    doc_ref.set(user_data)
    return doc_ref.id

def create_user_with_id(user_id, user_data):
    """Creer un document avec ID specifique"""
    doc_ref = db.collection('users').document(user_id)
    doc_ref.set(user_data)
    return user_id

# ============ READ ============
def get_user(user_id):
    """Obtenir un document par ID"""
    doc_ref = db.collection('users').document(user_id)
    doc = doc_ref.get()

    if doc.exists:
        return doc.to_dict()
    return None

def get_all_users():
    """Obtenir tous les documents d'une collection"""
    users = []
    docs = db.collection('users').stream()

    for doc in docs:
        user = doc.to_dict()
        user['id'] = doc.id
        users.append(user)

    return users

def get_users_by_role(role):
    """Requete avec filtre"""
    users = []
    query = db.collection('users').where('role', '==', role)

    for doc in query.stream():
        user = doc.to_dict()
        user['id'] = doc.id
        users.append(user)

    return users

def get_users_paginated(limit=10, last_doc=None):
    """Pagination"""
    query = db.collection('users').order_by('name').limit(limit)

    if last_doc:
        query = query.start_after(last_doc)

    docs = query.stream()
    return [doc.to_dict() for doc in docs]

# ============ UPDATE ============
def update_user(user_id, updates):
    """Mettre a jour des champs specifiques"""
    doc_ref = db.collection('users').document(user_id)
    doc_ref.update(updates)

def update_user_merge(user_id, data):
    """Fusionner avec les donnees existantes"""
    doc_ref = db.collection('users').document(user_id)
    doc_ref.set(data, merge=True)

# ============ DELETE ============
def delete_user(user_id):
    """Supprimer un document"""
    db.collection('users').document(user_id).delete()

# ============ SOUS-COLLECTIONS ============
def add_animal_to_client(client_id, animal_data):
    """Ajouter un document dans une sous-collection"""
    doc_ref = db.collection('clients').document(client_id) \
                .collection('animals').document()
    animal_data['id'] = doc_ref.id
    doc_ref.set(animal_data)
    return doc_ref.id

def get_client_animals(client_id):
    """Obtenir tous les documents d'une sous-collection"""
    animals = []
    docs = db.collection('clients').document(client_id) \
             .collection('animals').stream()

    for doc in docs:
        animal = doc.to_dict()
        animal['id'] = doc.id
        animals.append(animal)

    return animals
```

### 5.4 Requetes Avancees

```python
from google.cloud.firestore_v1.base_query import FieldFilter

# Filtres multiples
query = db.collection('prescriptions') \
    .where(filter=FieldFilter('status', '==', 'active')) \
    .where(filter=FieldFilter('date', '>=', start_date)) \
    .order_by('date', direction=firestore.Query.DESCENDING) \
    .limit(20)

# Requete composee (array-contains)
query = db.collection('users') \
    .where(filter=FieldFilter('roles', 'array_contains', 'admin'))

# Requete IN
query = db.collection('products') \
    .where(filter=FieldFilter('category', 'in', ['antibiotics', 'vaccines']))
```

### 5.5 Firestore avec JavaScript (Frontend)

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Fonctions CRUD
export async function getUsers() {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getUserById(userId: string) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function createUser(userData: any) {
  const docRef = await addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateUser(userId: string, updates: any) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, updates);
}

export async function deleteUser(userId: string) {
  await deleteDoc(doc(db, 'users', userId));
}

// Requete avec filtres
export async function getActiveUsers() {
  const q = query(
    collection(db, 'users'),
    where('status', '==', 'active'),
    orderBy('name'),
    limit(50)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

---

## 6. Git/GitHub - Controle de Version

### 6.1 Concepts Fondamentaux

```
Working Directory    Staging Area    Local Repository    Remote Repository
      |                   |                  |                   |
      |   git add         |                  |                   |
      |------------------>|                  |                   |
      |                   |   git commit     |                   |
      |                   |----------------->|                   |
      |                   |                  |    git push       |
      |                   |                  |------------------>|
      |                   |                  |                   |
      |                   |                  |    git fetch      |
      |                   |                  |<------------------|
      |                   |                  |                   |
      |              git pull (fetch + merge)|                   |
      |<-----------------------------------------|
```

### 6.2 Commandes Essentielles

```bash
# ============ CONFIGURATION ============
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"

# ============ INITIALISATION ============
git init                    # Initialiser un nouveau repo
git clone <url>             # Cloner un repo existant

# ============ STATUT ET HISTORIQUE ============
git status                  # Voir l'etat des fichiers
git log                     # Historique des commits
git log --oneline           # Historique compact
git log --graph --oneline   # Avec visualisation des branches
git diff                    # Voir les modifications non stagees
git diff --staged           # Voir les modifications stagees

# ============ STAGING ET COMMIT ============
git add <fichier>           # Ajouter un fichier au staging
git add .                   # Ajouter tous les fichiers modifies
git add -p                  # Ajouter interactivement (partie par partie)
git reset <fichier>         # Retirer du staging
git commit -m "message"     # Creer un commit
git commit -am "message"    # Add + commit (fichiers deja suivis)
git commit --amend          # Modifier le dernier commit

# ============ BRANCHES ============
git branch                  # Lister les branches locales
git branch -a               # Lister toutes les branches
git branch <nom>            # Creer une branche
git checkout <branche>      # Changer de branche
git checkout -b <branche>   # Creer et changer de branche
git switch <branche>        # Changer de branche (nouvelle syntaxe)
git switch -c <branche>     # Creer et changer (nouvelle syntaxe)
git branch -d <branche>     # Supprimer une branche (mergee)
git branch -D <branche>     # Forcer la suppression

# ============ MERGE ET REBASE ============
git merge <branche>         # Fusionner une branche dans la courante
git rebase <branche>        # Rebaser sur une branche
git rebase -i HEAD~3        # Rebase interactif (3 derniers commits)

# ============ REMOTE ============
git remote -v               # Voir les remotes
git remote add origin <url> # Ajouter un remote
git push origin <branche>   # Pousser vers le remote
git push -u origin <branche># Pousser et configurer le tracking
git pull                    # Recuperer et merger
git fetch                   # Recuperer sans merger

# ============ STASH ============
git stash                   # Mettre de cote les modifications
git stash list              # Lister les stash
git stash pop               # Restaurer le dernier stash
git stash apply             # Appliquer sans supprimer
git stash drop              # Supprimer un stash

# ============ ANNULATION ============
git checkout -- <fichier>   # Annuler les modifications d'un fichier
git restore <fichier>       # Annuler (nouvelle syntaxe)
git reset --soft HEAD~1     # Annuler le dernier commit (garder les changements)
git reset --hard HEAD~1     # Annuler le dernier commit (perdre les changements)
git revert <commit>         # Creer un commit qui annule un autre
```

### 6.3 Workflow Git Flow

```
main (production)
  │
  └── develop (integration)
        │
        ├── feature/login-page
        │     │
        │     └── (commits de dev)
        │           │
        │           └── PR → develop
        │
        ├── feature/user-profile
        │     │
        │     └── (commits de dev)
        │           │
        │           └── PR → develop
        │
        └── release/v1.0.0
              │
              └── PR → main + develop
```

### 6.4 Creer une Pull Request (Workflow Typique)

```bash
# 1. S'assurer d'etre a jour
git checkout develop
git pull origin develop

# 2. Creer une branche de feature
git checkout -b feature/add-prescription-form

# 3. Faire vos modifications...
# ... coder ...

# 4. Commiter regulierement
git add .
git commit -m "feat: add prescription form component"
git commit -m "feat: add form validation"
git commit -m "style: improve form styling"

# 5. Pousser la branche
git push -u origin feature/add-prescription-form

# 6. Sur GitHub:
#    - Aller dans "Pull requests" → "New pull request"
#    - Selectionner: base: develop ← compare: feature/add-prescription-form
#    - Ajouter un titre et une description
#    - Assigner des reviewers
#    - Creer la PR

# 7. Apres approbation et merge, nettoyer
git checkout develop
git pull origin develop
git branch -d feature/add-prescription-form
```

### 6.5 Conventions de Commit (Conventional Commits)

```
<type>(<scope>): <description>

[body optionnel]

[footer optionnel]
```

**Types courants:**
- `feat`: Nouvelle fonctionnalite
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactorisation
- `test`: Ajout/modification de tests
- `chore`: Maintenance (deps, config)

**Exemples:**
```bash
git commit -m "feat(auth): add login form with validation"
git commit -m "fix(api): handle null response in user endpoint"
git commit -m "docs: update API documentation"
git commit -m "refactor(components): extract Button component"
git commit -m "test(auth): add unit tests for login service"
git commit -m "chore(deps): update React to v18.2"
```

### 6.6 Resoudre les Conflits

```bash
# Lors d'un merge ou pull avec conflit
git merge feature/other-branch
# CONFLICT (content): Merge conflict in src/App.tsx

# 1. Ouvrir le fichier en conflit
# Vous verrez:
<<<<<<< HEAD
const title = "Version actuelle";
=======
const title = "Version de la branche";
>>>>>>> feature/other-branch

# 2. Resoudre manuellement en choisissant/combinant
const title = "Version finale choisie";

# 3. Marquer comme resolu et continuer
git add src/App.tsx
git commit -m "merge: resolve conflict in App.tsx"
```

### 6.7 .gitignore Important

```gitignore
# Dependencies
node_modules/
__pycache__/
*.pyc
venv/
.env

# Build
.next/
dist/
build/
*.egg-info/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
.env.*.local

# Testing
coverage/
.pytest_cache/
```

---

## 7. API REST - Concepts Cles

### 7.1 Qu'est-ce qu'une API REST?

REST (Representational State Transfer) est un style d'architecture pour les APIs:

- **Stateless** - Chaque requete contient toutes les informations necessaires
- **Client-Server** - Separation des responsabilites
- **Uniform Interface** - Interface coherente
- **Layered System** - Architecture en couches

### 7.2 Methodes HTTP

| Methode | Action | Exemple | Idempotent |
|---------|--------|---------|------------|
| GET | Lire | `GET /api/users` | Oui |
| POST | Creer | `POST /api/users` | Non |
| PUT | Remplacer | `PUT /api/users/123` | Oui |
| PATCH | Modifier partiellement | `PATCH /api/users/123` | Non |
| DELETE | Supprimer | `DELETE /api/users/123` | Oui |

### 7.3 Codes de Statut HTTP

| Code | Signification | Utilisation |
|------|---------------|-------------|
| 200 | OK | Requete reussie |
| 201 | Created | Ressource creee |
| 204 | No Content | Succes sans contenu |
| 400 | Bad Request | Donnees invalides |
| 401 | Unauthorized | Non authentifie |
| 403 | Forbidden | Non autorise |
| 404 | Not Found | Ressource inexistante |
| 409 | Conflict | Conflit (ex: doublon) |
| 500 | Internal Server Error | Erreur serveur |

### 7.4 Structure d'une Reponse API

```json
// Succes
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Jean Dupont",
    "email": "jean@example.com"
  },
  "message": "Utilisateur recupere avec succes"
}

// Liste avec pagination
{
  "success": true,
  "data": {
    "items": [...],
    "totalItems": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}

// Erreur
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email invalide",
    "details": [
      { "field": "email", "message": "Format email invalide" }
    ]
  }
}
```

### 7.5 Appeler une API depuis React

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Fonction fetch generique
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur API');
  }

  return response.json();
}

// Fonctions specifiques
export const usersApi = {
  getAll: () => fetchApi<User[]>('/users'),

  getById: (id: string) => fetchApi<User>(`/users/${id}`),

  create: (data: CreateUserDto) =>
    fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateUserDto) =>
    fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
};
```

---

## 8. Questions Techniques Probables

### Questions React

**Q: Quelle est la difference entre useState et useRef?**
> `useState` declanche un re-rendu quand la valeur change, tandis que `useRef` garde une reference mutable sans re-rendu. Utilisez `useRef` pour acceder au DOM ou stocker des valeurs qui ne doivent pas affecter l'UI.

**Q: Pourquoi utiliser useCallback?**
> Pour memoriser une fonction et eviter qu'elle soit recree a chaque rendu. Utile quand on passe une fonction en prop a un composant enfant optimise avec `memo()`.

**Q: Comment eviter le prop drilling?**
> Utiliser `useContext` pour partager des donnees globales, ou une bibliotheque de state management comme Redux ou Zustand.

### Questions Next.js

**Q: Difference entre Server Components et Client Components?**
> Server Components s'executent sur le serveur (peuvent acceder a la DB), Client Components sur le navigateur (peuvent utiliser useState, onClick). Par defaut, tous les composants sont des Server Components.

**Q: Quand utiliser 'use client'?**
> Quand vous avez besoin d'interactivite (useState, useEffect, onClick, onChange), d'APIs browser (localStorage), ou de hooks React.

### Questions Flask

**Q: Qu'est-ce qu'un Blueprint?**
> Un Blueprint permet de structurer une application Flask en modules. Chaque blueprint peut avoir ses propres routes, templates et fichiers statiques.

**Q: Comment securiser une route Flask?**
> Utiliser des decorateurs pour verifier l'authentification, valider les tokens JWT, et verifier les permissions avant d'executer la logique de la route.

### Questions Firestore

**Q: Difference entre set() et update()?**
> `set()` remplace tout le document (ou le cree), tandis que `update()` modifie uniquement les champs specifies et echoue si le document n'existe pas.

**Q: Comment structurer les donnees dans Firestore?**
> Privilegier les documents plats (pas de nesting profond), utiliser les sous-collections pour les relations un-a-plusieurs, et dupliquer les donnees si necessaire pour eviter les jointures.

### Questions Git

**Q: Difference entre merge et rebase?**
> `merge` cree un commit de fusion et preserve l'historique complet, tandis que `rebase` reecrit l'historique pour creer une ligne droite. Rebase pour des branches locales, merge pour les branches partagees.

**Q: Comment annuler un commit deja pousse?**
> Utiliser `git revert <commit>` qui cree un nouveau commit qui annule les changements, sans réécrire l'historique.

---

## 9. Projet FleetTrack - Exemples Concrets

Votre projet FleetTrack demontre plusieurs competences recherchees:

### Architecture Frontend (React/Next.js)

```typescript
// Exemple de hook personnalise (useVehicles.ts)
export const useVehicles = (page = 1, pageSize = 10) => {
  const queryClient = useQueryClient();
  const isReady = useClientReady();

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', page, pageSize],
    queryFn: () => vehiclesApi.getAll(page, pageSize),
    enabled: isReady && hasToken(),
  });

  const createMutation = useMutation({
    mutationFn: vehiclesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  return {
    vehicles: vehiclesQuery.data,
    isLoading: vehiclesQuery.isLoading,
    createVehicle: createMutation.mutateAsync,
  };
};
```

### Composant avec Formulaire

```typescript
// Page de creation de vehicule
export default function NewVehiclePage() {
  const router = useRouter();
  const { createVehicle } = useVehicles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      await createVehicle({
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        registrationNumber: formData.get('registrationNumber') as string,
      });

      toast.success('Vehicule cree avec succes');
      router.push('/vehicles');
    } catch (error) {
      toast.error('Erreur lors de la creation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... formulaire ... */}
    </form>
  );
}
```

---

## Conseils pour l'Entrevue

1. **Soyez honnete** - Si vous ne savez pas, dites-le et expliquez comment vous chercheriez la reponse

2. **Montrez votre projet** - FleetTrack demontre vos competences en React, Next.js, TypeScript, et Git

3. **Posez des questions** - Sur l'equipe, les projets, la stack technique, le mentorat

4. **Montrez votre motivation** - Expliquez pourquoi ce stage vous interesse

5. **Preparez des exemples** - De problemes que vous avez resolus, de code dont vous etes fier

---

**Bonne chance pour votre entrevue!** 🚀
