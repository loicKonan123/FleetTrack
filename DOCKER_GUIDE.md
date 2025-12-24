# 🐳 Guide Docker - FleetTrack

Guide complet pour utiliser Docker avec FleetTrack API.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Méthode 1: Docker Compose (Recommandée)](#méthode-1-docker-compose-recommandée)
3. [Méthode 2: Docker CLI Classique](#méthode-2-docker-cli-classique)
4. [Commandes Docker Utiles](#commandes-docker-utiles)
5. [Accès à l'API](#accès-à-lapi)
6. [Troubleshooting](#troubleshooting)
7. [Configuration Avancée](#configuration-avancée)

---

## ✅ Prérequis

- **Docker Desktop** installé: [Télécharger](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (inclus avec Docker Desktop)
- Au minimum **2 GB** de RAM disponible pour Docker

**Vérifier l'installation:**
```bash
docker --version
docker-compose --version
```

---

## 🚀 Méthode 1: Docker Compose (Recommandée)

Docker Compose permet de gérer l'application avec une seule commande.

### Démarrer l'application

```bash
# Depuis le répertoire backend_c#
docker-compose up -d
```

**Options:**
- `-d` : Mode détaché (en arrière-plan)
- `--build` : Forcer la reconstruction de l'image

**Première fois:**
```bash
docker-compose up -d --build
```

### Voir les logs

```bash
# Tous les logs
docker-compose logs

# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs api
```

### Arrêter l'application

```bash
# Arrêter les conteneurs
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer TOUT (conteneurs + volumes + images)
docker-compose down -v --rmi all
```

### Redémarrer l'application

```bash
docker-compose restart
```

### Reconstruire après des modifications

```bash
# Reconstruire et redémarrer
docker-compose up -d --build

# Ou en deux étapes
docker-compose build
docker-compose up -d
```

---

## 🔧 Méthode 2: Docker CLI Classique

### 1. Build de l'image

```bash
# Depuis le répertoire backend_c#
docker build -t fleettrack-api:latest -f FleetTrack/src/FleetTrack.API/Dockerfile ./FleetTrack
```

**Paramètres:**
- `-t fleettrack-api:latest` : Nom et tag de l'image
- `-f FleetTrack/src/FleetTrack.API/Dockerfile` : Chemin vers le Dockerfile
- `./FleetTrack` : Contexte de build

### 2. Lancer le conteneur

**Mode simple:**
```bash
docker run -d -p 8080:8080 --name fleettrack-api fleettrack-api:latest
```

**Mode complet avec options:**
```bash
docker run -d \
  --name fleettrack-api \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ASPNETCORE_URLS=http://+:8080 \
  -v fleettrack-data:/app/data \
  --restart unless-stopped \
  fleettrack-api:latest
```

**Paramètres:**
- `-d` : Mode détaché (arrière-plan)
- `-p 8080:8080` : Mapping de port (hôte:conteneur)
- `--name` : Nom du conteneur
- `-e` : Variables d'environnement
- `-v` : Volumes pour persister les données
- `--restart` : Politique de redémarrage

### 3. Gérer le conteneur

```bash
# Voir les conteneurs actifs
docker ps

# Voir tous les conteneurs (actifs et arrêtés)
docker ps -a

# Arrêter le conteneur
docker stop fleettrack-api

# Démarrer le conteneur
docker start fleettrack-api

# Redémarrer le conteneur
docker restart fleettrack-api

# Supprimer le conteneur
docker rm fleettrack-api

# Supprimer le conteneur en cours d'exécution (force)
docker rm -f fleettrack-api
```

### 4. Logs et inspection

```bash
# Voir les logs
docker logs fleettrack-api

# Logs en temps réel
docker logs -f fleettrack-api

# Dernières 100 lignes
docker logs --tail 100 fleettrack-api

# Inspecter le conteneur
docker inspect fleettrack-api

# Statistiques en temps réel
docker stats fleettrack-api
```

### 5. Accès au conteneur

```bash
# Ouvrir un shell bash dans le conteneur
docker exec -it fleettrack-api /bin/bash

# Exécuter une commande
docker exec fleettrack-api ls -la /app
```

---

## 📡 Accès à l'API

Une fois l'application lancée dans Docker:

- **API Base URL:** http://localhost:8080/api
- **Swagger UI:** http://localhost:8080/swagger
- **Health Check:** http://localhost:8080/health
- **SignalR Hub:** ws://localhost:8080/hubs/gps

### Tester l'API

**Via curl:**
```bash
# Health check
curl http://localhost:8080/health

# Login (obtenir un token)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

**Via navigateur:**
- Ouvrir http://localhost:8080/swagger
- Tester les endpoints directement

---

## 🐛 Troubleshooting

### Le conteneur ne démarre pas

**Vérifier les logs:**
```bash
docker logs fleettrack-api
```

**Causes communes:**
- Port 8080 déjà utilisé
- Problème de base de données
- Erreur dans la configuration

**Solution - Changer le port:**
```bash
docker run -d -p 9090:8080 --name fleettrack-api fleettrack-api:latest
# Accès: http://localhost:9090
```

### Port déjà utilisé

**Trouver le processus qui utilise le port:**
```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
```

**Arrêter le conteneur qui utilise le port:**
```bash
docker ps
docker stop <container-id>
```

### Build échoue

**Nettoyer le cache Docker:**
```bash
docker builder prune

# Build sans cache
docker build --no-cache -t fleettrack-api:latest -f FleetTrack/src/FleetTrack.API/Dockerfile ./FleetTrack
```

### La base de données SQLite ne persiste pas

**Utiliser un volume:**
```bash
docker run -d -p 8080:8080 \
  -v fleettrack-data:/app/data \
  --name fleettrack-api \
  fleettrack-api:latest
```

**Vérifier les volumes:**
```bash
docker volume ls
docker volume inspect fleettrack-data
```

### Problèmes de performance

**Augmenter les ressources Docker:**
- Ouvrir Docker Desktop
- Settings → Resources
- Augmenter CPU et RAM (minimum 2 GB)

---

## ⚙️ Configuration Avancée

### Variables d'environnement

Créer un fichier `.env`:

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
ConnectionStrings__DefaultConnection=Data Source=/app/data/FleetTrack.db
Jwt__Secret=VotreSuperSecretKeyDePlus32Caracteres!
Jwt__Issuer=FleetTrackAPI
Jwt__Audience=FleetTrackClients
Jwt__ExpiryMinutes=60
```

Utiliser avec docker-compose:
```bash
docker-compose --env-file .env up -d
```

### Utiliser SQL Server au lieu de SQLite

Modifier `docker-compose.yml`:

```yaml
services:
  # Base de données SQL Server
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: fleettrack-sqlserver
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Password123
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    networks:
      - fleettrack-network

  api:
    # ... config existante
    environment:
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=FleetTrack;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True
    depends_on:
      - sqlserver

volumes:
  sqlserver-data:
```

### Multi-stage build optimisé

Le Dockerfile actuel utilise déjà un build multi-stage optimisé:

1. **Stage Build**: Compilation avec SDK .NET 8.0
2. **Stage Publish**: Publication de l'application
3. **Stage Final**: Runtime léger avec ASP.NET Core Runtime

**Avantages:**
- Image finale plus petite (~200 MB vs 1+ GB)
- Sécurité accrue (pas d'outils de build dans l'image finale)
- Utilisateur non-root

---

## 📊 Commandes Utiles

### Nettoyer Docker

```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune

# Supprimer les volumes non utilisés
docker volume prune

# Supprimer TOUT ce qui n'est pas utilisé
docker system prune -a

# Nettoyer complètement (attention!)
docker system prune -a --volumes
```

### Monitoring

```bash
# Statistiques en temps réel de tous les conteneurs
docker stats

# Informations système Docker
docker system df

# Événements Docker en temps réel
docker events
```

### Sauvegarder et restaurer

**Sauvegarder l'image:**
```bash
docker save fleettrack-api:latest > fleettrack-api.tar
```

**Restaurer l'image:**
```bash
docker load < fleettrack-api.tar
```

**Exporter le conteneur:**
```bash
docker export fleettrack-api > fleettrack-container.tar
```

---

## 🚀 Déploiement en Production

### Utiliser Docker Swarm

```bash
# Initialiser Swarm
docker swarm init

# Déployer la stack
docker stack deploy -c docker-compose.yml fleettrack

# Scaler le service
docker service scale fleettrack_api=3

# Voir les services
docker service ls
```

### Utiliser avec Kubernetes

Créer des manifests Kubernetes (deployment, service, ingress) à partir du docker-compose.

### CI/CD avec GitHub Actions

Le workflow existant build déjà l'image Docker automatiquement.

Pour pousser vers Docker Hub:
```yaml
- name: Push to Docker Hub
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: username/fleettrack-api:latest
```

---

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [ASP.NET Core Docker Images](https://hub.docker.com/_/microsoft-dotnet-aspnet)
- [Best Practices for .NET Docker](https://docs.microsoft.com/en-us/dotnet/core/docker/build-container)

---

## ✅ Checklist de Vérification

Avant de déployer en production:

- [ ] Variables d'environnement sécurisées (pas de secrets en dur)
- [ ] HTTPS configuré (certificats SSL)
- [ ] Base de données persistante (volumes ou BD externe)
- [ ] Logs centralisés
- [ ] Monitoring et alertes
- [ ] Backups automatiques de la BD
- [ ] Health checks configurés
- [ ] Ressources limitées (CPU, RAM)
- [ ] Politique de redémarrage définie
- [ ] Secrets gérés avec Docker Secrets ou variables d'environnement sécurisées

---

**Dernière mise à jour:** Décembre 2025
**Version:** 1.0
