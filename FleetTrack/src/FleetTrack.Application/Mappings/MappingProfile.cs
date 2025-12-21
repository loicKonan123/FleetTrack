using AutoMapper;
using FleetTrack.Application.DTOs.Driver;
using FleetTrack.Application.DTOs.Mission;
using FleetTrack.Application.DTOs.Vehicle;
using FleetTrack.Application.DTOs.Waypoint;
using FleetTrack.Domain.Entities;

namespace FleetTrack.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateVehicleMappings();
        CreateDriverMappings();
        CreateMissionMappings();
        CreateWaypointMappings();
    }

    private void CreateVehicleMappings()
    {
        // Vehicle -> VehicleDto
        CreateMap<Vehicle, VehicleDto>()
            .ForMember(dest => dest.CurrentDriverName,
                opt => opt.MapFrom(src => src.CurrentDriver != null
                    ? $"{src.CurrentDriver.FirstName} {src.CurrentDriver.LastName}"
                    : null));

        // CreateVehicleDto -> Vehicle
        CreateMap<CreateVehicleDto, Vehicle>();

        // UpdateVehicleDto -> Vehicle
        CreateMap<UpdateVehicleDto, Vehicle>();

        // Vehicle -> VehicleDetailsDto
        CreateMap<Vehicle, VehicleDetailsDto>()
            .ForMember(dest => dest.CurrentDriver, opt => opt.MapFrom(src => src.CurrentDriver))
            .ForMember(dest => dest.ActiveMissions,
                opt => opt.MapFrom(src => src.Missions.Where(m =>
                    m.Status == Domain.Enums.MissionStatus.InProgress ||
                    m.Status == Domain.Enums.MissionStatus.Assigned)))
            .ForMember(dest => dest.UnresolvedAlerts,
                opt => opt.MapFrom(src => src.Alerts.Where(a => !a.IsResolved)));

        // Driver -> CurrentDriverDto
        CreateMap<Driver, CurrentDriverDto>()
            .ForMember(dest => dest.FullName,
                opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));

        // Mission -> MissionSummaryDto
        CreateMap<Mission, MissionSummaryDto>();

        // Alert -> AlertSummaryDto
        CreateMap<Alert, AlertSummaryDto>();
    }

    private void CreateDriverMappings()
    {
        // Driver -> DriverDto
        CreateMap<Driver, DriverDto>()
            .ForMember(dest => dest.CurrentVehicleRegistration,
                opt => opt.MapFrom(src => src.CurrentVehicle != null ? src.CurrentVehicle.RegistrationNumber : null));

        // CreateDriverDto -> Driver
        CreateMap<CreateDriverDto, Driver>();

        // UpdateDriverDto -> Driver
        CreateMap<UpdateDriverDto, Driver>();

        // Driver -> DriverDetailsDto
        CreateMap<Driver, DriverDetailsDto>()
            .ForMember(dest => dest.CurrentVehicle, opt => opt.MapFrom(src => src.CurrentVehicle))
            .ForMember(dest => dest.ActiveMissions,
                opt => opt.MapFrom(src => src.Missions.Where(m =>
                    m.Status == Domain.Enums.MissionStatus.InProgress ||
                    m.Status == Domain.Enums.MissionStatus.Assigned)));

        // Vehicle -> CurrentVehicleInfoDto
        CreateMap<Vehicle, CurrentVehicleInfoDto>()
            .ForMember(dest => dest.BrandModel,
                opt => opt.MapFrom(src => $"{src.Brand} {src.Model}"));

        // Mission -> DriverMissionDto
        CreateMap<Mission, DriverMissionDto>();
    }

    private void CreateMissionMappings()
    {
        // Mission -> MissionDto
        CreateMap<Mission, MissionDto>()
            .ForMember(dest => dest.VehicleRegistration,
                opt => opt.MapFrom(src => src.Vehicle.RegistrationNumber))
            .ForMember(dest => dest.DriverName,
                opt => opt.MapFrom(src => $"{src.Driver.FirstName} {src.Driver.LastName}"));

        // CreateMissionDto -> Mission
        CreateMap<CreateMissionDto, Mission>();

        // UpdateMissionDto -> Mission
        CreateMap<UpdateMissionDto, Mission>();

        // Mission -> MissionDetailsDto
        CreateMap<Mission, MissionDetailsDto>()
            .ForMember(dest => dest.VehicleRegistration,
                opt => opt.MapFrom(src => src.Vehicle.RegistrationNumber))
            .ForMember(dest => dest.VehicleBrandModel,
                opt => opt.MapFrom(src => $"{src.Vehicle.Brand} {src.Vehicle.Model}"))
            .ForMember(dest => dest.DriverFullName,
                opt => opt.MapFrom(src => $"{src.Driver.FirstName} {src.Driver.LastName}"))
            .ForMember(dest => dest.DriverPhone,
                opt => opt.MapFrom(src => src.Driver.PhoneNumber))
            .ForMember(dest => dest.Waypoints,
                opt => opt.MapFrom(src => src.Waypoints.OrderBy(w => w.Order)));
    }

    private void CreateWaypointMappings()
    {
        // Waypoint -> WaypointDto
        CreateMap<Waypoint, WaypointDto>();

        // CreateWaypointDto -> Waypoint
        CreateMap<CreateWaypointDto, Waypoint>();
    }
}
