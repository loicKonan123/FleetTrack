using FleetTrack.Application.DTOs.Tracking;
using FleetTrack.Application.Interfaces;
using FleetTrack.Domain.Entities;
using FleetTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FleetTrack.Infrastructure.Services;

public class TrackingSessionService : ITrackingSessionService
{
    private readonly FleetTrackDbContext _context;
    private readonly ILogger<TrackingSessionService> _logger;

    public TrackingSessionService(FleetTrackDbContext context, ILogger<TrackingSessionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TrackingSessionStartedDto> StartSessionAsync(StartTrackingSessionDto dto)
    {
        // Vérifie si le véhicule existe
        var vehicle = await _context.Vehicles.FindAsync(dto.VehicleId);
        if (vehicle == null)
        {
            throw new ArgumentException($"Véhicule {dto.VehicleId} non trouvé");
        }

        // Arrête les sessions actives existantes pour ce véhicule
        var existingSessions = await _context.TrackingSessions
            .Where(s => s.VehicleId == dto.VehicleId && s.IsActive)
            .ToListAsync();

        foreach (var existingSession in existingSessions)
        {
            existingSession.IsActive = false;
            existingSession.EndedAt = DateTime.UtcNow;
        }

        // Crée la nouvelle session
        var session = new TrackingSession
        {
            VehicleId = dto.VehicleId,
            DriverName = dto.DriverName,
            DriverPhone = dto.DriverPhone,
            MissionId = dto.MissionId,
            StartedAt = DateTime.UtcNow,
            IsActive = true,
            PositionsCount = 0,
            TotalDistance = 0
        };

        _context.TrackingSessions.Add(session);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Session de tracking démarrée: {SessionId} pour véhicule {VehicleId}",
            session.Id, dto.VehicleId);

        return new TrackingSessionStartedDto
        {
            SessionId = session.Id,
            VehicleId = dto.VehicleId,
            StartedAt = session.StartedAt
        };
    }

    public async Task<bool> StopSessionAsync(Guid sessionId)
    {
        var session = await _context.TrackingSessions.FindAsync(sessionId);
        if (session == null)
        {
            return false;
        }

        session.IsActive = false;
        session.EndedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Session de tracking arrêtée: {SessionId}", sessionId);
        return true;
    }

