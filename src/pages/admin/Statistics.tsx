import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart3, TrendingUp, Users, AlertTriangle, Star } from 'lucide-react';

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
        if (profCount) setTotalProfiles(profCount);
        setLoading(false);
    };

    const totalRealVotes = candidates.reduce((sum, c) => sum + (c.real_votes || 0), 0);
    const participationRate = totalProfiles > 0 ? (totalRealVotes / totalProfiles) * 100 : 0;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Statistiques (Vue Réelle)</h1>
                <p className="text-nardo-grey">Analyse comparative des votes réels vs affichés publiquement.</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-nardo-light/20 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-nardo-grey text-sm font-medium uppercase tracking-wider">Inscrits Totaux</p>
                        <Users className="text-nardo-grey" size={20} />
                    </div>
                    <p className="text-3xl font-bold mt-2">{totalProfiles}</p>
                </div>
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-nardo-light/20 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-nardo-grey text-sm font-medium uppercase tracking-wider">Taux de Participation</p>
                        <TrendingUp className="text-nardo-grey" size={20} />
                    </div>
                    <p className="text-3xl font-bold mt-2">{participationRate.toFixed(1)}%</p>
                    <div className="mt-4 h-2 w-full bg-nardo-light/10 rounded-full overflow-hidden">
                        <div className="h-full bg-black dark:bg-nardo-grey rounded-full" style={{ width: `${participationRate}%` }}></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-nardo-light/20 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-nardo-grey text-sm font-medium uppercase tracking-wider">Écart Global</p>
                        <AlertTriangle className="text-yellow-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold mt-2">
                        {candidates.reduce((sum, c) => sum + (c.displayed_votes - c.real_votes), 0)} voix
                    </p>
                    <p className="text-xs text-nardo-grey mt-1">Générées par le système de priorité</p>
                </div>
            </div>

            {/* Comparative Table */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-nardo-light/20 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-nardo-grey/5 text-nardo-grey uppercase text-xs tracking-widest border-b border-nardo-light/10">
                            <th className="px-6 py-4 font-semibold">Candidat</th>
                            <th className="px-6 py-4 font-semibold">Votes Réels</th>
                            <th className="px-6 py-4 font-semibold">Votes Affichés</th>
                            <th className="px-6 py-4 font-semibold text-right">Écart (%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-nardo-light/10">
                        {candidates.map((c) => {
                            const diff = c.displayed_votes - c.real_votes;
                            const diffPercent = c.real_votes > 0 ? (diff / c.real_votes) * 100 : (diff > 0 ? 100 : 0);

                            return (
                                <tr key={c.id} className="hover:bg-nardo-grey/5 transition-colors">
                                    <td className="px-6 py-4 flex items-center font-bold">
                                        {c.is_featured && <Star size={16} className="text-yellow-500 mr-2" fill="currentColor" />}
                                        {c.name}
                                    </td>
                                    <td className="px-6 py-4 font-mono">{c.real_votes}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-nardo-grey">{c.displayed_votes}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${diff > 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-green-50 text-green-600'}`}>
                                            +{diffPercent.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Statistics;
