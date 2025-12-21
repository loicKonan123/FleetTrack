using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetTrack.Infrastructure.Data.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        // Table
        builder.ToTable("Vehicles");

        // Primary Key
        builder.HasKey(v => v.Id);

        // Properties
        builder.Property(v => v.RegistrationNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(v => v.Brand)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.Model)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.Year)
            .IsRequired();

        builder.Property(v => v.FuelCapacity)
            .HasColumnType("REAL");

        builder.Property(v => v.CurrentFuelLevel)
            .HasColumnType("REAL");

        // Indexes
        builder.HasIndex(v => v.RegistrationNumber)
            .IsUnique();

        builder.HasIndex(v => v.Status);

        // Relationships
        builder.HasOne(v => v.CurrentDriver)
            .WithOne(d => d.CurrentVehicle)
            .HasForeignKey<Vehicle>(v => v.CurrentDriverId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(v => v.Missions)
            .WithOne(m => m.Vehicle)
            .HasForeignKey(m => m.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(v => v.GpsPositions)
            .WithOne(g => g.Vehicle)
            .HasForeignKey(g => g.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(v => v.Alerts)
            .WithOne(a => a.Vehicle)
            .HasForeignKey(a => a.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(v => v.MaintenanceRecords)
            .WithOne(m => m.Vehicle)
            .HasForeignKey(m => m.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
