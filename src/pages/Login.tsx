import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { profile, loading: authLoading } = useAuth();

    // Redirect if already logged in (Prompt 3 & 10)
    React.useEffect(() => {
        if (!authLoading && profile) {
            if (profile.role === 'admin') navigate('/admin');
            else if (profile.has_voted) navigate('/confirmation');
            else navigate('/vote');
        }
    }, [profile, loading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // In a real scenario, we might want to allow login via matricule
            // For Supabase Auth, email is standard. If they enter a matricule, 
            // we'd need a mapping or a custom edge function.
            // For simplicity, we assume Email login as per Supabase defaults.

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Profile logic handled by ProtectedRoute/AuthContext
            // But we can do a quick redirect here if data is available
            if (data.user) {
                // The redirection will be handled by the next render cycle 
                // via the AuthContext and ProtectedRoute
            }
        } catch (err: any) {
            setError(err.message || 'Identifiants invalides.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-dark-card p-8 rounded-2xl shadow-xl border border-nardo-light/20">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-nardo-grey/10 text-nardo-grey">
                        <LogIn size={24} />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-black dark:text-white">
                        Connexion
                    </h2>
                    <p className="mt-2 text-sm text-nardo-grey">
                        Accédez à votre espace de vote
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
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
                            <label htmlFor="password" title="password" className="block text-sm font-medium text-nardo-grey">
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
                                "Se connecter"
                            )}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-nardo-grey">Pas encore de compte ? </span>
                        <Link to="/register" className="font-medium text-black dark:text-white hover:underline">
                            S'inscrire
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
