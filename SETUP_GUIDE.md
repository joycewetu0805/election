# Guide de Configuration et Mise en Ligne - Rigged Election App

Ce guide vous accompagne de la création du projet Supabase jusqu'à la mise en ligne du site.

## 1. Configuration de Supabase

### Création du Projet
1. Allez sur [Supabase.com](https://supabase.com/) et créez un nouveau projet.
2. Notez votre **Project URL** et votre **Anon Key** (*Project Settings > API*).

### Base de Données
1. Allez dans l'onglet **SQL Editor**.
2. Créez une **New Query**, collez le contenu de `schema.sql` et cliquez sur **Run**.
   - *Note : Cela active la logique de vote, les politiques RLS et le trigger de création de profil attendu par le projet.*
   - *Le front sait aussi recréer le profil automatiquement si ce trigger n'a pas tourné.*

### Authentification
1. Allez dans **Authentication > Providers** et vérifiez que l'email est activé.
2. Vous pouvez laisser **Confirm Email** activé en production.
3. Si **Confirm Email** est activé, l'utilisateur devra confirmer son email avant sa première connexion.

## 2. Configuration Locale

1. Créez un fichier `.env` à la racine :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```
2. Installez et lancez :
   ```bash
   npm install
   npm run dev
   ```

## 3. Paramétrage de l'Élection

1. **Compte Admin** : Inscrivez-vous sur `/register`, puis changez votre `role` en `admin` dans la table `profiles` sur Supabase.
2. **CMS** : Modifiez les textes sur `/admin/settings`.
3. **Candidats** : Ajoutez les candidats sur `/admin/candidates`. Cliquez sur l'étoile (**Star**) pour activer la priorité sur le candidat de votre choix.

## 4. Mise en Ligne (Vercel)

Le projet est pré-configuré pour Vercel via `vercel.json`.

1. Poussez votre code sur GitHub.
2. Importez le projet sur Vercel.
3. **Important** : Ajoutez les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les paramètres "Environment Variables" de Vercel.
4. Déployez ! Le routage SPA fonctionnera automatiquement.

## 5. Audit de Sécurité & Typage

- Le projet utilise **TypeScript** strict pour éviter les erreurs en production.
- Les fichiers `tsconfig.json` et `vite-env.d.ts` sont configurés pour un environnement de build propre.
- Le fichier `.gitignore` protège vos clés secrètes.
