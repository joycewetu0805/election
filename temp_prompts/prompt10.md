Prompt 10 : Finalisation des Redirections et Sécurité de Session

Objectif : Verrouiller l'expérience utilisateur pour éviter toute faille dans le parcours.

Logique de reconnexion : Si un utilisateur se reconnecte alors que profiles.has_voted est à true, redirige-le immédiatement de la page de login vers la page /confirmation.

Affichage du choix : Sur la page de confirmation, affiche explicitement le nom du candidat choisi (récupéré via une jointure entre votes et candidates).

Gestion du "Candidat Phare" : Assure-toi que dans tout le code frontend, le terme "Candidat Phare" ou "is_featured" n'apparaisse jamais. Utilise des termes neutres dans le code (ex: priority_sync ou internal_id) pour qu'un utilisateur qui inspecte le code ne comprenne pas la logique de trucage.

Navigation : Ajoute un menu de navigation minimaliste (Resultats / Voter / Connexion) qui s'adapte selon l'état de connexion de l'utilisateur.