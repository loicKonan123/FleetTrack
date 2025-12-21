using AutoMapper;
using FluentAssertions;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Driver;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Application.Services;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;
using FleetTrack.UnitTests.Fixtures;
using Moq;

namespace FleetTrack.UnitTests.Services;

public class DriverServiceTests
{
    private readonly Mock<IDriverRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly DriverService _service;

    public DriverServiceTests()
    {
        _mockRepository = new Mock<IDriverRepository>();
        _mockMapper = new Mock<IMapper>();
        _service = new DriverService(_mockRepository.Object, _mockMapper.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ShouldReturnPagedResult_WhenDriversExist()
    {
        // Arrange
        var drivers = TestDataFixture.CreateTestDrivers(5);
        var driverDtos = drivers.Select(d => new DriverDto { Id = d.Id, FirstName = d.FirstName }).ToList();

        _mockRepository.Setup(r => r.GetPagedAsync(1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(drivers);
        _mockRepository.Setup(r => r.CountAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);
        _mockMapper.Setup(m => m.Map<IEnumerable<DriverDto>>(drivers))
            .Returns(driverDtos);

        // Act
        var result = await _service.GetAllAsync(1, 10);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(5);
        result.TotalCount.Should().Be(5);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
        _mockRepository.Verify(r => r.GetPagedAsync(1, 10, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnEmptyResult_WhenNoDriversExist()
    {
        // Arrange
        var emptyList = new List<Driver>();
        _mockRepository.Setup(r => r.GetPagedAsync(1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyList);
        _mockRepository.Setup(r => r.CountAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        _mockMapper.Setup(m => m.Map<IEnumerable<DriverDto>>(emptyList))
            .Returns(new List<DriverDto>());

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
    public async Task GetByIdAsync_ShouldReturnDriver_WhenDriverExists()
    {
        // Arrange
        var driver = TestDataFixture.CreateTestDriver();
        var driverDto = new DriverDto { Id = driver.Id, FirstName = driver.FirstName, LastName = driver.LastName };

        _mockRepository.Setup(r => r.GetByIdAsync(driver.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);
        _mockMapper.Setup(m => m.Map<DriverDto>(driver))
            .Returns(driverDto);

        // Act
        var result = await _service.GetByIdAsync(driver.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(driver.Id);
        result.FirstName.Should().Be(driver.FirstName);
        _mockRepository.Verify(r => r.GetByIdAsync(driver.Id, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenDriverDoesNotExist()
    {
        // Arrange
        var driverId = Guid.NewGuid();
        _mockRepository.Setup(r => r.GetByIdAsync(driverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Driver?)null);

        // Act
        var result = await _service.GetByIdAsync(driverId);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetDetailsAsync Tests

    [Fact]
    public async Task GetDetailsAsync_ShouldReturnDetails_WhenDriverExists()
    {
        // Arrange
        var driver = TestDataFixture.CreateTestDriver();
        var detailsDto = new DriverDetailsDto { Id = driver.Id, FirstName = driver.FirstName };

        _mockRepository.Setup(r => r.GetDriverWithDetailsAsync(driver.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);
        _mockMapper.Setup(m => m.Map<DriverDetailsDto>(driver))
            .Returns(detailsDto);

        // Act
        var result = await _service.GetDetailsAsync(driver.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(driver.Id);
    }

    [Fact]
    public async Task GetDetailsAsync_ShouldReturnNull_WhenDriverDoesNotExist()
    {
        // Arrange
        var driverId = Guid.NewGuid();
        _mockRepository.Setup(r => r.GetDriverWithDetailsAsync(driverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Driver?)null);

        // Act
        var result = await _service.GetDetailsAsync(driverId);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetAvailableAsync Tests

    [Fact]
    public async Task GetAvailableAsync_ShouldReturnOnlyAvailableDrivers()
    {
        // Arrange
        var availableDrivers = new List<Driver>
        {
            TestDataFixture.CreateTestDriver(status: DriverStatus.Available),
            TestDataFixture.CreateTestDriver(id: Guid.NewGuid(), status: DriverStatus.Available)
        };
        var driverDtos = availableDrivers.Select(d => new DriverDto { Id = d.Id }).ToList();

        _mockRepository.Setup(r => r.GetAvailableDriversAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(availableDrivers);
        _mockMapper.Setup(m => m.Map<IEnumerable<DriverDto>>(availableDrivers))
            .Returns(driverDtos);

        // Act
        var result = await _service.GetAvailableAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        _mockRepository.Verify(r => r.GetAvailableDriversAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region GetByStatusAsync Tests

    [Theory]
    [InlineData(DriverStatus.Available)]
    [InlineData(DriverStatus.OnDuty)]
    [InlineData(DriverStatus.OffDuty)]
    [InlineData(DriverStatus.OnLeave)]
    public async Task GetByStatusAsync_ShouldReturnDriversWithSpecifiedStatus(DriverStatus status)
    {
        // Arrange
        var drivers = new List<Driver>
        {
            TestDataFixture.CreateTestDriver(status: status),
            TestDataFixture.CreateTestDriver(id: Guid.NewGuid(), status: status)
        };
        var driverDtos = drivers.Select(d => new DriverDto { Id = d.Id }).ToList();

        _mockRepository.Setup(r => r.GetDriversByStatusAsync(status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(drivers);
        _mockMapper.Setup(m => m.Map<IEnumerable<DriverDto>>(drivers))
            .Returns(driverDtos);

        // Act
        var result = await _service.GetByStatusAsync(status);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        _mockRepository.Verify(r => r.GetDriversByStatusAsync(status, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_ShouldCreateDriver_WhenDataIsValid()
    {
        // Arrange
        var createDto = new CreateDriverDto
        {
            FirstName = "Jean",
            LastName = "Dupont",
            Email = "jean.dupont@test.com",
            PhoneNumber = "+33612345678",
            LicenseNumber = "FR123456789",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5)
        };

        var driver = TestDataFixture.CreateTestDriver();
        var driverDto = new DriverDto { Id = driver.Id, Email = createDto.Email };

        _mockRepository.Setup(r => r.GetByEmailAsync(createDto.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Driver?)null);
        _mockRepository.Setup(r => r.GetByLicenseNumberAsync(createDto.LicenseNumber, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Driver?)null);
        _mockMapper.Setup(m => m.Map<Driver>(createDto))
            .Returns(driver);
        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Driver>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);
        _mockMapper.Setup(m => m.Map<DriverDto>(driver))
            .Returns(driverDto);

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be(createDto.Email);
        _mockRepository.Verify(r => r.GetByEmailAsync(createDto.Email, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.GetByLicenseNumberAsync(createDto.LicenseNumber, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Driver>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowValidationException_WhenEmailExists()
    {
        // Arrange
        var existingDriver = TestDataFixture.CreateTestDriver(firstName: "Existing");
        var createDto = new CreateDriverDto
        {
            FirstName = "Jean",
            LastName = "Dupont",
            Email = existingDriver.Email,
            PhoneNumber = "+33612345678",
            LicenseNumber = "NEW123",
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5)
        };

        _mockRepository.Setup(r => r.GetByEmailAsync(createDto.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDriver);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(() => _service.CreateAsync(createDto));
        exception.Message.Should().Contain(createDto.Email);
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Driver>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowValidationException_WhenLicenseNumberExists()
    {
        // Arrange
        var existingDriver = TestDataFixture.CreateTestDriver();
        var createDto = new CreateDriverDto
        {
            FirstName = "Jean",
            LastName = "Dupont",
            Email = "new@test.com",
            PhoneNumber = "+33612345678",
            LicenseNumber = existingDriver.LicenseNumber,
            LicenseExpiryDate = DateTime.UtcNow.AddYears(5)
        };

        _mockRepository.Setup(r => r.GetByEmailAsync(createDto.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Driver?)null);
        _mockRepository.Setup(r => r.GetByLicenseNumberAsync(createDto.LicenseNumber, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDriver);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(() => _service.CreateAsync(createDto));
        exception.Message.Should().Contain(createDto.LicenseNumber);
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Driver>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_ShouldUpdateDriver_WhenDriverExists()
    {
        // Arrange
        var driverId = TestDataFixture.DriverId1;
        var driver = TestDataFixture.CreateTestDriver(id: driverId);
        var updateDto = new UpdateDriverDto
        {
            FirstName = "UpdatedFirstName",
            LastName = "UpdatedLastName",
            Email = "updated@test.com",
            Status = DriverStatus.OnDuty
        };
        var updatedDriverDto = new DriverDto { Id = driverId, FirstName = updateDto.FirstName };

        _mockRepository.Setup(r => r.GetByIdAsync(driverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);
        _mockRepository.Setup(r => r.GetByEmailAsync(updateDto.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Driver?)null);
        _mockMapper.Setup(m => m.Map(updateDto, driver))
            .Returns(driver);
        _mockRepository.Setup(r => r.UpdateAsync(driver, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mockMapper.Setup(m => m.Map<DriverDto>(driver))
            .Returns(updatedDriverDto);

        // Act
        var result = await _service.UpdateAsync(driverId, updateDto);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(driverId);
        _mockRepository.Verify(r => r.UpdateAsync(driver, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowNotFoundException_WhenDriverDoesNotExist()
    {
        // Arrange
        var driverId = Guid.NewGuid();
        var updateDto = new UpdateDriverDto { FirstName = "Updated" };

        _mockRepository.Setup(r => r.GetByIdAsync(driverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Driver?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _service.UpdateAsync(driverId, updateDto));
        exception.Message.Should().Contain(driverId.ToString());
        _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<Driver>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowValidationException_WhenNewEmailExistsForAnotherDriver()
    {
        // Arrange
        var driverId = TestDataFixture.DriverId1;
        var driver = TestDataFixture.CreateTestDriver(id: driverId, firstName: "Original");
        var otherDriver = TestDataFixture.CreateTestDriver(id: Guid.NewGuid(), firstName: "Other");
        var updateDto = new UpdateDriverDto
        {
            FirstName = "Updated",
            Email = otherDriver.Email  // Trying to use another driver's email
        };

        _mockRepository.Setup(r => r.GetByIdAsync(driverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);
        _mockRepository.Setup(r => r.GetByEmailAsync(updateDto.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(otherDriver);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(() => _service.UpdateAsync(driverId, updateDto));
        exception.Message.Should().Contain(updateDto.Email);
        _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<Driver>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_ShouldDeleteDriver_WhenDriverExists()
    {
        // Arrange
        var driverId = TestDataFixture.DriverId1;
        var driver = TestDataFixture.CreateTestDriver(id: driverId);

        _mockRepository.Setup(r => r.GetByIdAsync(driverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);
        _mockRepository.Setup(r => r.DeleteAsync(driver, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.DeleteAsync(driverId);

        // Assert
        _mockRepository.Verify(r => r.GetByIdAsync(driverId, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.DeleteAsync(driver, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrowNotFoundException_WhenDriverDoesNotExist()
    {
        // Arrange
        var driverId = Guid.NewGuid();

        _mockRepository.Setup(r => r.GetByIdAsync(driverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Driver?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _service.DeleteAsync(driverId));
        exception.Message.Should().Contain(driverId.ToString());
        _mockRepository.Verify(r => r.DeleteAsync(It.IsAny<Driver>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion
}
