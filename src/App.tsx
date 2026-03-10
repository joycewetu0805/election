import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/PublicLayout';

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
    if (!user) return <Navigate to="/resultats" replace />;
    if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
    if (profile?.has_voted) return <Navigate to="/confirmation" replace />;
    return <Navigate to="/vote" replace />;
};

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <div className="min-h-screen bg-off-white text-black dark:bg-dark-bg dark:text-off-white">
                        <Routes>
                            <Route path="/" element={<RootRedirect />} />

                            <Route element={<PublicLayout />}>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/resultats" element={<Results />} />
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
                            </Route>

                            <Route path="/admin/*" element={
                                <ProtectedRoute allowedRole="admin">
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
