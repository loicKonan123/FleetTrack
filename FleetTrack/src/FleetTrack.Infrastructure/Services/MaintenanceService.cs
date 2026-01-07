using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.DTOs.Maintenance;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;
using FleetTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Infrastructure.Services;

public class MaintenanceService : IMaintenanceService
{
    private readonly FleetTrackDbContext _context;

    public MaintenanceService(FleetTrackDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<MaintenanceDto>> GetAllAsync(int pageNumber, int pageSize, Guid? vehicleId = null, MaintenanceType? type = null, bool? isCompleted = null, CancellationToken cancellationToken = default)
    {
        var query = _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .AsQueryable();

        if (vehicleId.HasValue)
            query = query.Where(m => m.VehicleId == vehicleId.Value);

        if (type.HasValue)
            query = query.Where(m => m.Type == type.Value);

        if (isCompleted.HasValue)
            query = query.Where(m => m.IsCompleted == isCompleted.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(m => m.ScheduledDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(m => MapToDto(m))
            .ToListAsync(cancellationToken);

        return new PagedResult<MaintenanceDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<MaintenanceDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var maintenance = await _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        return maintenance != null ? MapToDto(maintenance) : null;
    }

    public async Task<IEnumerable<MaintenanceDto>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .Where(m => m.VehicleId == vehicleId)
            .OrderByDescending(m => m.ScheduledDate)
            .Select(m => MapToDto(m))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MaintenanceDto>> GetUpcomingAsync(int days = 30, CancellationToken cancellationToken = default)
    {
        var endDate = DateTime.UtcNow.AddDays(days);

        return await _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .Where(m => !m.IsCompleted && m.ScheduledDate <= endDate && m.ScheduledDate >= DateTime.UtcNow)
            .OrderBy(m => m.ScheduledDate)
            .Select(m => MapToDto(m))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MaintenanceDto>> GetOverdueAsync(CancellationToken cancellationToken = default)
    {
        return await _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .Where(m => !m.IsCompleted && m.ScheduledDate < DateTime.UtcNow)
            .OrderBy(m => m.ScheduledDate)
            .Select(m => MapToDto(m))
            .ToListAsync(cancellationToken);
    }

    public async Task<MaintenanceDto> CreateAsync(CreateMaintenanceDto dto, CancellationToken cancellationToken = default)
    {
        var vehicle = await _context.Vehicles.FindAsync(new object[] { dto.VehicleId }, cancellationToken);
        if (vehicle == null)
            throw new NotFoundException(nameof(Vehicle), dto.VehicleId);

        var maintenance = new Maintenance
        {
            Type = dto.Type,
            Description = dto.Description,
            ScheduledDate = dto.ScheduledDate,
            MileageAtMaintenance = dto.MileageAtMaintenance,
            Cost = dto.Cost,
            ServiceProvider = dto.ServiceProvider,
            Notes = dto.Notes,
            VehicleId = dto.VehicleId,
            IsCompleted = false
        };

        _context.MaintenanceRecords.Add(maintenance);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(maintenance.Id, cancellationToken) ?? throw new Exception("Failed to create maintenance");
    }

    public async Task<MaintenanceDto> UpdateAsync(Guid id, UpdateMaintenanceDto dto, CancellationToken cancellationToken = default)
    {
        var maintenance = await _context.MaintenanceRecords.FindAsync(new object[] { id }, cancellationToken);
        if (maintenance == null)
            throw new NotFoundException(nameof(Maintenance), id);

        if (dto.Type.HasValue) maintenance.Type = dto.Type.Value;
        if (dto.Description != null) maintenance.Description = dto.Description;
        if (dto.ScheduledDate.HasValue) maintenance.ScheduledDate = dto.ScheduledDate.Value;
        if (dto.CompletedDate.HasValue) maintenance.CompletedDate = dto.CompletedDate.Value;
        if (dto.MileageAtMaintenance.HasValue) maintenance.MileageAtMaintenance = dto.MileageAtMaintenance.Value;
        if (dto.Cost.HasValue) maintenance.Cost = dto.Cost.Value;
        if (dto.ServiceProvider != null) maintenance.ServiceProvider = dto.ServiceProvider;
        if (dto.Notes != null) maintenance.Notes = dto.Notes;
        if (dto.IsCompleted.HasValue) maintenance.IsCompleted = dto.IsCompleted.Value;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken) ?? throw new Exception("Failed to update maintenance");
    }

    public async Task<MaintenanceDto> CompleteAsync(Guid id, CompleteMaintenanceDto dto, CancellationToken cancellationToken = default)
    {
        var maintenance = await _context.MaintenanceRecords.FindAsync(new object[] { id }, cancellationToken);
        if (maintenance == null)
            throw new NotFoundException(nameof(Maintenance), id);

        maintenance.IsCompleted = true;
        maintenance.CompletedDate = dto.CompletedDate;
        if (dto.MileageAtMaintenance.HasValue) maintenance.MileageAtMaintenance = dto.MileageAtMaintenance.Value;
        if (dto.Cost.HasValue) maintenance.Cost = dto.Cost.Value;
        if (dto.Notes != null) maintenance.Notes = dto.Notes;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken) ?? throw new Exception("Failed to complete maintenance");
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var maintenance = await _context.MaintenanceRecords.FindAsync(new object[] { id }, cancellationToken);
        if (maintenance == null)
            throw new NotFoundException(nameof(Maintenance), id);

        maintenance.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private static MaintenanceDto MapToDto(Maintenance m) => new()
    {
        Id = m.Id,
        Type = m.Type,
        Description = m.Description,
        ScheduledDate = m.ScheduledDate,
        CompletedDate = m.CompletedDate,
        MileageAtMaintenance = m.MileageAtMaintenance,
        Cost = m.Cost,
        ServiceProvider = m.ServiceProvider,
        Notes = m.Notes,
        IsCompleted = m.IsCompleted,
        VehicleId = m.VehicleId,
        VehicleRegistration = m.Vehicle?.RegistrationNumber,
        VehicleBrand = m.Vehicle?.Brand,
        VehicleModel = m.Vehicle?.Model,
        CreatedAt = m.CreatedAt,
        UpdatedAt = m.UpdatedAt
    };
}
