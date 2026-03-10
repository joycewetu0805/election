import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Confirmation = () => {
    const { profile, signOut } = useAuth();
    const [votedCandidate, setVotedCandidate] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Prevent going back (Prompt 7)
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = () => {
            window.history.pushState(null, '', window.location.href);
        };

        if (profile) fetchVotedCandidate();

        return () => {
            window.onpopstate = null;
        };
    }, [profile]);

    const fetchVotedCandidate = async () => {
        // Joining votes and candidates (Prompt 10)
        const { data } = await supabase
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
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={48} className="animate-bounce" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Vote Enregistré</h1>
                    <p className="text-lg text-nardo-grey font-medium italic">
                        "Merci pour votre participation ! Votre vote a été pris en compte."
                    </p>

                    <div className="mt-8 p-6 bg-white dark:bg-dark-card rounded-2xl border border-nardo-light/20 shadow-sm">
                        <p className="text-xs uppercase tracking-widest text-nardo-grey mb-2">Votre choix</p>
                        {loading ? (
                            <Loader2 className="animate-spin mx-auto text-nardo-light" />
                        ) : (
                            <p className="text-2xl font-bold tracking-tight">{votedCandidate || 'Candidat inconnu'}</p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="mt-12 flex items-center justify-center mx-auto space-x-2 px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
                >
                    <LogOut size={20} />
                    <span>Se déconnecter</span>
                </button>
            </div>
        </div>
    );
};

export default Confirmation;
