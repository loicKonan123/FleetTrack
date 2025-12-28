# Glossaire et Définitions Full-Stack

> **Encyclopédie complète** de tous les concepts de programmation utilisés dans le projet FleetTrack

---

## Introduction

Ce glossaire est conçu pour te donner une **compréhension profonde** de chaque concept utilisé dans le développement full-stack moderne. Chaque définition inclut:

- Une explication en **langage naturel**
- Une **analogie** pour mieux comprendre
- Des **exemples de code** tirés du projet FleetTrack
- Les **bonnes pratiques**

---

## Sommaire par Catégorie

### 1. Architecture Logicielle
📁 [01-architecture.md](./01-architecture.md)

| Concept | Description Rapide |
|---------|-------------------|
| Clean Architecture | Organisation en couches concentriques |
| Domain Layer | Cœur métier de l'application |
| Application Layer | Cas d'utilisation et DTOs |
| Infrastructure Layer | Implémentations techniques |
| API Layer | Points d'entrée HTTP |
| SOLID | 5 principes de conception |
| Dependency Injection | Inversion de contrôle |
| Repository Pattern | Abstraction de l'accès aux données |

---

### 2. C# et .NET
📁 [02-csharp-dotnet.md](./02-csharp-dotnet.md)

| Concept | Description Rapide |
|---------|-------------------|
| Namespace | Organisation logique du code |
| Class | Modèle pour créer des objets |
| Interface | Contrat de méthodes |
| Abstract Class | Classe de base non instanciable |
| Enum | Ensemble de constantes nommées |
| Record | Type immuable pour les données |
| async/await | Programmation asynchrone |
| LINQ | Requêtes sur collections |
| Generics | Code réutilisable typé |
| Nullable Types | Gestion explicite des null |

---

### 3. Base de Données
📁 [03-database.md](./03-database.md)

| Concept | Description Rapide |
|---------|-------------------|
| Base Relationnelle | Tables liées par des clés |
| Primary Key | Identifiant unique d'une ligne |
| Foreign Key | Référence vers une autre table |
| Index | Accélération des recherches |
| ORM | Mapping objet-relationnel |
| Entity Framework | ORM .NET officiel |
| DbContext | Pont entre code et BDD |
| Migrations | Versionnage du schéma |
| Transactions | Opérations atomiques |

---

### 4. API REST
📁 [04-api-rest.md](./04-api-rest.md)

| Concept | Description Rapide |
|---------|-------------------|
| API | Interface de communication |
| REST | Architecture basée sur les ressources |
| HTTP Methods | GET, POST, PUT, DELETE |
| Status Codes | 200, 201, 400, 401, 404, 500 |
| Controller | Gestionnaire de requêtes |
| Routing | Association URL → Action |
| DTO | Objet de transfert de données |
| Middleware | Pipeline de traitement |
| Validation | Vérification des données |

---

### 5. Authentification et Sécurité
📁 [05-authentication.md](./05-authentication.md)

| Concept | Description Rapide |
|---------|-------------------|
| Authentication | Vérification de l'identité |
| Authorization | Vérification des permissions |
| JWT | Token d'authentification |
| Claims | Informations dans le token |
| Hachage | Transformation irréversible |
| BCrypt | Algorithme de hachage sécurisé |
| Salt | Valeur aléatoire anti-rainbow |
| Refresh Token | Renouvellement du token |
| RBAC | Contrôle d'accès par rôles |
| CORS | Cross-Origin Resource Sharing |

---

### 6. Frontend React/Next.js
📁 [06-frontend.md](./06-frontend.md)

| Concept | Description Rapide |
|---------|-------------------|
| React | Bibliothèque UI composants |
| JSX | HTML dans JavaScript |
| Component | Pièce réutilisable de l'UI |
| Props | Paramètres des composants |
| useState | État local |
| useEffect | Effets de bord |
| useCallback | Mémorisation de fonction |
| useMemo | Mémorisation de valeur |
| useRef | Référence persistante |
| Custom Hook | Hook réutilisable |
| Next.js | Framework React avec SSR |
| Tailwind CSS | CSS utility-first |
| SignalR | Communication temps réel |

---

### 7. Tests
📁 [07-testing.md](./07-testing.md)

