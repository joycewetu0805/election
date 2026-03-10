import React, { useEffect, useState } from 'react';
import { ChartNoAxesColumn, Clock3, Users, Vote } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CandidateResults {
    id: number;
    name: string;
    faculty: string;
    displayed_votes: number;
}

interface SiteSettings {
    title: string;
    subtitle: string;
    description: string;
}

const Results = () => {
    const [candidates, setCandidates] = useState<CandidateResults[]>([]);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [totalDisplayedVotes, setTotalDisplayedVotes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        void fetchInitialData();

        const channel = supabase
            .channel('results-changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'candidates' },
                () => {
                    void fetchCandidatesOnly();
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, []);

    const syncCandidates = (data: CandidateResults[]) => {
        setCandidates(data);
        setTotalDisplayedVotes(data.reduce((sum, candidate) => sum + (candidate.displayed_votes || 0), 0));
        setLastUpdated(new Date());
    };

    const fetchInitialData = async () => {
        const [candidateResponse, settingsResponse] = await Promise.all([
            supabase.from('candidates').select('id, name, faculty, displayed_votes').order('displayed_votes', { ascending: false }),
            supabase.from('site_settings').select('title, subtitle, description').eq('id', 1).single()
        ]);

        if (candidateResponse.data) syncCandidates(candidateResponse.data);
        if (settingsResponse.data) setSettings(settingsResponse.data);
        setLoading(false);
    };

    const fetchCandidatesOnly = async () => {
        const { data } = await supabase
            .from('candidates')
            .select('id, name, faculty, displayed_votes')
            .order('displayed_votes', { ascending: false });

        if (data) syncCandidates(data);
    };

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
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-end">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full bg-nardo-grey/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.32em] text-nardo-grey">
                            <span className="h-2.5 w-2.5 rounded-full bg-nardo-grey animate-pulse-soft"></span>
                            <span>Temps réel</span>
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
                        <p className="section-kicker">Dernière mise à jour</p>
                        <p className="mt-3 text-2xl font-bold tracking-tight">
                            {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
                        </p>
                        <p className="mt-2 text-sm text-nardo-grey">
                            Les chiffres bougent automatiquement dès qu’un nouveau vote modifie le classement.
                        </p>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <article className="surface-panel p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                        <p className="section-kicker">Suffrages</p>
                        <Vote size={18} className="text-nardo-grey" />
                    </div>
                    <p className="mt-3 text-4xl font-black tracking-tight">{totalDisplayedVotes}</p>
                    <p className="mt-2 text-sm text-nardo-grey">Total des voix actuellement visibles.</p>
                </article>

                <article className="surface-panel p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                        <p className="section-kicker">Profils</p>
                        <Users size={18} className="text-nardo-grey" />
                    </div>
                    <p className="mt-3 text-4xl font-black tracking-tight">{candidates.length}</p>
                    <p className="mt-2 text-sm text-nardo-grey">Nombre de candidats présents dans le classement.</p>
                </article>

                <article className="surface-panel p-5 sm:p-6 sm:col-span-2 xl:col-span-1">
                    <div className="flex items-center justify-between">
                        <p className="section-kicker">Lecture</p>
                        <ChartNoAxesColumn size={18} className="text-nardo-grey" />
                    </div>
                    <p className="mt-3 text-xl font-bold tracking-tight">Classement vertical continu</p>
                    <p className="mt-2 text-sm text-nardo-grey">
                        Les barres sont calculées sur la somme totale des voix affichées pour conserver une répartition lisible à 100%.
                    </p>
                </article>
            </section>

            <section className="space-y-4">
                {candidates.map((candidate, index) => {
                    const percentage = totalDisplayedVotes > 0
                        ? (candidate.displayed_votes / totalDisplayedVotes) * 100
                        : 0;

                    return (
                        <article
                            key={candidate.id}
                            className="surface-panel overflow-hidden p-5 sm:p-6"
                            style={{ animationDelay: `${index * 70}ms` }}
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-lg font-black text-white dark:bg-off-white dark:text-black">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{candidate.name}</h2>
                                        <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-nardo-grey">
                                            {candidate.faculty}
                                        </p>
                                    </div>
                                </div>

                                <div className="sm:text-right">
                                    <p className="text-2xl font-black tracking-tight">{percentage.toFixed(1)}%</p>
                                    <p className="mt-1 text-sm text-nardo-grey">{candidate.displayed_votes} voix</p>
                                </div>
                            </div>

                            <div className="mt-5 h-4 overflow-hidden rounded-full border border-nardo-light/10 bg-nardo-light/10">
                                <div
                                    className="h-full rounded-full bg-black transition-all duration-1000 ease-out dark:bg-off-white"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </article>
                    );
                })}
            </section>

            <footer className="pb-4 text-center text-sm text-nardo-grey">
                Lecture publique actualisée automatiquement. Dernière synchro:{' '}
                <span className="font-semibold text-black dark:text-off-white">
                    {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
                </span>
            </footer>
        </div>
    );
};

export default Results;
