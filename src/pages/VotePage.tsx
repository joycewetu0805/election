import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface Candidate {
    id: number;
    name: string;
    faculty: string;
    photo_url: string;
}

interface SiteSettings {
    title: string;
    subtitle: string;
    description: string;
}

const VotePage = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const { profile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [candRes, setRes] = await Promise.all([
            supabase.from('candidates').select('id, name, faculty, photo_url'),
            supabase.from('site_settings').select('title, subtitle, description').eq('id', 1).single()
        ]);

        if (candRes.data) setCandidates(candRes.data);
        if (setRes.data) setSettings(setRes.data);
        setLoading(false);
    };

    const handleVote = async () => {
        if (!selectedId || !profile) return;
        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('votes')
                .insert([{ user_id: profile.id, candidate_id: selectedId }]);

            if (error) throw error;

            // The trigger will handle has_voted update
            navigate('/confirmation');
        } catch (err) {
            console.error('Error submitting vote:', err);
            alert('Une erreur est survenue lors du vote. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
            setShowConfirm(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
            {/* Header */}
            <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">{settings?.title}</h1>
                <p className="text-xl text-nardo-grey font-medium tracking-tight">{settings?.subtitle}</p>
                <div className="max-w-2xl mx-auto p-4 bg-nardo-grey/5 border border-nardo-light/20 rounded-xl text-sm text-nardo-grey italic">
                    {settings?.description}
                </div>
            </header>

            {/* Candidate Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {candidates.map((candidate) => {
                    const isSelected = selectedId === candidate.id;
                    return (
                        <div
                            key={candidate.id}
                            onClick={() => setSelectedId(candidate.id)}
                            className={`
                relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300
                ${isSelected
                                    ? 'border-black dark:border-white ring-4 ring-nardo-grey/10 scale-[1.02]'
                                    : 'border-transparent bg-white dark:bg-dark-card hover:border-nardo-light opacity-100'}
                ${selectedId !== null && !isSelected ? 'opacity-50 grayscale-[0.5]' : ''}
              `}
                        >
                            <div className="aspect-[4/5] bg-nardo-light/10 relative">
                                {candidate.photo_url ? (
                                    <img src={candidate.photo_url} alt={candidate.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <ImageIcon size={48} className="text-nardo-light" />
                                    </div>
                                )}
                                {isSelected && (
                                    <div className="absolute top-4 right-4 bg-black dark:bg-white text-white dark:text-black p-2 rounded-full shadow-lg">
                                        <Check size={20} />
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold tracking-tight">{candidate.name}</h3>
                                <p className="text-nardo-grey font-medium">{candidate.faculty}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Footer */}
            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg border-t border-nardo-light/20 flex justify-center z-40">
                <button
                    disabled={selectedId === null}
                    onClick={() => setShowConfirm(true)}
                    className="w-full max-w-md py-4 bg-black text-white dark:bg-nardo-grey rounded-xl font-bold text-lg hover:scale-[1.02] transition-all disabled:opacity-30 disabled:scale-100"
                >
                    Valider mon choix
                </button>
            </footer>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="w-full max-w-sm bg-white dark:bg-dark-card rounded-2xl p-8 shadow-2xl border border-nardo-light/20 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center">
                            <AlertCircle size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">Confirmer le vote</h3>
                            <p className="text-nardo-grey">
                                Attention, ce choix est définitif. Vous ne pourrez plus modifier votre vote par la suite.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                disabled={submitting}
                                onClick={handleVote}
                                className="w-full py-3 bg-black text-white dark:bg-nardo-grey rounded-xl font-bold flex items-center justify-center"
                            >
                                {submitting ? <Loader2 className="animate-spin mr-2" /> : "Oui, je confirme"}
                            </button>
                            <button
                                disabled={submitting}
                                onClick={() => setShowConfirm(false)}
                                className="w-full py-3 text-nardo-grey font-bold hover:text-black"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer for fixed footer */}
            <div className="h-24"></div>
        </div>
    );
};

export default VotePage;
