-- ============================================================================
-- FleetTrack - Script de données d'exemple
-- ============================================================================
-- Description: Ce script insère des données d'exemple dans toutes les tables
-- Usage: Exécuter dans DB Browser for SQLite (Execute SQL tab)
-- Date: 2025-12-20
-- ============================================================================

-- Nettoyer les données existantes (optionnel - décommenter si nécessaire)
-- DELETE FROM Waypoints;
-- DELETE FROM GpsPositions;
-- DELETE FROM Alerts;
-- DELETE FROM MaintenanceRecords;
-- DELETE FROM Missions;
-- DELETE FROM Drivers;
-- DELETE FROM Vehicles;
-- DELETE FROM Zones;

-- ============================================================================
-- 1. VEHICLES (Véhicules)
-- ============================================================================
-- NOTE: CurrentDriverId est NULL au départ, sera mis à jour après insertion des chauffeurs

INSERT INTO Vehicles (
    Id, RegistrationNumber, Brand, Model, Year, Type, Status,
    FuelType, FuelCapacity, CurrentFuelLevel, Mileage,
    LastMaintenanceDate, NextMaintenanceDate, CurrentDriverId,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES
-- Camion Toyota Hilux
('11111111-1111-1111-1111-111111111111', 'ABC-123', 'Toyota', 'Hilux', 2023, 1, 0, 1, 80.0, 65.0, 15000,
 '2025-11-15T10:00:00Z', '2026-02-15T10:00:00Z', NULL,
 '2025-01-10T08:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Camionnette Mercedes Sprinter (sera assignée au chauffeur Sophie)
('22222222-2222-2222-2222-222222222222', 'XYZ-456', 'Mercedes', 'Sprinter', 2022, 2, 0, 1, 70.0, 45.0, 28500,
 '2025-10-20T14:00:00Z', '2026-01-20T14:00:00Z', NULL,
 '2024-06-15T09:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Voiture Renault Clio
('33333333-3333-3333-3333-333333333333', 'DEF-789', 'Renault', 'Clio', 2024, 0, 0, 0, 45.0, 32.0, 5200,
 NULL, '2026-01-10T10:00:00Z', NULL,
 '2024-11-01T11:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Camion Volvo FH16 (en maintenance)
('44444444-4444-4444-4444-444444444444', 'GHI-012', 'Volvo', 'FH16', 2021, 1, 2, 1, 120.0, 80.0, 45800,
 '2025-12-10T09:00:00Z', '2026-03-10T09:00:00Z', NULL,
 '2023-03-20T10:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Moto Honda CB500
('55555555-5555-5555-5555-555555555555', 'JKL-345', 'Honda', 'CB500', 2023, 3, 0, 0, 17.0, 12.0, 8500,
 '2025-09-05T08:00:00Z', '2026-03-05T08:00:00Z', NULL,
 '2024-08-12T12:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Bus Iveco Crossway (sera assigné au chauffeur Claire)
('66666666-6666-6666-6666-666666666666', 'MNO-678', 'Iveco', 'Crossway', 2020, 4, 0, 1, 200.0, 150.0, 62300,
 '2025-11-25T13:00:00Z', '2026-02-25T13:00:00Z', NULL,
 '2022-05-10T07:00:00Z', '2025-12-20T08:00:00Z', 0);

-- ============================================================================
-- 2. DRIVERS (Chauffeurs)
-- ============================================================================
-- NOTE: CurrentVehicleId est NULL au départ, sera mis à jour après

INSERT INTO Drivers (
    Id, FirstName, LastName, Email, PhoneNumber, LicenseNumber,
    LicenseExpiryDate, Status, CurrentVehicleId, LastActiveDate,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES
-- Jean Dupont (disponible)
('11111111-1111-1111-1111-111111111111', 'Jean', 'Dupont', 'jean.dupont@fleettrack.com', '+33612345678', 'FR123456789',
 '2028-12-31T00:00:00Z', 0, NULL, '2025-12-19T18:00:00Z',
 '2024-01-15T09:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Marie Martin (sera assignée au Sprinter)
('22222222-2222-2222-2222-222222222222', 'Marie', 'Martin', 'marie.martin@fleettrack.com', '+33623456789', 'FR234567890',
 '2029-06-30T00:00:00Z', 0, NULL, '2025-12-20T08:00:00Z',
 '2023-08-20T10:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Pierre Bernard (en pause)
('33333333-3333-3333-3333-333333333333', 'Pierre', 'Bernard', 'pierre.bernard@fleettrack.com', '+33634567890', 'FR345678901',
 '2027-03-15T00:00:00Z', 2, NULL, '2025-12-20T07:30:00Z',
 '2024-03-10T11:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Sophie Dubois (hors service)
('44444444-4444-4444-4444-444444444444', 'Sophie', 'Dubois', 'sophie.dubois@fleettrack.com', '+33645678901', 'FR456789012',
 '2030-01-20T00:00:00Z', 3, NULL, '2025-12-19T20:00:00Z',
 '2022-11-05T08:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Luc Petit (en congé)
('55555555-5555-5555-5555-555555555555', 'Luc', 'Petit', 'luc.petit@fleettrack.com', '+33656789012', 'FR567890123',
 '2028-09-10T00:00:00Z', 4, NULL, '2025-12-15T17:00:00Z',
 '2023-05-12T09:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Claire Roux (sera assignée au Bus)
('66666666-6666-6666-6666-666666666666', 'Claire', 'Roux', 'claire.roux@fleettrack.com', '+33667890123', 'FR678901234',
 '2029-11-25T00:00:00Z', 0, NULL, '2025-12-20T08:00:00Z',
 '2023-09-18T10:00:00Z', '2025-12-20T08:00:00Z', 0);

-- ============================================================================
-- ASSIGNATIONS VÉHICULES ↔ CHAUFFEURS (Relations bidirectionnelles)
-- ============================================================================
-- Maintenant que les véhicules et chauffeurs existent, on crée les relations

-- Marie Martin → Mercedes Sprinter
UPDATE Drivers
SET CurrentVehicleId = '22222222-2222-2222-2222-222222222222',
    Status = 1,  -- OnDuty
    UpdatedAt = '2025-12-20T08:00:00Z'
WHERE Id = '22222222-2222-2222-2222-222222222222';

UPDATE Vehicles
SET CurrentDriverId = '22222222-2222-2222-2222-222222222222',
    Status = 1,  -- InUse
    UpdatedAt = '2025-12-20T08:00:00Z'
WHERE Id = '22222222-2222-2222-2222-222222222222';

-- Claire Roux → Bus Iveco
UPDATE Drivers
SET CurrentVehicleId = '66666666-6666-6666-6666-666666666666',
    Status = 1,  -- OnDuty
    UpdatedAt = '2025-12-20T08:00:00Z'
WHERE Id = '66666666-6666-6666-6666-666666666666';

UPDATE Vehicles
SET CurrentDriverId = '66666666-6666-6666-6666-666666666666',
    Status = 1,  -- InUse
    UpdatedAt = '2025-12-20T08:00:00Z'
WHERE Id = '66666666-6666-6666-6666-666666666666';

-- ============================================================================
-- 3. ZONES (Zones géographiques)
-- ============================================================================

INSERT INTO Zones (
    Id, Name, Description, Type, CenterLatitude, CenterLongitude,
    RadiusInMeters, Coordinates, IsActive, Color,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES
-- Dépôt Paris
('11111111-1111-1111-1111-111111111111', 'Dépôt Central Paris', 'Zone du dépôt principal à Paris',
 5, 48.8566, 2.3522, 500.0, NULL, 1, '#FF5733',
 '2025-01-05T10:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Zone de livraison Lyon
('22222222-2222-2222-2222-222222222222', 'Zone Livraison Lyon', 'Périmètre de livraison Lyon Centre',
 3, 45.7640, 4.8357, 1000.0, NULL, 1, '#33FF57',
 '2025-01-08T11:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Zone restreinte Aéroport
('33333333-3333-3333-3333-333333333333', 'Zone Aéroport CDG', 'Zone restreinte autour de l''aéroport',
 0, 49.0097, 2.5479, 2000.0, NULL, 1, '#FF3333',
 '2025-02-10T09:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Parking client Marseille
('44444444-4444-4444-4444-444444444444', 'Parking Client Marseille', 'Zone de stationnement client',
 2, 43.2965, 5.3698, 300.0, NULL, 1, '#3357FF',
 '2025-03-15T14:00:00Z', '2025-12-20T08:00:00Z', 0);

-- ============================================================================
-- 4. MISSIONS
-- ============================================================================

INSERT INTO Missions (
    Id, Name, Description, Status, Priority, VehicleId, DriverId,
    StartDate, EndDate, ActualStartDate, ActualEndDate,
    EstimatedDistance, ActualDistance,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES
-- Mission Paris-Lyon en cours
('11111111-1111-1111-1111-111111111111', 'Livraison Paris-Lyon', 'Transport de marchandises urgentes vers Lyon',
 2, 2, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 '2025-12-20T06:00:00Z', '2025-12-20T16:00:00Z', '2025-12-20T06:15:00Z', NULL,
 450.0, NULL,
 '2025-12-19T15:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Mission Marseille terminée
('22222222-2222-2222-2222-222222222222', 'Livraison Marseille', 'Transport équipements informatiques',
 3, 1, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 '2025-12-18T08:00:00Z', '2025-12-18T20:00:00Z', '2025-12-18T08:10:00Z', '2025-12-18T19:45:00Z',
 775.0, 782.5,
 '2025-12-17T10:00:00Z', '2025-12-19T08:00:00Z', 0),

-- Mission planifiée Toulouse
('33333333-3333-3333-3333-333333333333', 'Livraison Toulouse', 'Livraison multiple de colis',
 0, 0, '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
 '2025-12-22T07:00:00Z', '2025-12-22T18:00:00Z', NULL, NULL,
 680.0, NULL,
 '2025-12-20T09:00:00Z', '2025-12-20T09:00:00Z', 0),

-- Circuit bus urbain
('44444444-4444-4444-4444-444444444444', 'Circuit Bus Ligne 12', 'Circuit régulier bus urbain',
 2, 3, '66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666',
 '2025-12-20T05:30:00Z', '2025-12-20T22:00:00Z', '2025-12-20T05:28:00Z', NULL,
 85.0, NULL,
 '2025-12-19T18:00:00Z', '2025-12-20T08:00:00Z', 0);

-- ============================================================================
-- 5. WAYPOINTS (Points de passage)
-- ============================================================================

INSERT INTO Waypoints (
    Id, MissionId, Name, Address, Latitude, Longitude, Type, [Order],
    PlannedArrivalTime, ActualArrivalTime, PlannedDepartureTime, ActualDepartureTime,
    IsCompleted, Notes,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES
-- Mission Paris-Lyon - Points
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Dépôt Paris Départ', '123 Avenue des Champs-Élysées, Paris', 48.8566, 2.3522, 0, 1,
 '2025-12-20T06:00:00Z', '2025-12-20T06:15:00Z', '2025-12-20T06:30:00Z', '2025-12-20T06:35:00Z',
 1, 'Chargement effectué avec retard de 15 min',
 '2025-12-19T15:00:00Z', '2025-12-20T06:35:00Z', 0),

('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
 'Aire de Repos A6', 'Aire de Nemours, A6', 48.2656, 2.6969, 4, 2,
 '2025-12-20T09:00:00Z', NULL, '2025-12-20T09:30:00Z', NULL,
 0, NULL,
 '2025-12-19T15:00:00Z', '2025-12-20T08:00:00Z', 0),

('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
 'Client Lyon', '456 Rue de la République, Lyon', 45.7640, 4.8357, 1, 3,
 '2025-12-20T14:00:00Z', NULL, '2025-12-20T15:00:00Z', NULL,
 0, NULL,
 '2025-12-19T15:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Mission Marseille - Points (terminée)
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222',
 'Dépôt Paris', '123 Avenue des Champs-Élysées, Paris', 48.8566, 2.3522, 0, 1,
 '2025-12-18T08:00:00Z', '2025-12-18T08:10:00Z', '2025-12-18T08:30:00Z', '2025-12-18T08:40:00Z',
 1, NULL,
 '2025-12-17T10:00:00Z', '2025-12-18T08:40:00Z', 0),

('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222',
 'Client Marseille', '789 Vieux Port, Marseille', 43.2965, 5.3698, 1, 2,
 '2025-12-18T18:00:00Z', '2025-12-18T17:50:00Z', '2025-12-18T19:00:00Z', '2025-12-18T18:45:00Z',
 1, 'Livraison anticipée',
 '2025-12-17T10:00:00Z', '2025-12-18T18:45:00Z', 0);

-- ============================================================================
-- 6. GPS POSITIONS (Positions GPS)
-- ============================================================================

INSERT INTO GpsPositions (
    Id, VehicleId, Latitude, Longitude, Altitude, Speed, Heading, Timestamp, Accuracy,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES
-- Positions du Sprinter en mission Paris-Lyon
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
 48.8566, 2.3522, 35.0, 0.0, 180.0, '2025-12-20T06:15:00Z', 5.0,
 '2025-12-20T06:15:00Z', '2025-12-20T06:15:00Z', 0),

('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 48.8200, 2.3800, 40.0, 75.5, 185.0, '2025-12-20T07:00:00Z', 4.0,
 '2025-12-20T07:00:00Z', '2025-12-20T07:00:00Z', 0),

('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
 48.2656, 2.6969, 120.0, 95.0, 175.0, '2025-12-20T08:30:00Z', 6.0,
 '2025-12-20T08:30:00Z', '2025-12-20T08:30:00Z', 0),

-- Positions du bus
('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666',
 48.8700, 2.3200, 45.0, 35.0, 90.0, '2025-12-20T07:00:00Z', 3.0,
 '2025-12-20T07:00:00Z', '2025-12-20T07:00:00Z', 0),

('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666',
 48.8750, 2.3300, 42.0, 28.0, 95.0, '2025-12-20T07:30:00Z', 4.0,
 '2025-12-20T07:30:00Z', '2025-12-20T07:30:00Z', 0),

('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666',
 48.8800, 2.3400, 40.0, 32.0, 88.0, '2025-12-20T08:00:00Z', 3.5,
 '2025-12-20T08:00:00Z', '2025-12-20T08:00:00Z', 0);

-- ============================================================================
-- 7. ALERTS (Alertes)
-- ============================================================================

INSERT INTO Alerts (
    Id, VehicleId, Type, Severity, Title, Message, TriggeredAt,
    IsAcknowledged, AcknowledgedAt, AcknowledgedBy,
    IsResolved, ResolvedAt, Resolution,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES
-- Excès de vitesse (non résolu)
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
 0, 1, 'Excès de vitesse détecté',
 'Véhicule XYZ-456 a dépassé 110 km/h sur autoroute limitée à 90 km/h (zone chantier)',
 '2025-12-20T08:15:00Z',
 1, '2025-12-20T08:20:00Z', 'Supervisor_123',
 0, NULL, NULL,
 '2025-12-20T08:15:00Z', '2025-12-20T08:20:00Z', 0),

-- Niveau carburant bas (résolu)
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
 4, 1, 'Niveau de carburant bas',
 'Véhicule ABC-123 - Niveau carburant à 15% (12L restants)',
 '2025-12-19T16:30:00Z',
 1, '2025-12-19T16:35:00Z', 'Dispatcher_456',
 1, '2025-12-19T18:00:00Z', 'Véhicule ravitaillé à la station Shell A6',
 '2025-12-19T16:30:00Z', '2025-12-19T18:00:00Z', 0),

-- Maintenance due (non acquitté)
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444',
 5, 2, 'Maintenance programmée dans 3 jours',
 'Véhicule GHI-012 - Vidange moteur programmée le 25/12/2025',
 '2025-12-20T08:00:00Z',
 0, NULL, NULL,
 0, NULL, NULL,
 '2025-12-20T08:00:00Z', '2025-12-20T08:00:00Z', 0),

-- Freinage brusque (acquitté)
('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666',
 1, 0, 'Freinage brusque détecté',
 'Bus MNO-678 - Freinage d''urgence détecté à 07:15',
 '2025-12-20T07:15:00Z',
 1, '2025-12-20T07:45:00Z', 'Fleet_Manager_789',
 1, '2025-12-20T07:50:00Z', 'Piéton traversant - freinage justifié',
 '2025-12-20T07:15:00Z', '2025-12-20T07:50:00Z', 0),

-- Temps inactivité excessif (critique non résolu)
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222',
 3, 3, 'Temps d''inactivité moteur tournant',
 'Véhicule XYZ-456 - Moteur tournant à l''arrêt depuis 45 minutes',
 '2025-12-20T09:30:00Z',
 1, '2025-12-20T09:35:00Z', 'Supervisor_123',
 0, NULL, NULL,
 '2025-12-20T09:30:00Z', '2025-12-20T09:35:00Z', 0);

-- ============================================================================
-- 8. MAINTENANCE RECORDS (Registres de maintenance)
-- ============================================================================

INSERT INTO MaintenanceRecords (
    Id, VehicleId, Type, Description, ScheduledDate, CompletedDate,
    MileageAtMaintenance, Cost, ServiceProvider, Notes, IsCompleted,
    CreatedAt, UpdatedAt, IsDeleted
) VALUES
-- Vidange Toyota Hilux (terminée)
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 2, 'Vidange moteur complète + remplacement filtre à huile et filtre à air',
 '2025-11-15T10:00:00Z', '2025-11-15T11:30:00Z',
 15000, 145.50, 'Garage Central Paris', 'RAS - Prochaine vidange à 25000 km', 1,
 '2025-11-01T09:00:00Z', '2025-11-15T12:00:00Z', 0),

-- Changement pneus Sprinter (terminé)
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 3, 'Remplacement 4 pneus avant + équilibrage',
 '2025-10-20T14:00:00Z', '2025-10-20T16:00:00Z',
 28000, 580.00, 'Euromaster Lyon', 'Pneus Michelin Agilis montés', 1,
 '2025-10-10T10:00:00Z', '2025-10-20T16:30:00Z', 0),

-- Révision Renault Clio (à venir)
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 5, 'Révision des 10 000 km - Contrôle complet',
 '2026-01-10T10:00:00Z', NULL,
 10000, 250.00, 'Renault Garage Marseille', NULL, 0,
 '2025-12-15T11:00:00Z', '2025-12-15T11:00:00Z', 0),

-- Réparation Volvo (en cours de maintenance)
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
 6, 'Réparation système de freinage - Plaquettes et disques avant',
 '2025-12-10T09:00:00Z', NULL,
 45800, 890.00, 'Volvo Service Center', 'Véhicule immobilisé pour réparation', 0,
 '2025-12-05T14:00:00Z', '2025-12-10T09:00:00Z', 0),

-- Service freins Honda (terminé)
('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
 4, 'Remplacement plaquettes de frein avant + arrière',
 '2025-09-05T08:00:00Z', '2025-09-05T10:30:00Z',
 8000, 320.00, 'Honda Moto Service', 'Parfait état - Contrôle OK', 1,
 '2025-08-20T09:00:00Z', '2025-09-05T11:00:00Z', 0),

-- Maintenance préventive Bus (à venir - critique)
('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666',
 0, 'Maintenance préventive complète - Contrôle sécurité transport passagers',
 '2025-12-25T08:00:00Z', NULL,
 62000, 1250.00, 'Iveco Bus Center', 'Maintenance légale obligatoire', 0,
 '2025-12-10T10:00:00Z', '2025-12-10T10:00:00Z', 0);

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

-- Vérification des insertions
SELECT 'Vehicles: ' || COUNT(*) FROM Vehicles WHERE IsDeleted = 0;
SELECT 'Drivers: ' || COUNT(*) FROM Drivers WHERE IsDeleted = 0;
SELECT 'Zones: ' || COUNT(*) FROM Zones WHERE IsDeleted = 0;
SELECT 'Missions: ' || COUNT(*) FROM Missions WHERE IsDeleted = 0;
SELECT 'Waypoints: ' || COUNT(*) FROM Waypoints WHERE IsDeleted = 0;
SELECT 'GpsPositions: ' || COUNT(*) FROM GpsPositions WHERE IsDeleted = 0;
SELECT 'Alerts: ' || COUNT(*) FROM Alerts WHERE IsDeleted = 0;
SELECT 'MaintenanceRecords: ' || COUNT(*) FROM MaintenanceRecords WHERE IsDeleted = 0;

-- ============================================================================
-- RÉSUMÉ DES DONNÉES INSÉRÉES
-- ============================================================================
-- Vehicles:            6 véhicules (camions, van, voiture, moto, bus)
-- Drivers:             6 chauffeurs (différents statuts)
-- Zones:               4 zones géographiques
-- Missions:            4 missions (en cours, terminée, planifiée)
-- Waypoints:           5 points de passage
-- GpsPositions:        6 positions GPS
-- Alerts:              5 alertes (résolues et non résolues)
-- MaintenanceRecords:  6 registres de maintenance
-- ============================================================================
