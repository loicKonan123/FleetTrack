using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetTrack.Infrastructure.Data.Configurations;

public class ZoneConfiguration : IEntityTypeConfiguration<Zone>
{
    public void Configure(EntityTypeBuilder<Zone> builder)
    {
        // Table
        builder.ToTable("Zones");

        // Primary Key
        builder.HasKey(z => z.Id);

        // Properties
        builder.Property(z => z.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(z => z.Description)
            .HasMaxLength(1000);

        builder.Property(z => z.CenterLatitude)
            .HasColumnType("REAL");

        builder.Property(z => z.CenterLongitude)
            .HasColumnType("REAL");

        builder.Property(z => z.RadiusInMeters)
            .HasColumnType("REAL");

        builder.Property(z => z.Coordinates); // JSON en TEXT (SQLite)

        builder.Property(z => z.Color)
            .HasMaxLength(20);

        // Indexes
        builder.HasIndex(z => z.Type);
        builder.HasIndex(z => z.IsActive);
        builder.HasIndex(z => z.Name);
    }
}
