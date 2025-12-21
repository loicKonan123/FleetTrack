using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetTrack.Infrastructure.Data.Configurations;

public class MissionConfiguration : IEntityTypeConfiguration<Mission>
{
    public void Configure(EntityTypeBuilder<Mission> builder)
    {
        // Table
        builder.ToTable("Missions");

        // Primary Key
        builder.HasKey(m => m.Id);

        // Properties
        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.Description)
            .HasMaxLength(1000);

        builder.Property(m => m.EstimatedDistance)
            .HasColumnType("decimal(18,2)");

        builder.Property(m => m.ActualDistance)
            .HasColumnType("decimal(18,2)");

        // Indexes
        builder.HasIndex(m => m.Status);
        builder.HasIndex(m => m.Priority);
        builder.HasIndex(m => m.StartDate);
        builder.HasIndex(m => new { m.VehicleId, m.Status });
        builder.HasIndex(m => new { m.DriverId, m.Status });

        // Relationships
        builder.HasMany(m => m.Waypoints)
            .WithOne(w => w.Mission)
            .HasForeignKey(w => w.MissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
