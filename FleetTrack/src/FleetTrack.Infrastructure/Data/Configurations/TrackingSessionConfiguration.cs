using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetTrack.Infrastructure.Data.Configurations;

public class TrackingSessionConfiguration : IEntityTypeConfiguration<TrackingSession>
{
    public void Configure(EntityTypeBuilder<TrackingSession> builder)
    {
        builder.ToTable("TrackingSessions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.DriverName)
            .HasMaxLength(100);

        builder.Property(x => x.DriverPhone)
            .HasMaxLength(20);

        builder.Property(x => x.StartedAt)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.PositionsCount)
            .HasDefaultValue(0);

        builder.Property(x => x.TotalDistance)
            .HasDefaultValue(0);

        // Relations
        builder.HasOne(x => x.Vehicle)
            .WithMany()
            .HasForeignKey(x => x.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Driver)
            .WithMany()
            .HasForeignKey(x => x.DriverId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Mission)
            .WithMany()
            .HasForeignKey(x => x.MissionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.Positions)
            .WithOne(x => x.TrackingSession)
            .HasForeignKey(x => x.TrackingSessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Index pour recherches rapides
        builder.HasIndex(x => x.VehicleId);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.StartedAt);
        builder.HasIndex(x => new { x.VehicleId, x.IsActive });
    }
}
