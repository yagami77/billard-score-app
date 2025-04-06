# 📋 Plan d'amélioration de l'application 5quilles

## Objectif
Ajouter des fonctionnalités importantes à l'application (authentification, navigation, gestion utilisateur, etc.)

---

## ✅ Tâches à exécuter (Claude doit cocher ce qu'il fait automatiquement)

- [x] Ajouter un bouton "Retour à l'accueil" en haut de la page `app/dashboard/page.tsx` pointant vers `/`, avec les mêmes styles que sur `app/streams/page.tsx`
- [x] Lorsqu'un utilisateur accède à une table via une URL contenant les paramètres `?sets=...&points=...`, ne pas afficher la fenêtre de configuration
- [x] Si ces paramètres sont présents, démarrer la partie directement avec ces valeurs
- [x] Afficher la modale **uniquement** si aucun paramètre n'est fourni (accès direct à la table sans config)