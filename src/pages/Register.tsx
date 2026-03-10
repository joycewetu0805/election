import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [matricule, setMatricule] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            setLoading(false);
            return;
        }

        try {
            const normalizedEmail = email.trim().toLowerCase();
            const normalizedMatricule = matricule.trim().toUpperCase();

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: {
                    data: {
                        matricule: normalizedMatricule,
                    }
                }
            });

            if (authError) throw authError;

            if (!authData.user) {
                throw new Error('Le compte a été créé de façon incomplète. Réessayez.');
            }

            if (!authData.session) {
                setSuccess('Compte créé. Vérifiez votre email pour confirmer le compte, puis connectez-vous.');
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de l’inscription.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-stretch">
            <section className="surface-panel-strong overflow-hidden p-6 sm:p-8">
                <div className="flex h-full flex-col justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-nardo-grey/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.32em] text-nardo-grey">
                            <ShieldCheck size={14} />
                            <span>Création de compte</span>
                        </div>
                        <h1 className="headline-display text-3xl sm:text-4xl">
                            Préparez votre accès au vote
                        </h1>
                        <p className="text-sm leading-7 text-nardo-grey sm:text-base">
                            Renseignez votre matricule, votre email et un mot de passe. Le système vous reconnectera ensuite selon l’état réel de votre profil.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-[1.5rem] border border-nardo-light/15 bg-nardo-grey/5 p-5">
                            <p className="section-kicker">Identité</p>
                            <p className="mt-3 text-lg font-semibold">Matricule unique</p>
                            <p className="mt-2 text-sm text-nardo-grey">
                                Il sert à rattacher proprement votre compte au profil électeur.
                            </p>
                        </div>
                        <div className="rounded-[1.5rem] border border-nardo-light/15 bg-nardo-grey/5 p-5">
                            <p className="section-kicker">Validation</p>
                            <p className="mt-3 text-lg font-semibold">Confirmation email</p>
                            <p className="mt-2 text-sm text-nardo-grey">
                                Si elle est activée sur Supabase, vous devrez confirmer l’email avant la première connexion.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link to="/login" className="secondary-button">
                            Déjà inscrit ? Se connecter
                            <ArrowRight size={16} className="ml-2" />
                        </Link>
                        <Link to="/resultats" className="text-sm font-semibold text-nardo-grey underline-offset-4 hover:underline">
                            Consulter les résultats publics
                        </Link>
                    </div>
                </div>
            </section>

            <section className="surface-panel site-grid relative overflow-hidden p-6 sm:p-8 lg:p-10">
                <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(107,112,117,0.14),transparent)]"></div>
                <div className="relative mx-auto flex h-full max-w-2xl flex-col justify-center">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nardo-grey/10 text-nardo-grey">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Créer un compte</h2>
                            <p className="mt-1 text-sm text-nardo-grey">
                                Formulaire simple, parcours propre et compatible mobile.
                            </p>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleRegister}>
                        {error && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
                                <div className="flex items-start gap-2">
                                    <BadgeCheck size={18} className="mt-0.5 shrink-0" />
                                    <span>{success}</span>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="matricule" className="text-sm font-medium text-nardo-grey">
                                    Matricule
                                </label>
                                <input
                                    id="matricule"
                                    type="text"
                                    required
                                    value={matricule}
                                    onChange={(e) => setMatricule(e.target.value)}
                                    className="field-shell"
                                    placeholder="Ex: 2024ABC"
                                />
                            </div>

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
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
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

                            <div className="space-y-2">
                                <label htmlFor="confirm-password" className="text-sm font-medium text-nardo-grey">
                                    Confirmation
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="field-shell"
                                    placeholder="Confirmez le mot de passe"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="primary-button w-full">
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus size={16} className="mr-2" />}
                            Créer mon compte
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Register;
