using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;

namespace FleetTrack.UnitTests.Fixtures;

/// <summary>
/// Fixture de données de test partagées entre tous les tests
/// </summary>
public class TestDataFixture
{
    // GUIDs de test constants
    public static readonly Guid VehicleId1 = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid VehicleId2 = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid DriverId1 = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid DriverId2 = Guid.Parse("44444444-4444-4444-4444-444444444444");
    public static readonly Guid MissionId1 = Guid.Parse("55555555-5555-5555-5555-555555555555");

    /// <summary>
    /// Crée un véhicule de test avec des valeurs par défaut
    /// </summary>
    public static Vehicle CreateTestVehicle(
        Guid? id = null,
        string registrationNumber = "ABC-123",
        VehicleStatus status = VehicleStatus.Available,
        Guid? currentDriverId = null)
    {
        return new Vehicle
        {
            Id = id ?? VehicleId1,
            RegistrationNumber = registrationNumber,
            Brand = "Toyota",
            Model = "Hilux",
            Year = 2023,
            Type = VehicleType.Truck,
            Status = status,
            FuelType = FuelType.Diesel,
            FuelCapacity = 80.0,
            CurrentFuelLevel = 65.0,
            Mileage = 15000,
            LastMaintenanceDate = DateTime.UtcNow.AddMonths(-1),
            NextMaintenanceDate = DateTime.UtcNow.AddMonths(2),
            CurrentDriverId = currentDriverId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false
        };
    }

    /// <summary>
    /// Crée un chauffeur de test avec des valeurs par défaut
    /// </summary>
    public static Driver CreateTestDriver(
        Guid? id = null,
        string firstName = "Jean",
        string lastName = "Dupont",
        DriverStatus status = DriverStatus.Available,
        Guid? currentVehicleId = null)
    {
        return new Driver
        {
            Id = id ?? DriverId1,
            FirstName = firstName,
            LastName = lastName,
            Email = $"{firstName.ToLower()}.{lastName.ToLower()}@fleettrack.com",
            PhoneNumber = "+33612345678",
            LicenseNumber = "FR123456789",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = status,
            CurrentVehicleId = currentVehicleId,
            LastActiveDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false
        };
    }

    /// <summary>
    /// Crée une mission de test avec des valeurs par défaut
    /// </summary>
    public static Mission CreateTestMission(
        Guid? id = null,
        Guid? vehicleId = null,
        Guid? driverId = null,
        MissionStatus status = MissionStatus.Planned)
    {
        return new Mission
        {
            Id = id ?? MissionId1,
            Name = "Mission de test",
            Description = "Description de la mission de test",
            VehicleId = vehicleId ?? VehicleId1,
            DriverId = driverId ?? DriverId1,
            Status = status,
            Priority = MissionPriority.Medium,
            StartDate = DateTime.UtcNow.AddHours(1),
            EndDate = DateTime.UtcNow.AddHours(5),
            EstimatedDistance = 450.0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false
        };
    }

    /// <summary>
    /// Crée une position GPS de test
    /// </summary>
    public static GpsPosition CreateTestGpsPosition(
        Guid? vehicleId = null,
        double latitude = 48.8566,
        double longitude = 2.3522)
    {
        return new GpsPosition
        {
            Id = Guid.NewGuid(),
            VehicleId = vehicleId ?? VehicleId1,
            Latitude = latitude,
            Longitude = longitude,
            Altitude = 35.0,
            Speed = 45.5,
            Heading = 180.0,
            Timestamp = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false
        };
    }

    /// <summary>
    /// Crée une alerte de test
    /// </summary>
    public static Alert CreateTestAlert(
        Guid? vehicleId = null,
        AlertType type = AlertType.Speeding,
        AlertSeverity severity = AlertSeverity.Warning)
    {
        return new Alert
        {
            Id = Guid.NewGuid(),
            VehicleId = vehicleId ?? VehicleId1,
            Type = type,
            Severity = severity,
            Title = "Alerte de test",
            Message = "Message d'alerte de test",
            TriggeredAt = DateTime.UtcNow,
            IsAcknowledged = false,
            IsResolved = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false
        };
    }

    /// <summary>
    /// Crée une liste de véhicules de test
    /// </summary>
    public static List<Vehicle> CreateTestVehicles(int count = 3)
    {
        var vehicles = new List<Vehicle>();
        for (int i = 0; i < count; i++)
        {
            vehicles.Add(CreateTestVehicle(
                id: Guid.NewGuid(),
                registrationNumber: $"TEST-{i + 1:000}",
                status: i % 2 == 0 ? VehicleStatus.Available : VehicleStatus.InUse
            ));
        }
        return vehicles;
    }

    /// <summary>
    /// Crée une liste de chauffeurs de test
    /// </summary>
    public static List<Driver> CreateTestDrivers(int count = 3)
    {
        var drivers = new List<Driver>();
        var firstNames = new[] { "Jean", "Marie", "Pierre", "Sophie", "Luc" };
        var lastNames = new[] { "Dupont", "Martin", "Bernard", "Dubois", "Thomas" };

        for (int i = 0; i < count; i++)
        {
            drivers.Add(CreateTestDriver(
                id: Guid.NewGuid(),
                firstName: firstNames[i % firstNames.Length],
                lastName: lastNames[i % lastNames.Length],
                status: i % 2 == 0 ? DriverStatus.Available : DriverStatus.OnDuty
            ));
        }
        return drivers;
    }
}
