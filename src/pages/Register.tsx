import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
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
                        matricule: normalizedMatricule
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
            setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-dark-card p-8 rounded-2xl shadow-xl border border-nardo-light/20">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-nardo-grey/10 text-nardo-grey">
                        <UserPlus size={24} />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-black dark:text-white">
                        Créer un compte
                    </h2>
                    <p className="mt-2 text-sm text-nardo-grey">
                        Inscrivez-vous pour participer au vote
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    {error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
                            {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="matricule" className="block text-sm font-medium text-nardo-grey">
                                Matricule
                            </label>
                            <input
                                id="matricule"
                                type="text"
                                required
                                value={matricule}
                                onChange={(e) => setMatricule(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-nardo-light bg-transparent px-3 py-2 text-black dark:text-white focus:border-nardo-grey focus:outline-none focus:ring-1 focus:ring-nardo-grey"
                                placeholder="Ex: 2024ABC"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-nardo-grey">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-nardo-light bg-transparent px-3 py-2 text-black dark:text-white focus:border-nardo-grey focus:outline-none focus:ring-1 focus:ring-nardo-grey"
                                placeholder="votre@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-nardo-grey">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-nardo-light bg-transparent px-3 py-2 text-black dark:text-white focus:border-nardo-grey focus:outline-none focus:ring-1 focus:ring-nardo-grey"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-nardo-grey">
                                Confirmer le mot de passe
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-nardo-light bg-transparent px-3 py-2 text-black dark:text-white focus:border-nardo-grey focus:outline-none focus:ring-1 focus:ring-nardo-grey"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-black dark:bg-nardo-grey px-4 py-3 text-sm font-semibold text-white hover:bg-nardo-grey dark:hover:bg-white dark:hover:text-black transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "S'inscrire"
                            )}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-nardo-grey">Déjà inscrit ? </span>
                        <Link to="/login" className="font-medium text-black dark:text-white hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
