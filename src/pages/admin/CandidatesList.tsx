import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Plus,
    Trash2,
    Edit2,
    Star,
    X,
    Check,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';

interface Candidate {
    id: number;
    name: string;
    faculty: string;
    photo_url: string;
    is_featured: boolean; // internal: priority_sync
}

const CandidatesList = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        faculty: '',
        photo_url: ''
    });

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        const { data, error } = await supabase
            .from('candidates')
            .select('*')
            .order('id', { ascending: true });

        if (data) setCandidates(data);
        setLoading(false);
    };

    const handleOpenModal = (candidate: Candidate | null = null) => {
        if (candidate) {
            setEditingCandidate(candidate);
            setFormData({
                name: candidate.name,
                faculty: candidate.faculty,
                photo_url: candidate.photo_url || ''
            });
        } else {
            setEditingCandidate(null);
            setFormData({ name: '', faculty: '', photo_url: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingCandidate) {
                // Update
                const { error } = await supabase
                    .from('candidates')
                    .update(formData)
                    .eq('id', editingCandidate.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('candidates')
                    .insert([formData]);
                if (error) throw error;
            }

            setShowModal(false);
            fetchCandidates();
        } catch (err) {
            console.error('Error saving candidate:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) return;

        const { error } = await supabase
            .from('candidates')
            .delete()
            .eq('id', id);

        if (!error) fetchCandidates();
    };

    const toggleFeatured = async (id: number) => {
        setLoading(true);
        try {
            // 1. Set everyone to false
            await supabase
                .from('candidates')
                .update({ is_featured: false })
                .neq('id', 0); // Hack to target everyone but it's simple

            // 2. Set this one to true
            await supabase
                .from('candidates')
                .update({ is_featured: true })
                .eq('id', id);

            fetchCandidates();
        } catch (err) {
            console.error('Error toggling featured:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && candidates.length === 0) {
        return (
            <div className="rounded-3xl border border-nardo-light/20 bg-white p-6 shadow-sm dark:bg-dark-card">
                Chargement...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-nardo-grey">Administration</p>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Gestion Candidats</h1>
                    <p className="max-w-2xl text-sm text-nardo-grey sm:text-base">
                        Ajoutez, modifiez et mettez en avant les candidats sans casser l’interface sur mobile.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-nardo-light/15 dark:bg-dark-card">
                        {candidates.length} candidat{candidates.length > 1 ? 's' : ''}
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 font-semibold text-white shadow-sm transition-all hover:opacity-90 dark:bg-nardo-grey sm:w-auto"
                    >
                        <Plus size={20} className="mr-2" />
                        Nouveau Candidat
                    </button>
                </div>
            </header>

            <div className="grid gap-4 xl:hidden">
                {candidates.map((candidate) => (
                    <article
                        key={candidate.id}
                        className="rounded-3xl border border-nardo-light/20 bg-white p-4 shadow-sm transition-colors hover:bg-nardo-grey/5 dark:bg-dark-card"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-nardo-light/30 bg-nardo-light/20">
                                {candidate.photo_url ? (
                                    <img src={candidate.photo_url} alt={candidate.name} className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon size={24} className="text-nardo-grey" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-lg font-semibold">{candidate.name}</h2>
                                        <p className="text-sm text-nardo-grey">{candidate.faculty}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleFeatured(candidate.id)}
                                        className={`rounded-full p-2 transition-all ${candidate.is_featured ? 'bg-yellow-50 text-yellow-500 dark:bg-yellow-900/10' : 'text-nardo-light hover:bg-nardo-grey/10'}`}
                                        title="Définir comme candidat phare"
                                    >
                                        <Star size={18} fill={candidate.is_featured ? 'currentColor' : 'none'} />
                                    </button>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${candidate.is_featured ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/10' : 'bg-nardo-grey/10 text-nardo-grey'}`}>
                                        {candidate.is_featured ? 'Candidat phare' : 'Standard'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleOpenModal(candidate)}
                                className="flex items-center justify-center rounded-xl border border-nardo-light/20 px-4 py-3 text-sm font-semibold text-nardo-grey transition-colors hover:bg-nardo-grey/5 hover:text-black dark:hover:text-white"
                            >
                                <Edit2 size={16} className="mr-2" />
                                Modifier
                            </button>
                            <button
                                onClick={() => handleDelete(candidate.id)}
                                className="flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Supprimer
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            <div className="hidden overflow-hidden rounded-3xl border border-nardo-light/20 bg-white shadow-sm dark:bg-dark-card xl:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-nardo-light/10 bg-nardo-grey/5 text-xs font-semibold uppercase tracking-widest text-nardo-grey">
                                <th className="px-6 py-4">Candidat</th>
                                <th className="px-6 py-4">Faculté</th>
                                <th className="px-6 py-4 text-center">Phare</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nardo-light/10">
                            {candidates.map((candidate) => (
                                <tr key={candidate.id} className="group transition-colors hover:bg-nardo-grey/5">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-nardo-light/30 bg-nardo-light/20">
                                                {candidate.photo_url ? (
                                                    <img src={candidate.photo_url} alt={candidate.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <ImageIcon size={20} className="text-nardo-grey" />
                                                )}
                                            </div>
                                            <span className="ml-3 font-semibold">{candidate.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-nardo-grey">{candidate.faculty}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleFeatured(candidate.id)}
                                            className={`rounded-full p-2 transition-all ${candidate.is_featured ? 'bg-yellow-50 text-yellow-500 dark:bg-yellow-900/10' : 'text-nardo-light hover:bg-nardo-grey/10'}`}
                                        >
                                            <Star size={20} fill={candidate.is_featured ? 'currentColor' : 'none'} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(candidate)}
                                                className="rounded-lg p-2 text-nardo-grey transition-colors hover:text-black dark:hover:text-white"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(candidate.id)}
                                                className="rounded-lg p-2 text-red-400 transition-colors hover:text-red-600"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-nardo-light/20 bg-white p-5 shadow-2xl animate-in fade-in zoom-in duration-200 dark:bg-dark-card sm:p-7">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold">{editingCandidate ? 'Modifier le candidat' : 'Ajouter un candidat'}</h3>
                                <p className="mt-1 text-sm text-nardo-grey">
                                    Les champs sont optimisés pour mobile, tablette et desktop.
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-nardo-grey/10">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-nardo-grey">Nom Complet</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl border border-nardo-light bg-transparent px-4 py-3 focus:border-nardo-grey focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-nardo-grey">Faculté</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.faculty}
                                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                    className="w-full rounded-xl border border-nardo-light bg-transparent px-4 py-3 focus:border-nardo-grey focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-nardo-grey">URL de la Photo</label>
                                <input
                                    type="url"
                                    value={formData.photo_url}
                                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                                    className="w-full rounded-xl border border-nardo-light bg-transparent px-4 py-3 focus:border-nardo-grey focus:outline-none"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center rounded-xl bg-black py-3 font-bold text-white transition-all hover:opacity-90 dark:bg-nardo-grey"
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidatesList;
