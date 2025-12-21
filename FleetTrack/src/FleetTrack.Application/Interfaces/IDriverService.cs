using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Driver;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Interfaces;

public interface IDriverService
{
    Task<PagedResult<DriverDto>> GetAllAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<DriverDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DriverDetailsDto?> GetDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<DriverDto>> GetAvailableAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DriverDto>> GetByStatusAsync(DriverStatus status, CancellationToken cancellationToken = default);
    Task<DriverDto> CreateAsync(CreateDriverDto dto, CancellationToken cancellationToken = default);
    Task<DriverDto> UpdateAsync(Guid id, UpdateDriverDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
