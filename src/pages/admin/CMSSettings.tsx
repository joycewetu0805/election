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

    if (loading) return <div className="animate-pulse space-y-4">...Chargement</div>;

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Configuration CMS</h1>
                <p className="text-nardo-grey">Gérez les informations affichées sur les pages publiques.</p>
            </header>

            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-nardo-light/20 overflow-hidden">
                <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-nardo-grey mb-1">Titre du Site</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={settings.title}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-nardo-light bg-transparent px-4 py-2 focus:border-nardo-grey focus:outline-none focus:ring-1 focus:ring-nardo-grey"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nardo-grey mb-1">Sous-titre</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={settings.subtitle}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-nardo-light bg-transparent px-4 py-2 focus:border-nardo-grey focus:outline-none focus:ring-1 focus:ring-nardo-grey"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-nardo-grey mb-1">Description / Instructions</label>
                            <textarea
                                name="description"
                                rows={5}
                                value={settings.description}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-nardo-light bg-transparent px-4 py-2 focus:border-nardo-grey focus:outline-none focus:ring-1 focus:ring-nardo-grey"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-nardo-light/10">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_active"
                                id="is_active"
                                checked={settings.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-nardo-light text-black focus:ring-black"
                            />
                            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-nardo-grey">Le vote est actuellement actif</label>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`
                flex items-center px-6 py-2 rounded-lg font-semibold transition-all duration-300
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
