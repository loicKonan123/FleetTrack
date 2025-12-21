using FluentAssertions;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Vehicle;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;
using FleetTrack.IntegrationTests.Helpers;
using System.Net;
using System.Net.Http.Json;

namespace FleetTrack.IntegrationTests.Controllers;

public class VehiclesControllerTests : IntegrationTestBase
{
    public VehiclesControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetAll_ShouldReturnEmptyList_WhenNoVehicles()
    {
        // Arrange
        await ClearDatabaseAsync();

        // Act
        var result = await GetAsync<PagedResult<VehicleDto>>("/api/vehicles?pageNumber=1&pageSize=10");

        // Assert
        result.Should().NotBeNull();
        result!.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task GetAll_ShouldReturnVehicles_WhenVehiclesExist()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var vehicle1 = new Vehicle
        {
            Id = Guid.NewGuid(),
            RegistrationNumber = "TEST-001",
            Brand = "Toyota",
            Model = "Hilux",
            Year = 2023,
            Type = VehicleType.Truck,
            Status = VehicleStatus.Available,
            FuelType = FuelType.Diesel,
            FuelCapacity = 80.0,
            CurrentFuelLevel = 65.0,
            Mileage = 15000,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var vehicle2 = new Vehicle
        {
            Id = Guid.NewGuid(),
            RegistrationNumber = "TEST-002",
            Brand = "Mercedes",
            Model = "Sprinter",
            Year = 2022,
            Type = VehicleType.Van,
            Status = VehicleStatus.Available,
            FuelType = FuelType.Diesel,
            FuelCapacity = 70.0,
            CurrentFuelLevel = 45.0,
            Mileage = 28500,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Vehicles.AddRange(vehicle1, vehicle2);
        await context.SaveChangesAsync();

        // Act
        var result = await GetAsync<PagedResult<VehicleDto>>("/api/vehicles?pageNumber=1&pageSize=10");

        // Assert
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.Items.Should().Contain(v => v.RegistrationNumber == "TEST-001");
        result.Items.Should().Contain(v => v.RegistrationNumber == "TEST-002");
    }

    [Fact]
    public async Task GetById_ShouldReturnVehicle_WhenVehicleExists()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var vehicleId = Guid.NewGuid();
        var vehicle = new Vehicle
        {
            Id = vehicleId,
            RegistrationNumber = "TEST-123",
            Brand = "Toyota",
            Model = "Corolla",
            Year = 2024,
            Type = VehicleType.Car,
            Status = VehicleStatus.Available,
            FuelType = FuelType.Gasoline,
            FuelCapacity = 50.0,
            CurrentFuelLevel = 40.0,
            Mileage = 5000,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Vehicles.Add(vehicle);
        await context.SaveChangesAsync();

        // Act
        var result = await GetAsync<VehicleDto>($"/api/vehicles/{vehicleId}");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(vehicleId);
        result.RegistrationNumber.Should().Be("TEST-123");
        result.Brand.Should().Be("Toyota");
        result.Model.Should().Be("Corolla");
    }

    [Fact]
    public async Task GetById_ShouldReturn404_WhenVehicleDoesNotExist()
    {
        // Arrange
        await ClearDatabaseAsync();
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/vehicles/{nonExistentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_ShouldCreateVehicle_WhenDataIsValid()
    {
        // Arrange
        await ClearDatabaseAsync();

        var createDto = new CreateVehicleDto
        {
            RegistrationNumber = "NEW-456",
            Brand = "Ford",
            Model = "Transit",
            Year = 2024,
            Type = VehicleType.Van,
            FuelType = FuelType.Diesel,
            FuelCapacity = 70.0,
            CurrentFuelLevel = 70.0,
            Mileage = 0
        };

        // Act
        var result = await PostAsync<CreateVehicleDto, VehicleDto>("/api/vehicles", createDto);

        // Assert
        result.Should().NotBeNull();
        result!.RegistrationNumber.Should().Be("NEW-456");
        result.Brand.Should().Be("Ford");
        result.Model.Should().Be("Transit");
        result.Status.Should().Be(VehicleStatus.Available);

        // Vérifier que le véhicule est bien dans la base
        var context = GetDbContext();
        var vehicleInDb = await context.Vehicles.FindAsync(result.Id);
        vehicleInDb.Should().NotBeNull();
        vehicleInDb!.RegistrationNumber.Should().Be("NEW-456");
    }

    [Fact]
    public async Task Create_ShouldReturn400_WhenRegistrationNumberExists()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var existingVehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            RegistrationNumber = "EXISTING-123",
            Brand = "Toyota",
            Model = "Hilux",
            Year = 2023,
            Type = VehicleType.Truck,
            Status = VehicleStatus.Available,
            FuelType = FuelType.Diesel,
            FuelCapacity = 80.0,
            CurrentFuelLevel = 65.0,
            Mileage = 15000,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Vehicles.Add(existingVehicle);
        await context.SaveChangesAsync();

        var createDto = new CreateVehicleDto
        {
            RegistrationNumber = "EXISTING-123",
            Brand = "Ford",
            Model = "Transit",
            Year = 2024,
            Type = VehicleType.Van,
            FuelType = FuelType.Diesel,
            FuelCapacity = 70.0,
            CurrentFuelLevel = 70.0,
            Mileage = 0
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/vehicles", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Update_ShouldUpdateVehicle_WhenVehicleExists()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var vehicleId = Guid.NewGuid();
        var vehicle = new Vehicle
        {
            Id = vehicleId,
            RegistrationNumber = "UPDATE-001",
            Brand = "Toyota",
            Model = "Hilux",
            Year = 2023,
            Type = VehicleType.Truck,
            Status = VehicleStatus.Available,
            FuelType = FuelType.Diesel,
            FuelCapacity = 80.0,
            CurrentFuelLevel = 65.0,
            Mileage = 15000,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Vehicles.Add(vehicle);
        await context.SaveChangesAsync();

        var updateDto = new UpdateVehicleDto
        {
            Brand = "Toyota",
            Model = "Hilux",
            Status = VehicleStatus.InMaintenance,
            CurrentFuelLevel = 30.0,
            Mileage = 20000
        };

        // Act
        var result = await PutAsync<UpdateVehicleDto, VehicleDto>($"/api/vehicles/{vehicleId}", updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(vehicleId);
        result.Status.Should().Be(VehicleStatus.InMaintenance);
        result.CurrentFuelLevel.Should().Be(30.0);
        result.Mileage.Should().Be(20000);
    }

    [Fact]
    public async Task Update_ShouldReturn404_WhenVehicleDoesNotExist()
    {
        // Arrange
        await ClearDatabaseAsync();
        var nonExistentId = Guid.NewGuid();

        var updateDto = new UpdateVehicleDto
        {
            Brand = "Toyota",
            Model = "Hilux",
            Status = VehicleStatus.Available,
            CurrentFuelLevel = 65.0,
            Mileage = 15000
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/vehicles/{nonExistentId}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Delete_ShouldDeleteVehicle_WhenVehicleExists()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var vehicleId = Guid.NewGuid();
        var vehicle = new Vehicle
        {
            Id = vehicleId,
            RegistrationNumber = "DELETE-001",
            Brand = "Toyota",
            Model = "Hilux",
            Year = 2023,
            Type = VehicleType.Truck,
            Status = VehicleStatus.Available,
            FuelType = FuelType.Diesel,
            FuelCapacity = 80.0,
            CurrentFuelLevel = 65.0,
            Mileage = 15000,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Vehicles.Add(vehicle);
        await context.SaveChangesAsync();

        // Act
        var response = await DeleteAsync($"/api/vehicles/{vehicleId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Vérifier que le véhicule est soft deleted
        var deletedVehicle = await context.Vehicles.FindAsync(vehicleId);
        deletedVehicle.Should().NotBeNull();
        deletedVehicle!.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task Delete_ShouldReturn404_WhenVehicleDoesNotExist()
    {
        // Arrange
        await ClearDatabaseAsync();
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await DeleteAsync($"/api/vehicles/{nonExistentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetAvailable_ShouldReturnOnlyAvailableVehicles()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var availableVehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            RegistrationNumber = "AVAILABLE-001",
            Brand = "Toyota",
            Model = "Hilux",
            Year = 2023,
            Type = VehicleType.Truck,
            Status = VehicleStatus.Available,
            FuelType = FuelType.Diesel,
            FuelCapacity = 80.0,
            CurrentFuelLevel = 65.0,
            Mileage = 15000,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var inUseVehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            RegistrationNumber = "INUSE-002",
            Brand = "Mercedes",
            Model = "Sprinter",
            Year = 2022,
            Type = VehicleType.Van,
            Status = VehicleStatus.InUse,
            FuelType = FuelType.Diesel,
            FuelCapacity = 70.0,
            CurrentFuelLevel = 45.0,
            Mileage = 28500,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Vehicles.AddRange(availableVehicle, inUseVehicle);
        await context.SaveChangesAsync();

        // Act
        var result = await GetAsync<List<VehicleDto>>("/api/vehicles/available");

        // Assert
        result.Should().NotBeNull();
        result!.Should().HaveCount(1);
        result.Should().Contain(v => v.RegistrationNumber == "AVAILABLE-001");
        result.Should().NotContain(v => v.RegistrationNumber == "INUSE-002");
    }
}
