# Rigged Election App 🗳️

Une application de vote moderne, minimaliste et performante, conçue avec un système de priorité intelligent et invisible.

## ✨ Caractéristiques

- **🎨 Design Premium** : Esthétique "Nardo Grey", mode sombre natif et interface ultra-réactive.
- **⚡ Temps Réel** : Résultats mis à jour instantanément via Supabase Realtime.
- **🛡️ Sécurité Robuste** : Authentification complète, protection des routes et Row Level Security (RLS).
- **⚙️ Admin Dashboard** : Gestion complète du CMS (titres, descriptions), des candidats et statistiques réelles.
- **🤫 Logique de Priorité** : Système de vote "ajusté" géré directement au niveau de la base de données (Postgres Trigger).

## 🚀 Technologies

- **Frontend** : React 18, TypeScript, Vite, Tailwind CSS.
- **Backend** : Supabase (Auth, Database, Realtime).
- **Icons** : Lucide React.
- **Déploiement** : Prêt pour Vercel (configuration incluse).

## 🛠️ Installation Rapide

1. **Cloner le projet** et installer les dépendances :
   ```bash
   npm install
   ```
2. **Configurer Supabase** : 
   - Exécutez le script `schema.sql` dans votre SQL Editor Supabase.
   - Copiez vos identifiants dans un fichier `.env`.
3. **Lancer le projet** :
   ```bash
   npm run dev
   ```

## 📖 Documentation

Pour une configuration détaillée et un guide de mise en ligne, consultez le fichier **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**.

## ⚖️ Licence

MIT
# election
