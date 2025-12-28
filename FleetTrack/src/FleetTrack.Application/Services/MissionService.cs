using AutoMapper;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Mission;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces;
using FleetTrack.Application.Interfaces.Repositories;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;

namespace FleetTrack.Application.Services;

public class MissionService : IMissionService
{
    private readonly IMissionRepository _missionRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IDriverRepository _driverRepository;
    private readonly IMapper _mapper;

    public MissionService(
        IMissionRepository missionRepository,
        IVehicleRepository vehicleRepository,
        IDriverRepository driverRepository,
        IMapper mapper)
    {
        _missionRepository = missionRepository;
        _vehicleRepository = vehicleRepository;
        _driverRepository = driverRepository;
        _mapper = mapper;
    }

    public async Task<PagedResult<MissionDto>> GetAllAsync(int pageNumber, int pageSize, MissionStatus? status = null, MissionPriority? priority = null, CancellationToken cancellationToken = default)
    {
        var missions = await _missionRepository.GetPagedWithFiltersAsync(pageNumber, pageSize, status, priority, cancellationToken);
        var totalCount = await _missionRepository.CountWithFiltersAsync(status, priority, cancellationToken);

        return new PagedResult<MissionDto>
        {
            Items = _mapper.Map<IEnumerable<MissionDto>>(missions),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<MissionDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var mission = await _missionRepository.GetByIdAsync(id, cancellationToken);
        return mission != null ? _mapper.Map<MissionDto>(mission) : null;
    }

    public async Task<MissionDetailsDto?> GetDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var mission = await _missionRepository.GetMissionWithDetailsAsync(id, cancellationToken);
        return mission != null ? _mapper.Map<MissionDetailsDto>(mission) : null;
    }

