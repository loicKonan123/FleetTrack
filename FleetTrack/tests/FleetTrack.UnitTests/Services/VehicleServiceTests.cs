using AutoMapper;
using FluentAssertions;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Vehicle;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Application.Services;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;
using FleetTrack.UnitTests.Fixtures;
using Moq;

namespace FleetTrack.UnitTests.Services;

public class VehicleServiceTests
{
    private readonly Mock<IVehicleRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly VehicleService _service;

    public VehicleServiceTests()
    {
        _mockRepository = new Mock<IVehicleRepository>();
        _mockMapper = new Mock<IMapper>();
        _service = new VehicleService(_mockRepository.Object, _mockMapper.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ShouldReturnPagedResult_WhenVehiclesExist()
    {
        // Arrange
        var vehicles = TestDataFixture.CreateTestVehicles(5);
        var vehicleDtos = vehicles.Select(v => new VehicleDto { Id = v.Id, RegistrationNumber = v.RegistrationNumber }).ToList();

        _mockRepository.Setup(r => r.GetPagedAsync(1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicles);
        _mockRepository.Setup(r => r.CountAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);
        _mockMapper.Setup(m => m.Map<IEnumerable<VehicleDto>>(vehicles))
            .Returns(vehicleDtos);

        // Act
        var result = await _service.GetAllAsync(1, 10);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(5);
        result.TotalCount.Should().Be(5);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
        _mockRepository.Verify(r => r.GetPagedAsync(1, 10, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.CountAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnEmptyResult_WhenNoVehiclesExist()
    {
        // Arrange
        var emptyList = new List<Vehicle>();
        _mockRepository.Setup(r => r.GetPagedAsync(1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyList);
        _mockRepository.Setup(r => r.CountAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        _mockMapper.Setup(m => m.Map<IEnumerable<VehicleDto>>(emptyList))
            .Returns(new List<VehicleDto>());

        // Act
        var result = await _service.GetAllAsync(1, 10);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ShouldReturnVehicle_WhenVehicleExists()
    {
        // Arrange
        var vehicle = TestDataFixture.CreateTestVehicle();
        var vehicleDto = new VehicleDto { Id = vehicle.Id, RegistrationNumber = vehicle.RegistrationNumber };

        _mockRepository.Setup(r => r.GetByIdAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _mockMapper.Setup(m => m.Map<VehicleDto>(vehicle))
            .Returns(vehicleDto);

        // Act
        var result = await _service.GetByIdAsync(vehicle.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(vehicle.Id);
        result.RegistrationNumber.Should().Be(vehicle.RegistrationNumber);
        _mockRepository.Verify(r => r.GetByIdAsync(vehicle.Id, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenVehicleDoesNotExist()
    {
        // Arrange
        var vehicleId = Guid.NewGuid();
        _mockRepository.Setup(r => r.GetByIdAsync(vehicleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Vehicle?)null);

        // Act
        var result = await _service.GetByIdAsync(vehicleId);

        // Assert
        result.Should().BeNull();
        _mockRepository.Verify(r => r.GetByIdAsync(vehicleId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region GetDetailsAsync Tests

    [Fact]
    public async Task GetDetailsAsync_ShouldReturnDetails_WhenVehicleExists()
    {
        // Arrange
        var vehicle = TestDataFixture.CreateTestVehicle();
        var detailsDto = new VehicleDetailsDto { Id = vehicle.Id, RegistrationNumber = vehicle.RegistrationNumber };

        _mockRepository.Setup(r => r.GetVehicleWithDetailsAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _mockMapper.Setup(m => m.Map<VehicleDetailsDto>(vehicle))
            .Returns(detailsDto);

        // Act
        var result = await _service.GetDetailsAsync(vehicle.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(vehicle.Id);
        _mockRepository.Verify(r => r.GetVehicleWithDetailsAsync(vehicle.Id, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetDetailsAsync_ShouldReturnNull_WhenVehicleDoesNotExist()
    {
        // Arrange
        var vehicleId = Guid.NewGuid();
        _mockRepository.Setup(r => r.GetVehicleWithDetailsAsync(vehicleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Vehicle?)null);

        // Act
        var result = await _service.GetDetailsAsync(vehicleId);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetAvailableAsync Tests

    [Fact]
    public async Task GetAvailableAsync_ShouldReturnOnlyAvailableVehicles()
    {
        // Arrange
        var availableVehicles = new List<Vehicle>
        {
            TestDataFixture.CreateTestVehicle(status: VehicleStatus.Available),
            TestDataFixture.CreateTestVehicle(id: Guid.NewGuid(), status: VehicleStatus.Available)
        };
        var vehicleDtos = availableVehicles.Select(v => new VehicleDto { Id = v.Id }).ToList();

        _mockRepository.Setup(r => r.GetAvailableVehiclesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(availableVehicles);
        _mockMapper.Setup(m => m.Map<IEnumerable<VehicleDto>>(availableVehicles))
            .Returns(vehicleDtos);

        // Act
        var result = await _service.GetAvailableAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(v => v.Should().NotBeNull());
        _mockRepository.Verify(r => r.GetAvailableVehiclesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region GetByStatusAsync Tests

    [Theory]
    [InlineData(VehicleStatus.Available)]
    [InlineData(VehicleStatus.InUse)]
    [InlineData(VehicleStatus.InMaintenance)]
    [InlineData(VehicleStatus.OutOfService)]
    public async Task GetByStatusAsync_ShouldReturnVehiclesWithSpecifiedStatus(VehicleStatus status)
    {
        // Arrange
        var vehicles = new List<Vehicle>
        {
            TestDataFixture.CreateTestVehicle(status: status),
            TestDataFixture.CreateTestVehicle(id: Guid.NewGuid(), status: status)
        };
        var vehicleDtos = vehicles.Select(v => new VehicleDto { Id = v.Id }).ToList();

        _mockRepository.Setup(r => r.GetVehiclesByStatusAsync(status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicles);
        _mockMapper.Setup(m => m.Map<IEnumerable<VehicleDto>>(vehicles))
            .Returns(vehicleDtos);

        // Act
        var result = await _service.GetByStatusAsync(status);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        _mockRepository.Verify(r => r.GetVehiclesByStatusAsync(status, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_ShouldCreateVehicle_WhenDataIsValid()
    {
        // Arrange
        var createDto = new CreateVehicleDto
        {
            RegistrationNumber = "NEW-123",
            Brand = "Toyota",
            Model = "Corolla",
            Year = 2024,
            Type = VehicleType.Car,
            FuelType = FuelType.Gasoline,
            FuelCapacity = 50.0,
            CurrentFuelLevel = 50.0,
            Mileage = 0
        };

        var vehicle = TestDataFixture.CreateTestVehicle(registrationNumber: createDto.RegistrationNumber);
        var vehicleDto = new VehicleDto { Id = vehicle.Id, RegistrationNumber = createDto.RegistrationNumber };

        _mockRepository.Setup(r => r.GetByRegistrationNumberAsync(createDto.RegistrationNumber, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Vehicle?)null);
        _mockMapper.Setup(m => m.Map<Vehicle>(createDto))
            .Returns(vehicle);
        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Vehicle>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _mockMapper.Setup(m => m.Map<VehicleDto>(vehicle))
            .Returns(vehicleDto);

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.RegistrationNumber.Should().Be(createDto.RegistrationNumber);
        _mockRepository.Verify(r => r.GetByRegistrationNumberAsync(createDto.RegistrationNumber, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Vehicle>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowValidationException_WhenRegistrationNumberExists()
    {
        // Arrange
        var existingVehicle = TestDataFixture.CreateTestVehicle(registrationNumber: "EXISTING-123");
        var createDto = new CreateVehicleDto
        {
            RegistrationNumber = "EXISTING-123",
            Brand = "Toyota",
            Model = "Corolla",
            Year = 2024,
            Type = VehicleType.Car,
            FuelType = FuelType.Gasoline,
            FuelCapacity = 50.0,
            CurrentFuelLevel = 50.0,
            Mileage = 0
        };

        _mockRepository.Setup(r => r.GetByRegistrationNumberAsync(createDto.RegistrationNumber, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingVehicle);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(() => _service.CreateAsync(createDto));
        exception.Message.Should().Contain("EXISTING-123");
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Vehicle>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_ShouldUpdateVehicle_WhenVehicleExists()
    {
        // Arrange
        var vehicleId = TestDataFixture.VehicleId1;
        var vehicle = TestDataFixture.CreateTestVehicle(id: vehicleId);
        var updateDto = new UpdateVehicleDto
        {
            Brand = "UpdatedBrand",
            Model = "UpdatedModel",
            Status = VehicleStatus.InMaintenance
        };
        var updatedVehicleDto = new VehicleDto { Id = vehicleId, Brand = updateDto.Brand };

        _mockRepository.Setup(r => r.GetByIdAsync(vehicleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _mockMapper.Setup(m => m.Map(updateDto, vehicle))
            .Returns(vehicle);
        _mockRepository.Setup(r => r.UpdateAsync(vehicle, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mockMapper.Setup(m => m.Map<VehicleDto>(vehicle))
            .Returns(updatedVehicleDto);

        // Act
        var result = await _service.UpdateAsync(vehicleId, updateDto);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(vehicleId);
        _mockRepository.Verify(r => r.GetByIdAsync(vehicleId, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.UpdateAsync(vehicle, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowNotFoundException_WhenVehicleDoesNotExist()
    {
        // Arrange
        var vehicleId = Guid.NewGuid();
        var updateDto = new UpdateVehicleDto { Brand = "UpdatedBrand" };

        _mockRepository.Setup(r => r.GetByIdAsync(vehicleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Vehicle?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _service.UpdateAsync(vehicleId, updateDto));
        exception.Message.Should().Contain(vehicleId.ToString());
        _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<Vehicle>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_ShouldDeleteVehicle_WhenVehicleExists()
    {
        // Arrange
        var vehicleId = TestDataFixture.VehicleId1;
        var vehicle = TestDataFixture.CreateTestVehicle(id: vehicleId);

        _mockRepository.Setup(r => r.GetByIdAsync(vehicleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _mockRepository.Setup(r => r.DeleteAsync(vehicle, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.DeleteAsync(vehicleId);

        // Assert
        _mockRepository.Verify(r => r.GetByIdAsync(vehicleId, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.DeleteAsync(vehicle, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrowNotFoundException_WhenVehicleDoesNotExist()
    {
        // Arrange
        var vehicleId = Guid.NewGuid();

        _mockRepository.Setup(r => r.GetByIdAsync(vehicleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Vehicle?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _service.DeleteAsync(vehicleId));
        exception.Message.Should().Contain(vehicleId.ToString());
        _mockRepository.Verify(r => r.DeleteAsync(It.IsAny<Vehicle>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion
}
