Prompt 8 : La Page Publique des Résultats (Temps Réel & Classement)

Objectif : Créer la page /resultats accessible à tous, affichant la dynamique du vote.

Récupération des données : Récupère title, subtitle et description depuis site_settings. Récupère la liste des candidats depuis la table candidates.

Logique d'affichage : Trie les candidats par ordre décroissant (celui qui a le plus de displayed_votes en haut).

Calcul des jauges : Calcule le pourcentage de chaque candidat sur la base de la somme totale des displayed_votes (et non sur le nombre d'inscrits) pour garantir que le cumul fasse toujours 100%.

Composants UI :

Affiche chaque candidat dans un bloc épuré : Nom complet en gras, nombre de voix (displayed_votes) à droite.

Sous le nom, insère une jauge de progression (Progress Bar) dont la longueur correspond au pourcentage calculé.

Temps Réel : Utilise supabase.channel pour écouter les changements sur la table candidates. Lorsqu'un vote est intercepté par le trigger SQL, la page doit mettre à jour les chiffres et animer la barre de progression sans recharger la page.