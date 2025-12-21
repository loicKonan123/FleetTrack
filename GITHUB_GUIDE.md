# 📘 Guide Complet GitHub - FleetTrack

## Table des Matières

1. [Introduction](#introduction)
2. [Résumé du Projet FleetTrack](#résumé-du-projet-fleettrack)
3. [Qu'est-ce que GitHub?](#quest-ce-que-github)
4. [Pourquoi GitHub est Essentiel](#pourquoi-github-est-essentiel)
5. [Configuration Initiale de Git et GitHub](#configuration-initiale-de-git-et-github)
6. [Les Concepts Fondamentaux de Git](#les-concepts-fondamentaux-de-git)
7. [Travailler avec GitHub - Guide Pratique](#travailler-avec-github---guide-pratique)
8. [GitHub Actions et CI/CD](#github-actions-et-cicd)
9. [Fonctionnalités Avancées de GitHub](#fonctionnalités-avancées-de-github)
10. [Bonnes Pratiques et Workflows](#bonnes-pratiques-et-workflows)
11. [Application Pratique avec FleetTrack](#application-pratique-avec-fleettrack)
12. [Commandes Git Essentielles](#commandes-git-essentielles)
13. [Dépannage et Solutions](#dépannage-et-solutions)

---

## Introduction

Ce guide complet vous accompagne dans la maîtrise de GitHub, de la configuration initiale aux fonctionnalités avancées, en utilisant le projet **FleetTrack** comme exemple concret.

**FleetTrack** est une API REST complète de gestion de flotte construite avec:
- **.NET 8.0** et **Clean Architecture**
- **60 tests unitaires** (100% de réussite)
- **22 tests d'intégration**
- **Pipeline CI/CD automatisé** avec GitHub Actions
- **Scripts d'exécution de tests** multi-plateformes

---

## Résumé du Projet FleetTrack

### Architecture du Projet

FleetTrack suit les principes de **Clean Architecture** avec 4 couches distinctes:

```
FleetTrack/
├── src/
│   ├── FleetTrack.Domain/          # Entités métier, enums, interfaces
│   ├── FleetTrack.Application/     # Logique métier, services, DTOs
│   ├── FleetTrack.Infrastructure/  # Accès données, DbContext, repositories
│   └── FleetTrack.API/             # Contrôleurs REST, endpoints
├── tests/
│   ├── FleetTrack.UnitTests/       # 60 tests unitaires
│   └── FleetTrack.IntegrationTests/ # 22 tests d'intégration
├── .github/
│   └── workflows/
│       └── dotnet-ci.yml           # Pipeline CI/CD automatisé
├── run-tests.ps1                   # Script PowerShell pour exécuter les tests
├── run-tests.sh                    # Script Bash pour exécuter les tests
├── TESTS_GUIDE.md                  # Guide d'exécution des tests
└── FleetTrack.sln                  # Solution .NET
```

### Technologies Utilisées

**Backend:**
- .NET 8.0 SDK
- ASP.NET Core Web API
- Entity Framework Core 8.0
- SQLite (développement)

**Tests:**
- xUnit 2.5.3 - Framework de tests
- Moq 4.20.72 - Bibliothèque de mocking
- FluentAssertions 8.8.0 - Assertions fluides
- Microsoft.AspNetCore.Mvc.Testing - Tests d'intégration

**CI/CD:**
- GitHub Actions
- Docker
- ReportGenerator (couverture de code)

### Fonctionnalités Implémentées

**Gestion des Véhicules:**
- CRUD complet (Create, Read, Update, Delete)
- Filtrage par statut
- Recherche de véhicules disponibles
- Historique de maintenance
- Suivi du niveau de carburant et kilométrage

**Gestion des Conducteurs:**
- CRUD complet
- Vérification de l'expiration du permis
- Gestion des statuts (disponible, en mission, en repos)
- Attribution automatique aux missions

**Gestion des Missions:**
- Création avec validation métier
- Vérification de disponibilité véhicule/conducteur
- Contrôle d'expiration du permis
- Calcul de distance estimée
- Gestion des priorités

**Suivi GPS et Alertes:**
- Enregistrement des positions GPS
- Système d'alertes automatisé
- Notifications de maintenance

### Tests Implémentés

**Tests Unitaires (60 tests):**
- **VehicleServiceTests** (20 tests)
  - GetAllAsync avec et sans soft-deleted
  - GetByIdAsync avec succès et échec
  - GetAvailableAsync
  - GetByStatusAsync
  - CreateAsync avec validation
  - UpdateAsync avec vérifications
  - DeleteAsync (soft delete)

- **DriverServiceTests** (18 tests)
  - GetAllAsync avec filtres
  - GetByIdAsync
  - GetAvailableAsync
  - CreateAsync avec validation numéro de permis
  - UpdateAsync
  - DeleteAsync

- **MissionServiceTests** (22 tests)
  - GetAllAsync avec filtres
  - GetByIdAsync
  - CreateAsync avec validation complexe
  - Vérification disponibilité véhicule
  - Vérification disponibilité conducteur
  - Validation expiration permis
  - UpdateAsync
  - CompleteAsync
  - DeleteAsync

**Tests d'Intégration (22 tests):**
- **VehiclesControllerTests** (12 tests)
  - GET /api/vehicles
  - GET /api/vehicles/{id}
  - POST /api/vehicles
  - PUT /api/vehicles/{id}
  - DELETE /api/vehicles/{id}
  - GET /api/vehicles/available

- **DriversControllerTests** (10 tests)
  - GET /api/drivers
  - GET /api/drivers/{id}
  - POST /api/drivers
  - PUT /api/drivers/{id}
  - DELETE /api/drivers/{id}

### Pipeline CI/CD

Le fichier [.github/workflows/dotnet-ci.yml](.github/workflows/dotnet-ci.yml) automatise:

1. **Build** - Compilation en mode Release
2. **Tests Unitaires** - Exécution des 60 tests
3. **Tests d'Intégration** - Exécution des 22 tests
4. **Couverture de Code** - Génération du rapport Codecov
5. **Upload des Résultats** - Sauvegarde des rapports .trx
6. **Build Docker** - Construction de l'image (sur main uniquement)

---

## Qu'est-ce que GitHub?

### Définition

**GitHub** est une plateforme web d'hébergement et de gestion de code source qui utilise **Git**, le système de contrôle de version le plus populaire au monde.

### Git vs GitHub

**Git:**
- Système de contrôle de version distribué
- Fonctionne en local sur votre machine
- Créé par Linus Torvalds en 2005
- Gratuit et open-source
- Permet de suivre l'historique des modifications

**GitHub:**
- Service web hébergeant des dépôts Git
- Ajoute des fonctionnalités collaboratives
- Interface graphique pour Git
- Intégration CI/CD, gestion de projet, documentation
- Propriété de Microsoft depuis 2018

### Analogie Simple

Imaginez Git comme un **système de sauvegarde intelligent** pour votre code:
- Chaque sauvegarde (commit) crée un point de restauration
- Vous pouvez revenir en arrière à tout moment
- Plusieurs personnes peuvent travailler simultanément
- Les modifications sont fusionnées intelligemment

GitHub est comme **Dropbox/Google Drive pour développeurs**, mais avec des super-pouvoirs:
- Collaboration en temps réel
- Revue de code intégrée
- Automatisation des tests
- Gestion de projet
- Documentation centralisée

---

## Pourquoi GitHub est Essentiel

### 1. Contrôle de Version Professionnel

**Sans Git/GitHub:**
```
projet_final.zip
projet_final_v2.zip
projet_final_v2_VRAIMENT_FINAL.zip
projet_final_v2_VRAIMENT_FINAL_cette_fois.zip
```

**Avec Git/GitHub:**
- Historique complet des modifications
- Messages de commit descriptifs
- Possibilité de revenir à n'importe quelle version
- Comparaison facile entre versions

**Exemple concret FleetTrack:**
```bash
# Voir l'historique complet
git log --oneline

# Résultat:
486973c Add complete FleetTrack API with tests and CI/CD pipeline
a1b2c3d Initial commit

# Revenir à une version précédente
git checkout a1b2c3d
```

### 2. Collaboration d'Équipe Sans Friction

**Scénarios de collaboration:**

**Développeur A** travaille sur les véhicules:
```bash
git checkout -b feature/vehicle-maintenance
# Modifie VehicleService.cs
git commit -m "Add maintenance scheduling feature"
git push origin feature/vehicle-maintenance
```

**Développeur B** travaille sur les conducteurs en parallèle:
```bash
git checkout -b feature/driver-notifications
# Modifie DriverService.cs
git commit -m "Add driver notification system"
git push origin feature/driver-notifications
```

Les deux peuvent travailler simultanément sans conflit!

### 3. Revue de Code (Code Review)

Avant de fusionner du code, l'équipe peut le réviser:

**Pull Request typique:**
```
Titre: "Add maintenance scheduling feature"

Changements:
- VehicleService.cs (+120 lignes)
- IVehicleRepository.cs (+15 lignes)
- VehicleServiceTests.cs (+80 lignes)

Reviewers: @senior-dev, @team-lead

Commentaires:
@senior-dev: "Excellent travail! Pourriez-vous ajouter un test
              pour le cas où la date de maintenance est dans le passé?"

@developer-A: "Fait! Commit abc123"

@team-lead: "LGTM (Looks Good To Me)" ✅ Approuvé
```

### 4. CI/CD Automatisé

**Sans CI/CD:**
- Tests manuels avant chaque déploiement
- Oublis fréquents
- Bugs en production
- Processus long et fastidieux

**Avec GitHub Actions (FleetTrack):**
```yaml
# À chaque push:
1. ✅ Build automatique
2. ✅ 60 tests unitaires exécutés
3. ✅ 22 tests d'intégration exécutés
4. ✅ Rapport de couverture généré
5. ✅ Docker image construite
6. ✅ Notification si échec
```

**Résultat:** Zéro bug passé inaperçu!

### 5. Documentation Centralisée

GitHub permet d'héberger:
- **README.md** - Présentation du projet
- **TESTS_GUIDE.md** - Guide d'exécution des tests
- **GITHUB_GUIDE.md** - Ce guide complet
- **Wiki** - Documentation extensive
- **GitHub Pages** - Site web de documentation

### 6. Gestion de Projet Intégrée

**GitHub Issues:**
```
Issue #23: Bug - Vehicle status not updating after mission completion
Assignee: @developer-A
Labels: bug, high-priority
Milestone: v1.2.0

Comments:
- @tester: "Reproduced on staging environment"
- @developer-A: "Fix in progress, will push to branch fix/vehicle-status"
- @developer-A: "Fixed in PR #45"

Status: Closed ✅
```

**GitHub Projects (Kanban):**
```
To Do          | In Progress              | Review        | Done
---------------|--------------------------|---------------|------------------
Issue #24      | Issue #23 (@dev-A)       | PR #45        | Issue #22 ✅
Issue #25      | Issue #26 (@dev-B)       | PR #46        | Issue #21 ✅
```

### 7. Open Source et Partage de Code

**Avantages:**
- Portfolio public pour employeurs
- Contributions à des projets mondiaux
- Apprentissage du code des meilleurs développeurs
- Reconnaissance dans la communauté

**Exemple:**
```
Votre profil GitHub: github.com/votre-nom
Projets:
- FleetTrack (⭐ 150 stars, 25 forks)
- Autre-Projet (⭐ 80 stars)

Contributions:
- Microsoft/dotnet (5 PRs merged)
- Azure/azure-sdk-for-net (2 PRs merged)

Employeurs potentiels peuvent voir:
✅ Code de qualité
✅ Tests complets
✅ CI/CD configuré
✅ Documentation professionnelle
```

### 8. Sécurité et Sauvegarde

**Protection contre les pertes:**
- Code hébergé dans le cloud
- Historique complet préservé
- Impossible de perdre définitivement du code
- Récupération facile après crash disque

**Sécurité:**
- Authentification 2FA
- Gestion des accès (publique/privée)
- Détection automatique de secrets (tokens, mots de passe)
- Alertes de vulnérabilités de dépendances

### 9. Intégrations Puissantes

GitHub s'intègre avec:
- **Slack/Discord** - Notifications d'équipe
- **Jira** - Gestion de projet
- **Azure DevOps** - Déploiement
- **Codecov** - Couverture de code
- **SonarQube** - Qualité de code
- **Dependabot** - Mises à jour de dépendances

### 10. Gratuit pour Projets Publics et Privés

**Plan Gratuit:**
- Dépôts publics illimités
- Dépôts privés illimités
- 2000 minutes/mois de GitHub Actions
- GitHub Pages
- Communauté et support

**C'est GRATUIT pour la plupart des développeurs!**

---

## Configuration Initiale de Git et GitHub

### Étape 1: Installer Git

**Windows:**
1. Téléchargez Git depuis [git-scm.com](https://git-scm.com/)
2. Exécutez l'installateur
3. Utilisez les options par défaut (recommandé)
4. Vérifiez l'installation:
```bash
git --version
# Résultat attendu: git version 2.43.0 (ou plus récent)
```

**macOS:**
```bash
# Avec Homebrew (recommandé)
brew install git

# Ou installer Xcode Command Line Tools
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git
```

### Étape 2: Configurer Git

**Configuration globale (pour tous vos projets):**

```bash
# Nom (apparaîtra dans les commits)
git config --global user.name "Votre Nom"

# Email (utilisez le même que GitHub)
git config --global user.email "votre.email@example.com"

# Éditeur par défaut (VS Code recommandé)
git config --global core.editor "code --wait"

# Branche par défaut (convention moderne)
git config --global init.defaultBranch main

# Affichage coloré
git config --global color.ui auto

# Vérifier la configuration
git config --list
```

**Configuration pour FleetTrack (exemple):**
```bash
git config --global user.name "Loic Konan"
git config --global user.email "loic.konan@example.com"
```

### Étape 3: Créer un Compte GitHub

1. Allez sur [github.com](https://github.com/)
2. Cliquez sur "Sign up"
3. Remplissez le formulaire:
   - Username: `loicKonan123` (exemple)
   - Email: `loic.konan@example.com`
   - Password: (mot de passe fort)
4. Vérifiez votre email
5. Complétez votre profil

### Étape 4: Configurer l'Authentification SSH (Recommandé)

**Pourquoi SSH?**
- Pas besoin de taper mot de passe à chaque push
- Plus sécurisé que HTTPS
- Configuration une fois, utilisation permanente

**Générer une clé SSH:**

```bash
# Générer une nouvelle clé SSH
ssh-keygen -t ed25519 -C "votre.email@example.com"

# Appuyez sur Entrée pour le fichier par défaut
# Entrez une passphrase (optionnel mais recommandé)

# Résultat:
# Clé privée: ~/.ssh/id_ed25519
# Clé publique: ~/.ssh/id_ed25519.pub
```

**Ajouter la clé à l'agent SSH:**

```bash
# Démarrer l'agent SSH
eval "$(ssh-agent -s)"

# Ajouter la clé privée
ssh-add ~/.ssh/id_ed25519
```

**Ajouter la clé publique à GitHub:**

```bash
# Afficher la clé publique
cat ~/.ssh/id_ed25519.pub

# Résultat (exemple):
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGqL... votre.email@example.com
```

1. Allez sur GitHub → Settings → SSH and GPG keys
2. Cliquez "New SSH key"
3. Titre: "Mon ordinateur portable"
4. Collez la clé publique
5. Cliquez "Add SSH key"

**Tester la connexion:**

```bash
ssh -T git@github.com

# Résultat attendu:
Hi loicKonan123! You've successfully authenticated, but GitHub does not provide shell access.
```

### Étape 5: Créer un Nouveau Dépôt GitHub

**Méthode 1: Via l'interface web**

1. Allez sur [github.com/new](https://github.com/new)
2. Remplissez le formulaire:
   - Repository name: `FleetTrack`
   - Description: `Fleet management system with .NET 8.0 and Clean Architecture`
   - Public ou Private: `Public` (recommandé pour portfolio)
   - ❌ Ne cochez PAS "Initialize with README" (vous en avez déjà un)
   - ❌ Ne cochez PAS "Add .gitignore" (vous en avez déjà un)
   - ❌ Ne cochez PAS "Choose a license" (à ajouter plus tard)
3. Cliquez "Create repository"

**GitHub vous donne alors les commandes pour pousser votre code:**

```bash
# Si vous avez déjà un dépôt local (cas de FleetTrack)
git remote add origin git@github.com:loicKonan123/FleetTrack.git
git branch -M main
git push -u origin main
```

**Méthode 2: Via GitHub CLI (gh)**

```bash
# Installer GitHub CLI
# Windows: winget install --id GitHub.cli
# macOS: brew install gh
# Linux: voir https://cli.github.com/

# Se connecter
gh auth login

# Créer le dépôt depuis le terminal
cd "C:\Users\konan\Downloads\backend_c#\FleetTrack"
gh repo create FleetTrack --public --source=. --remote=origin --push
```

---

## Les Concepts Fondamentaux de Git

### 1. Repository (Dépôt)

**Définition:** Un dépôt est un espace de stockage pour votre projet contenant tous les fichiers et l'historique complet des modifications.

**Types:**
- **Local Repository:** Sur votre machine
- **Remote Repository:** Sur GitHub (ou autre serveur)

**Initialiser un nouveau dépôt:**
```bash
# Créer un nouveau dépôt dans le dossier actuel
git init

# Résultat: Crée un dossier caché .git/
```

**Cloner un dépôt existant:**
```bash
# Cloner depuis GitHub
git clone git@github.com:loicKonan123/FleetTrack.git

# Cloner dans un dossier spécifique
git clone git@github.com:loicKonan123/FleetTrack.git mon-dossier
```

### 2. Commit

**Définition:** Un commit est un instantané (snapshot) de votre projet à un moment précis.

**Anatomie d'un commit:**
```
commit 486973c1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7
Author: Loic Konan <loic.konan@example.com>
Date:   Sat Dec 21 10:30:00 2025 +0100

    Add complete FleetTrack API with tests and CI/CD pipeline

    - Implemented Clean Architecture with 4 layers
    - Added 60 unit tests with 100% pass rate
    - Added 22 integration tests
    - Configured GitHub Actions CI/CD pipeline
    - Created test execution scripts (PowerShell and Bash)
    - Added comprehensive documentation
```

**Créer un commit:**
```bash
# Ajouter des fichiers au staging
git add VehicleService.cs VehicleServiceTests.cs

# Ou ajouter tous les fichiers modifiés
git add .

# Créer le commit
git commit -m "Add vehicle maintenance scheduling feature"

# Commit avec description détaillée
git commit -m "Add vehicle maintenance scheduling feature" -m "This feature allows scheduling preventive maintenance for vehicles based on mileage and time intervals."
```

**Bonnes pratiques pour les messages de commit:**

✅ **BON:**
```bash
git commit -m "Fix vehicle status update after mission completion"
git commit -m "Add driver license expiry validation"
git commit -m "Refactor MissionService to use repository pattern"
```

❌ **MAUVAIS:**
```bash
git commit -m "fix"
git commit -m "changes"
git commit -m "wip"  # Work In Progress
git commit -m "asdfasdf"
```

**Format recommandé (Conventional Commits):**
```bash
git commit -m "feat: add vehicle maintenance scheduling"
git commit -m "fix: correct vehicle status update logic"
git commit -m "docs: update README with setup instructions"
git commit -m "test: add integration tests for driver endpoints"
git commit -m "refactor: simplify mission validation logic"
git commit -m "chore: update dependencies to latest versions"
```

### 3. Branch (Branche)

**Définition:** Une branche est une ligne de développement indépendante permettant de travailler sur des fonctionnalités sans affecter le code principal.

**Visualisation:**
```
main:     A --- B --- C --- F --- G
                   \             /
feature/X:          D --- E -----
```

**Commandes de branche:**
```bash
# Voir toutes les branches
git branch

# Créer une nouvelle branche
git branch feature/vehicle-maintenance

# Créer et basculer vers une nouvelle branche (recommandé)
git checkout -b feature/vehicle-maintenance

# Ou avec la commande moderne
git switch -c feature/vehicle-maintenance

# Basculer vers une branche existante
git checkout main
git switch main

# Supprimer une branche locale
git branch -d feature/vehicle-maintenance

# Supprimer une branche distante
git push origin --delete feature/vehicle-maintenance
```

**Workflow typique avec branches:**
```bash
# 1. Créer une branche pour une nouvelle fonctionnalité
git checkout -b feature/driver-notifications

# 2. Faire des modifications
# ... éditer des fichiers ...

# 3. Committer les changements
git add .
git commit -m "feat: add driver notification system"

# 4. Pousser la branche vers GitHub
git push -u origin feature/driver-notifications

# 5. Créer une Pull Request sur GitHub

# 6. Après fusion, revenir à main et mettre à jour
git checkout main
git pull origin main

# 7. Supprimer la branche locale
git branch -d feature/driver-notifications
```

### 4. Merge (Fusion)

**Définition:** Fusionner combine les modifications de deux branches.

**Types de merge:**

**Fast-Forward Merge (fusion simple):**
```
Avant:
main:     A --- B --- C
                   \
feature:            D --- E

Après (git merge feature):
main:     A --- B --- C --- D --- E
```

```bash
git checkout main
git merge feature/driver-notifications
```

**Three-Way Merge (fusion avec commit de merge):**
```
Avant:
main:     A --- B --- C --- F
                   \
feature:            D --- E

Après (git merge feature):
main:     A --- B --- C --- F --- M
                   \             /
feature:            D --- E -----
```

**Résolution de conflits:**

Parfois, Git ne peut pas fusionner automatiquement:

```bash
git merge feature/vehicle-maintenance

# Résultat:
Auto-merging VehicleService.cs
CONFLICT (content): Merge conflict in VehicleService.cs
Automatic merge failed; fix conflicts and then commit the result.
```

Le fichier contiendra des marqueurs de conflit:
```csharp
public async Task<Vehicle> GetByIdAsync(Guid id)
{
<<<<<<< HEAD
    // Version dans main
    var vehicle = await _repository.GetByIdAsync(id);
    if (vehicle == null)
        throw new NotFoundException($"Vehicle with ID {id} not found");
=======
    // Version dans feature/vehicle-maintenance
    var vehicle = await _repository.GetByIdWithMaintenanceAsync(id);
    if (vehicle == null || vehicle.IsDeleted)
        throw new NotFoundException($"Vehicle not found");
>>>>>>> feature/vehicle-maintenance
    return vehicle;
}
```

**Résoudre le conflit:**
1. Éditer le fichier manuellement
2. Choisir quelle version garder (ou combiner les deux)
3. Supprimer les marqueurs `<<<<<<<`, `=======`, `>>>>>>>`
4. Sauvegarder le fichier

```csharp
public async Task<Vehicle> GetByIdAsync(Guid id)
{
    // Version finale après résolution
    var vehicle = await _repository.GetByIdWithMaintenanceAsync(id);
    if (vehicle == null || vehicle.IsDeleted)
        throw new NotFoundException($"Vehicle with ID {id} not found");
    return vehicle;
}
```

5. Marquer comme résolu et committer:
```bash
git add VehicleService.cs
git commit -m "Merge feature/vehicle-maintenance into main"
```

### 5. Remote (Dépôt distant)

**Définition:** Un remote est une référence vers un dépôt hébergé sur un serveur (généralement GitHub).

**Commandes remote:**
```bash
# Voir les remotes configurés
git remote -v

# Résultat:
origin  git@github.com:loicKonan123/FleetTrack.git (fetch)
origin  git@github.com:loicKonan123/FleetTrack.git (push)

# Ajouter un remote
git remote add origin git@github.com:loicKonan123/FleetTrack.git

# Renommer un remote
git remote rename origin upstream

# Supprimer un remote
git remote remove origin

# Changer l'URL d'un remote
git remote set-url origin git@github.com:nouveau-nom/FleetTrack.git
```

**Workflow avec remote:**
```bash
# Récupérer les changements (sans fusionner)
git fetch origin

# Récupérer et fusionner en une commande
git pull origin main

# Pousser vers le remote
git push origin main

# Pousser une nouvelle branche
git push -u origin feature/vehicle-maintenance

# -u crée le lien de suivi (tracking)
# Après ça, vous pouvez juste faire: git push
```

### 6. Stage (Zone de transit)

**Définition:** Le staging area est une zone intermédiaire où vous préparez les fichiers avant de les committer.

**Workflow Git complet:**
```
Working Directory → Staging Area → Repository
     (add)              (commit)

Fichiers modifiés → Fichiers préparés → Commit permanent
```

**Commandes staging:**
```bash
# Voir l'état des fichiers
git status

# Résultat:
On branch main
Changes not staged for commit:
  modified:   VehicleService.cs
  modified:   DriverService.cs
Untracked files:
  MissionService.cs

# Ajouter un fichier spécifique au staging
git add VehicleService.cs

# Ajouter tous les fichiers modifiés
git add .

# Ajouter seulement les fichiers .cs
git add *.cs

# Retirer un fichier du staging (ne supprime pas les modifications)
git restore --staged VehicleService.cs

# Voir les différences (non staged)
git diff

# Voir les différences staged
git diff --staged
```

**Exemple de workflow:**
```bash
# 1. Modifier des fichiers
# VehicleService.cs, DriverService.cs, MissionService.cs

# 2. Vérifier l'état
git status

# 3. Ajouter seulement les fichiers prêts
git add VehicleService.cs DriverService.cs

# 4. Committer
git commit -m "feat: add vehicle and driver management features"

# 5. Ajouter le reste plus tard
git add MissionService.cs
git commit -m "feat: add mission management feature"
```

### 7. .gitignore

**Définition:** Fichier qui spécifie quels fichiers/dossiers Git doit ignorer.

**Contenu du .gitignore de FleetTrack:**
```gitignore
# .NET
bin/
obj/
*.user
*.suo
*.cache
*.log
.vs/
.vscode/

# Test Results
TestResults/
*.trx
coverage.*.xml

# Database
*.db
*.db-shm
*.db-wal

# OS
.DS_Store
Thumbs.db
```

**Pourquoi ignorer certains fichiers?**

❌ **Ne JAMAIS committer:**
- Fichiers de build (`bin/`, `obj/`)
- Dépendances (`node_modules/`, `packages/`)
- Fichiers de configuration IDE (`.vs/`, `.vscode/settings.json`)
- Secrets (`.env`, `appsettings.Development.json` avec mots de passe)
- Fichiers temporaires (`*.tmp`, `*.log`)
- Bases de données locales (`*.db`)

✅ **TOUJOURS committer:**
- Code source (`.cs`, `.js`, `.py`)
- Configuration (`.csproj`, `package.json`, `requirements.txt`)
- Documentation (`.md`, `README`)
- Scripts (`run-tests.sh`, `deploy.sh`)
- Tests (`*Tests.cs`)

**Ajouter un fichier déjà tracké au .gitignore:**
```bash
# 1. Ajouter au .gitignore
echo "appsettings.Development.json" >> .gitignore

# 2. Retirer du tracking (mais garder le fichier local)
git rm --cached appsettings.Development.json

# 3. Committer
git commit -m "chore: stop tracking appsettings.Development.json"
```

---

## Travailler avec GitHub - Guide Pratique

### 1. Pousser FleetTrack vers GitHub

**Prérequis:**
- Git installé et configuré
- Compte GitHub créé
- SSH configuré
- Dépôt GitHub créé (https://github.com/loicKonan123/FleetTrack.git)

**Étapes:**

```bash
# 1. Naviguer vers le projet
cd "C:\Users\konan\Downloads\backend_c#"

# 2. Vérifier que Git est initialisé
git status

# Si pas initialisé:
git init

# 3. Vérifier les fichiers à committer
git status

# 4. Ajouter tous les fichiers (si pas déjà fait)
git add .

# 5. Créer le commit initial (si pas déjà fait)
git commit -m "feat: initial commit - FleetTrack API with tests and CI/CD

- Implemented Clean Architecture with Domain, Application, Infrastructure, and API layers
- Added 60 unit tests with 100% pass rate using xUnit, Moq, and FluentAssertions
- Added 22 integration tests using WebApplicationFactory
- Configured GitHub Actions CI/CD pipeline with automated testing
- Created cross-platform test execution scripts (PowerShell and Bash)
- Added comprehensive documentation (TESTS_GUIDE.md)
- Configured .gitignore for .NET projects
- Set up Entity Framework Core with SQLite"

# 6. Ajouter le remote GitHub
git remote add origin git@github.com:loicKonan123/FleetTrack.git

# Vérifier
git remote -v

# 7. Renommer la branche en 'main' (si nécessaire)
git branch -M main

# 8. Pousser vers GitHub
git push -u origin main

# Résultat attendu:
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (150/150), 45.2 KiB | 2.5 MiB/s, done.
Total 150 (delta 25), reused 0 (delta 0)
To github.com:loicKonan123/FleetTrack.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**Vérification:**
1. Allez sur https://github.com/loicKonan123/FleetTrack
2. Vous devriez voir tous vos fichiers
3. Le fichier README.md (si présent) s'affiche automatiquement
4. L'onglet "Actions" montre le pipeline CI/CD en cours

### 2. Workflow Quotidien de Développement

**Scénario: Ajouter une nouvelle fonctionnalité**

```bash
# Jour 1: Commencer une nouvelle fonctionnalité

# 1. Mettre à jour main avec les derniers changements
git checkout main
git pull origin main

# 2. Créer une branche pour la fonctionnalité
git checkout -b feature/vehicle-fuel-tracking

# 3. Faire des modifications
# ... éditer VehicleService.cs, ajouter FuelLog.cs, etc. ...

# 4. Vérifier les changements
git status
git diff

# 5. Tester localement
dotnet test

# 6. Committer
git add .
git commit -m "feat: add fuel consumption tracking for vehicles

- Added FuelLog entity to track fuel refills
- Added GetFuelHistoryAsync method to VehicleService
- Added 5 new unit tests for fuel tracking
- Updated Vehicle entity with FuelLogs navigation property"

# 7. Pousser vers GitHub
git push -u origin feature/vehicle-fuel-tracking

# Jour 2-3: Continuer le développement

# 1. Faire plus de modifications
# ... continuer à coder ...

# 2. Committer régulièrement
git add .
git commit -m "feat: add fuel efficiency calculation"

git push  # Plus besoin de -u, le lien de suivi existe déjà

# Jour 4: Finaliser et merger

# 1. Mettre à jour avec main (au cas où d'autres ont pushé)
git checkout main
git pull origin main
git checkout feature/vehicle-fuel-tracking
git merge main

# Résoudre les conflits si nécessaire

# 2. Pousser la version finale
git push

# 3. Créer une Pull Request sur GitHub (voir section suivante)
```

### 3. Pull Requests (PR)

**Définition:** Une Pull Request est une demande de fusion de votre branche vers une autre (généralement main).

**Créer une Pull Request:**

**Méthode 1: Via l'interface GitHub**

1. Allez sur https://github.com/loicKonan123/FleetTrack
2. GitHub affiche automatiquement: "feature/vehicle-fuel-tracking had recent pushes. Compare & pull request"
3. Cliquez sur "Compare & pull request"
4. Remplissez le formulaire:

```markdown
Titre: Add fuel consumption tracking for vehicles

Description:

## Summary
This PR adds comprehensive fuel tracking functionality to the FleetTrack system.

## Changes
- ✅ Added FuelLog entity to Domain layer
- ✅ Added fuel tracking methods to VehicleService
- ✅ Implemented fuel efficiency calculation
- ✅ Added 5 new unit tests (100% coverage)
- ✅ Updated Vehicle entity with navigation property

## Test Plan
- [x] All unit tests pass (65/65)
- [x] Manual testing with sample data
- [x] Fuel efficiency calculation verified

## Screenshots
[Attach screenshots if relevant]

## Breaking Changes
None

## Related Issues
Closes #15
```

5. Assignez des reviewers (collègues)
6. Ajoutez des labels: `enhancement`, `feature`
7. Cliquez "Create pull request"

**Méthode 2: Via GitHub CLI**

```bash
# Créer une PR depuis le terminal
gh pr create --title "Add fuel consumption tracking" \
             --body "Implements fuel tracking with comprehensive tests" \
             --base main \
             --head feature/vehicle-fuel-tracking
```

**Processus de Review:**

1. **Review du code:**
   - Les reviewers examinent chaque ligne modifiée
   - Commentent les suggestions d'amélioration
   - Approuvent ou demandent des changements

2. **Intégration Continue:**
   - GitHub Actions exécute automatiquement les tests
   - Le merge est bloqué si les tests échouent
   - Rapport de couverture de code généré

3. **Modifications demandées:**
```bash
# Faire les modifications demandées
# ... éditer les fichiers ...

git add .
git commit -m "fix: address review comments"
git push

# La PR se met à jour automatiquement!
```

4. **Fusion:**
   - Après approbation, cliquez "Merge pull request"
   - Choisissez le type de merge:
     - **Merge commit:** Crée un commit de merge (historique complet)
     - **Squash and merge:** Combine tous les commits en un seul (historique propre)
     - **Rebase and merge:** Réapplique les commits sur main (historique linéaire)

5. **Nettoyage:**
```bash
# Après fusion, retourner à main
git checkout main
git pull origin main

# Supprimer la branche locale
git branch -d feature/vehicle-fuel-tracking

# Supprimer la branche distante (si GitHub ne l'a pas fait automatiquement)
git push origin --delete feature/vehicle-fuel-tracking
```

### 4. Issues (Gestion des tâches et bugs)

**Créer une issue:**

1. Allez sur l'onglet "Issues"
2. Cliquez "New issue"
3. Remplissez:

```markdown
Titre: Vehicle status not updating after mission completion

Labels: bug, high-priority
Assignee: @loicKonan123
Milestone: v1.2.0

Description:

## Bug Description
When a mission is marked as completed, the vehicle status remains "InMission" instead of changing to "Available".

## Steps to Reproduce
1. Create a vehicle with status "Available"
2. Assign it to a mission
3. Complete the mission via PUT /api/missions/{id}/complete
4. Check vehicle status - still shows "InMission"

## Expected Behavior
Vehicle status should automatically change to "Available" when mission is completed.

## Actual Behavior
Vehicle status remains "InMission".

## Environment
- .NET 8.0
- FleetTrack v1.1.0
- Database: SQLite

## Possible Solution
MissionService.CompleteAsync should update the vehicle status:
```csharp
mission.Vehicle.Status = VehicleStatus.Available;
await _unitOfWork.SaveChangesAsync();
```

## Related Code
[MissionService.cs:245](FleetTrack/src/FleetTrack.Application/Services/MissionService.cs#L245)
```

4. Cliquez "Submit new issue"

**Utiliser les issues dans les commits:**
```bash
# Lier un commit à une issue
git commit -m "fix: update vehicle status on mission completion

This fixes the bug where vehicles remained in 'InMission' status
after completing a mission.

Fixes #23"

# Après merge, l'issue #23 se fermera automatiquement!
```

**Labels communs:**
- `bug` - Problème à corriger
- `enhancement` - Amélioration d'une fonctionnalité existante
- `feature` - Nouvelle fonctionnalité
- `documentation` - Amélioration de la documentation
- `help wanted` - Besoin d'aide de la communauté
- `good first issue` - Bon pour les débutants
- `wontfix` - Ne sera pas corrigé
- `duplicate` - Issue dupliquée

### 5. Projects (Tableaux Kanban)

**Créer un projet:**

1. Allez sur l'onglet "Projects"
2. Cliquez "New project"
3. Choisissez le template "Board"
4. Nommez: "FleetTrack v1.2.0"

**Colonnes typiques:**
```
📋 Backlog          | 🔜 To Do       | 🏃 In Progress        | 👀 Review      | ✅ Done
--------------------|----------------|----------------------|----------------|------------------
Issue #30           | Issue #23      | Issue #25 (@dev-A)   | PR #28         | Issue #22 ✅
Issue #31           | Issue #24      | Issue #26 (@dev-B)   | PR #29         | Issue #21 ✅
Feature Request #5  | Issue #27      |                      |                | Issue #20 ✅
```

**Automatisation:**
- Issue créée → automatiquement dans "Backlog"
- PR ouverte → automatiquement dans "Review"
- PR fusionnée → automatiquement dans "Done"

### 6. Wiki

**Créer une documentation extensive:**

1. Allez sur l'onglet "Wiki"
2. Cliquez "Create the first page"
3. Créez des pages comme:

```
Home
├── Getting Started
│   ├── Installation
│   ├── Configuration
│   └── First Steps
├── Architecture
│   ├── Clean Architecture Overview
│   ├── Domain Layer
│   ├── Application Layer
│   ├── Infrastructure Layer
│   └── API Layer
├── API Documentation
│   ├── Vehicles Endpoints
│   ├── Drivers Endpoints
│   └── Missions Endpoints
└── Contributing
    ├── Code Style Guide
    ├── Testing Guidelines
    └── Pull Request Process
```

### 7. Releases (Versions)

**Créer une release:**

1. Allez sur "Releases"
2. Cliquez "Draft a new release"
3. Remplissez:

```markdown
Tag version: v1.2.0
Release title: FleetTrack v1.2.0 - Fuel Tracking

Description:

## 🎉 What's New

### Features
- ✨ Fuel consumption tracking
- ✨ Fuel efficiency calculations
- ✨ Fuel refill history

### Improvements
- ⚡ Improved mission assignment performance (30% faster)
- 🐛 Fixed vehicle status update bug (#23)
- 📝 Enhanced API documentation

### Tests
- Added 12 new unit tests
- Improved code coverage to 85%

## 📦 Installation

```bash
docker pull loickonan123/fleettrack:v1.2.0
```

## 📚 Documentation
See [CHANGELOG.md](CHANGELOG.md) for detailed changes.

## 🙏 Contributors
- @loicKonan123
- @contributor2

## 🔗 Full Changelog
[v1.1.0...v1.2.0](https://github.com/loicKonan123/FleetTrack/compare/v1.1.0...v1.2.0)
```

4. Attachez des binaires (si applicable):
   - `FleetTrack-v1.2.0-win-x64.zip`
   - `FleetTrack-v1.2.0-linux-x64.tar.gz`
   - `FleetTrack-v1.2.0-osx-x64.tar.gz`

5. Cliquez "Publish release"

**Tagging:**
```bash
# Créer un tag localement
git tag -a v1.2.0 -m "Release version 1.2.0 - Fuel tracking"

# Pousser le tag
git push origin v1.2.0

# Pousser tous les tags
git push --tags
```

---

## GitHub Actions et CI/CD

### Comprendre le Pipeline FleetTrack

Le fichier [.github/workflows/dotnet-ci.yml](.github/workflows/dotnet-ci.yml) automatise le processus de build et de test.

**Structure du fichier:**

```yaml
name: .NET CI/CD Pipeline

# Déclencheurs: quand exécuter le pipeline
on:
  push:
    branches: [ main, develop ]      # À chaque push sur main ou develop
  pull_request:
    branches: [ main, develop ]      # À chaque PR vers main ou develop

jobs:
  # Job 1: Build et tests
  build-and-test:
    name: Build and Test
    runs-on: ubuntu-latest           # Environnement d'exécution

    steps:
    # Étape 1: Récupérer le code
    - name: Checkout code
      uses: actions/checkout@v4

    # Étape 2: Installer .NET 8.0
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: '8.0.x'

    # Étape 3: Restaurer les dépendances NuGet
    - name: Restore dependencies
      run: dotnet restore FleetTrack/FleetTrack.sln

    # Étape 4: Compiler en mode Release
    - name: Build solution
      run: dotnet build FleetTrack/FleetTrack.sln --configuration Release --no-restore

    # Étape 5: Exécuter les tests unitaires
    - name: Run Unit Tests
      run: dotnet test FleetTrack/tests/FleetTrack.UnitTests/FleetTrack.UnitTests.csproj \
           --configuration Release \
           --no-build \
           --verbosity normal \
           --logger "trx;LogFileName=unit-tests.trx" \
           --collect:"XPlat Code Coverage"

    # Étape 6: Exécuter les tests d'intégration
    - name: Run Integration Tests
      run: dotnet test FleetTrack/tests/FleetTrack.IntegrationTests/FleetTrack.IntegrationTests.csproj \
           --configuration Release \
           --no-build \
           --verbosity normal \
           --logger "trx;LogFileName=integration-tests.trx"

    # Étape 7: Uploader les résultats de tests
    - name: Upload Test Results
      uses: actions/upload-artifact@v4
      if: always()                   # Exécuter même si les tests échouent
      with:
        name: test-results
        path: |
          **/TestResults/*.trx
          **/TestResults/**/coverage.cobertura.xml

    # Étape 8: Publier un rapport de tests
    - name: Publish Test Report
      uses: dorny/test-reporter@v1
      if: always()
      with:
        name: Test Results
        path: '**/TestResults/*.trx'
        reporter: dotnet-trx

    # Étape 9: Envoyer la couverture de code à Codecov
    - name: Code Coverage Report
      uses: codecov/codecov-action@v4
      if: always()
      with:
        files: '**/TestResults/**/coverage.cobertura.xml'
        fail_ci_if_error: false

  # Job 2: Build Docker (seulement sur main)
  build-docker:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: build-and-test            # Exécuter seulement si build-and-test réussit
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Build Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./FleetTrack
        file: ./FleetTrack/src/FleetTrack.API/Dockerfile
        push: false                  # Ne pas pousser vers un registry (pour l'instant)
        tags: fleettrack-api:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

### Visualiser l'Exécution du Pipeline

**Après avoir poussé vers GitHub:**

1. Allez sur https://github.com/loicKonan123/FleetTrack/actions
2. Vous verrez l'exécution en cours:

```
.NET CI/CD Pipeline #1
✅ build-and-test (3m 24s)
   ✅ Checkout code (2s)
   ✅ Setup .NET (15s)
   ✅ Restore dependencies (45s)
   ✅ Build solution (1m 20s)
   ✅ Run Unit Tests (35s) - 60 passed
   ✅ Run Integration Tests (25s) - 22 passed
   ✅ Upload Test Results (3s)
   ✅ Publish Test Report (2s)
   ✅ Code Coverage Report (2s)

✅ build-docker (1m 45s)
   ✅ Checkout code (2s)
   ✅ Set up Docker Buildx (10s)
   ✅ Build Docker image (1m 33s)
```

3. Cliquez sur une étape pour voir les logs détaillés
4. Téléchargez les artifacts (rapports de tests)

**Si une étape échoue:**

```
❌ .NET CI/CD Pipeline #2 - Failed
✅ build-and-test
   ✅ Checkout code (2s)
   ✅ Setup .NET (15s)
   ✅ Restore dependencies (45s)
   ✅ Build solution (1m 20s)
   ❌ Run Unit Tests (12s) - 58 passed, 2 failed

Error: Test Failed - Expected 5, but was 4
FleetTrack.UnitTests.VehicleServiceTests.GetAvailableAsync_ShouldReturnOnlyAvailableVehicles
```

**GitHub envoie automatiquement:**
- Email de notification
- Notification GitHub
- Badge de statut sur le README

### Badges de Statut

**Ajouter un badge au README.md:**

```markdown
# FleetTrack

![.NET CI/CD](https://github.com/loicKonan123/FleetTrack/actions/workflows/dotnet-ci.yml/badge.svg)
![Code Coverage](https://codecov.io/gh/loicKonan123/FleetTrack/branch/main/graph/badge.svg)
![License](https://img.shields.io/github/license/loicKonan123/FleetTrack)
![Version](https://img.shields.io/github/v/release/loicKonan123/FleetTrack)

Fleet management system with .NET 8.0 and Clean Architecture.

## Features
...
```

**Résultat visuel:**
- Badge vert ✅ si tous les tests passent
- Badge rouge ❌ si des tests échouent
- Badge de couverture de code (ex: 85%)

### Workflows Avancés

**Exemple: Déploiement automatique en production**

```yaml
name: Deploy to Production

on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'fleettrack-api'
        publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
        package: ./publish
```

**Exemple: Tests de charge avec k6**

```yaml
name: Performance Tests

on:
  pull_request:
    branches: [ main ]

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Run k6 load test
      uses: grafana/k6-action@v0.3.0
      with:
        filename: tests/load-test.js
        flags: --vus 100 --duration 30s
```

**Exemple: Notifications Slack**

```yaml
- name: Notify Slack on Failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "❌ Build failed on ${{ github.repository }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Build #${{ github.run_number }} failed\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Details>"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Secrets et Variables d'Environnement

**Stocker des secrets sensibles:**

1. Allez sur Settings → Secrets and variables → Actions
2. Cliquez "New repository secret"
3. Ajoutez:
   - `AZURE_PUBLISH_PROFILE`
   - `DATABASE_CONNECTION_STRING`
   - `API_KEY`
   - `SLACK_WEBHOOK_URL`

**Utiliser dans le workflow:**
```yaml
- name: Deploy
  env:
    CONNECTION_STRING: ${{ secrets.DATABASE_CONNECTION_STRING }}
    API_KEY: ${{ secrets.API_KEY }}
  run: |
    dotnet ef database update --connection "$CONNECTION_STRING"
```

**⚠️ IMPORTANT:** Ne JAMAIS committer de secrets dans le code!

---

## Fonctionnalités Avancées de GitHub

### 1. GitHub Pages - Héberger de la Documentation

**Créer un site de documentation:**

1. Créez un dossier `docs/` avec un fichier `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>FleetTrack Documentation</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>FleetTrack API Documentation</h1>
    <nav>
        <a href="#getting-started">Getting Started</a>
        <a href="#api">API Reference</a>
        <a href="#examples">Examples</a>
    </nav>

    <section id="getting-started">
        <h2>Getting Started</h2>
        <p>FleetTrack is a comprehensive fleet management system...</p>
    </section>

    <!-- ... -->
</body>
</html>
```

2. Activez GitHub Pages:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: /docs
   - Save

3. Votre site sera disponible sur:
   `https://loickonan123.github.io/FleetTrack/`

**Ou utilisez un générateur comme MkDocs:**

```bash
# Installer MkDocs
pip install mkdocs mkdocs-material

# Créer la structure
mkdocs new .

# Structure créée:
docs/
├── index.md
└── ...
mkdocs.yml

# Configuration mkdocs.yml
site_name: FleetTrack Documentation
theme:
  name: material
  palette:
    primary: indigo

# Déployer sur GitHub Pages
mkdocs gh-deploy
```

### 2. GitHub Discussions - Forum Communautaire

**Activer les Discussions:**
1. Settings → Features → ☑️ Discussions
2. Créez des catégories:
   - 💬 General
   - 💡 Ideas
   - 🙏 Q&A
   - 📣 Announcements

**Exemple de discussion:**
```
Catégorie: Ideas
Titre: Add real-time GPS tracking on map

Description:
It would be great to have a real-time map view showing all vehicles'
current positions with WebSockets.

Features:
- Live position updates
- Vehicle clustering on zoom out
- Click vehicle for details
- Route history playback

What do you think? Would this be useful?

👍 12   ❤️ 5   🚀 3
```

### 3. GitHub Sponsors - Financement

**Activer les Sponsors:**
1. Créez un fichier `.github/FUNDING.yml`:

```yaml
github: loicKonan123
patreon: loickonan
ko_fi: loickonan
custom: ["https://paypal.me/loickonan"]
```

2. Apparaît comme un bouton "Sponsor" sur votre dépôt
3. Les utilisateurs peuvent vous soutenir financièrement

### 4. Security - Sécurité

**Dependabot - Mises à jour automatiques:**

1. Créez `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # .NET dependencies
  - package-ecosystem: "nuget"
    directory: "/FleetTrack"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

2. Dependabot créera automatiquement des PRs pour mettre à jour:
   - Entity Framework Core 8.0.0 → 8.0.1
   - xUnit 2.5.3 → 2.6.0
   - etc.

**Security Advisories - Alertes de vulnérabilités:**

GitHub vous alerte automatiquement si une dépendance a une vulnérabilité connue:

```
🚨 Security Alert

Vulnerability found in: Newtonsoft.Json 12.0.1
Severity: High
CVE-2024-12345

Recommendation: Upgrade to version 13.0.2 or later

[Create Dependabot security update]
```

**Code Scanning - Analyse de code:**

```yaml
# .github/workflows/codeql-analysis.yml
name: "CodeQL"

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 1'  # Tous les lundis

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: csharp

    - name: Autobuild
      uses: github/codeql-action/autobuild@v2

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
```

**Secret Scanning - Détection de secrets:**

GitHub détecte automatiquement si vous commettez accidentellement:
- Clés API
- Tokens d'accès
- Mots de passe
- Certificats privés

```
🚨 Secret detected in commit abc123

Type: AWS Access Key
File: appsettings.json
Line: 15

This secret has been revoked by GitHub.
Please rotate your credentials immediately.
```

### 5. GitHub Codespaces - IDE dans le Cloud

**Lancer un Codespace:**
1. Cliquez sur "Code" → "Codespaces" → "Create codespace on main"
2. VS Code s'ouvre dans votre navigateur
3. Environnement complet prêt à coder:
   - .NET 8.0 pré-installé
   - Extensions configurées
   - Git configuré
   - Terminal intégré

**Configuration personnalisée:**

Créez `.devcontainer/devcontainer.json`:

```json
{
  "name": "FleetTrack Dev Environment",
  "image": "mcr.microsoft.com/devcontainers/dotnet:8.0",

  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },

  "customizations": {
    "vscode": {
      "extensions": [
        "ms-dotnettools.csharp",
        "ms-dotnettools.csdevkit",
        "ms-azuretools.vscode-docker",
        "eamodio.gitlens"
      ],
      "settings": {
        "terminal.integrated.defaultProfile.linux": "bash"
      }
    }
  },

  "postCreateCommand": "dotnet restore FleetTrack/FleetTrack.sln",

  "forwardPorts": [5000, 5001]
}
```

**Avantages:**
- Pas besoin d'installer quoi que ce soit localement
- Même environnement pour toute l'équipe
- Puissance de calcul du cloud
- Accessible depuis n'importe quel appareil

### 6. Branch Protection Rules - Règles de Protection

**Protéger la branche main:**

1. Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. Activez:

```
☑️ Require a pull request before merging
   ☑️ Require approvals (2)
   ☑️ Dismiss stale pull request approvals when new commits are pushed
   ☑️ Require review from Code Owners

☑️ Require status checks to pass before merging
   ☑️ Require branches to be up to date before merging
   Status checks:
   - build-and-test
   - unit-tests
   - integration-tests

☑️ Require conversation resolution before merging

☑️ Require signed commits

☑️ Include administrators

☑️ Restrict who can push to matching branches
   - @senior-developers
   - @team-leads
```

**Résultat:**
- Impossible de pousser directement sur main
- Tous les changements doivent passer par une PR
- PR doit être approuvée par 2 personnes
- Tous les tests doivent passer
- Tous les commentaires doivent être résolus

### 7. CODEOWNERS - Propriété de Code

**Créer `.github/CODEOWNERS`:**

```
# FleetTrack Code Owners

# Global owner
* @loicKonan123

# Domain layer - Senior architects only
/FleetTrack/src/FleetTrack.Domain/ @senior-architect @loicKonan123

# Application layer - Backend team
/FleetTrack/src/FleetTrack.Application/ @backend-team

# Infrastructure - DevOps team
/FleetTrack/src/FleetTrack.Infrastructure/ @backend-team @devops-team

# API - Full-stack team
/FleetTrack/src/FleetTrack.API/ @fullstack-team

# Tests - Everyone
/FleetTrack/tests/ @backend-team

# CI/CD - DevOps only
/.github/workflows/ @devops-team @loicKonan123

# Documentation - Technical writers
*.md @tech-writers @loicKonan123
```

**Effet:**
- Chaque PR modifiant `Domain/` doit être approuvée par `@senior-architect`
- Modifications de `.github/workflows/` nécessitent approbation de `@devops-team`
- Automatise l'assignation de reviewers

### 8. GitHub CLI (gh) - GitHub en Ligne de Commande

**Commandes utiles:**

```bash
# Se connecter
gh auth login

# Créer un dépôt
gh repo create FleetTrack --public --source=. --remote=origin --push

# Lister les PRs
gh pr list

# Créer une PR
gh pr create --title "Add fuel tracking" --body "Implements fuel tracking feature"

# Voir une PR
gh pr view 42

# Approuver une PR
gh pr review 42 --approve --body "LGTM!"

# Merger une PR
gh pr merge 42 --squash

# Créer une issue
gh issue create --title "Bug in vehicle status" --body "Status not updating" --label bug

# Lister les issues
gh issue list --label bug --state open

# Voir les workflows
gh workflow list

# Exécuter un workflow manuellement
gh workflow run dotnet-ci.yml

# Voir les runs
gh run list

# Voir les logs d'un run
gh run view 12345 --log

# Cloner un dépôt
gh repo clone loicKonan123/FleetTrack
```

---

## Bonnes Pratiques et Workflows

### 1. Git Flow - Workflow Professionnel

**Structure de branches:**

```
main            Production-ready code
│
├── develop     Integration branch
│   │
│   ├── feature/vehicle-tracking
│   ├── feature/driver-notifications
│   └── feature/fuel-management
│
├── release/v1.2.0    Release preparation
│
└── hotfix/critical-bug    Emergency fixes
```

**Workflow:**

```bash
# 1. Nouvelle fonctionnalité
git checkout develop
git checkout -b feature/vehicle-tracking

# ... développement ...

git push -u origin feature/vehicle-tracking
# Créer PR vers develop

# 2. Préparer une release
git checkout develop
git checkout -b release/v1.2.0

# Bump version, update CHANGELOG
git commit -m "chore: prepare release v1.2.0"
git push -u origin release/v1.2.0

# PR vers main ET develop

# 3. Hotfix critique
git checkout main
git checkout -b hotfix/critical-security-bug

# ... fix ...

git commit -m "fix: critical security vulnerability"
git push -u origin hotfix/critical-security-bug

# PR vers main ET develop
```

### 2. Conventional Commits

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage (pas de changement de code)
- `refactor:` - Refactorisation
- `test:` - Ajout/modification de tests
- `chore:` - Tâches de maintenance

**Exemples:**

```bash
git commit -m "feat(vehicle): add fuel consumption tracking

Implements comprehensive fuel tracking with:
- FuelLog entity for refill history
- Fuel efficiency calculation
- Consumption reports

Closes #45"

git commit -m "fix(mission): correct vehicle status update

Vehicle status was not being updated to Available
after mission completion.

Fixes #23"

git commit -m "docs(api): add swagger documentation for fuel endpoints"

git commit -m "test(vehicle): add integration tests for fuel tracking"

git commit -m "refactor(service): simplify mission validation logic

Extracted validation into separate methods for better readability."

git commit -m "chore(deps): update Entity Framework to 8.0.1"
```

**Avantages:**
- Historique lisible
- Génération automatique de CHANGELOG
- Semantic versioning automatique
- Meilleure collaboration

### 3. Semantic Versioning

**Format:** `MAJOR.MINOR.PATCH` (ex: `1.2.3`)

- **MAJOR** (1.x.x): Changements incompatibles (breaking changes)
- **MINOR** (x.2.x): Nouvelles fonctionnalités (compatibles)
- **PATCH** (x.x.3): Corrections de bugs

**Exemples:**

```
v1.0.0 → v1.0.1   fix: critical bug
v1.0.1 → v1.1.0   feat: add fuel tracking
v1.1.0 → v2.0.0   BREAKING: change API response format
```

**Préfixes:**
- `v1.2.3` - Version stable
- `v1.2.3-alpha.1` - Version alpha
- `v1.2.3-beta.2` - Version beta
- `v1.2.3-rc.1` - Release Candidate

### 4. Stratégies de Merge

**1. Merge Commit (par défaut):**
```
feature:  A --- B --- C
                       \
main:     D --- E --- F --- M
```
- Préserve l'historique complet
- Montre clairement les branches
- Peut devenir complexe

**2. Squash and Merge:**
```
feature:  A --- B --- C

main:     D --- E --- F --- ABC
```
- Combine tous les commits en un
- Historique propre et linéaire
- Perte des commits intermédiaires

**3. Rebase and Merge:**
```
feature:  A --- B --- C

main:     D --- E --- F --- A' --- B' --- C'
```
- Historique linéaire
- Préserve les commits individuels
- Peut causer des conflits complexes

**Recommandation FleetTrack:**
- **Features:** Squash and merge (historique propre)
- **Hotfixes:** Merge commit (traçabilité)
- **Docs:** Squash and merge

### 5. .gitattributes - Normalisation des Fins de Ligne

**Créer `.gitattributes`:**

```gitattributes
# Auto detect text files and normalize to LF
* text=auto

# C# files
*.cs text diff=csharp

# Scripts
*.sh text eol=lf
*.ps1 text eol=crlf

# Binary files
*.dll binary
*.exe binary
*.png binary
*.jpg binary

# Linguist overrides (pour les statistiques GitHub)
*.sql linguist-detectable=true
*.md linguist-detectable=false
docs/* linguist-documentation
tests/* linguist-vendored
```

**Pourquoi important?**
- Windows utilise CRLF (`\r\n`)
- Linux/Mac utilisent LF (`\n`)
- Sans normalisation → conflits constants

### 6. README Professionnel

**Structure recommandée:**

```markdown
# FleetTrack

![CI/CD](https://github.com/loicKonan123/FleetTrack/workflows/.NET%20CI/badge.svg)
![Coverage](https://codecov.io/gh/loicKonan123/FleetTrack/branch/main/graph/badge.svg)
![License](https://img.shields.io/github/license/loicKonan123/FleetTrack)
![Version](https://img.shields.io/github/v/release/loicKonan123/FleetTrack)

> Fleet management system built with .NET 8.0 and Clean Architecture

[Demo](https://fleettrack-demo.azurewebsites.net) | [Documentation](https://loickonan123.github.io/FleetTrack/) | [API Docs](https://api.fleettrack.io/swagger)

## ✨ Features

- 🚗 **Vehicle Management** - CRUD operations, status tracking, maintenance scheduling
- 👨‍✈️ **Driver Management** - License validation, availability tracking
- 📍 **Mission Management** - Assignment, tracking, completion
- 🛰️ **GPS Tracking** - Real-time position updates
- ⚠️ **Alert System** - Automated notifications
- ⛽ **Fuel Tracking** - Consumption monitoring and efficiency calculations

## 🚀 Quick Start

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Git](https://git-scm.com/)

### Installation

```bash
git clone git@github.com:loicKonan123/FleetTrack.git
cd FleetTrack/FleetTrack
dotnet restore
dotnet run --project src/FleetTrack.API
```

API available at: `https://localhost:5001/swagger`

## 🏗️ Architecture

```
FleetTrack/
├── Domain          # Entities, enums, interfaces
├── Application     # Business logic, services, DTOs
├── Infrastructure  # Data access, EF Core, repositories
└── API             # REST endpoints, controllers
```

Clean Architecture with:
- ✅ Dependency Injection
- ✅ Repository Pattern
- ✅ CQRS principles
- ✅ Domain-Driven Design

## 🧪 Testing

```bash
# All tests
dotnet test

# Unit tests only (60 tests)
./run-tests.ps1 unit

# Integration tests (22 tests)
./run-tests.ps1 integration

# With coverage report
./run-tests.ps1 coverage
```

Coverage: **85%**

## 📚 Documentation

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Architecture Guide](docs/architecture.md)
- [Contributing](CONTRIBUTING.md)
- [Testing Guide](TESTS_GUIDE.md)

## 🛠️ Tech Stack

**Backend:**
- .NET 8.0
- ASP.NET Core Web API
- Entity Framework Core
- SQLite (dev) / PostgreSQL (prod)

**Testing:**
- xUnit
- Moq
- FluentAssertions

**CI/CD:**
- GitHub Actions
- Docker
- Azure App Service

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md).

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 👥 Authors

- **Loic Konan** - [@loicKonan123](https://github.com/loicKonan123)

## 🙏 Acknowledgments

- Inspired by Clean Architecture principles by Robert C. Martin
- Built with ❤️ and .NET 8.0

## 📞 Support

- 📧 Email: loic.konan@example.com
- 💬 Discussions: [GitHub Discussions](https://github.com/loicKonan123/FleetTrack/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/loicKonan123/FleetTrack/issues)

---

⭐ Star this repository if you find it helpful!
```

### 7. CONTRIBUTING.md

**Créer un guide de contribution:**

```markdown
# Contributing to FleetTrack

Thank you for considering contributing to FleetTrack! 🎉

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Environment** (OS, .NET version, etc.)
- **Screenshots** (if applicable)

Template:
```
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: Windows 11
- .NET: 8.0.1
- FleetTrack: v1.2.0
```

### Suggesting Features

Feature requests are welcome! Please provide:

- **Clear use case**
- **Proposed solution**
- **Alternatives considered**

### Pull Requests

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Follow code style**:
   - Use C# naming conventions
   - Add XML documentation to public methods
   - Follow SOLID principles
4. **Write tests**:
   - Unit tests for business logic
   - Integration tests for endpoints
   - Maintain >80% coverage
5. **Update documentation**
6. **Commit** with conventional commits: `feat: add vehicle tracking`
7. **Push**: `git push origin feature/my-feature`
8. **Open a PR** with:
   - Clear title and description
   - Link to related issues
   - Screenshots/GIFs if UI changes

### Code Style

We follow Microsoft's C# Coding Conventions:

```csharp
// ✅ Good
public async Task<Vehicle> GetByIdAsync(Guid id)
{
    var vehicle = await _repository.GetByIdAsync(id);
    if (vehicle == null)
        throw new NotFoundException($"Vehicle with ID {id} not found");

    return vehicle;
}

// ❌ Bad
public async Task<Vehicle> get_vehicle(Guid id){
  var v=await _repository.GetByIdAsync(id);
  if(v==null) throw new NotFoundException($"Vehicle with ID {id} not found");
  return v;
}
```

### Testing Guidelines

Every new feature must include tests:

```csharp
[Fact]
public async Task CreateAsync_ShouldCreateVehicle_WhenValidDataProvided()
{
    // Arrange
    var createDto = new CreateVehicleDto
    {
        RegistrationNumber = "ABC-123",
        Brand = "Toyota",
        Model = "Hilux"
    };

    // Act
    var result = await _service.CreateAsync(createDto);

    // Assert
    result.Should().NotBeNull();
    result.RegistrationNumber.Should().Be("ABC-123");
}
```

### Commit Messages

Use Conventional Commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `chore:` - Maintenance

Examples:
```bash
feat(vehicle): add fuel tracking feature
fix(mission): correct status update logic
docs(api): update swagger documentation
test(driver): add integration tests
```

### Branch Naming

- `feature/vehicle-tracking`
- `fix/status-update-bug`
- `docs/api-reference`
- `test/integration-tests`

## Development Setup

```bash
# Clone your fork
git clone git@github.com:YOUR_USERNAME/FleetTrack.git

# Add upstream remote
git remote add upstream git@github.com:loicKonan123/FleetTrack.git

# Create branch
git checkout -b feature/my-feature

# Keep updated
git fetch upstream
git merge upstream/main
```

## Running Tests

```bash
# All tests
dotnet test

# Specific test
dotnet test --filter "VehicleServiceTests"

# With coverage
./run-tests.ps1 coverage
```

## Questions?

Feel free to:
- Open a [Discussion](https://github.com/loicKonan123/FleetTrack/discussions)
- Ask in the [Issues](https://github.com/loicKonan123/FleetTrack/issues)

Thank you for contributing! 🚀
```

---

## Application Pratique avec FleetTrack

### Scénario Complet: Ajouter une Nouvelle Fonctionnalité

**Objectif:** Ajouter un système de notifications par email pour les alertes.

**Jour 1: Planification**

```bash
# 1. Créer une issue
gh issue create \
  --title "Add email notification system for alerts" \
  --body "Send automatic emails when alerts are triggered" \
  --label enhancement,feature

# Issue #50 créée
```

**Jour 2: Développement**

```bash
# 1. Mettre à jour develop
git checkout develop
git pull origin develop

# 2. Créer une branche
git checkout -b feature/email-notifications

# 3. Implémenter la fonctionnalité
# ... créer EmailService.cs ...
# ... créer IEmailService.cs ...
# ... modifier AlertService.cs ...

# 4. Ajouter des tests
# ... créer EmailServiceTests.cs ...

# 5. Tester localement
dotnet test

# Résultat: 68/68 tests passent ✅

# 6. Committer
git add .
git commit -m "feat(notifications): add email notification system

- Created IEmailService interface
- Implemented EmailService with SMTP support
- Integrated with AlertService
- Added 8 new unit tests
- Updated configuration for email settings

Closes #50"

# 7. Pousser
git push -u origin feature/email-notifications
```

**Jour 3: Code Review**

```bash
# 1. Créer la PR
gh pr create \
  --title "Add email notification system for alerts" \
  --body "Implements automatic email notifications when alerts are triggered.

## Changes
- ✅ IEmailService interface
- ✅ EmailService implementation
- ✅ Integration with AlertService
- ✅ 8 new unit tests (100% coverage)
- ✅ Configuration documentation

## Test Plan
- [x] Unit tests pass
- [x] Integration tests pass
- [x] Manual testing with Gmail SMTP
- [x] Email templates validated

## Screenshots
[Screenshot of email received]

Closes #50" \
  --base develop

# PR #51 créée

# 2. Reviewers commentent
# @senior-dev: "Could you add retry logic for failed emails?"

# 3. Faire les modifications
# ... ajouter retry logic ...

git add .
git commit -m "feat(notifications): add retry logic for failed emails"
git push

# PR mise à jour automatiquement

# 4. Approval
# @senior-dev: "LGTM! ✅"
# @team-lead: "Approved ✅"

# 5. GitHub Actions vérifie
# ✅ build-and-test passed

# 6. Merger
gh pr merge 51 --squash
```

**Jour 4: Release**

```bash
# 1. Créer une branche release
git checkout develop
git pull origin develop
git checkout -b release/v1.3.0

# 2. Mettre à jour la version
# ... modifier FleetTrack.API.csproj ...
# ... mettre à jour CHANGELOG.md ...

git commit -m "chore: prepare release v1.3.0"
git push -u origin release/v1.3.0

# 3. PR vers main
gh pr create \
  --title "Release v1.3.0" \
  --body "Release version 1.3.0 with email notifications" \
  --base main

# 4. Après merge, créer le tag
git checkout main
git pull origin main
git tag -a v1.3.0 -m "Release v1.3.0 - Email Notifications"
git push origin v1.3.0

# 5. Créer la release GitHub
gh release create v1.3.0 \
  --title "FleetTrack v1.3.0 - Email Notifications" \
  --notes "## What's New

- ✨ Email notification system for alerts
- ⚡ Improved alert processing performance
- 🐛 Fixed minor bugs

## Installation
\`\`\`bash
docker pull loickonan123/fleettrack:v1.3.0
\`\`\`

Full changelog: https://github.com/loicKonan123/FleetTrack/blob/main/CHANGELOG.md"

# 6. Merger release dans develop
git checkout develop
git merge main
git push origin develop
```

### Workflow de Collaboration en Équipe

**Équipe:**
- Alice (Backend Developer)
- Bob (DevOps Engineer)
- Charlie (QA Tester)

**Lundi matin - Planification Sprint:**

Alice crée des issues:
```bash
gh issue create --title "Implement vehicle maintenance reminders" --label feature
gh issue create --title "Add driver performance metrics" --label feature
```

**Lundi après-midi - Développement:**

Alice travaille sur les reminders:
```bash
git checkout -b feature/maintenance-reminders
# ... code ...
git push -u origin feature/maintenance-reminders
gh pr create
```

Bob configure le déploiement automatique:
```bash
git checkout -b devops/auto-deploy
# ... modifie .github/workflows/deploy.yml ...
git push -u origin devops/auto-deploy
gh pr create
```

**Mardi - Review:**

Charlie teste la PR d'Alice:
```bash
# Clone la branche
gh pr checkout 55

# Exécute l'API localement
dotnet run

# Teste manuellement
# ... trouve un bug ...

# Commente sur la PR
gh pr comment 55 --body "Bug found: reminder emails sent twice"
```

Alice corrige:
```bash
git checkout feature/maintenance-reminders
# ... fix bug ...
git commit -m "fix: prevent duplicate reminder emails"
git push
```

**Mercredi - Merge et Deploy:**

```bash
# Alice merge sa PR
gh pr merge 55 --squash

# GitHub Actions:
# 1. ✅ Tests
# 2. ✅ Build Docker
# 3. ✅ Deploy to staging
# 4. ✅ Run smoke tests
# 5. ✅ Deploy to production

# Toute l'équipe reçoit une notification Slack:
# "✅ FleetTrack v1.3.1 deployed to production"
```

---

## Commandes Git Essentielles

### Configuration

```bash
# Configuration globale
git config --global user.name "Votre Nom"
git config --global user.email "email@example.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"

# Configuration locale (pour un projet spécifique)
git config user.email "travail@entreprise.com"

# Voir la configuration
git config --list
git config user.name
```

### Initialisation et Clonage

```bash
# Initialiser un nouveau dépôt
git init

# Cloner un dépôt
git clone git@github.com:loicKonan123/FleetTrack.git
git clone https://github.com/loicKonan123/FleetTrack.git
git clone git@github.com:loicKonan123/FleetTrack.git mon-dossier
```

### État et Différences

```bash
# Voir l'état des fichiers
git status
git status -s  # Version courte

# Voir les différences
git diff                    # Non staged
git diff --staged           # Staged
git diff HEAD               # Tous les changements
git diff main..develop      # Entre deux branches
git diff abc123..def456     # Entre deux commits
git diff VehicleService.cs  # Pour un fichier spécifique
```

### Staging et Commits

```bash
# Ajouter au staging
git add fichier.cs
git add .
git add *.cs
git add src/

# Retirer du staging
git restore --staged fichier.cs
git reset HEAD fichier.cs

# Committer
git commit -m "Message"
git commit -m "Titre" -m "Description détaillée"
git commit -a -m "Message"  # Add + commit en une commande (fichiers déjà trackés)

# Modifier le dernier commit
git commit --amend -m "Nouveau message"
git commit --amend --no-edit  # Ajouter des fichiers au dernier commit sans changer le message
```

### Branches

```bash
# Lister les branches
git branch                  # Locales
git branch -r               # Distantes
git branch -a               # Toutes

# Créer une branche
git branch feature/nom
git checkout -b feature/nom  # Créer et basculer
git switch -c feature/nom    # Moderne

# Basculer de branche
git checkout main
git switch main

# Renommer une branche
git branch -m ancien-nom nouveau-nom

# Supprimer une branche
git branch -d feature/nom     # Si déjà merged
git branch -D feature/nom     # Force delete
git push origin --delete feature/nom  # Supprimer distante
```

### Fusion et Rebase

```bash
# Merger une branche
git checkout main
git merge feature/nom

# Annuler un merge
git merge --abort

# Rebase
git checkout feature/nom
git rebase main

# Rebase interactif (modifier l'historique)
git rebase -i HEAD~3  # 3 derniers commits
```

### Remote

```bash
# Voir les remotes
git remote -v

# Ajouter un remote
git remote add origin git@github.com:user/repo.git

# Changer l'URL
git remote set-url origin git@github.com:new-user/repo.git

# Renommer un remote
git remote rename origin upstream

# Supprimer un remote
git remote remove origin
```

### Pull, Push, Fetch

```bash
# Récupérer sans fusionner
git fetch origin
git fetch --all

# Récupérer et fusionner
git pull origin main
git pull --rebase origin main  # Rebase au lieu de merge

# Pousser
git push origin main
git push -u origin feature/nom  # -u pour créer le lien de suivi
git push --all                  # Pousser toutes les branches
git push --tags                 # Pousser tous les tags
git push --force                # ⚠️ DANGEREUX! À éviter sur main
```

### Historique

```bash
# Voir l'historique
git log
git log --oneline
git log --graph --oneline --all
git log --author="Loic"
git log --since="2 weeks ago"
git log --until="2024-01-01"
git log -- fichier.cs  # Historique d'un fichier

# Rechercher dans l'historique
git log --grep="bug"
git log -S "fonction_name"  # Recherche dans le code

# Voir un commit spécifique
git show abc123
git show HEAD
git show HEAD~3  # 3 commits avant HEAD
```

### Annuler des Changements

```bash
# Annuler modifications (non staged)
git restore fichier.cs
git checkout -- fichier.cs

# Annuler staging
git restore --staged fichier.cs
git reset HEAD fichier.cs

# Annuler le dernier commit (garder les changements)
git reset --soft HEAD~1

# Annuler le dernier commit (supprimer les changements)
git reset --hard HEAD~1  # ⚠️ DANGEREUX!

# Annuler un commit public (créer un nouveau commit)
git revert abc123
git revert HEAD

# Revenir à un commit spécifique
git reset --hard abc123  # ⚠️ DANGEREUX!
```

### Tags

```bash
# Lister les tags
git tag
git tag -l "v1.*"

# Créer un tag
git tag v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"

# Pousser les tags
git push origin v1.0.0
git push --tags

# Supprimer un tag
git tag -d v1.0.0                # Local
git push origin --delete v1.0.0   # Distant

# Checkout un tag
git checkout v1.0.0
```

### Stash (Mise de côté temporaire)

```bash
# Mettre de côté les changements
git stash
git stash save "WIP: feature in progress"

# Lister les stash
git stash list

# Appliquer un stash
git stash apply              # Dernier stash
git stash apply stash@{0}    # Stash spécifique
git stash pop                # Applique et supprime

# Supprimer un stash
git stash drop stash@{0}
git stash clear              # Supprimer tous

# Créer une branche depuis un stash
git stash branch feature/nom stash@{0}
```

### Cherry-pick

```bash
# Appliquer un commit spécifique d'une autre branche
git cherry-pick abc123

# Cherry-pick plusieurs commits
git cherry-pick abc123 def456

# Cherry-pick sans commit (juste staging)
git cherry-pick -n abc123
```

### Nettoyage

```bash
# Supprimer les fichiers non trackés
git clean -n   # Dry run (voir ce qui serait supprimé)
git clean -f   # Supprimer
git clean -fd  # Supprimer fichiers et dossiers

# Garbage collection
git gc
git gc --aggressive
```

### Recherche et Blame

```bash
# Rechercher dans les fichiers
git grep "search term"
git grep -n "search term"  # Avec numéros de ligne

# Voir qui a modifié chaque ligne
git blame fichier.cs
git blame -L 10,20 fichier.cs  # Lignes 10 à 20
git blame -e fichier.cs        # Avec emails
```

### Submodules

```bash
# Ajouter un submodule
git submodule add git@github.com:user/repo.git path/to/submodule

# Initialiser et mettre à jour
git submodule init
git submodule update

# Cloner un projet avec submodules
git clone --recurse-submodules git@github.com:user/repo.git

# Mettre à jour tous les submodules
git submodule update --remote
```

### Utilitaires

```bash
# Voir la taille du dépôt
git count-objects -vH

# Trouver les gros fichiers
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '/^blob/ {print substr($0,6)}' | sort --numeric-sort --key=2 | tail -10

# Créer une archive
git archive --format=zip HEAD > archive.zip
git archive --format=tar.gz --prefix=project/ HEAD > archive.tar.gz

# Statistiques
git shortlog -sn          # Nombre de commits par auteur
git log --author="Loic" --oneline | wc -l  # Vos commits
```

---

## Dépannage et Solutions

### Problème 1: "fatal: not a git repository"

**Erreur:**
```bash
fatal: not a git repository (or any of the parent directories): .git
```

**Solution:**
```bash
# Initialiser Git dans le dossier
git init

# Ou naviguer vers le bon dossier
cd chemin/vers/projet
```

### Problème 2: Conflit de Merge

**Erreur:**
```bash
CONFLICT (content): Merge conflict in VehicleService.cs
Automatic merge failed; fix conflicts and then commit the result.
```

**Solution:**
```bash
# 1. Ouvrir le fichier et chercher les marqueurs
# <<<<<<< HEAD
# =======
# >>>>>>> feature/branch

# 2. Éditer manuellement pour résoudre

# 3. Marquer comme résolu
git add VehicleService.cs

# 4. Continuer le merge
git commit -m "Merge feature/branch into main"

# Ou annuler le merge
git merge --abort
```

### Problème 3: Fichier trop volumineux

**Erreur:**
```bash
remote: error: File database.db is 150.00 MB; this exceeds GitHub's file size limit of 100.00 MB
```

**Solution:**
```bash
# 1. Ajouter au .gitignore
echo "database.db" >> .gitignore

# 2. Retirer du tracking
git rm --cached database.db

# 3. Supprimer de l'historique (si déjà committed)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch database.db" \
  --prune-empty --tag-name-filter cat -- --all

# 4. Force push (⚠️ dangereux)
git push origin --force --all
```

### Problème 4: Mauvais message de commit

**Erreur:**
Vous avez écrit `git commit -m "fix"` au lieu d'un message descriptif.

**Solution:**
```bash
# Si pas encore pushed
git commit --amend -m "fix: correct vehicle status update logic"

# Si déjà pushed (⚠️ éviter si d'autres ont pulled)
git commit --amend -m "fix: correct vehicle status update logic"
git push --force
```

### Problème 5: Commité dans la mauvaise branche

**Erreur:**
Vous avez commité dans `main` au lieu de `feature/branch`.

**Solution:**
```bash
# 1. Créer une nouvelle branche avec les commits
git branch feature/branch

# 2. Revenir en arrière sur main
git reset --hard origin/main

# 3. Basculer vers la nouvelle branche
git checkout feature/branch
```

### Problème 6: Besoin d'annuler un push public

**Erreur:**
Vous avez poussé du code bugué sur main.

**Solution:**
```bash
# Ne PAS utiliser git reset sur des commits publics!

# Utiliser git revert (crée un nouveau commit)
git revert HEAD
git push origin main

# Ou revenir à un commit spécifique
git revert --no-commit HEAD~3..
git commit -m "Revert changes from commits abc-def"
git push origin main
```

### Problème 7: Secrets commités accidentellement

**Erreur:**
Vous avez commité `appsettings.json` avec un mot de passe.

**Solution:**
```bash
# 1. Changer immédiatement le secret exposé!

# 2. Retirer du dernier commit (si pas pushed)
git rm --cached appsettings.json
echo "appsettings.json" >> .gitignore
git commit --amend --no-edit

# 3. Si déjà pushed, supprimer de l'historique
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch appsettings.json" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all

# 4. Utiliser BFG Repo-Cleaner (plus rapide)
# https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files appsettings.json
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

### Problème 8: Divergence avec remote

**Erreur:**
```bash
error: failed to push some refs to 'github.com:user/repo.git'
hint: Updates were rejected because the remote contains work that you do not have locally.
```

**Solution:**
```bash
# Option 1: Pull et merge
git pull origin main
git push origin main

# Option 2: Pull et rebase (historique plus propre)
git pull --rebase origin main
git push origin main

# Option 3: Force push (⚠️ dangereux - seulement sur vos branches)
git push --force origin feature/my-branch
```

### Problème 9: Ligne de fin de fichier (CRLF/LF)

**Erreur:**
```bash
warning: CRLF will be replaced by LF in VehicleService.cs.
```

**Solution:**
```bash
# Configurer Git pour normaliser automatiquement
git config --global core.autocrlf true  # Windows
git config --global core.autocrlf input # Linux/Mac

# Ou créer .gitattributes
echo "* text=auto" > .gitattributes
git add .gitattributes
git commit -m "chore: add .gitattributes for line endings"
```

### Problème 10: Branche locale en retard

**Erreur:**
Votre branche locale est 5 commits derrière origin/main.

**Solution:**
```bash
# Voir l'état
git status

# Mettre à jour
git checkout main
git pull origin main

# Ou si sur une feature branch
git checkout feature/branch
git fetch origin
git merge origin/main
```

---

## Conclusion

### Récapitulatif FleetTrack

Vous avez maintenant:

✅ **Un projet complet:**
- Architecture Clean avec 4 couches
- 60 tests unitaires (100% passés)
- 22 tests d'intégration
- Pipeline CI/CD automatisé
- Scripts d'exécution multi-plateformes

✅ **Une maîtrise de Git:**
- Configuration professionnelle
- Workflow de branches
- Résolution de conflits
- Commandes essentielles

✅ **Une expertise GitHub:**
- Repositories et clonage
- Pull Requests et Code Review
- Issues et Projects
- GitHub Actions et CI/CD
- Fonctionnalités avancées

### Prochaines Étapes

1. **Pousser FleetTrack sur GitHub:**
```bash
cd "C:\Users\konan\Downloads\backend_c#"
git push -u origin main
```

2. **Créer votre premier PR:**
```bash
git checkout -b feature/my-first-feature
# ... faire des modifications ...
git push -u origin feature/my-first-feature
gh pr create
```

3. **Configurer des règles de protection:**
- Settings → Branches → Add rule pour `main`

4. **Inviter des collaborateurs:**
- Settings → Collaborators → Add people

5. **Documenter votre projet:**
- Créer un README.md professionnel
- Ajouter des badges de statut
- Créer une Wiki

### Ressources Supplémentaires

**Documentation Officielle:**
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [GitHub Actions](https://docs.github.com/en/actions)

**Tutoriels Interactifs:**
- [Learn Git Branching](https://learngitbranching.js.org/)
- [GitHub Skills](https://skills.github.com/)
- [Git Immersion](http://gitimmersion.com/)

**Outils:**
- [GitHub Desktop](https://desktop.github.com/) - Interface graphique
- [GitKraken](https://www.gitkraken.com/) - Client Git avancé
- [GitHub CLI](https://cli.github.com/) - Commandes GitHub en terminal

**Communauté:**
- [GitHub Community](https://github.community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/git)

### Message Final

GitHub n'est pas juste un outil de stockage de code - c'est une **plateforme complète de développement collaboratif**:

- 🤝 **Collaboration** - Travaillez avec des développeurs du monde entier
- 🔄 **CI/CD** - Automatisez vos workflows
- 📊 **Visibilité** - Montrez votre travail aux employeurs
- 🎓 **Apprentissage** - Apprenez du code open-source
- 🚀 **Innovation** - Contribuez à des projets qui changent le monde

**FleetTrack est votre premier pas.** Continuez à:
- Contribuer à des projets open-source
- Partager vos propres projets
- Collaborer avec d'autres développeurs
- Automatiser vos workflows
- Documenter votre apprentissage

**Le code que vous écrivez aujourd'hui est l'héritage que vous laissez demain.**

---

**Bon développement avec GitHub! 🚀**

*Ce guide a été créé pour accompagner le projet FleetTrack et vous aider à maîtriser Git et GitHub de manière professionnelle.*

**Questions ou suggestions?** Ouvrez une [Discussion](https://github.com/loicKonan123/FleetTrack/discussions) ou une [Issue](https://github.com/loicKonan123/FleetTrack/issues)!

---

**Auteur:** Loic Konan
**Projet:** FleetTrack
**Date:** Décembre 2025
**Version:** 1.0
