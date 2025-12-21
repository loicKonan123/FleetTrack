using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetTrack.Infrastructure.Data.Configurations;

public class AlertConfiguration : IEntityTypeConfiguration<Alert>
{
    public void Configure(EntityTypeBuilder<Alert> builder)
    {
        // Table
        builder.ToTable("Alerts");

        // Primary Key
        builder.HasKey(a => a.Id);

        // Properties
        builder.Property(a => a.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Message)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(a => a.AcknowledgedBy)
            .HasMaxLength(100);

        builder.Property(a => a.Resolution)
            .HasMaxLength(1000);

        builder.Property(a => a.TriggeredAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(a => new { a.VehicleId, a.TriggeredAt });
        builder.HasIndex(a => a.Type);
        builder.HasIndex(a => a.Severity);
        builder.HasIndex(a => a.IsAcknowledged);
        builder.HasIndex(a => a.IsResolved);
    }
}
