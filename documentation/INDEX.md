# 📚 FleetTrack - Index de la Documentation

Bienvenue dans la documentation complète du système FleetTrack. Ce document vous guide vers toutes les ressources disponibles.

---

## 📖 Documents disponibles

### 1. [README.md](./README.md) - Vue d'ensemble du projet
**Description:** Introduction générale au projet FleetTrack, architecture Clean Architecture, et instructions de démarrage rapide.

**Contenu:**
- Présentation du projet
- Architecture globale (Domain, Application, Infrastructure, API)
- Technologies utilisées
- Installation et configuration
- Comment démarrer le projet

**À consulter pour:** Comprendre le projet dans son ensemble et démarrer rapidement.

---

### 2. [USER_MANAGEMENT.md](./USER_MANAGEMENT.md) - Gestion des utilisateurs
**Description:** Documentation complète du système de gestion des utilisateurs, rôles et permissions.

**Contenu:**
- Vue d'ensemble des fonctionnalités
- Architecture backend (Controller, Service, Repository, DTOs)
- Endpoints API REST (CRUD, activation, réinitialisation mot de passe)
- Interface frontend (pages de liste, création, édition)
- Modèles de données (User, Role, DTOs TypeScript)
- Sécurité (hachage BCrypt, autorisation Admin)
- Guide d'utilisation pas à pas
- Exemples de code (API, hooks React Query)

**À consulter pour:**
- Créer et gérer les utilisateurs
- Comprendre le système de rôles
- Implémenter des fonctionnalités utilisateur
- Intégrer l'API de gestion des utilisateurs

---

### 3. [AUTH_DOCUMENTATION.md](./AUTH_DOCUMENTATION.md) - Authentification JWT
**Description:** Documentation complète du système d'authentification avec JWT tokens.

**Contenu:**
- Configuration JWT (tokens, refresh tokens, expiration)
- Endpoints d'authentification (login, register, refresh, revoke)
- Système de rôles et permissions
- Utilisation dans Swagger
- Exemples de requêtes

**À consulter pour:**
- Comprendre l'authentification
- Implémenter la connexion/inscription
- Gérer les tokens JWT
- Sécuriser les endpoints

---

### 4. [SIGNALR_DOCUMENTATION.md](./SIGNALR_DOCUMENTATION.md) - Tracking GPS temps réel
**Description:** Documentation du hub SignalR pour le tracking GPS en temps réel.

**Contenu:**
- Configuration du hub SignalR
- Méthodes disponibles (Subscribe, SendPosition, etc.)
- Événements clients (ReceiveGpsPosition, ReceiveTrackingEvent)
- Intégration JavaScript/TypeScript
- Exemples de connexion

**À consulter pour:**
- Implémenter le tracking temps réel
- S'abonner aux positions GPS
- Envoyer des événements de tracking

---

### 5. [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Schéma de base de données
**Description:** Documentation complète de la structure de la base de données SQLite avec toutes les tables, relations, types de données et index.

**Contenu:**
- Diagramme ERD (Entity Relationship Diagram)
- Description détaillée des 8 tables
- Relations 1:1 et 1:N entre les entités
- Tous les index et contraintes
- Enums complets (11 types différents)
- Exemples de requêtes SQL
- Exemples de données INSERT

**À consulter pour:**
- Comprendre la structure des données
- Créer des requêtes SQL
- Insérer des données de test
- Comprendre les relations entre entités

**Tables documentées:**
1. **Vehicles** - Gestion des véhicules (16 colonnes)
2. **Drivers** - Gestion des chauffeurs (12 colonnes)
3. **Missions** - Missions et trajets (14 colonnes)
4. **Waypoints** - Points de passage (15 colonnes)
5. **GpsPositions** - Tracking GPS (11 colonnes)
6. **Alerts** - Alertes et notifications (14 colonnes)
7. **MaintenanceRecords** - Historique maintenance (12 colonnes)
8. **Zones** - Zones géographiques (12 colonnes)

---

### 6. [ARCHITECTURE_FLOW.md](./ARCHITECTURE_FLOW.md) - Parcours du code
**Description:** Documentation détaillée du flux d'exécution du code à travers les différentes couches de l'architecture.

