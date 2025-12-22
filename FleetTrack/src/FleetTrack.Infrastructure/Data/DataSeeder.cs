using FleetTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FleetTrack.Infrastructure.Data;

/// <summary>
/// Classe pour initialiser les données de base (rôles, utilisateur admin initial, etc.)
/// </summary>
public static class DataSeeder
{
    /// <summary>
    /// Initialise les rôles et l'utilisateur admin par défaut
    /// </summary>
    public static async Task SeedAsync(FleetTrackDbContext context)
    {
        // Créer les rôles si ils n'existent pas
        await SeedRolesAsync(context);

        // Créer l'utilisateur admin par défaut
        await SeedAdminUserAsync(context);
    }

    private static async Task SeedRolesAsync(FleetTrackDbContext context)
    {
        if (await context.Roles.AnyAsync())
            return; // Les rôles existent déjà

        var roles = new List<Role>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = Role.Names.Admin,
                Description = "Administrateur avec tous les droits",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = Role.Names.Dispatcher,
                Description = "Répartiteur pouvant gérer les missions et véhicules",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = Role.Names.Driver,
                Description = "Chauffeur pouvant consulter et mettre à jour ses missions",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = Role.Names.Viewer,
                Description = "Utilisateur en lecture seule",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            }
        };

        context.Roles.AddRange(roles);
        await context.SaveChangesAsync();
    }

    private static async Task SeedAdminUserAsync(FleetTrackDbContext context)
    {
        if (await context.Users.AnyAsync(u => u.Username == "admin"))
            return; // L'admin existe déjà

        var adminRole = await context.Roles.FirstAsync(r => r.Name == Role.Names.Admin);

        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Username = "admin",
            Email = "admin@fleettrack.com",
            // Mot de passe: Admin123! (à changer en production)
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            FirstName = "Admin",
            LastName = "FleetTrack",
            PhoneNumber = null,
            RoleId = adminRole.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();
    }
}
