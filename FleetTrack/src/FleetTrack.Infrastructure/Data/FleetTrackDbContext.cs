using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace FleetTrack.Infrastructure.Data;

public class FleetTrackDbContext : DbContext
{
    public FleetTrackDbContext(DbContextOptions<FleetTrackDbContext> options)
        : base(options)
    {
    }

    // DbSets pour chaque entité
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Mission> Missions => Set<Mission>();
    public DbSet<Waypoint> Waypoints => Set<Waypoint>();
    public DbSet<GpsPosition> GpsPositions => Set<GpsPosition>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<Maintenance> MaintenanceRecords => Set<Maintenance>();
    public DbSet<Zone> Zones => Set<Zone>();
    public DbSet<TrackingSession> TrackingSessions => Set<TrackingSession>();

    // Authentication
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Applique toutes les configurations IEntityTypeConfiguration automatiquement
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Filtre global pour le Soft Delete
        modelBuilder.Entity<Vehicle>().HasQueryFilter(v => !v.IsDeleted);
        modelBuilder.Entity<Driver>().HasQueryFilter(d => !d.IsDeleted);
        modelBuilder.Entity<Mission>().HasQueryFilter(m => !m.IsDeleted);
        modelBuilder.Entity<Waypoint>().HasQueryFilter(w => !w.IsDeleted);
        modelBuilder.Entity<GpsPosition>().HasQueryFilter(g => !g.IsDeleted);
        modelBuilder.Entity<Alert>().HasQueryFilter(a => !a.IsDeleted);
        modelBuilder.Entity<Maintenance>().HasQueryFilter(m => !m.IsDeleted);
        modelBuilder.Entity<Zone>().HasQueryFilter(z => !z.IsDeleted);
        modelBuilder.Entity<TrackingSession>().HasQueryFilter(t => !t.IsDeleted);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Gestion automatique de UpdatedAt avant la sauvegarde
        var entries = ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
