using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetTrack.Infrastructure.Data.Configurations;

public class GpsPositionConfiguration : IEntityTypeConfiguration<GpsPosition>
{
    public void Configure(EntityTypeBuilder<GpsPosition> builder)
    {
        // Table
        builder.ToTable("GpsPositions");

        // Primary Key
        builder.HasKey(g => g.Id);

        // Properties
        builder.Property(g => g.Latitude)
            .IsRequired()
            .HasColumnType("REAL");

        builder.Property(g => g.Longitude)
            .IsRequired()
            .HasColumnType("REAL");

        builder.Property(g => g.Altitude)
            .HasColumnType("REAL");

        builder.Property(g => g.Speed)
            .HasColumnType("REAL");

        builder.Property(g => g.Heading)
            .HasColumnType("REAL");

        builder.Property(g => g.Accuracy)
            .HasColumnType("REAL");

        builder.Property(g => g.Timestamp)
            .IsRequired();

        // Indexes
        builder.HasIndex(g => new { g.VehicleId, g.Timestamp });
        builder.HasIndex(g => g.Timestamp);
        builder.HasIndex(g => g.TrackingSessionId);

        // Relations
        builder.HasOne(g => g.TrackingSession)
            .WithMany(t => t.Positions)
            .HasForeignKey(g => g.TrackingSessionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
