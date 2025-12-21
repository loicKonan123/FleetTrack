using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetTrack.Infrastructure.Data.Configurations;

public class WaypointConfiguration : IEntityTypeConfiguration<Waypoint>
{
    public void Configure(EntityTypeBuilder<Waypoint> builder)
    {
        // Table
        builder.ToTable("Waypoints");

        // Primary Key
        builder.HasKey(w => w.Id);

        // Properties
        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.Address)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(w => w.Latitude)
            .IsRequired()
            .HasColumnType("REAL");

        builder.Property(w => w.Longitude)
            .IsRequired()
            .HasColumnType("REAL");

        builder.Property(w => w.Notes)
            .HasMaxLength(1000);

        // Indexes
        builder.HasIndex(w => new { w.MissionId, w.Order });
        builder.HasIndex(w => w.Type);
        builder.HasIndex(w => w.IsCompleted);
    }
}