    public async Task<IEnumerable<MissionDto>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var missions = await _missionRepository.GetActiveMissionsAsync(cancellationToken);
        return _mapper.Map<IEnumerable<MissionDto>>(missions);
    }

    public async Task<IEnumerable<MissionDto>> GetByStatusAsync(MissionStatus status, CancellationToken cancellationToken = default)
    {
        var missions = await _missionRepository.GetMissionsByStatusAsync(status, cancellationToken);
        return _mapper.Map<IEnumerable<MissionDto>>(missions);
    }

    public async Task<MissionDto> CreateAsync(CreateMissionDto dto, CancellationToken cancellationToken = default)
    {
        // Vérifier que le véhicule existe et est disponible
        var vehicle = await _vehicleRepository.GetByIdAsync(dto.VehicleId, cancellationToken);
        if (vehicle == null)
        {
            throw new NotFoundException(nameof(Vehicle), dto.VehicleId);
        }

        if (vehicle.Status != VehicleStatus.Available)
        {
            throw new BusinessException($"Le véhicule '{vehicle.RegistrationNumber}' n'est pas disponible");
        }

        // Vérifier que le conducteur existe et est disponible
        var driver = await _driverRepository.GetByIdAsync(dto.DriverId, cancellationToken);
        if (driver == null)
        {
            throw new NotFoundException(nameof(Driver), dto.DriverId);
        }

        if (driver.Status != DriverStatus.Available)
        {
            throw new BusinessException($"Le conducteur '{driver.FirstName} {driver.LastName}' n'est pas disponible");
        }

        // Vérifier que le permis est valide
        if (driver.LicenseExpiryDate < DateTime.UtcNow.Date)
        {
            throw new BusinessException($"Le permis du conducteur '{driver.FirstName} {driver.LastName}' est expiré");
        }

        var mission = _mapper.Map<Mission>(dto);
        mission.Status = MissionStatus.Planned;

        var created = await _missionRepository.AddAsync(mission, cancellationToken);
        return _mapper.Map<MissionDto>(created);
    }

    public async Task<MissionDto> UpdateAsync(Guid id, UpdateMissionDto dto, CancellationToken cancellationToken = default)
    {
        var mission = await _missionRepository.GetByIdAsync(id, cancellationToken);
        if (mission == null)
        {
            throw new NotFoundException(nameof(Mission), id);
        }

        // Vérifier le véhicule si modifié
        if (dto.VehicleId.HasValue && dto.VehicleId != mission.VehicleId)
        {
            var vehicle = await _vehicleRepository.GetByIdAsync(dto.VehicleId.Value, cancellationToken);
            if (vehicle == null)
            {
                throw new NotFoundException(nameof(Vehicle), dto.VehicleId.Value);
            }
            mission.VehicleId = dto.VehicleId.Value;
        }

        // Vérifier le conducteur si modifié
        if (dto.DriverId.HasValue && dto.DriverId != mission.DriverId)
        {
            var driver = await _driverRepository.GetByIdAsync(dto.DriverId.Value, cancellationToken);
            if (driver == null)
            {
                throw new NotFoundException(nameof(Driver), dto.DriverId.Value);
            }
            mission.DriverId = dto.DriverId.Value;
        }

        // Mettre à jour les autres champs
        if (!string.IsNullOrEmpty(dto.Name))
            mission.Name = dto.Name;

        if (dto.Description != null)
            mission.Description = dto.Description;

        if (dto.Status.HasValue)
            mission.Status = dto.Status.Value;

        mission.Priority = dto.Priority;

        if (dto.StartDate.HasValue)
            mission.StartDate = dto.StartDate.Value;

        if (dto.EndDate.HasValue)
            mission.EndDate = dto.EndDate;

        if (dto.EstimatedDistance.HasValue)
            mission.EstimatedDistance = dto.EstimatedDistance.Value;

        if (dto.ActualDistance.HasValue)
            mission.ActualDistance = dto.ActualDistance;

        await _missionRepository.UpdateAsync(mission, cancellationToken);

        return _mapper.Map<MissionDto>(mission);
    }

    public async Task<MissionDto> UpdateStatusAsync(Guid id, MissionStatus status, CancellationToken cancellationToken = default)
    {
        var mission = await _missionRepository.GetByIdAsync(id, cancellationToken);
        if (mission == null)
        {
            throw new NotFoundException(nameof(Mission), id);
        }

        mission.Status = status;

        // Si la mission est terminée, enregistrer la date de fin
        if (status == MissionStatus.Completed && !mission.EndDate.HasValue)
        {
            mission.EndDate = DateTime.UtcNow;
        }

        await _missionRepository.UpdateAsync(mission, cancellationToken);

        return _mapper.Map<MissionDto>(mission);
    }

    public async Task<MissionDto> AssignAsync(Guid id, AssignMissionDto dto, CancellationToken cancellationToken = default)
    {
        var mission = await _missionRepository.GetByIdAsync(id, cancellationToken);
        if (mission == null)
        {
            throw new NotFoundException(nameof(Mission), id);
        }

        // Vérifier le véhicule
        var vehicle = await _vehicleRepository.GetByIdAsync(dto.VehicleId, cancellationToken);
        if (vehicle == null)
        {
            throw new NotFoundException(nameof(Vehicle), dto.VehicleId);
        }

        // Vérifier le conducteur
        var driver = await _driverRepository.GetByIdAsync(dto.DriverId, cancellationToken);
        if (driver == null)
        {
            throw new NotFoundException(nameof(Driver), dto.DriverId);
        }

        mission.VehicleId = dto.VehicleId;
        mission.DriverId = dto.DriverId;
        mission.StartDate = dto.StartDate;
        mission.Status = MissionStatus.Assigned;

        await _missionRepository.UpdateAsync(mission, cancellationToken);

        return _mapper.Map<MissionDto>(mission);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var mission = await _missionRepository.GetByIdAsync(id, cancellationToken);
        if (mission == null)
        {
            throw new NotFoundException(nameof(Mission), id);
        }

        if (mission.Status == MissionStatus.InProgress)
        {
            throw new BusinessException("Impossible de supprimer une mission en cours");
        }

        await _missionRepository.DeleteAsync(mission, cancellationToken);
    }
}
