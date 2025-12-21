using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetTrack.Infrastructure.Data.Configurations;

public class DriverConfiguration : IEntityTypeConfiguration<Driver>
{
    public void Configure(EntityTypeBuilder<Driver> builder)
    {
        // Table
        builder.ToTable("Drivers");

        // Primary Key
        builder.HasKey(d => d.Id);

        // Properties
        builder.Property(d => d.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(d => d.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(d => d.LicenseNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(d => d.LicenseExpiryDate)
            .IsRequired();

        // Indexes
        builder.HasIndex(d => d.Email)
            .IsUnique();

        builder.HasIndex(d => d.LicenseNumber)
            .IsUnique();

        builder.HasIndex(d => d.Status);

        // Relationships
        builder.HasMany(d => d.Missions)
            .WithOne(m => m.Driver)
            .HasForeignKey(m => m.DriverId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
