using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.User;

namespace FleetTrack.Application.Interfaces;

public interface IUserService
{
    // Read operations
    Task<PagedResult<UserListDto>> GetAllAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<UserDetailsDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserListDto>> GetByRoleAsync(Guid roleId, CancellationToken cancellationToken = default);

    // Write operations
    Task<UserDetailsDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default);
    Task<UserDetailsDto> UpdateAsync(Guid id, UpdateUserDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Password management
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken cancellationToken = default);
    Task ResetPasswordAsync(Guid userId, ResetPasswordDto dto, CancellationToken cancellationToken = default);

    // Status management
    Task ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);

    // Role operations
    Task<IEnumerable<RoleDto>> GetAllRolesAsync(CancellationToken cancellationToken = default);
}
