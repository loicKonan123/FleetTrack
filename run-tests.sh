#!/bin/bash
# Script Bash pour exécuter les tests FleetTrack
# Usage: ./run-tests.sh [all|unit|integration|coverage]

TEST_TYPE=${1:-all}

# Couleurs
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧪 FleetTrack - Test Runner${NC}"
echo -e "${CYAN}=============================${NC}"
echo ""

# Fonction pour arrêter les processus FleetTrack
stop_fleettrack_processes() {
    echo -e "${YELLOW}⏹️  Arrêt des processus FleetTrack en cours...${NC}"
    pkill -f "FleetTrack" 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}✅ Processus arrêtés${NC}"
    echo ""
}

# Fonction pour exécuter les tests
run_tests() {
    local project_path=$1
    local test_name=$2

    echo -e "${CYAN}▶️  Exécution des $test_name...${NC}"
    echo ""

    if dotnet test "$project_path" --configuration Release --verbosity normal --logger "console;verbosity=normal"; then
        echo ""
        echo -e "${GREEN}✅ $test_name réussis!${NC}"
        return 0
    else
        echo ""
        echo -e "${RED}❌ $test_name échoués!${NC}"
        return 1
    fi
}

# Navigation vers le dossier FleetTrack
cd "$(dirname "$0")/FleetTrack" || exit 1

case $TEST_TYPE in
    unit)
        echo -e "${YELLOW}📋 Exécution des tests UNITAIRES uniquement${NC}"
        echo ""
        run_tests "tests/FleetTrack.UnitTests/FleetTrack.UnitTests.csproj" "tests unitaires"
        success=$?
        ;;

    integration)
        echo -e "${YELLOW}🔗 Exécution des tests d'INTÉGRATION uniquement${NC}"
        echo ""
        stop_fleettrack_processes
        run_tests "tests/FleetTrack.IntegrationTests/FleetTrack.IntegrationTests.csproj" "tests d'intégration"
        success=$?
        ;;

    coverage)
        echo -e "${YELLOW}📊 Exécution des tests avec COUVERTURE DE CODE${NC}"
        echo ""

        # Nettoyer les anciens résultats
        rm -rf TestResults

        # Exécuter les tests avec couverture
        dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults --configuration Release

        # Vérifier si ReportGenerator est installé
        if ! dotnet tool list -g | grep -q "dotnet-reportgenerator-globaltool"; then
            echo ""
            echo -e "${YELLOW}⚠️  Installation de ReportGenerator...${NC}"
            dotnet tool install -g dotnet-reportgenerator-globaltool
        fi

        # Générer le rapport HTML
        echo ""
        echo -e "${CYAN}📈 Génération du rapport de couverture...${NC}"
        reportgenerator \
            -reports:"./TestResults/**/coverage.cobertura.xml" \
            -targetdir:"./TestResults/CoverageReport" \
            -reporttypes:"Html;Badges;TextSummary"

        # Afficher le résumé
        if [ -f "./TestResults/CoverageReport/Summary.txt" ]; then
            echo ""
            echo -e "${CYAN}📊 RÉSUMÉ DE LA COUVERTURE:${NC}"
            cat "./TestResults/CoverageReport/Summary.txt"
        fi

        # Ouvrir le rapport (selon l'OS)
        echo ""
        echo -e "${CYAN}🌐 Rapport de couverture généré: ./TestResults/CoverageReport/index.html${NC}"
        if command -v xdg-open &> /dev/null; then
            xdg-open "./TestResults/CoverageReport/index.html" &
        elif command -v open &> /dev/null; then
            open "./TestResults/CoverageReport/index.html" &
        fi

        success=0
        ;;

    watch)
        echo -e "${YELLOW}👀 Mode WATCH - Les tests se ré-exécuteront automatiquement${NC}"
        echo -e "${GRAY}   Appuyez sur Ctrl+C pour arrêter${NC}"
        echo ""
        cd tests/FleetTrack.UnitTests || exit 1
        dotnet watch test
        success=0
        ;;

    *)
        echo -e "${YELLOW}🎯 Exécution de TOUS les tests${NC}"
        echo ""

        # Tests unitaires
        run_tests "tests/FleetTrack.UnitTests/FleetTrack.UnitTests.csproj" "tests unitaires"
        unit_success=$?
        echo ""
        echo -e "${GRAY}─────────────────────────────────────────────────${NC}"
        echo ""

        # Tests d'intégration
        stop_fleettrack_processes
        run_tests "tests/FleetTrack.IntegrationTests/FleetTrack.IntegrationTests.csproj" "tests d'intégration"
        integration_success=$?

        if [ $unit_success -eq 0 ] && [ $integration_success -eq 0 ]; then
            success=0
        else
            success=1
        fi
        ;;
esac

# Résumé final
echo ""
echo -e "${CYAN}=============================${NC}"
if [ $success -eq 0 ]; then
    echo -e "${GREEN}✅ Tests terminés avec SUCCÈS!${NC}"
    exit 0
else
    echo -e "${RED}❌ Certains tests ont ÉCHOUÉ${NC}"
    exit 1
fi
