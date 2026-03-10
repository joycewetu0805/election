import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
    BarChart3,
    LogOut,
    Menu,
    Settings,
    ShieldCheck,
    Users,
    X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import CMSSettings from './admin/CMSSettings';
import CandidatesList from './admin/CandidatesList';
import Statistics from './admin/Statistics';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { signOut, profile } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {
            icon: Settings,
            label: 'Configuration CMS',
            description: 'Titres, textes publics et activation du vote',
            path: '/admin/settings'
        },
        {
            icon: Users,
            label: 'Gestion Candidats',
            description: 'Ajout, édition et mise en avant des profils',
            path: '/admin/candidates'
        },
        {
            icon: BarChart3,
            label: 'Statistiques',
            description: 'Participation, écarts et suivi des votes',
            path: '/admin/stats'
        },
    ];

    const currentSection = menuItems.find((item) => location.pathname.startsWith(item.path)) ?? menuItems[0];

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-off-white text-black dark:bg-dark-bg dark:text-off-white lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
            {isSidebarOpen && (
                <button
                    type="button"
                    aria-label="Fermer le menu admin"
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/45 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-nardo-light/20
                    bg-white/95 shadow-2xl backdrop-blur transition-transform duration-300 dark:bg-dark-card/95
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0 lg:shadow-none
                `}
            >
                <div className="border-b border-nardo-light/15 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full bg-nardo-grey/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-nardo-grey">
                                <ShieldCheck size={14} />
                                <span>Administration</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">Console Admin</h1>
                                <p className="text-sm text-nardo-grey">
                                    Gérez l’élection depuis une interface adaptée au terrain.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            className="rounded-lg p-2 text-nardo-grey transition-colors hover:bg-nardo-grey/10 lg:hidden"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mt-6 rounded-2xl border border-nardo-light/20 bg-nardo-grey/5 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-nardo-grey">Compte connecté</p>
                                <p className="mt-2 truncate text-sm font-semibold">{profile?.email}</p>
                                <p className="mt-1 text-xs text-nardo-grey">Matricule: {profile?.matricule || 'Non renseigné'}</p>
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    block rounded-2xl border px-4 py-4 transition-all
                                    ${isActive
                                        ? 'border-black bg-black text-white dark:border-nardo-grey dark:bg-nardo-grey'
                                        : 'border-transparent bg-transparent text-nardo-grey hover:border-nardo-light/20 hover:bg-nardo-grey/5'}
                                `}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 rounded-xl p-2 ${isActive ? 'bg-white/15 text-white' : 'bg-nardo-grey/10 text-nardo-grey'}`}>
                                        <item.icon size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold">{item.label}</p>
                                        <p className={`mt-1 text-sm ${isActive ? 'text-white/75' : 'text-nardo-grey'}`}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-nardo-light/15 p-4">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10"
                    >
                        <LogOut size={18} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            <div className="min-w-0">
                <header className="sticky top-0 z-20 border-b border-nardo-light/15 bg-off-white/90 backdrop-blur lg:hidden dark:bg-dark-bg/90">
                    <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(true)}
                            className="rounded-xl border border-nardo-light/20 bg-white p-2 text-black shadow-sm transition-colors hover:bg-nardo-grey/5 dark:bg-dark-card dark:text-off-white"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-nardo-grey">Espace admin</p>
                            <p className="truncate text-base font-semibold">{currentSection.label}</p>
                        </div>
                        <ThemeToggle className="hidden sm:inline-flex" />
                    </div>
                </header>

                <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
                    <div className="mx-auto w-full max-w-7xl">
                        <Routes>
                            <Route path="/" element={<Navigate to="/admin/settings" replace />} />
                            <Route path="/settings" element={<CMSSettings />} />
                            <Route path="/candidates" element={<CandidatesList />} />
                            <Route path="/stats" element={<Statistics />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
