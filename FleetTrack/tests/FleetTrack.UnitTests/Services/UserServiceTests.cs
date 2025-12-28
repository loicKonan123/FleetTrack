using FleetTrack.Application.DTOs.User;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces;
using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Application.Services;
using FleetTrack.Domain.Entities;
using Moq;

namespace FleetTrack.UnitTests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IRoleRepository> _roleRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly UserService _userService;
    private readonly Guid _adminRoleId = Guid.NewGuid();
    private readonly Guid _driverRoleId = Guid.NewGuid();

    public UserServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _roleRepositoryMock = new Mock<IRoleRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();

        _userService = new UserService(
            _userRepositoryMock.Object,
            _roleRepositoryMock.Object,
            _passwordHasherMock.Object
        );
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ReturnsPagedResult()
    {
        // Arrange
        var users = new List<User>
        {
            CreateTestUser("user1", "user1@test.com"),
            CreateTestUser("user2", "user2@test.com")
        };

        _userRepositoryMock.Setup(x => x.GetPagedAsync(1, 10, default))
            .ReturnsAsync(users);
        _userRepositoryMock.Setup(x => x.CountAsync(default))
            .ReturnsAsync(2);

        // Act
        var result = await _userService.GetAllAsync(1, 10);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalCount);
        Assert.Equal(1, result.PageNumber);
        Assert.Equal(10, result.PageSize);
        Assert.Equal(2, result.Items.Count());
    }

    [Fact]
    public async Task GetAllAsync_EmptyList_ReturnsEmptyPagedResult()
    {
        // Arrange
        _userRepositoryMock.Setup(x => x.GetPagedAsync(1, 10, default))
            .ReturnsAsync(new List<User>());
        _userRepositoryMock.Setup(x => x.CountAsync(default))
            .ReturnsAsync(0);

        // Act
        var result = await _userService.GetAllAsync(1, 10);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.TotalCount);
        Assert.Empty(result.Items);
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ExistingUser_ReturnsUserDetails()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser("testuser", "test@test.com");
        user.Id = userId;

        _userRepositoryMock.Setup(x => x.GetByIdWithDetailsAsync(userId, default))
            .ReturnsAsync(user);

        // Act
        var result = await _userService.GetByIdAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(userId, result.Id);
        Assert.Equal("testuser", result.Username);
        Assert.Equal("test@test.com", result.Email);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingUser_ReturnsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepositoryMock.Setup(x => x.GetByIdWithDetailsAsync(userId, default))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _userService.GetByIdAsync(userId);

        // Assert
        Assert.Null(result);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_ValidData_CreatesUser()
    {
        // Arrange
        var dto = new CreateUserDto
        {
            Username = "newuser",
            Email = "newuser@test.com",
            Password = "Password123!",
            FirstName = "New",
            LastName = "User",
            RoleId = _adminRoleId,
            IsActive = true
        };

        var role = new Role { Id = _adminRoleId, Name = "Admin", Description = "Admin role" };
        var createdUser = CreateTestUser(dto.Username, dto.Email);
        createdUser.RoleId = _adminRoleId;
        createdUser.Role = role;

        _userRepositoryMock.Setup(x => x.UsernameExistsAsync(dto.Username, default))
            .ReturnsAsync(false);
        _userRepositoryMock.Setup(x => x.EmailExistsAsync(dto.Email, default))
            .ReturnsAsync(false);
        _roleRepositoryMock.Setup(x => x.GetByIdAsync(_adminRoleId, default))
            .ReturnsAsync(role);
        _passwordHasherMock.Setup(x => x.HashPassword(dto.Password))
            .Returns("hashedPassword");
        _userRepositoryMock.Setup(x => x.AddAsync(It.IsAny<User>(), default))
            .ReturnsAsync(createdUser);
        _userRepositoryMock.Setup(x => x.GetByIdWithDetailsAsync(createdUser.Id, default))
            .ReturnsAsync(createdUser);

        // Act
        var result = await _userService.CreateAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Username, result.Username);
        Assert.Equal(dto.Email, result.Email);
        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<User>(), default), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_DuplicateUsername_ThrowsBusinessException()
    {
        // Arrange
        var dto = new CreateUserDto
        {
            Username = "existinguser",
            Email = "new@test.com",
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            RoleId = _adminRoleId
        };

        _userRepositoryMock.Setup(x => x.UsernameExistsAsync(dto.Username, default))
            .ReturnsAsync(true);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _userService.CreateAsync(dto));
        Assert.Contains("déjà utilisé", exception.Message);
    }

    [Fact]
    public async Task CreateAsync_DuplicateEmail_ThrowsBusinessException()
    {
        // Arrange
        var dto = new CreateUserDto
        {
            Username = "newuser",
            Email = "existing@test.com",
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            RoleId = _adminRoleId
        };

        _userRepositoryMock.Setup(x => x.UsernameExistsAsync(dto.Username, default))
            .ReturnsAsync(false);
        _userRepositoryMock.Setup(x => x.EmailExistsAsync(dto.Email, default))
            .ReturnsAsync(true);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _userService.CreateAsync(dto));
        Assert.Contains("déjà utilisé", exception.Message);
    }

    [Fact]
    public async Task CreateAsync_InvalidRoleId_ThrowsNotFoundException()
    {
        // Arrange
        var invalidRoleId = Guid.NewGuid();
        var dto = new CreateUserDto
        {
            Username = "newuser",
            Email = "new@test.com",
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            RoleId = invalidRoleId
        };

        _userRepositoryMock.Setup(x => x.UsernameExistsAsync(dto.Username, default))
            .ReturnsAsync(false);
        _userRepositoryMock.Setup(x => x.EmailExistsAsync(dto.Email, default))
            .ReturnsAsync(false);
        _roleRepositoryMock.Setup(x => x.GetByIdAsync(invalidRoleId, default))
            .ReturnsAsync((Role?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _userService.CreateAsync(dto));
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_ValidData_UpdatesUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var existingUser = CreateTestUser("olduser", "old@test.com");
        existingUser.Id = userId;

        var dto = new UpdateUserDto
        {
            FirstName = "Updated",
            LastName = "Name"
        };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync(existingUser);
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>(), default))
            .Returns(Task.CompletedTask);
        _userRepositoryMock.Setup(x => x.GetByIdWithDetailsAsync(userId, default))
            .ReturnsAsync(existingUser);

        // Act
        var result = await _userService.UpdateAsync(userId, dto);

        // Assert
        Assert.NotNull(result);
        _userRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>(), default), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_NonExistingUser_ThrowsNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var dto = new UpdateUserDto { FirstName = "Test" };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _userService.UpdateAsync(userId, dto));
    }

    [Fact]
    public async Task UpdateAsync_DuplicateUsername_ThrowsBusinessException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var existingUser = CreateTestUser("olduser", "old@test.com");
        existingUser.Id = userId;

        var dto = new UpdateUserDto { Username = "takenusername" };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync(existingUser);
        _userRepositoryMock.Setup(x => x.UsernameExistsAsync("takenusername", default))
            .ReturnsAsync(true);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _userService.UpdateAsync(userId, dto));
        Assert.Contains("déjà utilisé", exception.Message);
    }

    [Fact]
    public async Task UpdateAsync_DuplicateEmail_ThrowsBusinessException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var existingUser = CreateTestUser("user", "old@test.com");
        existingUser.Id = userId;

        var dto = new UpdateUserDto { Email = "taken@test.com" };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync(existingUser);
        _userRepositoryMock.Setup(x => x.EmailExistsAsync("taken@test.com", default))
            .ReturnsAsync(true);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _userService.UpdateAsync(userId, dto));
        Assert.Contains("déjà utilisé", exception.Message);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_ExistingUser_DeletesUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser("testuser", "test@test.com");
        user.Id = userId;

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _userRepositoryMock.Setup(x => x.DeleteAsync(user, default))
            .Returns(Task.CompletedTask);

        // Act
        await _userService.DeleteAsync(userId);

        // Assert
        _userRepositoryMock.Verify(x => x.DeleteAsync(user, default), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_NonExistingUser_ThrowsNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _userService.DeleteAsync(userId));
    }

    #endregion

    #region ChangePasswordAsync Tests

    [Fact]
    public async Task ChangePasswordAsync_ValidPassword_ChangesPassword()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser("testuser", "test@test.com");
        user.Id = userId;
        user.PasswordHash = "oldHashedPassword";

        var dto = new ChangePasswordDto
        {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword456!",
            ConfirmPassword = "NewPassword456!"
        };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _passwordHasherMock.Setup(x => x.VerifyPassword("OldPassword123!", "oldHashedPassword"))
            .Returns(true);
        _passwordHasherMock.Setup(x => x.HashPassword("NewPassword456!"))
            .Returns("newHashedPassword");
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _userService.ChangePasswordAsync(userId, dto);

        // Assert
        _userRepositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(u => u.PasswordHash == "newHashedPassword"), default), Times.Once);
    }

    [Fact]
    public async Task ChangePasswordAsync_WrongCurrentPassword_ThrowsBusinessException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser("testuser", "test@test.com");
        user.Id = userId;
        user.PasswordHash = "hashedPassword";

        var dto = new ChangePasswordDto
        {
            CurrentPassword = "WrongPassword!",
            NewPassword = "NewPassword456!",
            ConfirmPassword = "NewPassword456!"
        };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _passwordHasherMock.Setup(x => x.VerifyPassword("WrongPassword!", "hashedPassword"))
            .Returns(false);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => _userService.ChangePasswordAsync(userId, dto));
        Assert.Contains("incorrect", exception.Message);
    }

    #endregion

    #region ResetPasswordAsync Tests

    [Fact]
    public async Task ResetPasswordAsync_ExistingUser_ResetsPassword()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser("testuser", "test@test.com");
        user.Id = userId;

        var dto = new ResetPasswordDto { NewPassword = "NewPassword123!" };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _passwordHasherMock.Setup(x => x.HashPassword("NewPassword123!"))
            .Returns("newHashedPassword");
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _userService.ResetPasswordAsync(userId, dto);

        // Assert
        _userRepositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(u => u.PasswordHash == "newHashedPassword"), default), Times.Once);
    }

    [Fact]
    public async Task ResetPasswordAsync_NonExistingUser_ThrowsNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var dto = new ResetPasswordDto { NewPassword = "NewPassword123!" };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _userService.ResetPasswordAsync(userId, dto));
    }

    #endregion

    #region ActivateAsync Tests

    [Fact]
    public async Task ActivateAsync_ExistingUser_ActivatesUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser("testuser", "test@test.com");
        user.Id = userId;
        user.IsActive = false;

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _userService.ActivateAsync(userId);

        // Assert
        _userRepositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(u => u.IsActive == true), default), Times.Once);
    }

    [Fact]
    public async Task ActivateAsync_NonExistingUser_ThrowsNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _userService.ActivateAsync(userId));
    }

    #endregion

    #region DeactivateAsync Tests

    [Fact]
    public async Task DeactivateAsync_ExistingUser_DeactivatesUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser("testuser", "test@test.com");
        user.Id = userId;
        user.IsActive = true;

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _userService.DeactivateAsync(userId);

        // Assert
        _userRepositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(u => u.IsActive == false), default), Times.Once);
    }

    [Fact]
    public async Task DeactivateAsync_NonExistingUser_ThrowsNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, default))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _userService.DeactivateAsync(userId));
    }

    #endregion

    #region GetAllRolesAsync Tests

    [Fact]
    public async Task GetAllRolesAsync_ReturnsAllRoles()
    {
        // Arrange
        var roles = new List<Role>
        {
            new Role { Id = _adminRoleId, Name = "Admin", Description = "Administrator", Users = new List<User>() },
            new Role { Id = _driverRoleId, Name = "Driver", Description = "Driver", Users = new List<User>() }
        };

        _roleRepositoryMock.Setup(x => x.GetAllWithUserCountAsync(default))
            .ReturnsAsync(roles);

        // Act
        var result = await _userService.GetAllRolesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
    }

    #endregion

    #region GetByRoleAsync Tests

    [Fact]
    public async Task GetByRoleAsync_ReturnsUsersWithRole()
    {
        // Arrange
        var users = new List<User>
        {
            CreateTestUser("admin1", "admin1@test.com"),
            CreateTestUser("admin2", "admin2@test.com")
        };

        _userRepositoryMock.Setup(x => x.GetByRoleAsync(_adminRoleId, default))
            .ReturnsAsync(users);

        // Act
        var result = await _userService.GetByRoleAsync(_adminRoleId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
    }

    #endregion

    #region Helper Methods

    private User CreateTestUser(string username, string email)
    {
        var role = new Role
        {
            Id = _adminRoleId,
            Name = "Admin",
            Description = "Administrator"
        };

        return new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            PasswordHash = "hashedPassword",
            FirstName = "Test",
            LastName = "User",
            IsActive = true,
            RoleId = _adminRoleId,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
