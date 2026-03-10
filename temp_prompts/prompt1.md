Prompt 1 : Architecture de la Base de Données (Supabase)

Objectif : Initialiser le projet avec React, TypeScript, Tailwind CSS et Supabase. Crée-moi le script SQL complet pour générer les tables nécessaires à une application de sondage. Voici les spécifications :

Une table profiles (liée à l'auth Supabase) avec : id (UUID), matricule (texte, unique), email (texte), role (enum: 'admin', 'voter'), has_voted (boolean, défaut: false).

Une table candidates avec : id, name, faculty, photo_url, is_featured (boolean, défaut: false), real_votes (int, défaut: 0), displayed_votes (int, défaut: 0).

Une table votes avec : id, user_id (lié à profiles), candidate_id (lié à candidates), created_at.

Une table site_settings avec une seule ligne : id (toujours 1), title, subtitle, description, is_active (boolean).
Ajoute les politiques de sécurité (Row Level Security - RLS) pour que seuls les admins puissent modifier candidates et site_settings, et que les utilisateurs authentifiés ne puissent insérer qu'un seul vote.
