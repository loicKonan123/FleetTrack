using AutoMapper;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Driver;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces;
using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Services;

public class DriverService : IDriverService
{
    private readonly IDriverRepository _driverRepository;
    private readonly IMapper _mapper;

    public DriverService(IDriverRepository driverRepository, IMapper mapper)
    {
        _driverRepository = driverRepository;
        _mapper = mapper;
    }

    public async Task<PagedResult<DriverDto>> GetAllAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var drivers = await _driverRepository.GetPagedAsync(pageNumber, pageSize, cancellationToken);
        var totalCount = await _driverRepository.CountAsync(cancellationToken: cancellationToken);

        return new PagedResult<DriverDto>
        {
            Items = _mapper.Map<IEnumerable<DriverDto>>(drivers),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<DriverDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var driver = await _driverRepository.GetByIdAsync(id, cancellationToken);
        return driver != null ? _mapper.Map<DriverDto>(driver) : null;
    }

    public async Task<DriverDetailsDto?> GetDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var driver = await _driverRepository.GetDriverWithDetailsAsync(id, cancellationToken);
        return driver != null ? _mapper.Map<DriverDetailsDto>(driver) : null;
    }

    public async Task<IEnumerable<DriverDto>> GetAvailableAsync(CancellationToken cancellationToken = default)
    {
        var drivers = await _driverRepository.GetAvailableDriversAsync(cancellationToken);
        return _mapper.Map<IEnumerable<DriverDto>>(drivers);
    }

    public async Task<IEnumerable<DriverDto>> GetByStatusAsync(DriverStatus status, CancellationToken cancellationToken = default)
    {
        var drivers = await _driverRepository.GetDriversByStatusAsync(status, cancellationToken);
        return _mapper.Map<IEnumerable<DriverDto>>(drivers);
    }

    public async Task<DriverDto> CreateAsync(CreateDriverDto dto, CancellationToken cancellationToken = default)
    {
        // Vérifier si l'email existe déjà
        var existingByEmail = await _driverRepository.GetByEmailAsync(dto.Email, cancellationToken);
        if (existingByEmail != null)
        {
            throw new ValidationException($"Un conducteur avec l'email '{dto.Email}' existe déjà");
        }

        // Vérifier si le numéro de permis existe déjà
        var existingByLicense = await _driverRepository.GetByLicenseNumberAsync(dto.LicenseNumber, cancellationToken);
        if (existingByLicense != null)
        {
            throw new ValidationException($"Un conducteur avec le numéro de permis '{dto.LicenseNumber}' existe déjà");
        }

        var driver = _mapper.Map<Driver>(dto);
        driver.Status = DriverStatus.Available;

        var created = await _driverRepository.AddAsync(driver, cancellationToken);
        return _mapper.Map<DriverDto>(created);
    }

    public async Task<DriverDto> UpdateAsync(Guid id, UpdateDriverDto dto, CancellationToken cancellationToken = default)
    {
        var driver = await _driverRepository.GetByIdAsync(id, cancellationToken);
        if (driver == null)
        {
            throw new NotFoundException(nameof(Driver), id);
        }

        // Vérifier si le nouvel email est déjà utilisé par un autre conducteur
        if (driver.Email != dto.Email)
        {
            var existingByEmail = await _driverRepository.GetByEmailAsync(dto.Email, cancellationToken);
            if (existingByEmail != null && existingByEmail.Id != id)
            {
                throw new ValidationException($"Un autre conducteur utilise déjà l'email '{dto.Email}'");
            }
        }

        _mapper.Map(dto, driver);
        await _driverRepository.UpdateAsync(driver, cancellationToken);

        return _mapper.Map<DriverDto>(driver);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var driver = await _driverRepository.GetByIdAsync(id, cancellationToken);
        if (driver == null)
        {
            throw new NotFoundException(nameof(Driver), id);
        }

        await _driverRepository.DeleteAsync(driver, cancellationToken);
    }
}
