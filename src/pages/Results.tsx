import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Users, Clock, Vote } from 'lucide-react';

interface CandidateResults {
    id: number;
    name: string;
    faculty: string;
    displayed_votes: number;
}

interface SiteSettings {
    title: string;
    subtitle: string;
}

const Results = () => {
    const [candidates, setCandidates] = useState<CandidateResults[]>([]);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [totalDisplayedVotes, setTotalDisplayedVotes] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();

        // Prompt 8: Real-time update via Supabase Channel
        const channel = supabase
            .channel('results-changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'candidates' },
                () => {
                    fetchCandidatesOnly();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchInitialData = async () => {
        const [candRes, setRes] = await Promise.all([
            supabase.from('candidates').select('id, name, faculty, displayed_votes').order('displayed_votes', { ascending: false }),
            supabase.from('site_settings').select('title, subtitle').eq('id', 1).single()
        ]);

        if (candRes.data) {
            setCandidates(candRes.data);
            setTotalDisplayedVotes(candRes.data.reduce((sum, c) => sum + (c.displayed_votes || 0), 0));
        }
        if (setRes.data) setSettings(setRes.data);
        setLoading(false);
    };

    const fetchCandidatesOnly = async () => {
        const { data } = await supabase
            .from('candidates')
            .select('id, name, faculty, displayed_votes')
            .order('displayed_votes', { ascending: false });

        if (data) {
            setCandidates(data);
            setTotalDisplayedVotes(data.reduce((sum, c) => sum + (c.displayed_votes || 0), 0));
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
            <header className="text-center space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-nardo-grey/10 text-nardo-grey rounded-full text-xs font-bold uppercase tracking-widest">
                    <Clock size={14} />
                    <span>Résultats en temps réel</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{settings?.title}</h1>
                <p className="text-xl text-nardo-grey font-medium">{settings?.subtitle}</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-dark-card p-8 rounded-3xl border border-nardo-light/20 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-nardo-grey text-sm font-bold uppercase tracking-widest">Total des suffrages</p>
                        <p className="text-4xl font-black mt-1">{totalDisplayedVotes}</p>
                    </div>
                    <div className="bg-black dark:bg-nardo-grey p-4 rounded-2xl text-white">
                        <Vote size={32} />
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card p-8 rounded-3xl border border-nardo-light/20 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-nardo-grey text-sm font-bold uppercase tracking-widest">Candidats</p>
                        <p className="text-4xl font-black mt-1">{candidates.length}</p>
                    </div>
                    <div className="bg-nardo-light/20 p-4 rounded-2xl text-nardo-grey">
                        <Users size={32} />
                    </div>
                </div>
            </div>

            {/* Results List (Prompt 8 & 9: Vertical Ranking) */}
            <div className="space-y-6">
                {candidates.map((candidate, index) => {
                    const percentage = totalDisplayedVotes > 0
                        ? (candidate.displayed_votes / totalDisplayedVotes) * 100
                        : 0;

                    return (
                        <div key={candidate.id} className="animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl font-black text-nardo-light/40">#{index + 1}</span>
                                    <div>
                                        <p className="text-lg font-bold tracking-tight">{candidate.name}</p>
                                        <p className="text-xs text-nardo-grey font-medium uppercase tracking-wider">{candidate.faculty}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black">{percentage.toFixed(1)}%</p>
                                    <p className="text-xs text-nardo-grey font-medium italic">{candidate.displayed_votes} voix</p>
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="h-4 w-full bg-nardo-light/10 rounded-full overflow-hidden border border-nardo-light/5">
                                <div
                                    className="h-full bg-black dark:bg-nardo-grey rounded-full transition-all duration-1000 ease-out flex items-center px-2"
                                    style={{ width: `${percentage}%` }}
                                >
                                    {percentage > 5 && <div className="h-1 w-full bg-white/20 rounded-full"></div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <footer className="pt-12 text-center">
                <p className="text-nardo-grey text-sm font-medium">
                    Dernière mise à jour : {new Date().toLocaleTimeString()}
                </p>
            </footer>
        </div>
    );
};

export default Results;
