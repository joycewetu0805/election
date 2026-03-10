import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, CheckCircle2, Loader2 } from 'lucide-react';

const CMSSettings = () => {
    const [settings, setSettings] = useState({
        title: '',
        subtitle: '',
        description: '',
        is_active: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (data) {
            setSettings(data);
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);

        try {
            const { error } = await supabase
                .from('site_settings')
                .update(settings)
                .eq('id', 1);

            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Error updating settings:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-3xl border border-nardo-light/20 bg-white p-6 shadow-sm dark:bg-dark-card">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 w-32 rounded bg-nardo-light/30"></div>
                    <div className="h-10 rounded-xl bg-nardo-light/20"></div>
                    <div className="h-10 rounded-xl bg-nardo-light/20"></div>
                    <div className="h-32 rounded-2xl bg-nardo-light/20"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-nardo-grey">Administration</p>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Configuration CMS</h1>
                <p className="max-w-2xl text-sm text-nardo-grey sm:text-base">
                    Gérez les informations publiques de l’élection, le message d’accueil et l’état général du vote.
                </p>
            </header>

            <div className="overflow-hidden rounded-3xl border border-nardo-light/20 bg-white shadow-sm dark:bg-dark-card">
                <form onSubmit={handleSave} className="space-y-6 p-4 sm:p-6 lg:p-8">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-nardo-grey">Titre du Site</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={settings.title}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-nardo-light bg-transparent px-4 py-3 focus:border-nardo-grey focus:outline-none focus:ring-1 focus:ring-nardo-grey"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-nardo-grey">Sous-titre</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={settings.subtitle}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-nardo-light bg-transparent px-4 py-3 focus:border-nardo-grey focus:outline-none focus:ring-1 focus:ring-nardo-grey"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-nardo-grey">Description / Instructions</label>
                            <textarea
                                name="description"
                                rows={8}
                                value={settings.description}
                                onChange={handleChange}
                                className="min-h-[220px] w-full rounded-2xl border border-nardo-light bg-transparent px-4 py-3 focus:border-nardo-grey focus:outline-none focus:ring-1 focus:ring-nardo-grey"
                            />
                            <p className="text-xs text-nardo-grey">
                                Ce texte s’affiche sur les pages publiques pour expliquer le déroulement du vote.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-2xl border border-nardo-light/15 bg-nardo-grey/5 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <label htmlFor="is_active" className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                name="is_active"
                                id="is_active"
                                checked={settings.is_active}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 rounded border-nardo-light text-black focus:ring-black"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-black dark:text-off-white">Le vote est actuellement actif</span>
                                <span className="mt-1 block text-xs text-nardo-grey">
                                    Désactivez ce bouton si vous souhaitez garder le site visible sans autoriser le vote.
                                </span>
                            </span>
                        </label>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`
                                flex w-full items-center justify-center rounded-xl px-6 py-3 font-semibold transition-all duration-300 sm:w-auto
                                ${saved ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-nardo-grey'}
                                disabled:opacity-50
                            `}
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> :
                                saved ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {saved ? 'Enregistré' : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CMSSettings;
