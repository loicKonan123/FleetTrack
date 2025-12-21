using FluentAssertions;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Driver;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;
using FleetTrack.IntegrationTests.Helpers;
using System.Net;
using System.Net.Http.Json;

namespace FleetTrack.IntegrationTests.Controllers;

public class DriversControllerTests : IntegrationTestBase
{
    public DriversControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetAll_ShouldReturnDrivers_WhenDriversExist()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var driver1 = new Driver
        {
            Id = Guid.NewGuid(),
            FirstName = "Jean",
            LastName = "Dupont",
            Email = "jean.dupont@test.com",
            PhoneNumber = "+33612345678",
            LicenseNumber = "FR123456789",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = DriverStatus.Available,
            LastActiveDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var driver2 = new Driver
        {
            Id = Guid.NewGuid(),
            FirstName = "Marie",
            LastName = "Martin",
            Email = "marie.martin@test.com",
            PhoneNumber = "+33623456789",
            LicenseNumber = "FR987654321",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(3),
            Status = DriverStatus.OnDuty,
            LastActiveDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Drivers.AddRange(driver1, driver2);
        await context.SaveChangesAsync();

        // Act
        var result = await GetAsync<PagedResult<DriverDto>>("/api/drivers?pageNumber=1&pageSize=10");

        // Assert
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetById_ShouldReturnDriver_WhenDriverExists()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var driverId = Guid.NewGuid();
        var driver = new Driver
        {
            Id = driverId,
            FirstName = "Pierre",
            LastName = "Bernard",
            Email = "pierre.bernard@test.com",
            PhoneNumber = "+33634567890",
            LicenseNumber = "FR111222333",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(4),
            Status = DriverStatus.Available,
            LastActiveDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Drivers.Add(driver);
        await context.SaveChangesAsync();

        // Act
        var result = await GetAsync<DriverDto>($"/api/drivers/{driverId}");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(driverId);
        result.FirstName.Should().Be("Pierre");
        result.LastName.Should().Be("Bernard");
        result.Email.Should().Be("pierre.bernard@test.com");
    }

    [Fact]
    public async Task Create_ShouldCreateDriver_WhenDataIsValid()
    {
        // Arrange
        await ClearDatabaseAsync();

        var createDto = new CreateDriverDto
        {
            FirstName = "Sophie",
            LastName = "Dubois",
            Email = "sophie.dubois@test.com",
            PhoneNumber = "+33645678901",
            LicenseNumber = "FR444555666",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5)
        };

        // Act
        var result = await PostAsync<CreateDriverDto, DriverDto>("/api/drivers", createDto);

        // Assert
        result.Should().NotBeNull();
        result!.FirstName.Should().Be("Sophie");
        result.LastName.Should().Be("Dubois");
        result.Email.Should().Be("sophie.dubois@test.com");
        result.Status.Should().Be(DriverStatus.Available);

        // Vérifier dans la base
        var context = GetDbContext();
        var driverInDb = await context.Drivers.FindAsync(result.Id);
        driverInDb.Should().NotBeNull();
        driverInDb!.Email.Should().Be("sophie.dubois@test.com");
    }

    [Fact]
    public async Task Create_ShouldReturn400_WhenEmailExists()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var existingDriver = new Driver
        {
            Id = Guid.NewGuid(),
            FirstName = "Existing",
            LastName = "Driver",
            Email = "existing@test.com",
            PhoneNumber = "+33612345678",
            LicenseNumber = "FR999888777",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = DriverStatus.Available,
            LastActiveDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Drivers.Add(existingDriver);
        await context.SaveChangesAsync();

        var createDto = new CreateDriverDto
        {
            FirstName = "New",
            LastName = "Driver",
            Email = "existing@test.com", // Same email
            PhoneNumber = "+33623456789",
            LicenseNumber = "FR111111111",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/drivers", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_ShouldReturn400_WhenLicenseNumberExists()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var existingDriver = new Driver
        {
            Id = Guid.NewGuid(),
            FirstName = "Existing",
            LastName = "Driver",
            Email = "existing@test.com",
            PhoneNumber = "+33612345678",
            LicenseNumber = "FR999999999",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = DriverStatus.Available,
            LastActiveDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Drivers.Add(existingDriver);
        await context.SaveChangesAsync();

        var createDto = new CreateDriverDto
        {
            FirstName = "New",
            LastName = "Driver",
            Email = "new@test.com",
            PhoneNumber = "+33623456789",
            LicenseNumber = "FR999999999", // Same license
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/drivers", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Update_ShouldUpdateDriver_WhenDriverExists()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var driverId = Guid.NewGuid();
        var driver = new Driver
        {
            Id = driverId,
            FirstName = "Original",
            LastName = "Name",
            Email = "original@test.com",
            PhoneNumber = "+33612345678",
            LicenseNumber = "FR123456789",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = DriverStatus.Available,
            LastActiveDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Drivers.Add(driver);
        await context.SaveChangesAsync();

        var updateDto = new UpdateDriverDto
        {
            FirstName = "Updated",
            LastName = "Name",
            Email = "updated@test.com",
            PhoneNumber = "+33687654321",
            LicenseNumber = "FR123456789",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(6),
            Status = DriverStatus.OnDuty
        };

        // Act
        var result = await PutAsync<UpdateDriverDto, DriverDto>($"/api/drivers/{driverId}", updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(driverId);
        result.FirstName.Should().Be("Updated");
        result.Email.Should().Be("updated@test.com");
        result.Status.Should().Be(DriverStatus.OnDuty);
    }

    [Fact]
    public async Task Delete_ShouldDeleteDriver_WhenDriverExists()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var driverId = Guid.NewGuid();
        var driver = new Driver
        {
            Id = driverId,
            FirstName = "ToDelete",
            LastName = "Driver",
            Email = "delete@test.com",
            PhoneNumber = "+33612345678",
            LicenseNumber = "FR123456789",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = DriverStatus.Available,
            LastActiveDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Drivers.Add(driver);
        await context.SaveChangesAsync();

        // Act
        var response = await DeleteAsync($"/api/drivers/{driverId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Vérifier soft delete
        var deletedDriver = await context.Drivers.FindAsync(driverId);
        deletedDriver.Should().NotBeNull();
        deletedDriver!.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task GetAvailable_ShouldReturnOnlyAvailableDrivers()
    {
        // Arrange
        await ClearDatabaseAsync();
        var context = GetDbContext();

        var availableDriver = new Driver
        {
            Id = Guid.NewGuid(),
            FirstName = "Available",
            LastName = "Driver",
            Email = "available@test.com",
            PhoneNumber = "+33612345678",
            LicenseNumber = "FR111111111",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = DriverStatus.Available,
            LastActiveDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var onDutyDriver = new Driver
        {
            Id = Guid.NewGuid(),
            FirstName = "OnDuty",
            LastName = "Driver",
            Email = "onduty@test.com",
            PhoneNumber = "+33623456789",
            LicenseNumber = "FR222222222",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = DriverStatus.OnDuty,
            LastActiveDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Drivers.AddRange(availableDriver, onDutyDriver);
        await context.SaveChangesAsync();

        // Act
        var result = await GetAsync<List<DriverDto>>("/api/drivers/available");

        // Assert
        result.Should().NotBeNull();
        result!.Should().HaveCount(1);
        result.Should().Contain(d => d.FirstName == "Available");
        result.Should().NotContain(d => d.FirstName == "OnDuty");
    }
}
