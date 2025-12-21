# 🧪 Guide d'Exécution des Tests - FleetTrack

Ce guide vous explique comment exécuter les tests localement et via un pipeline CI/CD.

---

## 📋 Table des Matières

1. [Exécution Locale des Tests](#exécution-locale-des-tests)
2. [Visualisation des Résultats](#visualisation-des-résultats)
3. [Pipeline CI/CD](#pipeline-cicd)
4. [Couverture de Code](#couverture-de-code)
5. [Commandes Utiles](#commandes-utiles)

---

## 🖥️ Exécution Locale des Tests

### Prérequis

Assurez-vous d'avoir:
- **.NET 8.0 SDK** installé
- **Aucune instance de l'API en cours d'exécution** (pour les tests d'intégration)

### 1. Exécuter TOUS les tests

```bash
cd FleetTrack
dotnet test --configuration Release
```

### 2. Exécuter UNIQUEMENT les tests unitaires

```bash
cd FleetTrack
dotnet test tests/FleetTrack.UnitTests/FleetTrack.UnitTests.csproj --verbosity normal
```

**Résultat attendu:**
```
Test Run Successful.
Total tests: 60
     Passed: 60
 Total time: ~2.7 seconds
```

### 3. Exécuter UNIQUEMENT les tests d'intégration

⚠️ **IMPORTANT**: Arrêtez l'API avant d'exécuter ces tests!

```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*FleetTrack*"} | Stop-Process -Force

# Puis exécutez les tests
cd FleetTrack
dotnet test tests/FleetTrack.IntegrationTests/FleetTrack.IntegrationTests.csproj --verbosity normal
```

### 4. Exécuter avec rapport détaillé

```bash
cd FleetTrack
dotnet test --logger "console;verbosity=detailed"
```

---

## 📊 Visualisation des Résultats

### Option 1: Console (Par défaut)

La sortie console affiche:
- ✅ Tests réussis en vert
- ❌ Tests échoués en rouge
- ⏱️ Temps d'exécution
- 📈 Statistiques globales

### Option 2: Rapport HTML avec ReportGenerator

```bash
# Installer ReportGenerator globalement
dotnet tool install -g dotnet-reportgenerator-globaltool

# Exécuter les tests avec couverture de code
cd FleetTrack
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults

# Générer le rapport HTML
reportgenerator -reports:"./TestResults/**/coverage.cobertura.xml" -targetdir:"./TestResults/CoverageReport" -reporttypes:Html

# Ouvrir le rapport
start ./TestResults/CoverageReport/index.html
```

### Option 3: Visual Studio Code

Si vous utilisez VSCode avec l'extension **.NET Core Test Explorer**:

1. Installez l'extension: `formulahendry.dotnet-test-explorer`
2. Les tests apparaîtront dans la barre latérale
3. Cliquez sur ▶️ pour exécuter individuellement
4. Voyez les résultats en temps réel

### Option 4: Visual Studio 2022

1. Ouvrez **Test Explorer** (Test > Test Explorer)
2. Cliquez sur **Run All** ou sélectionnez des tests spécifiques
3. Voyez les résultats avec détails d'erreur

---

## 🚀 Pipeline CI/CD

### GitHub Actions (Configuré)

Le pipeline `.github/workflows/dotnet-ci.yml` s'exécute automatiquement sur:
- **Push** vers `main` ou `develop`
- **Pull Request** vers `main` ou `develop`

#### Étapes du Pipeline:

1. **Checkout** - Récupère le code
2. **Setup .NET** - Installe .NET 8.0
3. **Restore** - Restaure les dépendances NuGet
4. **Build** - Compile la solution en mode Release
5. **Run Unit Tests** - Exécute les 60 tests unitaires
6. **Run Integration Tests** - Exécute les tests d'intégration
7. **Upload Results** - Sauvegarde les résultats (.trx)
8. **Publish Report** - Génère un rapport visuel
9. **Code Coverage** - Envoie la couverture à Codecov (optionnel)
10. **Build Docker** - Construit l'image Docker (sur main uniquement)

#### Voir les Résultats du Pipeline:

1. Allez sur GitHub: **votre-repo > Actions**
2. Cliquez sur le workflow récent
3. Voyez chaque étape avec logs détaillés
4. Téléchargez les artifacts (rapports de tests)

**Exemple de résultat:**
```
✅ build-and-test (ubuntu-latest)
   ✅ Checkout code
   ✅ Setup .NET
   ✅ Restore dependencies
   ✅ Build solution
   ✅ Run Unit Tests (60 passed)
   ✅ Run Integration Tests (22 passed)
   ✅ Upload Test Results
```

### Autres Plateformes CI/CD

<details>
<summary>Azure DevOps Pipeline</summary>

Créez `azure-pipelines.yml`:

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  buildConfiguration: 'Release'

steps:
- task: UseDotNet@2
  inputs:
    version: '8.0.x'

- task: DotNetCoreCLI@2
  displayName: 'Restore dependencies'
  inputs:
    command: 'restore'
    projects: 'FleetTrack/FleetTrack.sln'

- task: DotNetCoreCLI@2
  displayName: 'Build solution'
  inputs:
    command: 'build'
    projects: 'FleetTrack/FleetTrack.sln'
    arguments: '--configuration $(buildConfiguration)'

- task: DotNetCoreCLI@2
  displayName: 'Run tests'
  inputs:
    command: 'test'
    projects: 'FleetTrack/**/*Tests.csproj'
    arguments: '--configuration $(buildConfiguration) --logger trx'
    publishTestResults: true
```

</details>

<details>
<summary>GitLab CI/CD</summary>

Créez `.gitlab-ci.yml`:

```yaml
image: mcr.microsoft.com/dotnet/sdk:8.0

stages:
  - build
  - test

variables:
  DOTNET_CLI_TELEMETRY_OPTOUT: 1

build:
  stage: build
  script:
    - cd FleetTrack
    - dotnet restore
    - dotnet build --configuration Release --no-restore
  artifacts:
    paths:
      - FleetTrack/*/bin/Release/

test:
  stage: test
  script:
    - cd FleetTrack
    - dotnet test --configuration Release --no-build --logger "junit;LogFilePath=../TestResults/test-results.xml"
  artifacts:
    when: always
    reports:
      junit: TestResults/test-results.xml
```

</details>

---

## 📈 Couverture de Code

### Générer un Rapport de Couverture

```bash
cd FleetTrack

# Exécuter les tests avec couverture
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults

# Installer ReportGenerator (si pas déjà fait)
dotnet tool install -g dotnet-reportgenerator-globaltool

# Générer le rapport HTML
reportgenerator `
  -reports:"./TestResults/**/coverage.cobertura.xml" `
  -targetdir:"./TestResults/CoverageReport" `
  -reporttypes:"Html;Badges"

# Ouvrir le rapport
start ./TestResults/CoverageReport/index.html
```

### Intégration Codecov (Optionnel)

Pour suivre la couverture de code en continu:

1. Inscrivez-vous sur [codecov.io](https://codecov.io)
2. Connectez votre repo GitHub
3. Le pipeline GitHub Actions enverra automatiquement les rapports
4. Voyez les tendances sur le dashboard Codecov

---

## ⚡ Commandes Utiles

### Exécuter des tests spécifiques

```bash
# Tests d'une classe spécifique
dotnet test --filter "FullyQualifiedName~VehicleServiceTests"

# Tests d'une méthode spécifique
dotnet test --filter "FullyQualifiedName~GetByIdAsync_ShouldReturnVehicle"

# Tests par catégorie (si vous ajoutez des [Trait])
dotnet test --filter "Category=Unit"
```

### Exécuter en mode Watch (développement)

```bash
cd FleetTrack/tests/FleetTrack.UnitTests
dotnet watch test
```

Les tests se ré-exécutent automatiquement quand vous modifiez le code!

### Exécuter avec différents niveaux de verbosité

```bash
# Minimal
dotnet test --verbosity minimal

# Normal (recommandé)
dotnet test --verbosity normal

# Détaillé
dotnet test --verbosity detailed

# Diagnostic (debug)
dotnet test --verbosity diagnostic
```

### Générer un rapport TRX (Test Results XML)

```bash
dotnet test --logger "trx;LogFileName=test-results.trx"

# Le fichier sera dans: TestResults/test-results.trx
```

### Exécuter en parallèle (plus rapide)

```bash
dotnet test --parallel
```

### Nettoyer avant de tester

```bash
dotnet clean
dotnet test --no-restore
```

---

## 🐛 Dépannage

### Problème: "Program is inaccessible due to its protection level"

**Solution**: Vérifiez que [Program.cs:64](FleetTrack/src/FleetTrack.API/Program.cs#L64) contient:
```csharp
public partial class Program { }
```

### Problème: "Could not copy FleetTrack.API.exe"

**Solution**: L'API est en cours d'exécution. Arrêtez-la:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*FleetTrack*"} | Stop-Process -Force
```

### Problème: Tests d'intégration échouent

**Solutions**:
1. Vérifiez que l'API n'est pas en cours d'exécution
2. Assurez-vous que la base de données SQLite est accessible
3. Vérifiez les logs de sortie pour les erreurs spécifiques

### Problème: Couverture de code à 0%

**Solution**: Assurez-vous d'utiliser `--collect:"XPlat Code Coverage"`:
```bash
dotnet test --collect:"XPlat Code Coverage"
```

---

## 📝 Résumé des Commandes

| Action | Commande |
|--------|----------|
| **Tous les tests** | `dotnet test` |
| **Tests unitaires** | `dotnet test tests/FleetTrack.UnitTests/FleetTrack.UnitTests.csproj` |
| **Tests d'intégration** | `dotnet test tests/FleetTrack.IntegrationTests/FleetTrack.IntegrationTests.csproj` |
| **Avec couverture** | `dotnet test --collect:"XPlat Code Coverage"` |
| **Mode watch** | `dotnet watch test` |
| **Rapport HTML** | `reportgenerator -reports:"./TestResults/**/coverage.cobertura.xml" -targetdir:"./TestResults/CoverageReport" -reporttypes:Html` |

---

## 🎯 Bonnes Pratiques

1. ✅ **Exécutez les tests avant chaque commit**
2. ✅ **Vérifiez la couverture de code régulièrement**
3. ✅ **Utilisez le mode watch pendant le développement**
4. ✅ **Configurez le pipeline CI/CD dès le début**
5. ✅ **Maintenez une couverture > 80%**
6. ✅ **Écrivez des tests pour chaque nouveau service**

---

**Prochaine étape**: Pushez votre code sur GitHub pour voir le pipeline en action! 🚀
