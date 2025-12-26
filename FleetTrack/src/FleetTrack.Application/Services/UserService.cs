using AutoMapper;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.User;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces;
using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Domain.Entities;

namespace FleetTrack.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<PagedResult<UserListDto>> GetAllAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetPagedAsync(pageNumber, pageSize, cancellationToken);
        var totalCount = await _userRepository.CountAsync(cancellationToken);

        var userDtos = users.Select(u => new UserListDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            FullName = $"{u.FirstName} {u.LastName}",
            RoleName = u.Role?.Name ?? "N/A",
            IsActive = u.IsActive,
            LastLoginDate = u.LastLoginDate,
            CreatedAt = u.CreatedAt
        });

        return new PagedResult<UserListDto>
        {
            Items = userDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<UserDetailsDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        if (user == null) return null;

        return new UserDetailsDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            IsActive = user.IsActive,
            LastLoginDate = user.LastLoginDate,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            RoleId = user.RoleId,
            RoleName = user.Role?.Name ?? "N/A",
            RoleDescription = user.Role?.Description ?? "",
            DriverId = user.DriverId,
            DriverLicenseNumber = user.Driver?.LicenseNumber
        };
    }

    public async Task<IEnumerable<UserListDto>> GetByRoleAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetByRoleAsync(roleId, cancellationToken);
        return users.Select(u => new UserListDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            FullName = $"{u.FirstName} {u.LastName}",
            RoleName = u.Role?.Name ?? "N/A",
            IsActive = u.IsActive,
            LastLoginDate = u.LastLoginDate,
            CreatedAt = u.CreatedAt
        });
    }

    public async Task<UserDetailsDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        // Vérifier que le username n'existe pas déjà
        if (await _userRepository.UsernameExistsAsync(dto.Username, cancellationToken))
        {
            throw new BusinessException($"Le nom d'utilisateur '{dto.Username}' est déjà utilisé");
        }

        // Vérifier que l'email n'existe pas déjà
        if (await _userRepository.EmailExistsAsync(dto.Email, cancellationToken))
        {
            throw new BusinessException($"L'email '{dto.Email}' est déjà utilisé");
        }

        // Vérifier que le rôle existe
        var role = await _roleRepository.GetByIdAsync(dto.RoleId, cancellationToken);
        if (role == null)
        {
            throw new NotFoundException(nameof(Role), dto.RoleId);
        }

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            RoleId = dto.RoleId,
            DriverId = dto.DriverId,
            IsActive = dto.IsActive
        };

        var created = await _userRepository.AddAsync(user, cancellationToken);

        return await GetByIdAsync(created.Id, cancellationToken)
            ?? throw new BusinessException("Erreur lors de la création de l'utilisateur");
    }

    public async Task<UserDetailsDto> UpdateAsync(Guid id, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException(nameof(User), id);
        }

        // Vérifier le username si modifié
        if (!string.IsNullOrEmpty(dto.Username) && dto.Username != user.Username)
        {
            if (await _userRepository.UsernameExistsAsync(dto.Username, cancellationToken))
            {
                throw new BusinessException($"Le nom d'utilisateur '{dto.Username}' est déjà utilisé");
            }
            user.Username = dto.Username;
        }

        // Vérifier l'email si modifié
        if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
        {
            if (await _userRepository.EmailExistsAsync(dto.Email, cancellationToken))
            {
                throw new BusinessException($"L'email '{dto.Email}' est déjà utilisé");
            }
            user.Email = dto.Email;
        }

        // Vérifier le rôle si modifié
        if (dto.RoleId.HasValue && dto.RoleId.Value != user.RoleId)
        {
            var role = await _roleRepository.GetByIdAsync(dto.RoleId.Value, cancellationToken);
            if (role == null)
            {
                throw new NotFoundException(nameof(Role), dto.RoleId.Value);
            }
            user.RoleId = dto.RoleId.Value;
        }

        if (!string.IsNullOrEmpty(dto.FirstName)) user.FirstName = dto.FirstName;
        if (!string.IsNullOrEmpty(dto.LastName)) user.LastName = dto.LastName;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        if (dto.DriverId.HasValue) user.DriverId = dto.DriverId;
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        return await GetByIdAsync(id, cancellationToken)
            ?? throw new BusinessException("Erreur lors de la mise à jour de l'utilisateur");
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException(nameof(User), id);
        }

        await _userRepository.DeleteAsync(user, cancellationToken);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException(nameof(User), userId);
        }

        // Vérifier l'ancien mot de passe
        if (!_passwordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
        {
            throw new BusinessException("Le mot de passe actuel est incorrect");
        }

        user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);
    }

    public async Task ResetPasswordAsync(Guid userId, ResetPasswordDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException(nameof(User), userId);
        }

        user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException(nameof(User), id);
        }

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException(nameof(User), id);
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);
    }

    public async Task<IEnumerable<RoleDto>> GetAllRolesAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _roleRepository.GetAllWithUserCountAsync(cancellationToken);
        return roles.Select(r => new RoleDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description,
            UserCount = r.Users?.Count ?? 0
        });
    }
}
