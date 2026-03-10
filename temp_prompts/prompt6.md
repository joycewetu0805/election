Prompt 6 : L'Interface Électeur (La page de vote)

Objectif : Créer la page principale de vote (/vote) avec une UI très propre et formelle.

En haut de page, affiche dynamiquement le Titre, Sous-titre et Informations récupérés depuis la table site_settings.

Affiche les candidats sous forme de cartes (Grille).

Logique UI : L'utilisateur ne peut sélectionner qu'un seul candidat à la fois. Au clic, la carte du candidat sélectionné reçoit une bordure bleue et une icône ✅. Les autres cartes deviennent légèrement transparentes (opacity-50).

En bas, un bouton "Valider mon choix", désactivé par défaut, qui s'active uniquement si un candidat est sélectionné.

Au clic sur valider, affiche un Modal de confirmation ("Attention, ce choix est définitif"). Si confirmé, insère la donnée dans la table votes et redirige vers /confirmation.