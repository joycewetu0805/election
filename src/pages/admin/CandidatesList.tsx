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

    if (loading && candidates.length === 0) return <div>Chargement...</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion Candidats</h1>
                    <p className="text-nardo-grey">Ajoutez ou modifiez les profils des candidats aux élections.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-black text-white dark:bg-nardo-grey rounded-lg hover:opacity-90 transition-all shadow-sm font-semibold"
                >
                    <Plus size={20} className="mr-2" /> Nouveau Candidat
                </button>
            </header>

            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-nardo-light/20 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-nardo-grey/5 text-nardo-grey uppercase text-xs tracking-widest border-b border-nardo-light/10">
                            <th className="px-6 py-4 font-semibold">Candidat</th>
                            <th className="px-6 py-4 font-semibold">Faculté</th>
                            <th className="px-6 py-4 font-semibold text-center">Phare</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-nardo-light/10">
                        {candidates.map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-nardo-grey/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-nardo-light/20 flex items-center justify-center overflow-hidden border border-nardo-light/30">
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
                                        className={`p-2 rounded-full transition-all ${candidate.is_featured ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'text-nardo-light hover:bg-nardo-grey/10'}`}
                                    >
                                        <Star size={20} fill={candidate.is_featured ? "currentColor" : "none"} />
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(candidate)}
                                        className="p-2 text-nardo-grey hover:text-black dark:hover:text-white transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(candidate.id)}
                                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl p-8 shadow-2xl border border-nardo-light/20 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingCandidate ? 'Modifier Candidat' : 'Ajouter un Candidat'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-nardo-grey/10 rounded"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-nardo-grey mb-1">Nom Complet</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-nardo-light bg-transparent px-4 py-2 focus:border-nardo-grey focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nardo-grey mb-1">Faculté</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.faculty}
                                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                    className="w-full rounded-lg border border-nardo-light bg-transparent px-4 py-2 focus:border-nardo-grey focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nardo-grey mb-1">URL de la Photo</label>
                                <input
                                    type="url"
                                    value={formData.photo_url}
                                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                                    className="w-full rounded-lg border border-nardo-light bg-transparent px-4 py-2 focus:border-nardo-grey focus:outline-none"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black text-white dark:bg-nardo-grey py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
                                    Confirmé
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
