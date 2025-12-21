namespace FleetTrack.Domain.Entities;

/// <summary>
/// Représente un rôle utilisateur dans le système
/// </summary>
public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<User> Users { get; set; } = new List<User>();

    // Rôles prédéfinis (constantes)
    public static class Names
    {
        public const string Admin = "Admin";
        public const string Dispatcher = "Dispatcher";
        public const string Driver = "Driver";
        public const string Viewer = "Viewer";
    }
}
