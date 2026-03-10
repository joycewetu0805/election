import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
    const { user, profile, loading } = useAuth();
    const location = useLocation();

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

    // Attempt to handle profile-less state (e.g. trigger didn't fire yet)
    if (!profile && !loading) {
        // We can either show a setup screen or just let them stay on login
        // But let's assume if they have a user but no profile, something went wrong with the trigger
        return <div className="p-8 text-center">Profil en cours de création ou erreur de base de données...</div>;
    }

    // Role check
    if (profile && allowedRole && profile.role !== allowedRole) {
        return <Navigate to={profile.role === 'admin' ? '/admin' : '/vote'} replace />;
    }

    // Voting status check (Prompt 3 & 10 logic)
    if (profile && checkVoted && profile.has_voted) {
        return <Navigate to="/confirmation" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
