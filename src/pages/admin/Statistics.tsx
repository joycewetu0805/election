import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Users, AlertTriangle, Star } from 'lucide-react';

interface StatsCandidate {
    id: number;
    name: string;
    is_featured: boolean;
    real_votes: number;
    displayed_votes: number;
}

const Statistics = () => {
    const [candidates, setCandidates] = useState<StatsCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalProfiles, setTotalProfiles] = useState(0);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const { data: candData } = await supabase.from('candidates').select('*');
        const { count: profCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

        if (candData) setCandidates(candData);
        if (typeof profCount === 'number') setTotalProfiles(profCount);
        setLoading(false);
    };

    const totalRealVotes = candidates.reduce((sum, c) => sum + (c.real_votes || 0), 0);
    const participationRate = totalProfiles > 0 ? (totalRealVotes / totalProfiles) * 100 : 0;
    const totalGap = candidates.reduce((sum, c) => sum + (c.displayed_votes - c.real_votes), 0);

    if (loading) {
        return (
            <div className="rounded-3xl border border-nardo-light/20 bg-white p-6 shadow-sm dark:bg-dark-card">
                Chargement...
            </div>
        );
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <header className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-nardo-grey">Administration</p>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Statistiques</h1>
                <p className="max-w-2xl text-sm text-nardo-grey sm:text-base">
                    Comparez les chiffres réels et affichés avec une lecture confortable sur tous les formats d’écran.
                </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl border border-nardo-light/20 bg-white p-5 shadow-sm dark:bg-dark-card sm:p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-nardo-grey text-sm font-medium uppercase tracking-wider">Inscrits Totaux</p>
                        <Users className="text-nardo-grey" size={20} />
                    </div>
                    <p className="text-3xl font-bold mt-2">{totalProfiles}</p>
                </div>
                <div className="rounded-3xl border border-nardo-light/20 bg-white p-5 shadow-sm dark:bg-dark-card sm:p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-nardo-grey text-sm font-medium uppercase tracking-wider">Taux de Participation</p>
                        <TrendingUp className="text-nardo-grey" size={20} />
                    </div>
                    <p className="text-3xl font-bold mt-2">{participationRate.toFixed(1)}%</p>
                    <div className="mt-4 h-2 w-full bg-nardo-light/10 rounded-full overflow-hidden">
                        <div className="h-full bg-black dark:bg-nardo-grey rounded-full" style={{ width: `${participationRate}%` }}></div>
                    </div>
                </div>
                <div className="rounded-3xl border border-nardo-light/20 bg-white p-5 shadow-sm dark:bg-dark-card sm:col-span-2 sm:p-6 xl:col-span-1">
                    <div className="flex items-center justify-between">
                        <p className="text-nardo-grey text-sm font-medium uppercase tracking-wider">Écart Global</p>
                        <AlertTriangle className="text-yellow-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold mt-2">{totalGap} voix</p>
                    <p className="text-xs text-nardo-grey mt-1">Générées par le système de priorité</p>
                </div>
            </div>

            <div className="grid gap-4 lg:hidden">
                {candidates.map((candidate) => {
                    const diff = candidate.displayed_votes - candidate.real_votes;
                    const diffPercent = candidate.real_votes > 0 ? (diff / candidate.real_votes) * 100 : (diff > 0 ? 100 : 0);
                    const diffPrefix = diffPercent > 0 ? '+' : '';

                    return (
                        <article
                            key={candidate.id}
                            className="rounded-3xl border border-nardo-light/20 bg-white p-4 shadow-sm dark:bg-dark-card"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {candidate.is_featured && <Star size={16} className="text-yellow-500" fill="currentColor" />}
                                        <h2 className="text-lg font-bold">{candidate.name}</h2>
                                    </div>
                                    <p className="mt-1 text-sm text-nardo-grey">Suivi détaillé des écarts</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${diff > 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300'}`}>
                                    {diffPrefix}{diffPercent.toFixed(1)}%
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-nardo-grey/5 p-3">
                                    <p className="text-xs uppercase tracking-[0.2em] text-nardo-grey">Votes réels</p>
                                    <p className="mt-2 font-mono text-2xl font-bold">{candidate.real_votes}</p>
                                </div>
                                <div className="rounded-2xl bg-nardo-grey/5 p-3">
                                    <p className="text-xs uppercase tracking-[0.2em] text-nardo-grey">Votes affichés</p>
                                    <p className="mt-2 font-mono text-2xl font-bold">{candidate.displayed_votes}</p>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="hidden overflow-hidden rounded-3xl border border-nardo-light/20 bg-white shadow-sm dark:bg-dark-card lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-nardo-light/10 bg-nardo-grey/5 text-xs font-semibold uppercase tracking-widest text-nardo-grey">
                                <th className="px-6 py-4">Candidat</th>
                                <th className="px-6 py-4">Votes Réels</th>
                                <th className="px-6 py-4">Votes Affichés</th>
                                <th className="px-6 py-4 text-right">Écart (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nardo-light/10">
                            {candidates.map((candidate) => {
                                const diff = candidate.displayed_votes - candidate.real_votes;
                                const diffPercent = candidate.real_votes > 0 ? (diff / candidate.real_votes) * 100 : (diff > 0 ? 100 : 0);
                                const diffPrefix = diffPercent > 0 ? '+' : '';

                                return (
                                    <tr key={candidate.id} className="transition-colors hover:bg-nardo-grey/5">
                                        <td className="px-6 py-4 font-bold">
                                            <div className="flex items-center">
                                                {candidate.is_featured && <Star size={16} className="mr-2 text-yellow-500" fill="currentColor" />}
                                                {candidate.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono">{candidate.real_votes}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-nardo-grey">{candidate.displayed_votes}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`rounded px-2 py-1 text-xs font-bold ${diff > 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300'}`}>
                                                {diffPrefix}{diffPercent.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
