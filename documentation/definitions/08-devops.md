# Définitions : DevOps et Déploiement

> Guide complet des concepts DevOps utilisés dans FleetTrack

---

## Table des Matières

1. [DevOps - Introduction](#1-devops---introduction)
2. [Docker](#2-docker)
3. [Docker Compose](#3-docker-compose)
4. [CI/CD](#4-cicd)
5. [Variables d'Environnement](#5-variables-denvironnement)
6. [Logging et Monitoring](#6-logging-et-monitoring)
7. [Déploiement Cloud](#7-déploiement-cloud)

---

## 1. DevOps - Introduction

### 1.1 Définition

**DevOps** est une culture et un ensemble de pratiques qui unifient le développement (Dev) et les opérations (Ops) pour livrer des logiciels plus rapidement et de manière plus fiable.

### 1.2 Le Cycle DevOps

```
┌─────────────────────────────────────────────────────────────┐
│                     CYCLE DEVOPS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           Plan ──────► Code ──────► Build                   │
│             ▲                          │                    │
│             │                          ▼                    │
│          Monitor                     Test                   │
│             ▲                          │                    │
│             │                          ▼                    │
│          Operate ◄──── Deploy ◄──── Release                │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │    DEVELOPMENT      │  │       OPERATIONS            │  │
│  │  Plan, Code, Build, │  │  Deploy, Operate, Monitor   │  │
│  │  Test               │  │                             │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│             ══════════════════════════════                  │
│                CI/CD automatise tout ça                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Principes Clés

| Principe | Description |
|----------|-------------|
| **Automatisation** | Réduire les tâches manuelles |
| **Intégration Continue** | Merge et test fréquents du code |
| **Déploiement Continu** | Mise en production automatisée |
| **Infrastructure as Code** | Définir l'infra en code (versionnable) |
| **Monitoring** | Surveiller l'application en production |

---

## 2. Docker

### 2.1 Définition

**Docker** est une plateforme de conteneurisation qui permet d'empaqueter une application avec toutes ses dépendances dans un conteneur isolé.

### 2.2 Analogie

```
┌─────────────────────────────────────────────────────────────┐
│                    SANS DOCKER                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  "Ça marche sur ma machine!"                               │
│                                                             │
│  Dev Machine          Serveur Prod                          │
│  ┌──────────┐        ┌──────────┐                          │
│  │ Node 20  │        │ Node 18  │  ← Version différente!   │
│  │ npm 10   │        │ npm 9    │                          │
│  │ Linux    │        │ Windows  │  ← OS différent!         │
│  └──────────┘        └──────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     AVEC DOCKER                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Conteneur = Environnement identique partout                │
│                                                             │
│  Dev Machine          Serveur Prod          Serveur Test    │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐      │
│  │ Container│        │ Container│        │ Container│      │
│  │ Node 20  │   =    │ Node 20  │   =    │ Node 20  │      │
│  │ npm 10   │        │ npm 10   │        │ npm 10   │      │
│  │ Alpine   │        │ Alpine   │        │ Alpine   │      │
│  └──────────┘        └──────────┘        └──────────┘      │
│                                                             │
│  Même conteneur = Même comportement                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Concepts Clés

#### Image
Un **template** en lecture seule contenant l'OS, le code, les dépendances.

#### Conteneur
Une **instance** en cours d'exécution d'une image.

#### Dockerfile
Le **fichier de recette** pour construire une image.

#### Registry
Le **stockage** des images (Docker Hub, Azure Container Registry).

```
┌─────────────────────────────────────────────────────────────┐
│                       DOCKER                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Dockerfile ─────► docker build ─────► Image               │
│   (recette)                              │                  │
│                                          │ docker run       │
│                                          ▼                  │
│                                      Container              │
│                                      (en exécution)         │
│                                                             │
│   Registry ◄───── docker push                               │
│   (Docker Hub)                                              │
│        │                                                    │
│        └───── docker pull ─────► Autre machine             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Dockerfile Backend (.NET)

```dockerfile
# FleetTrack/Dockerfile

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copier les fichiers projet et restaurer les dépendances
COPY ["src/FleetTrack.API/FleetTrack.API.csproj", "src/FleetTrack.API/"]
COPY ["src/FleetTrack.Application/FleetTrack.Application.csproj", "src/FleetTrack.Application/"]
COPY ["src/FleetTrack.Domain/FleetTrack.Domain.csproj", "src/FleetTrack.Domain/"]
COPY ["src/FleetTrack.Infrastructure/FleetTrack.Infrastructure.csproj", "src/FleetTrack.Infrastructure/"]

RUN dotnet restore "src/FleetTrack.API/FleetTrack.API.csproj"

# Copier le reste du code
COPY . .

# Build et publish
RUN dotnet publish "src/FleetTrack.API/FleetTrack.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore

# Stage 2: Runtime (image finale légère)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copier les fichiers publiés
COPY --from=build /app/publish .

# Port exposé
EXPOSE 5000

# Variables d'environnement
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Commande de démarrage
ENTRYPOINT ["dotnet", "FleetTrack.API.dll"]
```

### 2.5 Dockerfile Frontend (Next.js)

```dockerfile
# fleettrack-frontend/Dockerfile

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 2.6 Commandes Docker Essentielles

```bash
# Construire une image
docker build -t fleettrack-api:latest .
docker build -t fleettrack-frontend:latest ./fleettrack-frontend

# Lister les images
docker images

# Lancer un conteneur
docker run -d \
  --name fleettrack-api \
  -p 5000:5000 \
  -e "ConnectionStrings__DefaultConnection=..." \
  fleettrack-api:latest

# Avec des options
docker run -d \                    # Détaché (arrière-plan)
  --name api \                     # Nom du conteneur
  -p 5000:5000 \                   # Port host:container
  -v /data:/app/data \             # Volume (persistance)
  -e VAR=value \                   # Variable d'environnement
  --network my-network \           # Réseau
  --restart unless-stopped \       # Redémarrage auto
  fleettrack-api:latest

# Lister les conteneurs
docker ps                          # En cours
docker ps -a                       # Tous

# Logs
docker logs fleettrack-api
docker logs -f fleettrack-api      # Suivre en temps réel

# Arrêter / Supprimer
docker stop fleettrack-api
docker rm fleettrack-api
docker rmi fleettrack-api:latest   # Supprimer l'image

# Shell dans un conteneur
docker exec -it fleettrack-api /bin/bash

# Nettoyer
docker system prune                # Supprimer les ressources inutilisées
docker system prune -a             # Tout nettoyer
```

---

## 3. Docker Compose

### 3.1 Définition

**Docker Compose** permet de définir et gérer des applications multi-conteneurs avec un fichier YAML.

### 3.2 Avantages

- Un seul fichier pour toute l'infrastructure
- Démarrage/arrêt de tous les services en une commande
- Réseau automatique entre les conteneurs
- Variables d'environnement centralisées

### 3.3 docker-compose.yml FleetTrack

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Base de données PostgreSQL
  db:
    image: postgres:16-alpine
    container_name: fleettrack-db
    environment:
      POSTGRES_USER: fleettrack
      POSTGRES_PASSWORD: ${DB_PASSWORD:-FleetTrack123!}
      POSTGRES_DB: fleettrack
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fleettrack"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - fleettrack-network

  # Backend API
  api:
    build:
      context: ./FleetTrack
      dockerfile: Dockerfile
    container_name: fleettrack-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=db;Database=fleettrack;Username=fleettrack;Password=${DB_PASSWORD:-FleetTrack123!}
      - Jwt__Secret=${JWT_SECRET}
      - Jwt__Issuer=FleetTrack
      - Jwt__Audience=FleetTrackUsers
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - fleettrack-network
    restart: unless-stopped

  # Frontend Next.js
  frontend:
    build:
      context: ./fleettrack-frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=http://api:5000/api
    container_name: fleettrack-frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - api
    networks:
      - fleettrack-network
    restart: unless-stopped

  # Reverse Proxy (optionnel)
  nginx:
    image: nginx:alpine
    container_name: fleettrack-nginx
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
      - frontend
    networks:
      - fleettrack-network

volumes:
  postgres_data:

networks:
  fleettrack-network:
    driver: bridge
```

### 3.4 Fichier .env

```bash
# .env (ne PAS commiter!)
DB_PASSWORD=SuperSecretPassword123!
JWT_SECRET=VotreCleSecrete256BitsMinimum32Caracteres!!!
```

### 3.5 Commandes Docker Compose

```bash
# Démarrer tous les services
docker-compose up

# En arrière-plan
docker-compose up -d

# Reconstruire les images
docker-compose up --build

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Logs
docker-compose logs
docker-compose logs -f api        # Suivre un service

# État des services
docker-compose ps

# Exécuter une commande dans un service
docker-compose exec api dotnet ef migrations list
docker-compose exec db psql -U fleettrack

# Redémarrer un service
docker-compose restart api

# Scaler un service
docker-compose up -d --scale api=3
```

---

## 4. CI/CD

### 4.1 Définition

**CI/CD** (Continuous Integration / Continuous Deployment) automatise le build, les tests et le déploiement du code.

```
┌─────────────────────────────────────────────────────────────┐
│                      CI/CD PIPELINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Git Push                                                  │
│      │                                                      │
│      ▼                                                      │
│   ┌──────────────────────────────────────────────────────┐ │
│   │               CONTINUOUS INTEGRATION                  │ │
│   ├──────────────────────────────────────────────────────┤ │
│   │  1. Checkout code                                     │ │
│   │  2. Restore dependencies                              │ │
│   │  3. Build                                             │ │
│   │  4. Run tests                                         │ │
│   │  5. Code analysis                                     │ │
│   │  6. Build Docker image                                │ │
│   │  7. Push to registry                                  │ │
│   └──────────────────────────────────────────────────────┘ │
│      │                                                      │
│      ▼                                                      │
│   ┌──────────────────────────────────────────────────────┐ │
│   │              CONTINUOUS DEPLOYMENT                    │ │
│   ├──────────────────────────────────────────────────────┤ │
│   │  8. Deploy to staging                                 │ │
│   │  9. Run integration tests                             │ │
│   │  10. Deploy to production                             │ │
│   │  11. Health check                                     │ │
│   └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DOTNET_VERSION: '8.0.x'
  NODE_VERSION: '20.x'

jobs:
  # Job 1: Build et Test Backend
  backend:
    name: Backend Build & Test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./FleetTrack

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Restore dependencies
        run: dotnet restore

      - name: Build
        run: dotnet build --no-restore --configuration Release

      - name: Run Unit Tests
        run: dotnet test tests/FleetTrack.UnitTests --no-build -c Release --logger trx

      - name: Run Integration Tests
        run: dotnet test tests/FleetTrack.IntegrationTests --no-build -c Release --logger trx

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: '**/*.trx'

  # Job 2: Build et Test Frontend
  frontend:
    name: Frontend Build & Test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./fleettrack-frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: fleettrack-frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:5000/api

  # Job 3: Build Docker Images
  docker:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [backend, frontend]
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: ./FleetTrack
          push: true
          tags: |
            username/fleettrack-api:latest
            username/fleettrack-api:${{ github.sha }}

      - name: Build and push Frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./fleettrack-frontend
          push: true
          tags: |
            username/fleettrack-frontend:latest
            username/fleettrack-frontend:${{ github.sha }}
          build-args: |
            NEXT_PUBLIC_API_URL=https://api.fleettrack.com

  # Job 4: Deploy
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [docker]
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/fleettrack
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

### 4.3 Secrets GitHub

Configuration dans: Settings → Secrets and variables → Actions

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Username Docker Hub |
| `DOCKER_PASSWORD` | Password/Token Docker Hub |
| `SERVER_HOST` | IP du serveur production |
| `SERVER_USER` | Utilisateur SSH |
| `SERVER_SSH_KEY` | Clé privée SSH |
| `DB_PASSWORD` | Mot de passe BDD |
| `JWT_SECRET` | Secret JWT |

---

## 5. Variables d'Environnement

### 5.1 Définition

Les **variables d'environnement** permettent de configurer une application sans modifier le code. Idéal pour les secrets et configurations spécifiques à l'environnement.

### 5.2 Configuration .NET

```csharp
// appsettings.json - Valeurs par défaut
{
  "Jwt": {
    "Issuer": "FleetTrack",
    "Audience": "FleetTrackUsers",
    "ExpirationMinutes": 30
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}

// appsettings.Development.json - Développement
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=fleettrack.db"
  },
  "Jwt": {
    "Secret": "DevSecretKeyForLocalDevelopmentOnly123!"
  }
}

// appsettings.Production.json - Production
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  }
}
```

```csharp
// Lecture des config dans le code
public class AuthService
{
    private readonly IConfiguration _configuration;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GetSecret()
    {
        // Lit depuis appsettings ou variable d'environnement
        return _configuration["Jwt:Secret"]!;
    }
}
```

### 5.3 Priorité de Configuration

```
┌─────────────────────────────────────────────────────────────┐
│              ORDRE DE PRIORITÉ (du plus haut)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Command line arguments                                  │
│     dotnet run --Jwt:Secret=xxx                            │
│                                                             │
│  2. Environment variables                                   │
│     export Jwt__Secret=xxx                                  │
│     Jwt__Secret=xxx (Docker)                               │
│                                                             │
│  3. User secrets (dev only)                                │
│     dotnet user-secrets set "Jwt:Secret" "xxx"             │
│                                                             │
│  4. appsettings.{Environment}.json                         │
│     appsettings.Production.json                            │
│                                                             │
│  5. appsettings.json                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Configuration Next.js

```bash
# .env.local (développement - ne PAS commiter)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5000/hubs

# .env.production (production)
NEXT_PUBLIC_API_URL=https://api.fleettrack.com/api
NEXT_PUBLIC_SIGNALR_URL=https://api.fleettrack.com/hubs
```

```tsx
// Utilisation dans le code
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Variables NEXT_PUBLIC_ sont exposées au client
// Variables sans prefix sont serveur-only
```

---

## 6. Logging et Monitoring

### 6.1 Logging dans .NET

```csharp
public class VehicleService : IVehicleService
{
    private readonly ILogger<VehicleService> _logger;

    public VehicleService(ILogger<VehicleService> logger)
    {
        _logger = logger;
    }

    public async Task<VehicleDto?> GetByIdAsync(Guid id)
    {
        _logger.LogInformation("Recherche du véhicule {VehicleId}", id);

        try
        {
            var vehicle = await _context.Vehicles.FindAsync(id);

            if (vehicle == null)
            {
                _logger.LogWarning("Véhicule {VehicleId} non trouvé", id);
                return null;
            }

            _logger.LogDebug("Véhicule trouvé: {@Vehicle}", vehicle);
            return MapToDto(vehicle);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la recherche du véhicule {VehicleId}", id);
            throw;
        }
    }
}
```

### 6.2 Niveaux de Log

| Niveau | Utilisation |
|--------|-------------|
| `Trace` | Détails très fins (debug avancé) |
| `Debug` | Informations de débogage |
| `Information` | Événements normaux de l'application |
| `Warning` | Situations anormales mais pas d'erreur |
| `Error` | Erreurs qui n'arrêtent pas l'application |
| `Critical` | Erreurs fatales |

### 6.3 Configuration Logging

```json
// appsettings.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning",
      "FleetTrack": "Debug"
    }
  }
}
```

### 6.4 Structured Logging

```csharp
// ❌ Mauvais - Interpolation de string
_logger.LogInformation($"User {userId} created vehicle {vehicleId}");

// ✅ Bon - Logging structuré
_logger.LogInformation(
    "User {UserId} created vehicle {VehicleId}",
    userId,
    vehicleId);

// Les propriétés sont indexables/searchables
// Output: {"UserId": "123", "VehicleId": "456", "Message": "..."}
```

---

## 7. Déploiement Cloud

### 7.1 Options de Déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                 OPTIONS DE DÉPLOIEMENT                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  IaaS (Infrastructure as a Service)                        │
│  ─────────────────────────────────                         │
│  • VM complète (AWS EC2, Azure VM, DigitalOcean)           │
│  • Contrôle total, plus de travail                         │
│  • Tu gères: OS, runtime, app, scaling                     │
│                                                             │
│  PaaS (Platform as a Service)                              │
│  ───────────────────────────                               │
│  • App Service (Azure), Elastic Beanstalk (AWS)            │
│  • Moins de contrôle, moins de travail                     │
│  • Tu gères: app seulement                                 │
│                                                             │
│  CaaS (Container as a Service)                             │
│  ───────────────────────────                               │
│  • Azure Container Apps, AWS ECS, Google Cloud Run         │
│  • Déploie tes conteneurs Docker                           │
│  • Scaling automatique                                      │
│                                                             │
│  Serverless                                                 │
│  ──────────                                                │
│  • Azure Functions, AWS Lambda                             │
│  • Paye uniquement à l'utilisation                         │
│  • Pas adapté pour tout (WebSockets, long-running)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Exemple: Azure Container Apps

```yaml
# azure-deploy.yml
name: Deploy to Azure Container Apps

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Login to ACR
        run: |
          az acr login --name fleettrackacr

      - name: Build and push to ACR
        run: |
          docker build -t fleettrackacr.azurecr.io/api:${{ github.sha }} ./FleetTrack
          docker push fleettrackacr.azurecr.io/api:${{ github.sha }}

      - name: Deploy to Container Apps
        run: |
          az containerapp update \
            --name fleettrack-api \
            --resource-group fleettrack-rg \
            --image fleettrackacr.azurecr.io/api:${{ github.sha }}
```

### 7.3 Checklist Déploiement Production

```
┌─────────────────────────────────────────────────────────────┐
│              CHECKLIST DÉPLOIEMENT PRODUCTION               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SÉCURITÉ                                                   │
│  □ HTTPS activé (certificat SSL)                           │
│  □ Secrets stockés de manière sécurisée                    │
│  □ Variables d'environnement configurées                    │
│  □ CORS configuré pour les domaines autorisés              │
│  □ Rate limiting activé                                     │
│  □ Headers de sécurité (HSTS, CSP, etc.)                   │
│                                                             │
│  BASE DE DONNÉES                                            │
│  □ Migrations appliquées                                    │
│  □ Backups configurés                                       │
│  □ Connection string sécurisée                             │
│  □ Pool de connexions configuré                            │
│                                                             │
│  PERFORMANCE                                                │
│  □ Caching configuré                                        │
│  □ Compression activée (gzip)                              │
│  □ Assets minifiés                                          │
│  □ CDN pour les fichiers statiques                         │
│                                                             │
│  MONITORING                                                 │
│  □ Logging configuré                                        │
│  □ Health checks                                            │
│  □ Alertes configurées                                      │
│  □ Métriques de performance                                 │
│                                                             │
│  RÉSILIENCE                                                 │
│  □ Scaling automatique                                      │
│  □ Load balancing                                           │
│  □ Strategy de rollback                                     │
│  □ Circuit breakers                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Résumé

| Concept | Description |
|---------|-------------|
| **DevOps** | Culture unissant Dev et Ops |
| **Docker** | Conteneurisation d'applications |
| **Image** | Template d'un conteneur |
| **Container** | Instance d'une image |
| **Dockerfile** | Recette pour construire une image |
| **Docker Compose** | Orchestration multi-conteneurs |
| **CI/CD** | Automatisation build/test/deploy |
| **GitHub Actions** | CI/CD intégré à GitHub |
| **Variables d'environnement** | Configuration externe |
| **Logging** | Enregistrement des événements |

---

[← Précédent : Testing](./07-testing.md) | [Retour au sommaire →](./INDEX.md)