    public async Task<bool> StopVehicleSessionsAsync(Guid vehicleId)
    {
        var sessions = await _context.TrackingSessions
            .Where(s => s.VehicleId == vehicleId && s.IsActive)
            .ToListAsync();

        if (!sessions.Any())
        {
            return false;
        }

        foreach (var session in sessions)
        {
            session.IsActive = false;
            session.EndedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Sessions de tracking arrêtées pour véhicule: {VehicleId}", vehicleId);
        return true;
    }

    public async Task UpdatePositionAsync(Guid sessionId, GpsPositionUpdateDto position)
    {
        var session = await _context.TrackingSessions.FindAsync(sessionId);
        if (session == null || !session.IsActive)
        {
            return;
        }

        // Calcule la distance depuis la dernière position
        double distance = 0;
        if (session.LastLatitude.HasValue && session.LastLongitude.HasValue)
        {
            distance = CalculateDistance(
                session.LastLatitude.Value, session.LastLongitude.Value,
                position.Latitude, position.Longitude);
        }

        // Met à jour la session
        session.LastLatitude = position.Latitude;
        session.LastLongitude = position.Longitude;
        session.LastSpeed = position.Speed;
        session.LastHeading = position.Heading;
        session.LastPositionAt = DateTime.UtcNow;
        session.PositionsCount++;
        session.TotalDistance += distance;

        // Enregistre la position GPS
        var gpsPosition = new GpsPosition
        {
            VehicleId = position.VehicleId,
            TrackingSessionId = sessionId,
            Latitude = position.Latitude,
            Longitude = position.Longitude,
            Altitude = position.Altitude,
            Speed = position.Speed,
            Heading = position.Heading,
            Accuracy = position.Accuracy,
            Timestamp = position.Timestamp
        };

        _context.GpsPositions.Add(gpsPosition);
        await _context.SaveChangesAsync();
    }

    public async Task<TrackingSessionDto?> GetByIdAsync(Guid sessionId)
    {
        var session = await _context.TrackingSessions
            .Include(s => s.Vehicle)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        return session == null ? null : MapToDto(session);
    }

    public async Task<TrackingSessionDto?> GetActiveSessionByVehicleAsync(Guid vehicleId)
    {
        var session = await _context.TrackingSessions
            .Include(s => s.Vehicle)
            .FirstOrDefaultAsync(s => s.VehicleId == vehicleId && s.IsActive);

        return session == null ? null : MapToDto(session);
    }

    public async Task<IEnumerable<ActiveTrackingSessionDto>> GetActiveSessionsAsync()
    {
        var sessions = await _context.TrackingSessions
            .Include(s => s.Vehicle)
            .Include(s => s.Mission)
            .Where(s => s.IsActive)
            .OrderByDescending(s => s.LastPositionAt ?? s.StartedAt)
            .ToListAsync();

        return sessions.Select(MapToActiveDto);
    }

    public async Task<IEnumerable<TrackingSessionDto>> GetVehicleSessionHistoryAsync(Guid vehicleId, int limit = 10)
    {
        var sessions = await _context.TrackingSessions
            .Include(s => s.Vehicle)
            .Where(s => s.VehicleId == vehicleId)
            .OrderByDescending(s => s.StartedAt)
            .Take(limit)
            .ToListAsync();

        return sessions.Select(MapToDto);
    }

    public async Task MarkInactiveSessionsAsync(int timeoutSeconds = 60)
    {
        var cutoff = DateTime.UtcNow.AddSeconds(-timeoutSeconds);

        var inactiveSessions = await _context.TrackingSessions
            .Where(s => s.IsActive && s.LastPositionAt < cutoff)
            .ToListAsync();

        foreach (var session in inactiveSessions)
        {
            session.IsActive = false;
            session.EndedAt = DateTime.UtcNow;
            _logger.LogInformation("Session {SessionId} marquée inactive (timeout)", session.Id);
        }

        if (inactiveSessions.Any())
        {
            await _context.SaveChangesAsync();
        }
    }

    private static TrackingSessionDto MapToDto(TrackingSession session)
    {
        return new TrackingSessionDto
        {
            Id = session.Id,
            VehicleId = session.VehicleId,
            VehiclePlateNumber = session.Vehicle?.RegistrationNumber,
            VehicleBrand = session.Vehicle?.Brand,
            VehicleModel = session.Vehicle?.Model,
            DriverId = session.DriverId,
            DriverName = session.DriverName,
            DriverPhone = session.DriverPhone,
            StartedAt = session.StartedAt,
            EndedAt = session.EndedAt,
            IsActive = session.IsActive,
            LastLatitude = session.LastLatitude,
            LastLongitude = session.LastLongitude,
            LastSpeed = session.LastSpeed,
            LastHeading = session.LastHeading,
            LastPositionAt = session.LastPositionAt,
            PositionsCount = session.PositionsCount,
            TotalDistance = session.TotalDistance,
            MissionId = session.MissionId
        };
    }

    private static ActiveTrackingSessionDto MapToActiveDto(TrackingSession session)
    {
        return new ActiveTrackingSessionDto
        {
            SessionId = session.Id,
            VehicleId = session.VehicleId,
            VehiclePlateNumber = session.Vehicle?.RegistrationNumber,
            VehicleBrand = session.Vehicle?.Brand,
            VehicleModel = session.Vehicle?.Model,
            VehicleType = session.Vehicle?.Type.ToString(),
            DriverName = session.DriverName,
            DriverPhone = session.DriverPhone,
            StartedAt = session.StartedAt,
            LastPositionAt = session.LastPositionAt,
            Latitude = session.LastLatitude,
            Longitude = session.LastLongitude,
            Speed = session.LastSpeed,
            Heading = session.LastHeading,
            PositionsCount = session.PositionsCount,
            IsActive = session.IsActive,
            MissionId = session.MissionId,
            MissionName = session.Mission?.Name
        };
    }

    /// <summary>
    /// Calcule la distance entre deux points GPS (formule Haversine)
    /// </summary>
    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371000; // Rayon de la Terre en mètres

        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return R * c;
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180;
}
