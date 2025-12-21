using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetTrack.Infrastructure.Data.Configurations;

public class MaintenanceConfiguration : IEntityTypeConfiguration<Maintenance>
{
    public void Configure(EntityTypeBuilder<Maintenance> builder)
    {
        // Table
        builder.ToTable("MaintenanceRecords");

        // Primary Key
        builder.HasKey(m => m.Id);

        // Properties
        builder.Property(m => m.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(m => m.Cost)
            .IsRequired()
            .HasColumnType("REAL");

        builder.Property(m => m.ServiceProvider)
            .HasMaxLength(200);

        builder.Property(m => m.Notes)
            .HasMaxLength(2000);

        builder.Property(m => m.ScheduledDate)
            .IsRequired();

        // Indexes
        builder.HasIndex(m => new { m.VehicleId, m.ScheduledDate });
        builder.HasIndex(m => m.Type);
        builder.HasIndex(m => m.IsCompleted);
    }
}
