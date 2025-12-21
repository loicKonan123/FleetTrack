# Script PowerShell pour executer les tests FleetTrack
# Usage: .\run-tests.ps1 [all|unit|integration|coverage]

param(
    [Parameter(Position=0)]
    [ValidateSet("all", "unit", "integration", "coverage", "watch")]
    [string]$TestType = "all"
)

$ErrorActionPreference = "Stop"

Write-Host "FleetTrack - Test Runner" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour arreter les processus FleetTrack
function Stop-FleetTrackProcesses {
    Write-Host "Arret des processus FleetTrack en cours..." -ForegroundColor Yellow
    Get-Process | Where-Object {$_.ProcessName -like "*FleetTrack*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "Processus arretes" -ForegroundColor Green
    Write-Host ""
}

# Fonction pour executer les tests
function Run-Tests {
    param($ProjectPath, $TestName)

    Write-Host "Execution des $TestName..." -ForegroundColor Cyan
    Write-Host ""

    dotnet test $ProjectPath --configuration Release --verbosity normal --logger "console;verbosity=normal"

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "$TestName reussis!" -ForegroundColor Green
        return $true
    } else {
        Write-Host ""
        Write-Host "$TestName echoues!" -ForegroundColor Red
        return $false
    }
}

# Navigation vers le dossier FleetTrack
Set-Location -Path "$PSScriptRoot\FleetTrack"

$success = $false

switch ($TestType) {
    "unit" {
        Write-Host "Execution des tests UNITAIRES uniquement" -ForegroundColor Yellow
        Write-Host ""
        $success = Run-Tests "tests\FleetTrack.UnitTests\FleetTrack.UnitTests.csproj" "tests unitaires"
        break
    }

    "integration" {
        Write-Host "Execution des tests d'INTEGRATION uniquement" -ForegroundColor Yellow
        Write-Host ""
        Stop-FleetTrackProcesses
        $success = Run-Tests "tests\FleetTrack.IntegrationTests\FleetTrack.IntegrationTests.csproj" "tests d'integration"
        break
    }

    "coverage" {
        Write-Host "Execution des tests avec COUVERTURE DE CODE" -ForegroundColor Yellow
        Write-Host ""

        # Nettoyer les anciens resultats
        if (Test-Path "TestResults") {
            Remove-Item -Path "TestResults" -Recurse -Force
        }

        # Executer les tests avec couverture
        dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults --configuration Release

        # Verifier si ReportGenerator est installe
        $reportGenInstalled = dotnet tool list -g | Select-String "dotnet-reportgenerator-globaltool"

        if (-not $reportGenInstalled) {
            Write-Host ""
            Write-Host "Installation de ReportGenerator..." -ForegroundColor Yellow
            dotnet tool install -g dotnet-reportgenerator-globaltool
        }

        # Generer le rapport HTML
        Write-Host ""
        Write-Host "Generation du rapport de couverture..." -ForegroundColor Cyan
        reportgenerator -reports:"./TestResults/**/coverage.cobertura.xml" -targetdir:"./TestResults/CoverageReport" -reporttypes:"Html;Badges;TextSummary"

        # Afficher le resume
        if (Test-Path "./TestResults/CoverageReport/Summary.txt") {
            Write-Host ""
            Write-Host "RESUME DE LA COUVERTURE:" -ForegroundColor Cyan
            Get-Content "./TestResults/CoverageReport/Summary.txt"
        }

        # Ouvrir le rapport
        Write-Host ""
        Write-Host "Ouverture du rapport HTML..." -ForegroundColor Cyan
        Start-Process "./TestResults/CoverageReport/index.html"

        $success = $true
        break
    }

    "watch" {
        Write-Host "Mode WATCH - Les tests se re-executeront automatiquement" -ForegroundColor Yellow
        Write-Host "Appuyez sur Ctrl+C pour arreter" -ForegroundColor Gray
        Write-Host ""
        Set-Location -Path "tests\FleetTrack.UnitTests"
        dotnet watch test
        $success = $true
        break
    }

    default {
        Write-Host "Execution de TOUS les tests" -ForegroundColor Yellow
        Write-Host ""

        # Tests unitaires
        $unitSuccess = Run-Tests "tests\FleetTrack.UnitTests\FleetTrack.UnitTests.csproj" "tests unitaires"
        Write-Host ""
        Write-Host "-------------------------------------------------" -ForegroundColor Gray
        Write-Host ""

        # Tests d'integration
        Stop-FleetTrackProcesses
        $integrationSuccess = Run-Tests "tests\FleetTrack.IntegrationTests\FleetTrack.IntegrationTests.csproj" "tests d'integration"

        $success = $unitSuccess -and $integrationSuccess
        break
    }
}

# Resume final
Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan
if ($success) {
    Write-Host "Tests termines avec SUCCES!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Certains tests ont ECHOUE" -ForegroundColor Red
    exit 1
}
