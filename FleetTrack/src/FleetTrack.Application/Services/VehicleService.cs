using AutoMapper;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Vehicle;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces;
using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Services;

public class VehicleService : IVehicleService
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IMapper _mapper;

    public VehicleService(IVehicleRepository vehicleRepository, IMapper mapper)
    {
        _vehicleRepository = vehicleRepository;
        _mapper = mapper;
    }

    public async Task<PagedResult<VehicleDto>> GetAllAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var vehicles = await _vehicleRepository.GetPagedAsync(pageNumber, pageSize, cancellationToken);
        var totalCount = await _vehicleRepository.CountAsync(cancellationToken: cancellationToken);

        return new PagedResult<VehicleDto>
        {
            Items = _mapper.Map<IEnumerable<VehicleDto>>(vehicles),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<VehicleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(id, cancellationToken);
        return vehicle != null ? _mapper.Map<VehicleDto>(vehicle) : null;
    }

    public async Task<VehicleDetailsDto?> GetDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = await _vehicleRepository.GetVehicleWithDetailsAsync(id, cancellationToken);
        return vehicle != null ? _mapper.Map<VehicleDetailsDto>(vehicle) : null;
    }

    public async Task<IEnumerable<VehicleDto>> GetAvailableAsync(CancellationToken cancellationToken = default)
    {
        var vehicles = await _vehicleRepository.GetAvailableVehiclesAsync(cancellationToken);
        return _mapper.Map<IEnumerable<VehicleDto>>(vehicles);
    }

    public async Task<IEnumerable<VehicleDto>> GetByStatusAsync(VehicleStatus status, CancellationToken cancellationToken = default)
    {
        var vehicles = await _vehicleRepository.GetVehiclesByStatusAsync(status, cancellationToken);
        return _mapper.Map<IEnumerable<VehicleDto>>(vehicles);
    }

    public async Task<VehicleDto> CreateAsync(CreateVehicleDto dto, CancellationToken cancellationToken = default)
    {
        // Vérifier si le numéro d'immatriculation existe déjà
        var existing = await _vehicleRepository.GetByRegistrationNumberAsync(dto.RegistrationNumber, cancellationToken);
        if (existing != null)
        {
            throw new ValidationException($"Un véhicule avec le numéro d'immatriculation '{dto.RegistrationNumber}' existe déjà");
        }

        var vehicle = _mapper.Map<Vehicle>(dto);
        vehicle.Status = VehicleStatus.Available;

        var created = await _vehicleRepository.AddAsync(vehicle, cancellationToken);
        return _mapper.Map<VehicleDto>(created);
    }

    public async Task<VehicleDto> UpdateAsync(Guid id, UpdateVehicleDto dto, CancellationToken cancellationToken = default)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(id, cancellationToken);
        if (vehicle == null)
        {
            throw new NotFoundException(nameof(Vehicle), id);
        }

        _mapper.Map(dto, vehicle);
        await _vehicleRepository.UpdateAsync(vehicle, cancellationToken);

        return _mapper.Map<VehicleDto>(vehicle);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(id, cancellationToken);
        if (vehicle == null)
        {
            throw new NotFoundException(nameof(Vehicle), id);
        }

        await _vehicleRepository.DeleteAsync(vehicle, cancellationToken);
    }
}
