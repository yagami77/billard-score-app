# 📋 Plan d'amélioration de l'application 5quilles

## Objectif
Ajouter des fonctionnalités importantes à l'application (authentification, navigation, gestion utilisateur, etc.)

---

## ✅ Tâches à exécuter (Claude doit cocher ce qu'il fait automatiquement)

- [ ] Créer une page de connexion (app/login/page.tsx) avec email/mot de passe
- [ ] Créer une page d'inscription (app/register/page.tsx)
- [ ] Mettre en place un système d’authentification basique (NextAuth.js ou équivalent maison)
- [ ] Protéger l'accès au tableau de bord (dashboard) pour les utilisateurs connectés uniquement
- [ ] Ajouter un bouton "Retour à l'accueil" en haut de la page dashboard
- [ ] Créer une page de profil joueur (app/profile/page.tsx) contenant pseudo, avatar et historique
- [ ] Créer un composant Header global avec navigation (Accueil, Profil, Se déconnecter)
- [ ] Afficher un message d’erreur si l’utilisateur tente d’accéder au dashboard sans être connecté
- [ ] Créer une base de données simple (ex: JSON ou Supabase) pour stocker les utilisateurs
- [ ] Installer les dépendances nécessaires : `next-auth`, `@auth/core`, etc.