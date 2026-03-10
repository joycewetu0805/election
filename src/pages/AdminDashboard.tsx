import React, { useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
    BarChart3,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Plus,
    Star,
    Trash2,
    Edit2,
    Save,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CMSSettings from './admin/CMSSettings';
import CandidatesList from './admin/CandidatesList';
import Statistics from './admin/Statistics';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { signOut, profile } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { icon: Settings, label: 'Configuration CMS', path: '/admin/settings' },
        { icon: Users, label: 'Gestion Candidats', path: '/admin/candidates' },
        { icon: BarChart3, label: 'Statistiques', path: '/admin/stats' },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-off-white dark:bg-dark-bg">
            {/* Sidebar */}
            <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        bg-white dark:bg-dark-card border-r border-nardo-light/20 transition-all duration-300 flex flex-col
      `}>
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && <span className="font-bold text-xl tracking-tighter">ADMIN</span>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-nardo-grey/10 rounded">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 mt-6 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                flex items-center p-3 rounded-lg transition-colors
                ${location.pathname === item.path
                                    ? 'bg-black text-white dark:bg-nardo-grey'
                                    : 'text-nardo-grey hover:bg-nardo-grey/5'}
              `}
                        >
                            <item.icon size={20} />
                            {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-nardo-light/20">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-left"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="ml-3 font-medium">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <div className="max-w-6xl mx-auto">
                    <Routes>
                        <Route path="/" element={<Navigate to="/admin/settings" replace />} />
                        <Route path="/settings" element={<CMSSettings />} />
                        <Route path="/candidates" element={<CandidatesList />} />
                        <Route path="/stats" element={<Statistics />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