| Concept | Description Rapide |
|---------|-------------------|
| Test Unitaire | Test d'une unité isolée |
| Test d'Intégration | Test de composants ensemble |
| Test E2E | Test de l'application complète |
| AAA Pattern | Arrange-Act-Assert |
| xUnit | Framework de test .NET |
| Mock | Faux objet simulant une dépendance |
| Moq | Bibliothèque de mocking |
| Assert | Vérification du résultat |
| Code Coverage | Couverture du code par les tests |

---

### 8. DevOps
📁 [08-devops.md](./08-devops.md)

| Concept | Description Rapide |
|---------|-------------------|
| DevOps | Culture Dev + Ops |
| Docker | Conteneurisation |
| Image | Template de conteneur |
| Container | Instance en exécution |
| Dockerfile | Recette de construction |
| Docker Compose | Multi-conteneurs |
| CI/CD | Automatisation build/deploy |
| GitHub Actions | CI/CD intégré |
| Variables d'env | Configuration externe |
| Logging | Enregistrement des événements |

---

## Index Alphabétique

### A
- **Abstract Class** → [C# .NET](./02-csharp-dotnet.md#22-classe-abstraite-abstract-class)
- **API** → [API REST](./04-api-rest.md#11-api-application-programming-interface)
- **Assert** → [Testing](./07-testing.md#6-assertions)
- **async/await** → [C# .NET](./02-csharp-dotnet.md#4-programmation-asynchrone)
- **Authentication** → [Auth](./05-authentication.md#11-authentification)
- **Authorization** → [Auth](./05-authentication.md#12-autorisation)

### B
- **BCrypt** → [Auth](./05-authentication.md#33-bcrypt)

### C
- **CI/CD** → [DevOps](./08-devops.md#4-cicd)
- **Claims** → [Auth](./05-authentication.md#23-les-3-parties)
- **Class** → [C# .NET](./02-csharp-dotnet.md#12-classe-class)
- **Clean Architecture** → [Architecture](./01-architecture.md#1-clean-architecture)
- **Component** → [Frontend](./06-frontend.md#2-composants)
- **Constructor** → [C# .NET](./02-csharp-dotnet.md#15-constructeur-constructor)
- **Container** → [DevOps](./08-devops.md#23-concepts-clés)
- **Controller** → [API REST](./04-api-rest.md#4-controllers-aspnet-core)
- **CORS** → [Auth](./05-authentication.md#6-cors)
- **Custom Hook** → [Frontend](./06-frontend.md#37-custom-hooks)

### D
- **DbContext** → [Database](./03-database.md#3-dbcontext)
- **Dependency Injection** → [Architecture](./01-architecture.md#42-dependency-injection-di)
- **DevOps** → [DevOps](./08-devops.md#1-devops---introduction)
- **Docker** → [DevOps](./08-devops.md#2-docker)
- **Docker Compose** → [DevOps](./08-devops.md#3-docker-compose)
- **Dockerfile** → [DevOps](./08-devops.md#24-dockerfile-backend-net)
- **DTO** → [API REST](./04-api-rest.md#61-dto-data-transfer-object)

### E
- **Entity** → [Database](./03-database.md#41-entité-entity)
- **Entity Framework** → [Database](./03-database.md#22-entity-framework-core-ef-core)
- **Enum** → [C# .NET](./02-csharp-dotnet.md#32-enum-énumération)

### F
- **Factory Pattern** → [Architecture](./01-architecture.md#43-factory-pattern)
- **Foreign Key** → [Database](./03-database.md#13-clé-étrangère-foreign-key---fk)

### G
- **Generics** → [C# .NET](./02-csharp-dotnet.md#6-génériques)
- **GitHub Actions** → [DevOps](./08-devops.md#42-github-actions)

### H
- **Hashing** → [Auth](./05-authentication.md#3-hachage-de-mot-de-passe)
- **HTTP** → [API REST](./04-api-rest.md#2-http---le-protocole)
- **Hooks** → [Frontend](./06-frontend.md#3-hooks-react)

### I
- **Image (Docker)** → [DevOps](./08-devops.md#23-concepts-clés)
- **Index** → [Database](./03-database.md#14-index)
- **Interface** → [C# .NET](./02-csharp-dotnet.md#21-interface)
- **Integration Test** → [Testing](./07-testing.md#4-tests-dintégration)

### J
- **JSX** → [Frontend](./06-frontend.md#12-jsx)
- **JWT** → [Auth](./05-authentication.md#2-jwt-json-web-token)

### L
- **LINQ** → [C# .NET](./02-csharp-dotnet.md#5-linq)
- **Logging** → [DevOps](./08-devops.md#6-logging-et-monitoring)

### M
- **Middleware** → [API REST](./04-api-rest.md#7-middleware)
- **Migration** → [Database](./03-database.md#5-migrations)
- **Mock** → [Testing](./07-testing.md#5-mocking)
- **Moq** → [Testing](./07-testing.md#53-utilisation-de-moq)

### N
- **Namespace** → [C# .NET](./02-csharp-dotnet.md#11-namespace-espace-de-noms)
- **Next.js** → [Frontend](./06-frontend.md#4-nextjs)
- **Nullable Types** → [C# .NET](./02-csharp-dotnet.md#7-nullable-reference-types)

### O
- **ORM** → [Database](./03-database.md#21-orm-object-relational-mapping)

### P
- **Polymorphism** → [C# .NET](./02-csharp-dotnet.md#24-polymorphisme)
- **Primary Key** → [Database](./03-database.md#12-clé-primaire-primary-key---pk)
- **Props** → [Frontend](./06-frontend.md#23-props-propriétés)
- **Property** → [C# .NET](./02-csharp-dotnet.md#13-propriété-property)

### R
- **RBAC** → [Auth](./05-authentication.md#5-rbac-role-based-access-control)
- **React** → [Frontend](./06-frontend.md#1-react---fondamentaux)
- **Record** → [C# .NET](./02-csharp-dotnet.md#33-record)
- **Refresh Token** → [Auth](./05-authentication.md#4-refresh-tokens)
- **Repository Pattern** → [Architecture](./01-architecture.md#41-repository-pattern)
- **REST** → [API REST](./04-api-rest.md#3-rest---architecture)
- **Routing** → [API REST](./04-api-rest.md#5-routing-routage)

### S
- **Salt** → [Auth](./05-authentication.md#34-salt-sel)
- **SignalR** → [Frontend](./06-frontend.md#8-temps-réel-avec-signalr)
- **SOLID** → [Architecture](./01-architecture.md#3-principes-solid)
- **Status Codes** → [API REST](./04-api-rest.md#23-codes-de-statut-http)
- **State Management** → [Frontend](./06-frontend.md#6-state-management)

### T
- **Tailwind CSS** → [Frontend](./06-frontend.md#7-styling-avec-tailwind-css)
- **Task** → [C# .NET](./02-csharp-dotnet.md#42-task-et-taskt)
- **Transaction** → [Database](./03-database.md#7-transactions)
- **TypeScript** → [Frontend](./06-frontend.md#5-typescript-pour-react)

### U
- **Unit Test** → [Testing](./07-testing.md#3-tests-unitaires)
- **useCallback** → [Frontend](./06-frontend.md#34-usecallback)
- **useEffect** → [Frontend](./06-frontend.md#33-useeffect)
- **useMemo** → [Frontend](./06-frontend.md#35-usememo)
- **useRef** → [Frontend](./06-frontend.md#36-useref)
- **useState** → [Frontend](./06-frontend.md#32-usestate)

### V
- **Validation** → [API REST](./04-api-rest.md#8-validation)
- **Variables d'env** → [DevOps](./08-devops.md#5-variables-denvironnement)
- **Virtual DOM** → [Frontend](./06-frontend.md#13-virtual-dom)

### X
- **xUnit** → [Testing](./07-testing.md#32-frameworks-de-test)

---

## Comment Utiliser ce Glossaire

1. **Débutant** : Lis les fichiers dans l'ordre numérique (01 → 08)
2. **Référence rapide** : Utilise l'index alphabétique ci-dessus
3. **Recherche ciblée** : Va directement au fichier concerné via le sommaire

---

## Ressources Complémentaires

### Documentation Officielle
- [Microsoft .NET Docs](https://docs.microsoft.com/dotnet)
- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [React Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Docker Docs](https://docs.docker.com)

### Tutoriels
- [Microsoft Learn](https://learn.microsoft.com)
- [freeCodeCamp](https://freecodecamp.org)

---

> **Note** : Ce glossaire est basé sur le projet FleetTrack et couvre les technologies utilisées dans ce projet spécifique. Les concepts sont expliqués dans le contexte d'une application de gestion de flotte véhiculaire.
