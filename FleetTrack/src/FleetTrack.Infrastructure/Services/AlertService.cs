using FleetTrack.Application.DTOs.Alert;
using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.Exceptions;
using FleetTrack.Application.Interfaces;
using FleetTrack.Domain.Entities;
using FleetTrack.Domain.Enums;
using FleetTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Infrastructure.Services;

public class AlertService : IAlertService
{
    private readonly FleetTrackDbContext _context;

    public AlertService(FleetTrackDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<AlertDto>> GetAllAsync(int pageNumber, int pageSize, Guid? vehicleId = null, AlertType? type = null, AlertSeverity? severity = null, bool? isAcknowledged = null, bool? isResolved = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Alerts
            .Include(a => a.Vehicle)
            .AsQueryable();

        if (vehicleId.HasValue)
            query = query.Where(a => a.VehicleId == vehicleId.Value);

        if (type.HasValue)
            query = query.Where(a => a.Type == type.Value);

        if (severity.HasValue)
            query = query.Where(a => a.Severity == severity.Value);

        if (isAcknowledged.HasValue)
            query = query.Where(a => a.IsAcknowledged == isAcknowledged.Value);

        if (isResolved.HasValue)
            query = query.Where(a => a.IsResolved == isResolved.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.TriggeredAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(a => MapToDto(a))
            .ToListAsync(cancellationToken);

        return new PagedResult<AlertDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<AlertDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var alert = await _context.Alerts
            .Include(a => a.Vehicle)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        return alert != null ? MapToDto(alert) : null;
    }

    public async Task<IEnumerable<AlertDto>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await _context.Alerts
            .Include(a => a.Vehicle)
            .Where(a => a.VehicleId == vehicleId)
            .OrderByDescending(a => a.TriggeredAt)
            .Select(a => MapToDto(a))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<AlertDto>> GetUnacknowledgedAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Alerts
            .Include(a => a.Vehicle)
            .Where(a => !a.IsAcknowledged)
            .OrderByDescending(a => a.Severity)
            .ThenByDescending(a => a.TriggeredAt)
            .Select(a => MapToDto(a))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<AlertDto>> GetUnresolvedAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Alerts
            .Include(a => a.Vehicle)
            .Where(a => !a.IsResolved)
            .OrderByDescending(a => a.Severity)
            .ThenByDescending(a => a.TriggeredAt)
            .Select(a => MapToDto(a))
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetUnacknowledgedCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Alerts.CountAsync(a => !a.IsAcknowledged, cancellationToken);
    }

    public async Task<AlertDto> CreateAsync(CreateAlertDto dto, CancellationToken cancellationToken = default)
    {
        var vehicle = await _context.Vehicles.FindAsync(new object[] { dto.VehicleId }, cancellationToken);
        if (vehicle == null)
            throw new NotFoundException(nameof(Vehicle), dto.VehicleId);

        var alert = new Alert
        {
            Type = dto.Type,
            Severity = dto.Severity,
            Title = dto.Title,
            Message = dto.Message,
            VehicleId = dto.VehicleId,
            TriggeredAt = DateTime.UtcNow,
            IsAcknowledged = false,
            IsResolved = false
        };

        _context.Alerts.Add(alert);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(alert.Id, cancellationToken) ?? throw new Exception("Failed to create alert");
    }

    public async Task<AlertDto> AcknowledgeAsync(Guid id, AcknowledgeAlertDto dto, CancellationToken cancellationToken = default)
    {
        var alert = await _context.Alerts.FindAsync(new object[] { id }, cancellationToken);
        if (alert == null)
            throw new NotFoundException(nameof(Alert), id);

        alert.IsAcknowledged = true;
        alert.AcknowledgedAt = DateTime.UtcNow;
        alert.AcknowledgedBy = dto.AcknowledgedBy;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken) ?? throw new Exception("Failed to acknowledge alert");
    }

    public async Task<AlertDto> ResolveAsync(Guid id, ResolveAlertDto dto, CancellationToken cancellationToken = default)
    {
        var alert = await _context.Alerts.FindAsync(new object[] { id }, cancellationToken);
        if (alert == null)
            throw new NotFoundException(nameof(Alert), id);

        alert.IsResolved = true;
        alert.ResolvedAt = DateTime.UtcNow;
        alert.Resolution = dto.Resolution;

        // Auto-acknowledge if not already
        if (!alert.IsAcknowledged)
        {
            alert.IsAcknowledged = true;
            alert.AcknowledgedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken) ?? throw new Exception("Failed to resolve alert");
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var alert = await _context.Alerts.FindAsync(new object[] { id }, cancellationToken);
        if (alert == null)
            throw new NotFoundException(nameof(Alert), id);

        alert.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private static AlertDto MapToDto(Alert a) => new()
    {
        Id = a.Id,
        Type = a.Type,
        Severity = a.Severity,
        Title = a.Title,
        Message = a.Message,
        TriggeredAt = a.TriggeredAt,
        IsAcknowledged = a.IsAcknowledged,
        AcknowledgedAt = a.AcknowledgedAt,
        AcknowledgedBy = a.AcknowledgedBy,
        IsResolved = a.IsResolved,
        ResolvedAt = a.ResolvedAt,
        Resolution = a.Resolution,
        VehicleId = a.VehicleId,
        VehicleRegistration = a.Vehicle?.RegistrationNumber,
        VehicleBrand = a.Vehicle?.Brand,
        VehicleModel = a.Vehicle?.Model,
        CreatedAt = a.CreatedAt
    };
}
