import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Confirmation = () => {
    const { profile, signOut } = useAuth();
    const [votedCandidate, setVotedCandidate] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = () => {
            window.history.pushState(null, '', window.location.href);
        };

        if (profile) {
            void fetchVotedCandidate();
        }

        return () => {
            window.onpopstate = null;
        };
    }, [profile]);

    const fetchVotedCandidate = async () => {
        const storedCandidate = window.localStorage.getItem('lastVotedCandidate');

        const { data, error } = await supabase
            .from('votes')
            .select(`
                candidate:candidates (
                    name
                )
            `)
            .eq('user_id', profile?.id)
            .single();

        if (data?.candidate) {
            const candidateInfo = data.candidate as unknown as { name: string };
            setVotedCandidate(candidateInfo.name);
            window.localStorage.setItem('lastVotedCandidate', candidateInfo.name);
        } else if (storedCandidate) {
            setVotedCandidate(storedCandidate);
        } else if (error) {
            console.error('Error fetching voted candidate:', error);
        }

        setLoading(false);
    };

    const handleLogout = async () => {
        window.localStorage.removeItem('lastVotedCandidate');
        await signOut();
        navigate('/login');
    };

    return (
        <div className="mx-auto max-w-3xl">
            <section className="surface-panel-strong overflow-hidden p-6 text-center sm:p-8 lg:p-12">
                <div className="mx-auto flex max-w-2xl flex-col items-center space-y-8">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:bg-green-900/20 dark:text-green-300">
                        <CheckCircle2 size={52} />
                    </div>

                    <div className="space-y-4">
                        <p className="section-kicker">Parcours terminé</p>
                        <h1 className="headline-display text-3xl sm:text-4xl lg:text-5xl">
                            Vote enregistré
                        </h1>
                        <p className="text-base leading-8 text-nardo-grey sm:text-lg">
                            Merci pour votre participation. Votre vote a été pris en compte et cette étape ne peut plus être modifiée.
                        </p>
                    </div>

                    <div className="surface-panel w-full max-w-xl p-6 sm:p-8">
                        <p className="section-kicker">Votre choix</p>
                        {loading ? (
                            <Loader2 className="mx-auto mt-5 h-7 w-7 animate-spin text-nardo-grey" />
                        ) : (
                            <p className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                                {votedCandidate || 'Candidat inconnu'}
                            </p>
                        )}
                        <p className="mt-3 text-sm leading-7 text-nardo-grey">
                            Cette page verrouille volontairement le retour arrière pour éviter toute reprise du parcours de vote.
                        </p>
                    </div>

                    <button onClick={handleLogout} className="primary-button px-8 py-4 text-base">
                        <LogOut size={18} className="mr-2" />
                        Se déconnecter
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Confirmation;
