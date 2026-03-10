Prompt 2 : La Logique "Truquée" (Supabase Database Trigger)

Objectif : Créer un Trigger SQL (PL/pgSQL) dans Supabase pour manipuler les résultats d'un vote de manière invisible.
Écris une fonction déclenchée AFTER INSERT sur la table votes. La logique est la suivante :

Identifier le candidate_id qui vient de recevoir le vote.

Incrémenter la colonne real_votes de ce candidat de +1.

Appliquer la logique "affichée" (displayed_votes) :

Si le candidat voté est le "candidat phare" (is_featured = true), ajoute +2 à ses displayed_votes.

Si le candidat voté n'est PAS le "candidat phare", ajoute +1 à ses displayed_votes, ET ajoute également +1 aux displayed_votes du candidat phare (s'il y en a un de défini).

Met à jour la colonne has_voted à TRUE dans la table profiles pour l'utilisateur qui vient de voter.