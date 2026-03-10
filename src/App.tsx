import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import VotePage from './pages/VotePage';
import AdminDashboard from './pages/AdminDashboard';
import Confirmation from './pages/Confirmation';
import Results from './pages/Results';

const RootRedirect = () => {
    const { user, profile, loading } = useAuth();
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-off-white dark:bg-dark-bg">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-nardo-grey border-t-transparent"></div>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
    if (profile?.has_voted) return <Navigate to="/confirmation" replace />;
    return <Navigate to="/vote" replace />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-off-white text-black dark:bg-dark-bg dark:text-off-white">
                    <Routes>
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/resultats" element={<Results />} />

                        {/* Protected Routes */}
                        <Route path="/vote" element={
                            <ProtectedRoute allowedRole="voter" checkVoted>
                                <VotePage />
                            </ProtectedRoute>
                        } />

                        <Route path="/confirmation" element={
                            <ProtectedRoute allowedRole="voter">
                                <Confirmation />
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/*" element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
