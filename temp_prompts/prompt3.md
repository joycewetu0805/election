Prompt 3 : Authentification et Routage Frontend

Objectif : Développer le système d'authentification et de routage sécurisé en React/TypeScript.

Crée une page d'inscription (/register) demandant : Matricule, Email, Mot de passe, Confirmation du mot de passe.

Crée une page de connexion (/login) acceptant l'Email (ou Matricule) et le Mot de passe.

Implémente un contexte d'authentification (AuthContext) pour vérifier l'état de l'utilisateur en temps réel.

Crée un composant ProtectedRoute :

Si non connecté : redirection vers /login.

Si connecté mais has_voted === true : redirection forcée vers /confirmation.

Si connecté, has_voted === false et rôle 'voter' : accès à /vote.

Si rôle 'admin' : accès à /admin.