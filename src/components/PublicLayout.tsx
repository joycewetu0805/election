import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChartNoAxesColumn, LogIn, LogOut, Menu, Shield, Vote, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const PublicLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, profile, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const votingTarget = profile?.role === 'admin'
        ? '/admin'
        : profile?.has_voted
            ? '/confirmation'
            : user
                ? '/vote'
                : '/login';

    const votingLabel = profile?.role === 'admin'
        ? 'Admin'
        : profile?.has_voted
            ? 'Confirmation'
            : 'Voter';

    const navItems = [
        { label: 'Resultats', to: '/resultats', icon: ChartNoAxesColumn },
        { label: votingLabel, to: votingTarget, icon: profile?.role === 'admin' ? Shield : Vote },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login', { replace: true });
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(107,112,117,0.22),_transparent_58%)] dark:bg-[radial-gradient(circle_at_top,_rgba(192,192,192,0.14),_transparent_58%)]"></div>
                <div className="absolute left-[-8rem] top-40 h-80 w-80 rounded-full bg-nardo-light/10 blur-3xl dark:bg-nardo-grey/10"></div>
                <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-black/5 blur-3xl dark:bg-white/5"></div>
            </div>

            <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
                <header className="sticky top-0 z-20 py-3">
                    <div className="rounded-[1.75rem] border border-nardo-light/15 bg-white/80 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:bg-dark-card/80">
                        <div className="flex items-center justify-between gap-4">
                            <Link to="/resultats" className="min-w-0">
                                <div className="inline-flex items-center gap-2 rounded-full bg-nardo-grey/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.32em] text-nardo-grey">
                                    <span>Election</span>
                                    <span>2026</span>
                                </div>
                                <p className="mt-2 truncate text-lg font-black uppercase tracking-[0.18em] sm:text-xl">
                                    Tableau Electoral
                                </p>
                            </Link>

                            <nav className="hidden items-center gap-2 lg:flex">
                                {navItems.map((item) => {
                                    const isActive = location.pathname.startsWith(item.to);

                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-black text-white dark:bg-off-white dark:text-black' : 'text-nardo-grey hover:bg-nardo-grey/10 hover:text-black dark:hover:text-off-white'}`}
                                        >
                                            <item.icon size={16} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="flex items-center gap-2">
                                <ThemeToggle />

                                {user ? (
                                    <button
                                        type="button"
                                        onClick={() => void handleSignOut()}
                                        className="hidden items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-off-white dark:text-black sm:inline-flex"
                                    >
                                        <LogOut size={16} />
                                        <span>Déconnexion</span>
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="hidden items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-off-white dark:text-black sm:inline-flex"
                                    >
                                        <LogIn size={16} />
                                        <span>Connexion</span>
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setIsMenuOpen((current) => !current)}
                                    className="inline-flex items-center justify-center rounded-full border border-nardo-light/20 bg-white/85 p-2.5 text-black shadow-sm dark:bg-dark-card/85 dark:text-off-white lg:hidden"
                                    aria-label="Ouvrir le menu"
                                >
                                    {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                                </button>
                            </div>
                        </div>

                        {isMenuOpen && (
                            <div className="mt-4 space-y-2 border-t border-nardo-light/10 pt-4 lg:hidden">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${location.pathname.startsWith(item.to) ? 'bg-black text-white dark:bg-off-white dark:text-black' : 'bg-nardo-grey/5 text-nardo-grey'}`}
                                    >
                                        <span>{item.label}</span>
                                        <item.icon size={16} />
                                    </Link>
                                ))}

                                {user ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            void handleSignOut();
                                        }}
                                        className="flex w-full items-center justify-between rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-900/40"
                                    >
                                        <span>Déconnexion</span>
                                        <LogOut size={16} />
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-between rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white dark:bg-off-white dark:text-black"
                                    >
                                        <span>Connexion</span>
                                        <LogIn size={16} />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 py-6 sm:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PublicLayout;
