using FleetTrack.Domain.Enums;

namespace FleetTrack.Domain.Entities;

public class Zone : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ZoneType Type { get; set; }
    public double CenterLatitude { get; set; }
    public double CenterLongitude { get; set; }
    public double RadiusInMeters { get; set; }
    public string? Coordinates { get; set; } // JSON pour polygones complexes
    public bool IsActive { get; set; }
    public string? Color { get; set; }
}
