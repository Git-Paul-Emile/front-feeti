# 🎯 Guide du Back Office Feeti

Bienvenue dans le guide complet du back office de votre plateforme de billetterie Feeti. Ce document vous explique comment utiliser toutes les fonctionnalités administratives.

## 📑 Table des Matières

1. [Accès au Back Office](#accès-au-back-office)
2. [Vue d'Ensemble](#vue-densemble)
3. [Gestion des Événements](#gestion-des-événements)
4. [Gestion des Transactions](#gestion-des-transactions)
5. [Paramètres et Configuration](#paramètres-et-configuration)
6. [Statistiques et Analytics](#statistiques-et-analytics)
7. [Sécurité et Permissions](#sécurité-et-permissions)

---

## 🔐 Accès au Back Office

### Connexion

1. Rendez-vous sur votre application Feeti
2. Cliquez sur **"Se connecter"** dans la navigation
3. Utilisez un compte administrateur avec les credentials suivants :
   - Email contenant **"admin"** ou **"superadmin"**
   - Mot de passe de votre choix (en développement)

**Exemple de comptes admin :**
- `admin@feeti.com`
- `superadmin@feeti.com`
- `moderator@feeti.com`

### Navigation vers le Back Office

Après connexion, deux méthodes d'accès :

**Méthode 1 : Via la Navigation**
- Cliquez sur votre avatar en haut à droite
- Sélectionnez **"Back Office"** dans le menu déroulant

**Méthode 2 : Via l'URL**
- Naviguez directement vers `/back-office` après connexion
- Le système vérifiera automatiquement vos permissions

---

## 📊 Vue d'Ensemble

La page d'accueil du back office affiche un tableau de bord complet avec :

### Statistiques Principales

**4 Cartes de Statistiques :**

1. **Événements Totaux** (Carte Indigo)
   - Nombre total d'événements créés
   - Sous-total : Événements live actifs
   - Icône : Calendrier 📅

2. **Utilisateurs** (Carte Verte)
   - Nombre total d'utilisateurs inscrits
   - Croissance des inscriptions
   - Icône : Utilisateurs 👥

3. **Billets Vendus** (Carte Jaune)
   - Total des billets vendus
   - Nombre de transactions complétées
   - Icône : Ticket 🎫

4. **Revenus** (Carte Émeraude)
   - Revenus totaux générés
   - Affichage en FCFA
   - Icône : Dollar 💰

### Graphiques Analytics

**Graphique 1 : Revenus par Mois**
- Visualisation en barres
- Évolution mensuelle des revenus
- Données filtrables par période

**Graphique 2 : Événements par Catégorie**
- Distribution des événements
- Catégories : Musique, Art, Concert, Sport, etc.
- Aide à identifier les catégories populaires

### Événements Récents

Liste des 5 derniers événements créés avec :
- Image miniature
- Titre et localisation
- Date et heure
- Badge de statut (publié/brouillon)
- Indicateur LIVE pour les événements en direct

---

## 🎭 Gestion des Événements

### Vue Liste des Événements

Accédez à l'onglet **"Événements"** pour voir tous les événements.

**Fonctionnalités de la Liste :**

1. **Barre de Recherche**
   - Recherche par titre, catégorie ou lieu
   - Mise à jour en temps réel
   - Icône de recherche 🔍

2. **Bouton Filtrer**
   - Filtrage avancé (à venir)
   - Options multiples de tri

3. **Bouton "Nouvel Événement"**
   - Création rapide d'événements
   - Formulaire complet accessible

### Table des Événements

**Colonnes affichées :**

| Colonne | Description |
|---------|-------------|
| **Événement** | Image + Titre + Catégorie |
| **Date** | Date et heure de l'événement |
| **Lieu** | Localisation physique |
| **Prix** | Tarif en FCFA |
| **Participants** | Jauge de remplissage (actuel/max) |
| **Statut** | Badge coloré (publié/brouillon/annulé/terminé) |
| **Actions** | Boutons Modifier et Supprimer |

### Créer un Nouvel Événement

**Étapes :**

1. Cliquez sur **"+ Nouvel Événement"**
2. Remplissez le formulaire :

**Champs Obligatoires (*):**
- **Titre*** : Nom de l'événement
- **Date*** : Date de l'événement (picker)
- **Heure*** : Heure de début (picker)

**Champs Optionnels :**
- **Catégorie** : Sélection (Musique, Art, Concert, Sport, Conférence)
- **Description** : Détails complets de l'événement
- **Lieu** : Adresse ou nom du lieu
- **URL de l'image** : Lien vers l'affiche/photo
- **Prix** : Tarif en FCFA (0 pour gratuit)
- **Places max** : Capacité d'accueil
- **Statut** : Brouillon / Publié / Annulé / Terminé
- **Événement en direct (Live)** : Toggle pour les événements streaming

3. Cliquez sur **"Enregistrer"**

**✅ Validation Automatique :**
- Titre requis
- Date et heure requises
- Date ne peut pas être dans le passé
- Prix ≥ 0
- Places max > 0

### Modifier un Événement

1. Dans la liste, cliquez sur l'icône **"Crayon"** ✏️
2. Le formulaire s'ouvre avec les données existantes
3. Modifiez les champs souhaités
4. Cliquez sur **"Enregistrer"**

**Note :** Toutes les modifications sont tracées avec `updated_at`

### Supprimer un Événement

1. Cliquez sur l'icône **"Corbeille"** 🗑️
2. Une confirmation apparaît :
   - **"Êtes-vous sûr de vouloir supprimer cet événement ?"**
   - **"Cette action est irréversible."**
3. Confirmez ou annulez

**⚠️ Attention :** 
- Suppression définitive de l'événement
- Les billets associés sont également affectés
- Impossible de récupérer les données

### Statuts des Événements

| Statut | Badge | Signification |
|--------|-------|---------------|
| **Brouillon** | Gris | Non publié, invisible au public |
| **Publié** | Bleu | Visible et disponible à la vente |
| **Annulé** | Rouge | Événement annulé, billets remboursables |
| **Terminé** | Vert | Événement passé |

### Indicateur LIVE

**Badge Rouge "LIVE"** affiché quand :
- `isLive = true`
- Événement en streaming direct
- Visible dans la liste et sur les cartes

---

## 💳 Gestion des Transactions

### Vue des Transactions

Accédez à l'onglet **"Transactions"** pour voir l'historique des paiements.

**Informations Affichées :**

| Colonne | Description |
|---------|-------------|
| **ID Transaction** | Identifiant unique (8 premiers caractères) |
| **Utilisateur** | ID de l'acheteur (anonymisé) |
| **Montant** | Prix total en FCFA |
| **Billets** | Nombre de billets achetés |
| **Statut** | Badge coloré (complété/en attente/échoué) |
| **Date** | Date et heure de la transaction |

### Statuts des Transactions

| Statut | Badge | Action |
|--------|-------|--------|
| **Pending** | Jaune | En attente de paiement |
| **Completed** | Vert | Paiement réussi |
| **Failed** | Rouge | Échec du paiement |
| **Refunded** | Orange | Remboursement effectué |

### Exporter les Données

**Fonctionnalité à venir :**
- Export CSV
- Export Excel
- Export PDF pour comptabilité
- Filtres par période

---

## ⚙️ Paramètres et Configuration

### Configuration Firebase

**Vérification de la Connexion :**

La carte **"Configuration Firebase"** affiche :

✅ **Statut Connecté** (Badge Vert)
- Base de données Firestore active
- Services Firebase opérationnels

❌ **Statut Déconnecté** (Badge Rouge)
- Configuration manquante
- Erreur de connexion

**Instructions de Configuration :**

1. Badge d'avertissement jaune affiché si non configuré
2. Liste des étapes :
   - Créer un projet Firebase
   - Activer Firestore Database
   - Activer Authentication
   - Activer Storage
   - Copier les credentials
3. Lien vers la documentation : `FIREBASE_SETUP.md`

### Actions Administrateur

**Boutons disponibles :**

1. **Actualiser les données** 🔄
   - Recharge toutes les statistiques
   - Rafraîchit les graphiques
   - Met à jour les compteurs

2. **Exporter les données** 📥
   - Export complet de la base
   - Format JSON/CSV
   - Sauvegarde locale

3. **Réinitialiser le cache** ⚠️
   - Vide le cache navigateur
   - Réinitialise les états
   - **Attention :** Action irréversible

---

## 📈 Statistiques et Analytics

### Métriques Clés

**Données en Temps Réel :**

Le back office affiche automatiquement :

1. **Taux de Conversion**
   - Visiteurs → Inscriptions
   - Visiteurs → Achats
   - Calculé automatiquement

2. **Revenus par Événement**
   - Classement des événements les plus rentables
   - Graphiques de comparaison
   - Tendances temporelles

3. **Comportement Utilisateur**
   - Pages les plus visitées
   - Temps moyen sur le site
   - Taux de rebond

### Graphiques Interactifs

**Recharts Library :**

Les graphiques sont :
- **Interactifs** : Survol pour détails
- **Responsifs** : Adaptés mobile/desktop
- **Exportables** : Capture d'écran possible
- **Personnalisables** : Couleurs de la charte Feeti

**Types de Graphiques :**
1. Barres (revenus mensuels)
2. Lignes (évolution temporelle)
3. Camembert (distribution catégories)
4. Aires empilées (comparaisons)

---

## 🔒 Sécurité et Permissions

### Niveaux d'Accès

**Hiérarchie des Rôles :**

| Rôle | Accès Back Office | Permissions |
|------|-------------------|-------------|
| **Super Admin** | ✅ Complet | Tous les droits |
| **Admin** | ✅ Complet | Gestion complète sauf suppression utilisateurs |
| **Moderator** | ✅ Limité | Modération événements et commentaires |
| **Support** | ✅ Lecture seule | Consultation uniquement |
| **Organizer** | ❌ Non | Accès à "Organizer Dashboard" uniquement |
| **User** | ❌ Non | Accès utilisateur standard |

### Protections Mises en Place

**1. Authentification Requise**
```typescript
// Vérification automatique
if (!currentUser || !currentUser.adminRole || currentUser.adminRole === 'user') {
  // Redirection vers LoginPage
}
```

**2. Validation des Données**
- Tous les formulaires sont validés
- Protection contre les injections
- Sanitisation des entrées

**3. Autorisations Granulaires**
- Chaque action vérifie les permissions
- Logs d'audit automatiques
- Traçabilité complète

### Bonnes Pratiques de Sécurité

**✅ À FAIRE :**
- Utilisez des mots de passe forts
- Activez l'authentification 2FA
- Changez les credentials régulièrement
- Limitez l'accès au strict nécessaire

**❌ À ÉVITER :**
- Partager les identifiants admin
- Garder des sessions ouvertes
- Utiliser des emails génériques
- Ignorer les alertes de sécurité

---

## 🎨 Interface Utilisateur

### Design System

**Palette de Couleurs :**
- **Indigo (#4338ca)** : Primaire
- **Vert (#059669)** : Secondaire
- **Rouge (#DE0035)** : Live/Urgent
- **Jaune (#cdff71)** : Accents

**Composants UI :**
- **shadcn/ui** : Bibliothèque de composants
- **Tailwind CSS** : Framework CSS
- **Lucide Icons** : Icônes cohérentes

### Responsive Design

**Breakpoints :**
- **Mobile** : < 640px
- **Tablet** : 640px - 1024px
- **Desktop** : > 1024px

Toutes les pages s'adaptent automatiquement.

---

## 🚀 Fonctionnalités Avancées

### À Venir (Roadmap)

**Version 2.0 :**
- [ ] Gestion des utilisateurs
- [ ] Modération des avis
- [ ] Export Excel/PDF
- [ ] Notifications push
- [ ] Intégration Stripe/Paystack
- [ ] Dashboard analytics avancé
- [ ] Rapports automatiques
- [ ] API REST documentée

**Version 3.0 :**
- [ ] Machine Learning pour recommandations
- [ ] Chatbot support client
- [ ] Application mobile admin
- [ ] Webhooks personnalisables
- [ ] Multi-tenant (plusieurs organisations)

---

## 🆘 Support et Assistance

### Problèmes Courants

**1. Impossible de se connecter**
- Vérifiez que votre email contient "admin"
- Vérifiez la configuration Firebase
- Consultez la console navigateur pour les erreurs

**2. Les données ne s'affichent pas**
- Cliquez sur le bouton "Actualiser"
- Vérifiez votre connexion Internet
- Regardez les logs Firebase dans la console

**3. Erreur lors de la création d'événement**
- Vérifiez que tous les champs requis sont remplis
- Vérifiez le format de l'URL d'image
- Assurez-vous que la date est future

### Logs et Debugging

**Console Développeur :**
```javascript
// Activer les logs détaillés
localStorage.setItem('DEBUG', 'true');

// Voir les erreurs Firebase
// Ouvrez la console (F12) et filtrez par "Firebase"
```

### Contacter le Support

**Méthodes de Contact :**
- 📧 Email : support@feeti.com
- 💬 Chat : Disponible dans l'application
- 📱 Téléphone : +242 6 XX XX XX XX
- 📖 Documentation : `/docs`

---

## 📝 Checklist de Démarrage

**Liste de vérification pour un back office opérationnel :**

- [ ] Firebase configuré (voir `FIREBASE_SETUP.md`)
- [ ] Compte admin créé
- [ ] Premier événement créé
- [ ] Test de création de billet
- [ ] Vérification des statistiques
- [ ] Export de données testé
- [ ] Règles de sécurité configurées
- [ ] Backup automatique activé
- [ ] Documentation lue et comprise

---

## 🎓 Ressources Supplémentaires

### Documentation Technique

- **Firebase Setup** : `/FIREBASE_SETUP.md`
- **Schéma SQL** : `/database/schema.sql`
- **API Reference** : `/services/FirebaseService.ts`

### Tutoriels Vidéo

*(À venir)*
- Introduction au Back Office (5 min)
- Créer votre premier événement (10 min)
- Gérer les transactions (8 min)
- Analytics avancés (15 min)

### Communauté

- **Discord** : discord.gg/feeti
- **Forum** : forum.feeti.com
- **GitHub** : github.com/feeti/platform

---

## 📜 Changelog

### Version 1.0.0 (Current)
- ✅ Vue d'ensemble avec statistiques
- ✅ Gestion des événements (CRUD)
- ✅ Visualisation des transactions
- ✅ Configuration Firebase
- ✅ Graphiques analytics
- ✅ Interface responsive

---

**🎉 Félicitations !** Vous êtes maintenant prêt à gérer votre plateforme Feeti comme un pro !

Pour toute question, n'hésitez pas à consulter la documentation ou à contacter le support technique.

---

*Dernière mise à jour : Décembre 2024*
*Version du guide : 1.0.0*