**Contenu:**
- Parcours complet d'une requête HTTP (10 étapes)
- Exemple: POST /api/vehicles (création d'un véhicule)
- Exemple: GET /api/vehicles (récupération de la liste)
- Gestion des erreurs (validation, not found, duplication)
- Diagrammes de flux
- Références aux numéros de ligne du code source
- Responsabilités de chaque couche

**À consulter pour:**
- Comprendre comment fonctionne une requête API
- Débugger un problème
- Comprendre le rôle de chaque couche
- Suivre le flux de données

**Couches documentées:**
1. **Controller** (API Layer) - Point d'entrée HTTP
2. **Service** (Application Layer) - Logique métier
3. **Repository** (Infrastructure Layer) - Accès aux données
4. **DbContext** (Infrastructure Layer) - ORM Entity Framework Core
5. **Database** - SQLite

---

## 🗂️ Organisation de la documentation

```
documentation/
├── INDEX.md                    (ce fichier - point d'entrée)
├── README.md                   (vue d'ensemble du projet)
├── USER_MANAGEMENT.md          (gestion des utilisateurs)
├── DATABASE_SCHEMA.md          (schéma complet de la BD)
├── AUTH_DOCUMENTATION.md       (authentification JWT)
├── SIGNALR_DOCUMENTATION.md    (tracking GPS temps réel)
└── ARCHITECTURE_FLOW.md        (parcours du code)
```

---

## 🚀 Par où commencer ?

### Si vous êtes nouveau sur le projet:
1. ✅ Lisez d'abord [README.md](./README.md) pour comprendre le contexte
2. ✅ Parcourez [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) pour comprendre les données
3. ✅ Consultez [ARCHITECTURE_FLOW.md](./ARCHITECTURE_FLOW.md) pour comprendre le code

### Si vous voulez développer une nouvelle fonctionnalité:
1. ✅ [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) → Identifier les tables concernées
2. ✅ [ARCHITECTURE_FLOW.md](./ARCHITECTURE_FLOW.md) → Comprendre où ajouter le code
3. ✅ [README.md](./README.md) → Vérifier les conventions du projet

### Si vous voulez manipuler les données:
1. ✅ [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) → Section "Exemples de données"
2. ✅ Utilisez DB Browser for SQLite ou Swagger
3. ✅ Référez-vous aux enums pour les valeurs valides

### Si vous débugguez un problème:
1. ✅ [ARCHITECTURE_FLOW.md](./ARCHITECTURE_FLOW.md) → Suivre le flux de la requête
2. ✅ [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) → Vérifier les contraintes et relations
3. ✅ Mettez des breakpoints selon le guide de debugging

---

## 📊 Statistiques de la documentation

| Document | Taille | Sections | Dernière mise à jour |
|----------|--------|----------|---------------------|
| README.md | ~6 KB | 5 | 2025-12-18 |
| USER_MANAGEMENT.md | ~18 KB | 8 | 2025-12-25 |
| AUTH_DOCUMENTATION.md | ~28 KB | 7 | 2025-12-20 |
| SIGNALR_DOCUMENTATION.md | ~28 KB | 6 | 2025-12-20 |
| DATABASE_SCHEMA.md | ~38 KB | 9 | 2025-12-20 |
| ARCHITECTURE_FLOW.md | ~26 KB | 5 | 2025-12-20 |
| **TOTAL** | **~144 KB** | **40** | - |

---

## 🔧 Outils recommandés

### Pour consulter la documentation:
- **VSCode** avec extension Markdown Preview
- **GitHub** (rendu automatique du Markdown)
- **Navigateur web** avec n'importe quel viewer Markdown

### Pour manipuler la base de données:
- **DB Browser for SQLite** - Interface graphique complète
- **Extension VSCode SQLite** - Intégré dans l'éditeur
- **Swagger UI** (http://localhost:5115) - Via les endpoints API
- **Ligne de commande** - `sqlite3 FleetTrack.db`

### Pour développer:
- **Visual Studio Code** - Éditeur recommandé
- **Visual Studio 2022** - IDE complet
- **.NET 8.0 SDK** - Requis
- **Git** - Gestion de version

---

## 📝 Convention de nommage des documents

| Type de document | Format du nom | Exemple |
|------------------|---------------|---------|
| Vue d'ensemble | `README.md` | README.md |
| Architecture/Technique | `ARCHITECTURE_*.md` | ARCHITECTURE_FLOW.md |
| Base de données | `DATABASE_*.md` | DATABASE_SCHEMA.md |
| Guide/Tutorial | `GUIDE_*.md` | GUIDE_DEPLOYMENT.md |
| Index/Sommaire | `INDEX.md` | INDEX.md |

---

## 🆘 Aide et support

### Problèmes courants

**Q: Je ne trouve pas une table spécifique**
→ Consultez [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md), Section "Tables"

**Q: Comment créer des données de test ?**
→ Consultez [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md), Section "Exemples de données"

**Q: Comment suivre une requête dans le code ?**
→ Consultez [ARCHITECTURE_FLOW.md](./ARCHITECTURE_FLOW.md), Section "Parcours complet"

**Q: Quelles sont les valeurs possibles pour un enum ?**
→ Consultez [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md), Section "Enums et Types"

**Q: Comment débugger mon API ?**
→ Consultez [ARCHITECTURE_FLOW.md](./ARCHITECTURE_FLOW.md), puis le guide de debugging dans le README principal

**Q: Comment créer un nouvel utilisateur ?**
→ Consultez [USER_MANAGEMENT.md](./USER_MANAGEMENT.md), Section "Guide d'utilisation"

**Q: Comment gérer les rôles et permissions ?**
→ Consultez [USER_MANAGEMENT.md](./USER_MANAGEMENT.md), Section "Rôles disponibles"

---

## 🔄 Mise à jour de la documentation

**Dernière mise à jour:** 2025-12-25

**Historique:**
- 2025-12-25: Ajout de USER_MANAGEMENT.md (gestion des utilisateurs)
- 2025-12-20: Ajout de AUTH_DOCUMENTATION.md et SIGNALR_DOCUMENTATION.md
- 2025-12-20: Ajout de DATABASE_SCHEMA.md et INDEX.md
- 2025-12-20: Ajout de ARCHITECTURE_FLOW.md
- 2025-12-18: Création initiale du README.md

---

## 📧 Contact

Pour toute question ou suggestion concernant la documentation:
- Créez une issue dans le repository
- Contactez l'équipe de développement

---

**Bonne lecture ! 📖**
