using FleetTrack.Application.DTOs.Tracking;
using FleetTrack.Application.Interfaces;
using FleetTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FleetTrack.Infrastructure.Services;

/// <summary>
/// Service d'implémentation pour le tracking GPS
/// Ce service gère uniquement la logique métier du tracking
/// La diffusion SignalR est gérée par les controllers
/// </summary>
public class GpsTrackingService : IGpsTrackingService
{
    private readonly FleetTrackDbContext _context;
    private readonly ILogger<GpsTrackingService> _logger;

    public GpsTrackingService(
        FleetTrackDbContext context,
        ILogger<GpsTrackingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<VehicleTrackingStatusDto>> GetAllVehicleTrackingStatusAsync()
    {
        var vehicles = await _context.Vehicles
            .Include(v => v.Missions.Where(m => !m.IsDeleted && m.Status != Domain.Enums.MissionStatus.Completed))
            .Include(v => v.GpsPositions.OrderByDescending(g => g.Timestamp).Take(1))
            .Where(v => !v.IsDeleted)
            .ToListAsync();

        var statusList = new List<VehicleTrackingStatusDto>();

        foreach (var vehicle in vehicles)
        {
            var lastPosition = vehicle.GpsPositions.FirstOrDefault();
            var currentMission = vehicle.Missions.FirstOrDefault();

            var status = new VehicleTrackingStatusDto
            {
                VehicleId = vehicle.Id,
                PlateNumber = vehicle.RegistrationNumber,
                VehicleType = vehicle.Type.ToString(),
                IsTracking = lastPosition != null &&
                            (DateTime.UtcNow - lastPosition.Timestamp).TotalMinutes < 5,
                LastPositionTime = lastPosition?.Timestamp,
                LastLatitude = lastPosition?.Latitude,
                LastLongitude = lastPosition?.Longitude,
                LastSpeed = lastPosition?.Speed,
                CurrentMissionId = currentMission?.Id,
                MissionStatus = currentMission?.Status.ToString()
            };

            statusList.Add(status);
        }

        return statusList;
    }

    public async Task<VehicleTrackingStatusDto?> GetVehicleTrackingStatusAsync(Guid vehicleId)
    {
        var vehicle = await _context.Vehicles
            .Include(v => v.Missions.Where(m => !m.IsDeleted && m.Status != Domain.Enums.MissionStatus.Completed))
            .Include(v => v.GpsPositions.OrderByDescending(g => g.Timestamp).Take(1))
            .FirstOrDefaultAsync(v => v.Id == vehicleId && !v.IsDeleted);

        if (vehicle == null)
            return null;

        var lastPosition = vehicle.GpsPositions.FirstOrDefault();
        var currentMission = vehicle.Missions.FirstOrDefault();

        return new VehicleTrackingStatusDto
        {
            VehicleId = vehicle.Id,
            PlateNumber = vehicle.RegistrationNumber,
            VehicleType = vehicle.Type.ToString(),
            IsTracking = lastPosition != null &&
                        (DateTime.UtcNow - lastPosition.Timestamp).TotalMinutes < 5,
            LastPositionTime = lastPosition?.Timestamp,
            LastLatitude = lastPosition?.Latitude,
            LastLongitude = lastPosition?.Longitude,
            LastSpeed = lastPosition?.Speed,
            CurrentMissionId = currentMission?.Id,
            MissionStatus = currentMission?.Status.ToString()
        };
    }

    public async Task<GpsPositionUpdateDto?> CreateGpsPositionUpdateDtoAsync(Guid positionId)
    {
        var position = await _context.GpsPositions
            .Include(p => p.Vehicle)
            .FirstOrDefaultAsync(p => p.Id == positionId);

        if (position == null)
            return null;

        return new GpsPositionUpdateDto
        {
            VehicleId = position.VehicleId,
            Latitude = position.Latitude,
            Longitude = position.Longitude,
            Speed = position.Speed,
            Heading = position.Heading,
            Altitude = position.Altitude,
            Accuracy = position.Accuracy,
            Timestamp = position.Timestamp,
            VehiclePlateNumber = position.Vehicle.RegistrationNumber,
            VehicleType = position.Vehicle.Type.ToString()
        };
    }
}
