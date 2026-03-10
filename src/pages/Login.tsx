import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ChartNoAxesColumn, LockKeyhole, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, profile, loading: authLoading } = useAuth();

    React.useEffect(() => {
        if (authLoading || !user || !profile) {
            return;
        }

        if (profile.role === 'admin') navigate('/admin');
        else if (profile.has_voted) navigate('/confirmation');
        else navigate('/vote');
    }, [authLoading, navigate, profile, user]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const normalizedEmail = email.trim().toLowerCase();

            const { error: authError } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password,
            });

            if (authError) {
                if (authError.message.toLowerCase().includes('email not confirmed')) {
                    throw new Error('Votre email n’est pas encore confirmé. Ouvrez le lien reçu par email puis reconnectez-vous.');
                }

                throw authError;
            }
        } catch (err: any) {
            setError(err.message || 'Identifiants invalides.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_26rem] lg:items-stretch">
            <section className="surface-panel site-grid relative overflow-hidden p-6 sm:p-8 lg:p-10">
                <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(107,112,117,0.16),transparent)]"></div>
                <div className="relative flex h-full flex-col justify-between gap-8">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full bg-nardo-grey/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.32em] text-nardo-grey">
                            <LockKeyhole size={14} />
                            <span>Accès sécurisé</span>
                        </div>
                        <div className="space-y-4">
                            <h1 className="headline-display text-3xl sm:text-4xl lg:text-5xl">
                                Connexion à l’espace électeur
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-nardo-grey sm:text-lg">
                                Accédez à votre session, vérifiez l’état de votre participation et poursuivez le parcours sans rupture.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.5rem] border border-nardo-light/15 bg-white/72 p-5 dark:bg-dark-card/72">
                            <p className="section-kicker">Parcours</p>
                            <p className="mt-3 text-lg font-semibold">Connexion, vote, confirmation</p>
                            <p className="mt-2 text-sm text-nardo-grey">
                                Le flux vous redirige automatiquement selon votre rôle et votre état de participation.
                            </p>
                        </div>
                        <div className="rounded-[1.5rem] border border-nardo-light/15 bg-white/72 p-5 dark:bg-dark-card/72">
                            <p className="section-kicker">Public</p>
                            <p className="mt-3 text-lg font-semibold">Résultats en direct</p>
                            <p className="mt-2 text-sm text-nardo-grey">
                                La page des résultats reste accessible à tous, sans couper le parcours d’authentification.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link to="/resultats" className="primary-button">
                            <ChartNoAxesColumn size={16} className="mr-2" />
                            Voir les résultats
                        </Link>
                        <Link to="/register" className="secondary-button">
                            Créer un compte
                            <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="surface-panel-strong p-6 sm:p-8">
                <div className="mx-auto flex h-full max-w-md flex-col justify-center">
                    <div className="mb-8 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nardo-grey/10 text-nardo-grey">
                            <LogIn size={24} />
                        </div>
                        <h2 className="mt-5 text-3xl font-bold tracking-tight">Connexion</h2>
                        <p className="mt-2 text-sm text-nardo-grey">
                            Utilisez l’email renseigné lors de l’inscription.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleLogin}>
                        {error && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-nardo-grey">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="field-shell"
                                placeholder="votre@email.com"
                            />
                            <p className="text-xs text-nardo-grey">
                                La connexion se fait avec votre email, pas avec le matricule.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-nardo-grey">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="field-shell"
                                placeholder="Votre mot de passe"
                            />
                        </div>

                        <button type="submit" disabled={loading} className="primary-button w-full">
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn size={16} className="mr-2" />}
                            Se connecter
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-nardo-grey">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="font-semibold text-black underline-offset-4 hover:underline dark:text-off-white">
                            S’inscrire
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Login;
