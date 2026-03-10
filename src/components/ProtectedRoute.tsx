import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRole?: 'admin' | 'voter';
    checkVoted?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRole,
    checkVoted = false
}) => {
    const { user, profile, loading, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-off-white dark:bg-dark-bg">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-nardo-grey border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!profile && !loading) {
        const handleReset = async () => {
            await signOut();
            navigate('/login', { replace: true });
        };

        return (
            <div className="flex min-h-screen items-center justify-center p-6 text-center">
                <div className="max-w-md rounded-2xl border border-nardo-light/20 bg-white p-8 shadow-sm dark:bg-dark-card">
                    <h1 className="text-2xl font-bold tracking-tight">Compte incomplet</h1>
                    <p className="mt-3 text-sm text-nardo-grey">
                        Le compte est bien authentifié, mais le profil associé n’a pas pu être initialisé.
                        Déconnectez-vous puis reconnectez-vous. Si le problème persiste, exécutez le SQL du projet sur Supabase.
                    </p>
                    <button
                        type="button"
                        onClick={() => void handleReset()}
                        className="mt-6 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
                    >
                        Se déconnecter et recommencer
                    </button>
                </div>
            </div>
        );
    }

    if (profile && allowedRole && profile.role !== allowedRole) {
        return <Navigate to={profile.role === 'admin' ? '/admin' : '/vote'} replace />;
    }

    if (profile && checkVoted && profile.has_voted) {
        return <Navigate to="/confirmation" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
