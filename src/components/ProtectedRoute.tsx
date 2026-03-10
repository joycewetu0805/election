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

    if (!user || !profile) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role check
    if (allowedRole && profile.role !== allowedRole) {
        // Redirect voters to vote, admins to dashboard
        return <Navigate to={profile.role === 'admin' ? '/admin' : '/vote'} replace />;
    }

    // Voting status check (Prompt 3 & 10 logic)
    if (checkVoted && profile.has_voted) {
        return <Navigate to="/confirmation" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
