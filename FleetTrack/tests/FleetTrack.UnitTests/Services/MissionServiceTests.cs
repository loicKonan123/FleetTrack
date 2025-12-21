using AutoMapper;
using FluentAssertions;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Mission;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Application.Services;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;
using FleetTrack.UnitTests.Fixtures;
using Moq;

namespace FleetTrack.UnitTests.Services;

public class MissionServiceTests
{
    private readonly Mock<IMissionRepository> _mockMissionRepository;
    private readonly Mock<IVehicleRepository> _mockVehicleRepository;
    private readonly Mock<IDriverRepository> _mockDriverRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly MissionService _service;

    public MissionServiceTests()
    {
        _mockMissionRepository = new Mock<IMissionRepository>();
        _mockVehicleRepository = new Mock<IVehicleRepository>();
        _mockDriverRepository = new Mock<IDriverRepository>();
        _mockMapper = new Mock<IMapper>();
        _service = new MissionService(
            _mockMissionRepository.Object,
            _mockVehicleRepository.Object,
            _mockDriverRepository.Object,
            _mockMapper.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ShouldReturnPagedResult_WhenMissionsExist()
    {
        // Arrange
        var missions = new List<Mission>
        {
            TestDataFixture.CreateTestMission(),
            TestDataFixture.CreateTestMission(id: Guid.NewGuid())
        };
        var missionDtos = missions.Select(m => new MissionDto { Id = m.Id, Name = m.Name }).ToList();

        _mockMissionRepository.Setup(r => r.GetPagedAsync(1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(missions);
        _mockMissionRepository.Setup(r => r.CountAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);
        _mockMapper.Setup(m => m.Map<IEnumerable<MissionDto>>(missions))
            .Returns(missionDtos);

        // Act
        var result = await _service.GetAllAsync(1, 10);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ShouldReturnMission_WhenMissionExists()
    {
        // Arrange
        var mission = TestDataFixture.CreateTestMission();
        var missionDto = new MissionDto { Id = mission.Id, Name = mission.Name };

        _mockMissionRepository.Setup(r => r.GetByIdAsync(mission.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mission);
        _mockMapper.Setup(m => m.Map<MissionDto>(mission))
            .Returns(missionDto);

        // Act
        var result = await _service.GetByIdAsync(mission.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(mission.Id);
        result.Name.Should().Be(mission.Name);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenMissionDoesNotExist()
    {
        // Arrange
        var missionId = Guid.NewGuid();
        _mockMissionRepository.Setup(r => r.GetByIdAsync(missionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mission?)null);

        // Act
        var result = await _service.GetByIdAsync(missionId);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetDetailsAsync Tests

    [Fact]
    public async Task GetDetailsAsync_ShouldReturnDetails_WhenMissionExists()
    {
        // Arrange
        var mission = TestDataFixture.CreateTestMission();
        var detailsDto = new MissionDetailsDto { Id = mission.Id, Name = mission.Name };

        _mockMissionRepository.Setup(r => r.GetMissionWithDetailsAsync(mission.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mission);
        _mockMapper.Setup(m => m.Map<MissionDetailsDto>(mission))
            .Returns(detailsDto);

        // Act
        var result = await _service.GetDetailsAsync(mission.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(mission.Id);
    }

    #endregion

    #region GetActiveAsync Tests

    [Fact]
    public async Task GetActiveAsync_ShouldReturnOnlyActiveMissions()
    {
        // Arrange
        var activeMissions = new List<Mission>
        {
            TestDataFixture.CreateTestMission(status: MissionStatus.InProgress),
            TestDataFixture.CreateTestMission(id: Guid.NewGuid(), status: MissionStatus.Assigned)
        };
        var missionDtos = activeMissions.Select(m => new MissionDto { Id = m.Id }).ToList();

        _mockMissionRepository.Setup(r => r.GetActiveMissionsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(activeMissions);
        _mockMapper.Setup(m => m.Map<IEnumerable<MissionDto>>(activeMissions))
            .Returns(missionDtos);

        // Act
        var result = await _service.GetActiveAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    #endregion

    #region GetByStatusAsync Tests

    [Theory]
    [InlineData(MissionStatus.Planned)]
    [InlineData(MissionStatus.Assigned)]
    [InlineData(MissionStatus.InProgress)]
    [InlineData(MissionStatus.Completed)]
    [InlineData(MissionStatus.Cancelled)]
    public async Task GetByStatusAsync_ShouldReturnMissionsWithSpecifiedStatus(MissionStatus status)
    {
        // Arrange
        var missions = new List<Mission>
        {
            TestDataFixture.CreateTestMission(status: status),
            TestDataFixture.CreateTestMission(id: Guid.NewGuid(), status: status)
        };
        var missionDtos = missions.Select(m => new MissionDto { Id = m.Id }).ToList();

        _mockMissionRepository.Setup(r => r.GetMissionsByStatusAsync(status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(missions);
        _mockMapper.Setup(m => m.Map<IEnumerable<MissionDto>>(missions))
            .Returns(missionDtos);

        // Act
        var result = await _service.GetByStatusAsync(status);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_ShouldCreateMission_WhenDataIsValid()
    {
        // Arrange
        var vehicle = TestDataFixture.CreateTestVehicle(status: VehicleStatus.Available);
        var driver = TestDataFixture.CreateTestDriver(status: DriverStatus.Available);
        driver.LicenseExpiryDate = DateTime.UtcNow.AddYears(2);

        var createDto = new CreateMissionDto
        {
            Name = "Mission de test",
            Description = "Test mission description",
            VehicleId = vehicle.Id,
            DriverId = driver.Id,
            StartDate = DateTime.UtcNow.AddHours(1),
            EstimatedDistance = 450.0,
            Priority = MissionPriority.Medium
        };

        var mission = TestDataFixture.CreateTestMission();
        var missionDto = new MissionDto { Id = mission.Id, Name = createDto.Name };

        _mockVehicleRepository.Setup(r => r.GetByIdAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _mockDriverRepository.Setup(r => r.GetByIdAsync(driver.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);
        _mockMapper.Setup(m => m.Map<Mission>(createDto))
            .Returns(mission);
        _mockMissionRepository.Setup(r => r.AddAsync(It.IsAny<Mission>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(mission);
        _mockMapper.Setup(m => m.Map<MissionDto>(mission))
            .Returns(missionDto);

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(createDto.Name);
        _mockMissionRepository.Verify(r => r.AddAsync(It.IsAny<Mission>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowNotFoundException_WhenVehicleDoesNotExist()
    {
        // Arrange
        var createDto = new CreateMissionDto
        {
            Name = "Mission de test",
            VehicleId = Guid.NewGuid(),
            DriverId = Guid.NewGuid()
        };

        _mockVehicleRepository.Setup(r => r.GetByIdAsync(createDto.VehicleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Vehicle?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _service.CreateAsync(createDto));
        exception.Message.Should().Contain(createDto.VehicleId.ToString());
        _mockMissionRepository.Verify(r => r.AddAsync(It.IsAny<Mission>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowBusinessException_WhenVehicleIsNotAvailable()
    {
        // Arrange
        var vehicle = TestDataFixture.CreateTestVehicle(status: VehicleStatus.InUse);
        var createDto = new CreateMissionDto
        {
            Name = "Mission de test",
            VehicleId = vehicle.Id,
            DriverId = Guid.NewGuid()
        };

        _mockVehicleRepository.Setup(r => r.GetByIdAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(() => _service.CreateAsync(createDto));
        exception.Message.Should().Contain("n'est pas disponible");
        _mockMissionRepository.Verify(r => r.AddAsync(It.IsAny<Mission>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowNotFoundException_WhenDriverDoesNotExist()
    {
        // Arrange
        var vehicle = TestDataFixture.CreateTestVehicle(status: VehicleStatus.Available);
        var createDto = new CreateMissionDto
        {
            Name = "Mission de test",
            VehicleId = vehicle.Id,
            DriverId = Guid.NewGuid()
        };

        _mockVehicleRepository.Setup(r => r.GetByIdAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _mockDriverRepository.Setup(r => r.GetByIdAsync(createDto.DriverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Driver?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _service.CreateAsync(createDto));
        exception.Message.Should().Contain(createDto.DriverId.ToString());
        _mockMissionRepository.Verify(r => r.AddAsync(It.IsAny<Mission>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowBusinessException_WhenDriverIsNotAvailable()
    {
        // Arrange
        var vehicle = TestDataFixture.CreateTestVehicle(status: VehicleStatus.Available);
        var driver = TestDataFixture.CreateTestDriver(status: DriverStatus.OnDuty);
        var createDto = new CreateMissionDto
        {
            Name = "Mission de test",
            VehicleId = vehicle.Id,
            DriverId = driver.Id
        };

        _mockVehicleRepository.Setup(r => r.GetByIdAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _mockDriverRepository.Setup(r => r.GetByIdAsync(driver.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(() => _service.CreateAsync(createDto));
        exception.Message.Should().Contain("n'est pas disponible");
        _mockMissionRepository.Verify(r => r.AddAsync(It.IsAny<Mission>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowBusinessException_WhenDriverLicenseIsExpired()
    {
        // Arrange
        var vehicle = TestDataFixture.CreateTestVehicle(status: VehicleStatus.Available);
        var driver = TestDataFixture.CreateTestDriver(status: DriverStatus.Available);
        driver.LicenseExpiryDate = DateTime.UtcNow.AddDays(-1); // Expired yesterday

        var createDto = new CreateMissionDto
        {
            Name = "Mission de test",
            VehicleId = vehicle.Id,
            DriverId = driver.Id
        };

        _mockVehicleRepository.Setup(r => r.GetByIdAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _mockDriverRepository.Setup(r => r.GetByIdAsync(driver.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(() => _service.CreateAsync(createDto));
        exception.Message.Should().Contain("expiré");
        _mockMissionRepository.Verify(r => r.AddAsync(It.IsAny<Mission>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_ShouldUpdateMission_WhenMissionExists()
    {
        // Arrange
        var missionId = TestDataFixture.MissionId1;
        var mission = TestDataFixture.CreateTestMission(id: missionId);
        var updateDto = new UpdateMissionDto
        {
            Name = "Mission mise à jour",
            Status = MissionStatus.InProgress
        };
        var updatedMissionDto = new MissionDto { Id = missionId, Name = updateDto.Name };

        _mockMissionRepository.Setup(r => r.GetByIdAsync(missionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mission);
        _mockMapper.Setup(m => m.Map(updateDto, mission))
            .Returns(mission);
        _mockMissionRepository.Setup(r => r.UpdateAsync(mission, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mockMapper.Setup(m => m.Map<MissionDto>(mission))
            .Returns(updatedMissionDto);

        // Act
        var result = await _service.UpdateAsync(missionId, updateDto);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(missionId);
        _mockMissionRepository.Verify(r => r.UpdateAsync(mission, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowNotFoundException_WhenMissionDoesNotExist()
    {
        // Arrange
        var missionId = Guid.NewGuid();
        var updateDto = new UpdateMissionDto { Name = "Updated" };

        _mockMissionRepository.Setup(r => r.GetByIdAsync(missionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mission?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _service.UpdateAsync(missionId, updateDto));
        exception.Message.Should().Contain(missionId.ToString());
    }

    #endregion

    #region AssignAsync Tests

    [Fact]
    public async Task AssignAsync_ShouldAssignMission_WhenAllEntitiesExist()
    {
        // Arrange
        var missionId = TestDataFixture.MissionId1;
        var mission = TestDataFixture.CreateTestMission(id: missionId);
        var vehicle = TestDataFixture.CreateTestVehicle();
        var driver = TestDataFixture.CreateTestDriver();
        var assignDto = new AssignMissionDto
        {
            VehicleId = vehicle.Id,
            DriverId = driver.Id,
            StartDate = DateTime.UtcNow.AddHours(1)
        };
        var assignedMissionDto = new MissionDto { Id = missionId };

        _mockMissionRepository.Setup(r => r.GetByIdAsync(missionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mission);
        _mockVehicleRepository.Setup(r => r.GetByIdAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _mockDriverRepository.Setup(r => r.GetByIdAsync(driver.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(driver);
        _mockMissionRepository.Setup(r => r.UpdateAsync(mission, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mockMapper.Setup(m => m.Map<MissionDto>(mission))
            .Returns(assignedMissionDto);

        // Act
        var result = await _service.AssignAsync(missionId, assignDto);

        // Assert
        result.Should().NotBeNull();
        mission.Status.Should().Be(MissionStatus.Assigned);
        mission.VehicleId.Should().Be(vehicle.Id);
        mission.DriverId.Should().Be(driver.Id);
        _mockMissionRepository.Verify(r => r.UpdateAsync(mission, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task AssignAsync_ShouldThrowNotFoundException_WhenMissionDoesNotExist()
    {
        // Arrange
        var missionId = Guid.NewGuid();
        var assignDto = new AssignMissionDto
        {
            VehicleId = Guid.NewGuid(),
            DriverId = Guid.NewGuid()
        };

        _mockMissionRepository.Setup(r => r.GetByIdAsync(missionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mission?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _service.AssignAsync(missionId, assignDto));
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_ShouldDeleteMission_WhenMissionExistsAndNotInProgress()
    {
        // Arrange
        var missionId = TestDataFixture.MissionId1;
        var mission = TestDataFixture.CreateTestMission(id: missionId, status: MissionStatus.Planned);

        _mockMissionRepository.Setup(r => r.GetByIdAsync(missionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mission);
        _mockMissionRepository.Setup(r => r.DeleteAsync(mission, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.DeleteAsync(missionId);

        // Assert
        _mockMissionRepository.Verify(r => r.DeleteAsync(mission, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrowNotFoundException_WhenMissionDoesNotExist()
    {
        // Arrange
        var missionId = Guid.NewGuid();

        _mockMissionRepository.Setup(r => r.GetByIdAsync(missionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mission?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _service.DeleteAsync(missionId));
        exception.Message.Should().Contain(missionId.ToString());
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrowBusinessException_WhenMissionIsInProgress()
    {
        // Arrange
        var missionId = TestDataFixture.MissionId1;
        var mission = TestDataFixture.CreateTestMission(id: missionId, status: MissionStatus.InProgress);

        _mockMissionRepository.Setup(r => r.GetByIdAsync(missionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mission);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(() => _service.DeleteAsync(missionId));
        exception.Message.Should().Contain("en cours");
        _mockMissionRepository.Verify(r => r.DeleteAsync(It.IsAny<Mission>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion
}
