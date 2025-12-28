# Définitions : Tests et Qualité du Code

> Guide complet des concepts de testing utilisés dans FleetTrack

---

## Table des Matières

1. [Pourquoi Tester ?](#1-pourquoi-tester)
2. [Types de Tests](#2-types-de-tests)
3. [Tests Unitaires](#3-tests-unitaires)
4. [Tests d'Intégration](#4-tests-dintégration)
5. [Mocking](#5-mocking)
6. [Assertions](#6-assertions)
7. [Bonnes Pratiques](#7-bonnes-pratiques)

---

## 1. Pourquoi Tester ?

### 1.1 Les Avantages

```
┌─────────────────────────────────────────────────────────────┐
│                 POURQUOI ÉCRIRE DES TESTS ?                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CONFIANCE                                               │
│     └── Tu peux modifier le code sans peur de tout casser  │
│                                                             │
│  2. DOCUMENTATION                                           │
│     └── Les tests montrent comment utiliser le code        │
│                                                             │
│  3. DESIGN                                                  │
│     └── Écrire des tests force un code mieux structuré     │
│                                                             │
│  4. RÉGRESSION                                              │
│     └── Détecte si une modification casse quelque chose    │
│                                                             │
│  5. AUTOMATISATION                                          │
│     └── CI/CD peut valider chaque changement               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Coût des Bugs

```
           Coût de correction d'un bug

    100x │                              ▓▓▓
        │                              ▓▓▓
     50x │                    ▓▓▓      ▓▓▓
        │                    ▓▓▓      ▓▓▓
     10x │          ▓▓▓      ▓▓▓      ▓▓▓
        │          ▓▓▓      ▓▓▓      ▓▓▓
      1x │  ▓▓▓    ▓▓▓      ▓▓▓      ▓▓▓
        └──────────────────────────────────
          Design  Dev    Test    Production

Plus on détecte tard, plus c'est cher!
```

---

## 2. Types de Tests

### 2.1 La Pyramide des Tests

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E╲        ← Peu nombreux, lents, coûteux
                 ╱──────╲         (Tests navigateur)
                ╱        ╲
               ╱Integration╲    ← Nombre moyen, moyennement rapides
              ╱────────────╲      (API, Base de données)
             ╱              ╲
            ╱   Unit Tests   ╲  ← Nombreux, très rapides
           ╱──────────────────╲   (Fonctions, Classes)
```

### 2.2 Comparaison

| Type | Portée | Vitesse | Quantité | Exemple |
|------|--------|---------|----------|---------|
| **Unitaire** | Une fonction/classe | Très rapide | Beaucoup | Tester `CalculateDistance()` |
| **Intégration** | Plusieurs composants | Moyen | Moyen | Tester API + BDD |
| **E2E** | Application entière | Lent | Peu | Tester le flux de connexion |

### 2.3 Définitions

#### Test Unitaire
Teste une **unité isolée** de code (fonction, méthode, classe) sans dépendances externes.

#### Test d'Intégration
Teste l'**interaction entre plusieurs composants** (API avec base de données, services entre eux).

#### Test E2E (End-to-End)
Teste l'**application complète** du point de vue utilisateur (navigateur, clics, formulaires).

---

## 3. Tests Unitaires

### 3.1 Structure d'un Test

#### Pattern AAA (Arrange-Act-Assert)

```csharp
[Fact]
public void CalculateDistance_BetweenParisAndLyon_ReturnsCorrectDistance()
{
    // ARRANGE - Préparer les données
    var lat1 = 48.8566;  // Paris
    var lon1 = 2.3522;
    var lat2 = 45.7640;  // Lyon
    var lon2 = 4.8357;

    // ACT - Exécuter l'action à tester
    var distance = GpsUtils.CalculateDistance(lat1, lon1, lat2, lon2);

    // ASSERT - Vérifier le résultat
    Assert.InRange(distance, 390, 400);  // ~392 km
}
```

### 3.2 Frameworks de Test

#### xUnit (utilisé dans FleetTrack)

```csharp
using Xunit;

namespace FleetTrack.UnitTests.Services;

public class PasswordHasherTests
{
    private readonly BCryptPasswordHasher _hasher;

    public PasswordHasherTests()
    {
        _hasher = new BCryptPasswordHasher();
    }

    [Fact]  // Test simple
    public void Hash_WithValidPassword_ReturnsNonEmptyString()
    {
        // Arrange
        var password = "MySecurePassword123!";

        // Act
        var hash = _hasher.Hash(password);

        // Assert
        Assert.NotEmpty(hash);
        Assert.StartsWith("$2a$", hash);  // Format BCrypt
    }

    [Fact]
    public void Verify_WithCorrectPassword_ReturnsTrue()
    {
        // Arrange
        var password = "MySecurePassword123!";
        var hash = _hasher.Hash(password);

        // Act
        var result = _hasher.Verify(password, hash);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void Verify_WithIncorrectPassword_ReturnsFalse()
    {
        // Arrange
        var password = "MySecurePassword123!";
        var wrongPassword = "WrongPassword";
        var hash = _hasher.Hash(password);

        // Act
        var result = _hasher.Verify(wrongPassword, hash);

        // Assert
        Assert.False(result);
    }

    [Theory]  // Test paramétré - plusieurs cas
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Hash_WithInvalidPassword_ThrowsException(string? password)
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => _hasher.Hash(password!));
    }

    [Theory]
    [InlineData("abc", false)]              // Trop court
    [InlineData("abcdefgh", false)]         // Pas de chiffre
    [InlineData("Abcdefgh1", false)]        // Pas de caractère spécial
    [InlineData("Abcdefgh1!", true)]        // Valide
    public void ValidatePasswordStrength_ReturnsExpectedResult(
        string password,
        bool expectedValid)
    {
        var result = PasswordValidator.IsStrong(password);
        Assert.Equal(expectedValid, result);
    }
}
```

### 3.3 Test d'un Service avec Mock

```csharp
using Moq;
using Xunit;

namespace FleetTrack.UnitTests.Services;

public class VehicleServiceTests
{
    private readonly Mock<FleetTrackDbContext> _mockContext;
    private readonly Mock<ILogger<VehicleService>> _mockLogger;
    private readonly VehicleService _service;

    public VehicleServiceTests()
    {
        _mockContext = new Mock<FleetTrackDbContext>();
        _mockLogger = new Mock<ILogger<VehicleService>>();
        _service = new VehicleService(_mockContext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetByIdAsync_WhenVehicleExists_ReturnsVehicleDto()
    {
        // Arrange
        var vehicleId = Guid.NewGuid();
        var vehicle = new Vehicle
        {
            Id = vehicleId,
            PlateNumber = "AB-123-CD",
            Brand = "Toyota",
            Model = "Corolla",
            Type = VehicleType.Car,
            Status = VehicleStatus.Available,
            IsActive = true
        };

        var mockDbSet = CreateMockDbSet(new List<Vehicle> { vehicle });
        _mockContext.Setup(c => c.Vehicles).Returns(mockDbSet.Object);

        // Act
        var result = await _service.GetByIdAsync(vehicleId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("AB-123-CD", result.PlateNumber);
        Assert.Equal("Toyota", result.Brand);
    }

    [Fact]
    public async Task GetByIdAsync_WhenVehicleNotExists_ReturnsNull()
    {
        // Arrange
        var mockDbSet = CreateMockDbSet(new List<Vehicle>());
        _mockContext.Setup(c => c.Vehicles).Returns(mockDbSet.Object);

        // Act
        var result = await _service.GetByIdAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_WithValidDto_ReturnsCreatedVehicle()
    {
        // Arrange
        var createDto = new CreateVehicleDto
        {
            PlateNumber = "XY-789-ZZ",
            Brand = "Volvo",
            Model = "V60",
            Type = VehicleType.Car
        };

        var vehicles = new List<Vehicle>();
        var mockDbSet = CreateMockDbSet(vehicles);
        _mockContext.Setup(c => c.Vehicles).Returns(mockDbSet.Object);
        _mockContext.Setup(c => c.SaveChangesAsync(default))
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("XY-789-ZZ", result.PlateNumber);
        Assert.Equal("Volvo", result.Brand);
        _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithDuplicatePlate_ThrowsException()
    {
        // Arrange
        var existingVehicle = new Vehicle { PlateNumber = "AB-123-CD" };
        var mockDbSet = CreateMockDbSet(new List<Vehicle> { existingVehicle });
        _mockContext.Setup(c => c.Vehicles).Returns(mockDbSet.Object);

        var createDto = new CreateVehicleDto { PlateNumber = "AB-123-CD" };

        // Act & Assert
        await Assert.ThrowsAsync<DuplicatePlateNumberException>(
            () => _service.CreateAsync(createDto)
        );
    }

    // Helper pour créer un Mock DbSet
    private static Mock<DbSet<T>> CreateMockDbSet<T>(List<T> data) where T : class
    {
        var queryable = data.AsQueryable();
        var mockSet = new Mock<DbSet<T>>();

        mockSet.As<IQueryable<T>>().Setup(m => m.Provider)
            .Returns(queryable.Provider);
        mockSet.As<IQueryable<T>>().Setup(m => m.Expression)
            .Returns(queryable.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType)
            .Returns(queryable.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator())
            .Returns(queryable.GetEnumerator());

        return mockSet;
    }
}
```

---

## 4. Tests d'Intégration

### 4.1 Définition

Les tests d'intégration testent plusieurs composants ensemble, avec de vraies dépendances (base de données en mémoire, vraie API HTTP).

### 4.2 WebApplicationFactory

```csharp
using Microsoft.AspNetCore.Mvc.Testing;

namespace FleetTrack.IntegrationTests.Helpers;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remplacer la vraie BDD par une BDD en mémoire
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<FleetTrackDbContext>));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<FleetTrackDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb_" + Guid.NewGuid());
            });

            // Créer la BDD et ajouter des données de test
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FleetTrackDbContext>();
            db.Database.EnsureCreated();
            SeedTestData(db);
        });
    }

    private static void SeedTestData(FleetTrackDbContext db)
    {
        // Rôles
        db.Roles.AddRange(
            new Role { Id = 1, Name = "Admin" },
            new Role { Id = 2, Name = "Dispatcher" },
            new Role { Id = 3, Name = "Driver" },
            new Role { Id = 4, Name = "Viewer" }
        );

        // Utilisateur admin pour les tests
        var hasher = new BCryptPasswordHasher();
        db.Users.Add(new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Username = "admin",
            Email = "admin@test.com",
            PasswordHash = hasher.Hash("Admin123!"),
            FirstName = "Test",
            LastName = "Admin",
            RoleId = 1,
            IsActive = true
        });

        // Véhicules de test
        db.Vehicles.AddRange(
            new Vehicle
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                PlateNumber = "TEST-001",
                Brand = "Toyota",
                Model = "Corolla",
                Type = VehicleType.Car,
                Status = VehicleStatus.Available,
                IsActive = true
            },
            new Vehicle
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                PlateNumber = "TEST-002",
                Brand = "Volvo",
                Model = "FH16",
                Type = VehicleType.Truck,
                Status = VehicleStatus.Available,
                IsActive = true
            }
        );

        db.SaveChanges();
    }
}
```

### 4.3 Base de Test

```csharp
namespace FleetTrack.IntegrationTests.Helpers;

public abstract class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>
{
    protected readonly HttpClient Client;
    protected readonly CustomWebApplicationFactory Factory;
    protected string? AuthToken;

    protected IntegrationTestBase(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    protected async Task AuthenticateAsAdminAsync()
    {
        var loginRequest = new { username = "admin", password = "Admin123!" };
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        AuthToken = result!.AccessToken;

        Client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", AuthToken);
    }

    protected async Task<T?> GetAsync<T>(string url)
    {
        var response = await Client.GetAsync(url);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>();
    }

    protected async Task<HttpResponseMessage> PostAsync<T>(string url, T data)
    {
        return await Client.PostAsJsonAsync(url, data);
    }
}
```

### 4.4 Tests des Controllers

```csharp
namespace FleetTrack.IntegrationTests.Controllers;

public class VehiclesControllerTests : IntegrationTestBase
{
    public VehiclesControllerTests(CustomWebApplicationFactory factory)
        : base(factory) { }

    [Fact]
    public async Task GetAll_WithoutAuth_Returns401()
    {
        // Act
        var response = await Client.GetAsync("/api/vehicles");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_WithAuth_ReturnsVehicles()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Act
        var response = await Client.GetAsync("/api/vehicles");
        var result = await response.Content.ReadFromJsonAsync<PagedResult<VehicleDto>>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalCount);  // Nos 2 véhicules de test
    }

    [Fact]
    public async Task GetById_WhenExists_ReturnsVehicle()
    {
        // Arrange
        await AuthenticateAsAdminAsync();
        var vehicleId = "22222222-2222-2222-2222-222222222222";

        // Act
        var response = await Client.GetAsync($"/api/vehicles/{vehicleId}");
        var vehicle = await response.Content.ReadFromJsonAsync<VehicleDto>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(vehicle);
        Assert.Equal("TEST-001", vehicle.PlateNumber);
        Assert.Equal("Toyota", vehicle.Brand);
    }

    [Fact]
    public async Task GetById_WhenNotExists_Returns404()
    {
        // Arrange
        await AuthenticateAsAdminAsync();
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await Client.GetAsync($"/api/vehicles/{nonExistentId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Create_WithValidData_ReturnsCreated()
    {
        // Arrange
        await AuthenticateAsAdminAsync();
        var newVehicle = new CreateVehicleDto
        {
            PlateNumber = "NEW-001",
            Brand = "Ford",
            Model = "Focus",
            Type = VehicleType.Car
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/vehicles", newVehicle);
        var created = await response.Content.ReadFromJsonAsync<VehicleDto>();

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(created);
        Assert.Equal("NEW-001", created.PlateNumber);
        Assert.NotEqual(Guid.Empty, created.Id);
    }

    [Fact]
    public async Task Create_WithDuplicatePlate_ReturnsConflict()
    {
        // Arrange
        await AuthenticateAsAdminAsync();
        var duplicateVehicle = new CreateVehicleDto
        {
            PlateNumber = "TEST-001",  // Déjà existant!
            Brand = "Honda",
            Model = "Civic",
            Type = VehicleType.Car
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/vehicles", duplicateVehicle);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Create_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        await AuthenticateAsAdminAsync();
        var invalidVehicle = new CreateVehicleDto
        {
            PlateNumber = "",  // Invalide: vide
            Brand = "",        // Invalide: vide
            Model = "Focus",
            Type = VehicleType.Car
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/vehicles", invalidVehicle);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Delete_AsAdmin_ReturnsNoContent()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Créer un véhicule à supprimer
        var newVehicle = new CreateVehicleDto
        {
            PlateNumber = "DELETE-ME",
            Brand = "Test",
            Model = "Delete",
            Type = VehicleType.Car
        };
        var createResponse = await Client.PostAsJsonAsync("/api/vehicles", newVehicle);
        var created = await createResponse.Content.ReadFromJsonAsync<VehicleDto>();

        // Act
        var deleteResponse = await Client.DeleteAsync($"/api/vehicles/{created!.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Vérifier que le véhicule n'existe plus
        var getResponse = await Client.GetAsync($"/api/vehicles/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task Delete_AsViewer_ReturnsForbidden()
    {
        // Arrange - Se connecter en tant que Viewer (pas Admin)
        // (Il faudrait créer un utilisateur Viewer dans SeedTestData)
        await AuthenticateAsViewerAsync();

        var vehicleId = "22222222-2222-2222-2222-222222222222";

        // Act
        var response = await Client.DeleteAsync($"/api/vehicles/{vehicleId}");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
```

---

## 5. Mocking

### 5.1 Définition

Le **mocking** consiste à créer des faux objets (mocks) qui simulent le comportement de vraies dépendances. Cela permet d'isoler le code testé.

### 5.2 Pourquoi Mocker ?

```
┌─────────────────────────────────────────────────────────────┐
│                    SANS MOCKING                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Test VehicleService                                       │
│         │                                                   │
│         ├──► FleetTrackDbContext (vraie BDD)               │
│         │         │                                         │
│         │         └──► SQLite/PostgreSQL                   │
│         │                   │                               │
│         │                   └── Lent, peut échouer          │
│         │                                                   │
│         └──► ILogger (vrai logger)                          │
│                   │                                         │
│                   └── Écrit dans des fichiers               │
│                                                             │
│   Problèmes:                                                │
│   • Tests lents (I/O base de données)                       │
│   • Tests fragiles (état de la BDD)                        │
│   • Difficile de tester les cas d'erreur                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AVEC MOCKING                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Test VehicleService                                       │
│         │                                                   │
│         ├──► Mock<FleetTrackDbContext>                     │
│         │         │                                         │
│         │         └── Données en mémoire, rapide           │
│         │                                                   │
│         └──► Mock<ILogger>                                  │
│                   │                                         │
│                   └── Ne fait rien, juste vérifie          │
│                                                             │
│   Avantages:                                                │
│   • Tests rapides (pas d'I/O)                              │
│   • Tests déterministes (même résultat à chaque fois)      │
│   • Facile de simuler des erreurs                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Utilisation de Moq

```csharp
using Moq;

public class AuthServiceTests
{
    private readonly Mock<FleetTrackDbContext> _mockContext;
    private readonly Mock<IPasswordHasher> _mockHasher;
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly Mock<ILogger<AuthService>> _mockLogger;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _mockContext = new Mock<FleetTrackDbContext>();
        _mockHasher = new Mock<IPasswordHasher>();
        _mockConfig = new Mock<IConfiguration>();
        _mockLogger = new Mock<ILogger<AuthService>>();

        // Configuration du mock IConfiguration
        _mockConfig.Setup(c => c["Jwt:Secret"])
            .Returns("MySecretKeyForTestingPurposes123456");
        _mockConfig.Setup(c => c["Jwt:Issuer"])
            .Returns("TestIssuer");
        _mockConfig.Setup(c => c["Jwt:Audience"])
            .Returns("TestAudience");
        _mockConfig.Setup(c => c["Jwt:ExpirationMinutes"])
            .Returns("30");

        _authService = new AuthService(
            _mockContext.Object,
            _mockHasher.Object,
            _mockConfig.Object,
            _mockLogger.Object
        );
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsToken()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = "hashed_password",
            IsActive = true,
            Role = new Role { Id = 1, Name = "Admin" }
        };

        // Setup: FindAsync retourne notre user
        var mockDbSet = CreateMockDbSet(new List<User> { user });
        _mockContext.Setup(c => c.Users).Returns(mockDbSet.Object);

        // Setup: Le hasher vérifie le password
        _mockHasher.Setup(h => h.Verify("correct_password", "hashed_password"))
            .Returns(true);

        // Act
        var result = await _authService.LoginAsync(new LoginRequestDto
        {
            Username = "testuser",
            Password = "correct_password"
        });

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.AccessToken);
        Assert.NotEmpty(result.RefreshToken);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ReturnsNull()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = "testuser",
            PasswordHash = "hashed_password",
            IsActive = true
        };

        var mockDbSet = CreateMockDbSet(new List<User> { user });
        _mockContext.Setup(c => c.Users).Returns(mockDbSet.Object);

        // Le hasher retourne FALSE (mauvais mot de passe)
        _mockHasher.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(false);

        // Act
        var result = await _authService.LoginAsync(new LoginRequestDto
        {
            Username = "testuser",
            Password = "wrong_password"
        });

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_WithInactiveUser_ReturnsNull()
    {
        // Arrange
        var user = new User
        {
            Username = "inactive",
            IsActive = false  // Compte désactivé
        };

        var mockDbSet = CreateMockDbSet(new List<User> { user });
        _mockContext.Setup(c => c.Users).Returns(mockDbSet.Object);

        // Act
        var result = await _authService.LoginAsync(new LoginRequestDto
        {
            Username = "inactive",
            Password = "any_password"
        });

        // Assert
        Assert.Null(result);

        // Verify: Le hasher n'a même pas été appelé
        _mockHasher.Verify(
            h => h.Verify(It.IsAny<string>(), It.IsAny<string>()),
            Times.Never
        );
    }
}
```

### 5.4 Syntaxe Moq Courante

```csharp
// Setup - Définir le comportement
mock.Setup(x => x.Method()).Returns(value);
mock.Setup(x => x.Method(It.IsAny<string>())).Returns(value);
mock.Setup(x => x.Method("specific")).Returns(specificValue);
mock.Setup(x => x.MethodAsync()).ReturnsAsync(value);
mock.Setup(x => x.Method()).Throws(new Exception());

// It.Is - Condition personnalisée
mock.Setup(x => x.Method(It.Is<int>(n => n > 0))).Returns(true);

// Sequence - Retours différents à chaque appel
mock.SetupSequence(x => x.Method())
    .Returns(1)
    .Returns(2)
    .Throws(new Exception());

// Verify - Vérifier que la méthode a été appelée
mock.Verify(x => x.Method(), Times.Once);
mock.Verify(x => x.Method(), Times.Never);
mock.Verify(x => x.Method(), Times.Exactly(3));
mock.Verify(x => x.Method(It.IsAny<string>()), Times.AtLeastOnce);

// Callback - Exécuter du code lors de l'appel
var capturedValue = "";
mock.Setup(x => x.Method(It.IsAny<string>()))
    .Callback<string>(s => capturedValue = s);
```

---

## 6. Assertions

### 6.1 Assertions xUnit de Base

```csharp
// Égalité
Assert.Equal(expected, actual);
Assert.NotEqual(unexpected, actual);

// Null
Assert.Null(value);
Assert.NotNull(value);

// Booléens
Assert.True(condition);
Assert.False(condition);

// Collections
Assert.Empty(collection);
Assert.NotEmpty(collection);
Assert.Single(collection);
Assert.Contains(item, collection);
Assert.DoesNotContain(item, collection);
Assert.All(collection, item => Assert.True(item.IsValid));

// Types
Assert.IsType<ExpectedType>(actual);
Assert.IsAssignableFrom<IEnumerable>(actual);

// Strings
Assert.StartsWith("prefix", actual);
Assert.EndsWith("suffix", actual);
Assert.Contains("substring", actual);
Assert.Matches(@"\d+", actual);  // Regex

// Nombres
Assert.InRange(actual, low, high);

// Exceptions
Assert.Throws<ArgumentException>(() => Method());
await Assert.ThrowsAsync<InvalidOperationException>(() => AsyncMethod());
var ex = Assert.Throws<CustomException>(() => Method());
Assert.Equal("Expected message", ex.Message);

// Same/Not Same (référence)
Assert.Same(expected, actual);      // Même référence
Assert.NotSame(expected, actual);   // Références différentes
```

### 6.2 FluentAssertions (Alternative)

```csharp
using FluentAssertions;

// Plus lisible et expressif
result.Should().NotBeNull();
result.Should().Be(42);
result.Should().BeGreaterThan(0);

list.Should().HaveCount(3);
list.Should().Contain(x => x.Name == "Test");
list.Should().BeInAscendingOrder(x => x.Date);

action.Should().Throw<ArgumentException>()
    .WithMessage("*invalid*");

asyncAction.Should().ThrowAsync<HttpRequestException>();

// Chaînage
result.Should()
    .NotBeNull()
    .And.Be("expected value");
```

---

## 7. Bonnes Pratiques

### 7.1 Nommage des Tests

```csharp
// Pattern: MethodName_Scenario_ExpectedBehavior

// ✅ BON
public void GetById_WhenVehicleExists_ReturnsVehicle()
public void GetById_WhenVehicleNotExists_ReturnsNull()
public void Create_WithDuplicatePlate_ThrowsDuplicateException()
public void Login_WithInvalidPassword_ReturnsNull()

// ❌ MAUVAIS
public void TestGetById()
public void GetByIdTest()
public void Test1()
```

### 7.2 Un Assert par Test

```csharp
// ✅ BON - Un concept par test
[Fact]
public void Create_ReturnsCorrectPlateNumber()
{
    var result = service.Create(dto);
    Assert.Equal("AB-123", result.PlateNumber);
}

[Fact]
public void Create_GeneratesNewId()
{
    var result = service.Create(dto);
    Assert.NotEqual(Guid.Empty, result.Id);
}

// ⚠️ Acceptable - Assertions liées
[Fact]
public void Create_ReturnsValidVehicle()
{
    var result = service.Create(dto);

    Assert.NotNull(result);
    Assert.Equal("AB-123", result.PlateNumber);
    Assert.NotEqual(Guid.Empty, result.Id);
}
```

### 7.3 Tests Indépendants

```csharp
// ❌ MAUVAIS - Dépendance entre tests
private static Vehicle _createdVehicle;

[Fact]
public void Test1_Create()
{
    _createdVehicle = service.Create(dto);
    Assert.NotNull(_createdVehicle);
}

[Fact]
public void Test2_GetById()
{
    // Échoue si Test1 n'a pas été exécuté avant!
    var result = service.GetById(_createdVehicle.Id);
    Assert.NotNull(result);
}

// ✅ BON - Tests indépendants
[Fact]
public void Create_ReturnsNewVehicle()
{
    var result = service.Create(dto);
    Assert.NotNull(result);
}

[Fact]
public void GetById_WithExistingId_ReturnsVehicle()
{
    // Arrange - Créer ses propres données
    var vehicle = CreateTestVehicle();

    // Act
    var result = service.GetById(vehicle.Id);

    // Assert
    Assert.NotNull(result);
}
```

### 7.4 Éviter la Logique dans les Tests

```csharp
// ❌ MAUVAIS - Logique complexe dans le test
[Fact]
public void CalculateTotal_ReturnsCorrectSum()
{
    var items = new[] { 10, 20, 30 };
    var expected = 0;
    foreach (var item in items)
    {
        expected += item;  // Bug: même logique que le code testé!
    }

    var result = calculator.Sum(items);
    Assert.Equal(expected, result);
}

// ✅ BON - Valeur attendue explicite
[Fact]
public void CalculateTotal_ReturnsCorrectSum()
{
    var items = new[] { 10, 20, 30 };
    var result = calculator.Sum(items);
    Assert.Equal(60, result);  // Valeur connue
}
```

### 7.5 Commandes de Test

```bash
# Exécuter tous les tests
dotnet test

# Exécuter avec détails
dotnet test --logger "console;verbosity=detailed"

# Exécuter un projet spécifique
dotnet test FleetTrack.UnitTests

# Exécuter un test spécifique
dotnet test --filter "FullyQualifiedName~VehicleServiceTests.GetById"

# Avec couverture de code
dotnet test --collect:"XPlat Code Coverage"

# Générer rapport HTML
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coverage"
```

---

## Résumé

| Concept | Description |
|---------|-------------|
| **Test Unitaire** | Teste une unité isolée |
| **Test d'Intégration** | Teste plusieurs composants ensemble |
| **Test E2E** | Teste l'application complète |
| **AAA Pattern** | Arrange-Act-Assert |
| **Mock** | Faux objet simulant une dépendance |
| **xUnit** | Framework de test .NET |
| **Moq** | Bibliothèque de mocking |
| **Assert** | Vérification du résultat |

---

[← Précédent : Frontend](./06-frontend.md) | [Suivant : DevOps →](./08-devops.md)
