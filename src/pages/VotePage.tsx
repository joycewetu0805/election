import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, CheckCheck, Image as ImageIcon, Loader2, Vote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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
    is_active: boolean;
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
        void fetchData();
    }, []);

    const fetchData = async () => {
        const [candidateResponse, settingsResponse] = await Promise.all([
            supabase.from('candidates').select('id, name, faculty, photo_url'),
            supabase.from('site_settings').select('title, subtitle, description, is_active').eq('id', 1).single()
        ]);

        if (candidateResponse.data) setCandidates(candidateResponse.data);
        if (settingsResponse.data) setSettings(settingsResponse.data);
        setLoading(false);
    };

    const handleVote = async () => {
        if (!selectedId || !profile || !settings?.is_active) return;
        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('votes')
                .insert([{ user_id: profile.id, candidate_id: selectedId }]);

            if (error) throw error;

            const selectedCandidate = candidates.find((candidate) => candidate.id === selectedId);
            if (selectedCandidate) {
                window.localStorage.setItem('lastVotedCandidate', selectedCandidate.name);
            }

            navigate('/confirmation');
        } catch (err) {
            console.error('Error submitting vote:', err);
            alert('Une erreur est survenue lors du vote. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
            setShowConfirm(false);
        }
    };

    const selectedCandidate = candidates.find((candidate) => candidate.id === selectedId) ?? null;
    const isVoteActive = settings?.is_active ?? false;
    const actionDisabled = !selectedCandidate || !isVoteActive || submitting;

    if (loading) {
        return (
            <div className="surface-panel mx-auto max-w-6xl p-8">
                Chargement...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="surface-panel site-grid overflow-hidden p-6 sm:p-8 lg:p-10">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full bg-nardo-grey/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.32em] text-nardo-grey">
                            <Vote size={14} />
                            <span>Bulletin unique</span>
                        </div>
                        <div className="space-y-3">
                            <h1 className="headline-display text-3xl sm:text-4xl lg:text-5xl">
                                {settings?.title}
                            </h1>
                            <p className="text-lg text-nardo-grey sm:text-xl">{settings?.subtitle}</p>
                            <p className="max-w-3xl text-sm leading-7 text-nardo-grey sm:text-base">
                                {settings?.description}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-nardo-light/15 bg-white/72 p-5 dark:bg-dark-card/72">
                        <p className="section-kicker">Rappel</p>
                        <p className="mt-3 text-lg font-semibold">Un seul choix, définitif</p>
                        <p className="mt-2 text-sm text-nardo-grey">
                            Sélectionnez un candidat, vérifiez votre résumé puis confirmez. Une fois validé, le vote ne peut plus être modifié.
                        </p>
                    </div>
                </div>

                {!isVoteActive && (
                    <div className="mt-6 rounded-[1.5rem] border border-yellow-200 bg-yellow-50 px-4 py-4 text-sm text-yellow-800 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-200">
                        Le vote est momentanément suspendu. Vous pouvez consulter les candidats, mais la validation est désactivée.
                    </div>
                )}
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <section className="space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="section-kicker">Sélection</p>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight">Choisissez un candidat</h2>
                        </div>
                        <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-nardo-light/15 dark:bg-dark-card/80">
                            {candidates.length} profil{candidates.length > 1 ? 's' : ''} disponible{candidates.length > 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                        {candidates.map((candidate) => {
                            const isSelected = selectedId === candidate.id;

                            return (
                                <article
                                    key={candidate.id}
                                    onClick={() => setSelectedId(candidate.id)}
                                    className={`
                                        group cursor-pointer overflow-hidden rounded-[2rem] border transition-all duration-300
                                        ${isSelected
                                            ? 'border-black bg-white shadow-[0_28px_70px_rgba(0,0,0,0.10)] dark:border-off-white dark:bg-dark-card'
                                            : 'border-nardo-light/15 bg-white/78 hover:border-nardo-grey/30 hover:bg-white dark:bg-dark-card/78'}
                                        ${selectedId !== null && !isSelected ? 'opacity-55' : ''}
                                    `}
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-nardo-light/10">
                                        {candidate.photo_url ? (
                                            <img src={candidate.photo_url} alt={candidate.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <ImageIcon size={48} className="text-nardo-light" />
                                            </div>
                                        )}

                                        {isSelected && (
                                            <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-lg dark:bg-off-white dark:text-black">
                                                <Check size={20} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 p-5">
                                        <div>
                                            <p className="text-xl font-bold tracking-tight">{candidate.name}</p>
                                            <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-nardo-grey">
                                                {candidate.faculty}
                                            </p>
                                        </div>

                                        <p className="text-sm leading-6 text-nardo-grey">
                                            Cliquez pour sélectionner ce profil. Les autres options s’effacent automatiquement pour éviter toute ambiguïté.
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <aside className="hidden xl:block">
                    <div className="surface-panel sticky top-28 p-6">
                        <p className="section-kicker">Résumé</p>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight">
                            {selectedCandidate ? selectedCandidate.name : 'Aucun choix'}
                        </h2>
                        <p className="mt-2 text-sm text-nardo-grey">
                            {selectedCandidate
                                ? selectedCandidate.faculty
                                : 'Sélectionnez une carte pour activer la validation.'}
                        </p>

                        <div className="mt-6 rounded-[1.5rem] border border-nardo-light/15 bg-nardo-grey/5 p-4">
                            <div className="flex items-start gap-3">
                                <CheckCheck size={18} className={selectedCandidate ? 'text-black dark:text-off-white' : 'text-nardo-grey'} />
                                <p className="text-sm leading-6 text-nardo-grey">
                                    Vérifiez votre choix avant validation. L’enregistrement du vote est définitif.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={actionDisabled}
                            onClick={() => setShowConfirm(true)}
                            className="primary-button mt-6 w-full"
                        >
                            Valider mon choix
                        </button>
                    </div>
                </aside>
            </div>

            <div className="fixed inset-x-0 bottom-4 z-20 px-4 xl:hidden">
                <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-nardo-light/15 bg-white/88 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.1)] backdrop-blur-xl dark:bg-dark-card/88">
                    <button
                        type="button"
                        disabled={actionDisabled}
                        onClick={() => setShowConfirm(true)}
                        className="primary-button w-full"
                    >
                        {selectedCandidate ? `Valider ${selectedCandidate.name}` : 'Valider mon choix'}
                    </button>
                </div>
            </div>

            <div className="h-24 xl:hidden"></div>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="surface-panel-strong w-full max-w-md p-6 text-center sm:p-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-200">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="mt-6 text-2xl font-bold tracking-tight">Confirmer le vote</h3>
                        <p className="mt-3 text-sm leading-7 text-nardo-grey">
                            Vous êtes sur le point de voter pour <span className="font-semibold text-black dark:text-off-white">{selectedCandidate?.name}</span>.
                            Cette action est définitive.
                        </p>

                        <div className="mt-6 space-y-3">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleVote}
                                className="primary-button w-full"
                            >
                                {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                Oui, confirmer
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setShowConfirm(false)}
                                className="secondary-button w-full"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VotePage;
