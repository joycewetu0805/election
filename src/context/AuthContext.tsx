import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'voter';

export interface Profile {
    id: string;
    matricule: string;
    email: string;
    role: UserRole;
    has_voted: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_SYNC_RETRIES = 3;
const PROFILE_SYNC_DELAY_MS = 250;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const getFallbackMatricule = (user: User) => {
    const rawMatricule = user.user_metadata?.matricule;
    if (typeof rawMatricule === 'string' && rawMatricule.trim()) {
        return rawMatricule.trim();
    }

    return `PENDING_${user.id.slice(0, 8)}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const requestRef = useRef(0);

    const loadProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, matricule, email, role, has_voted')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data;
    };

    const createFallbackProfile = async (nextUser: User) => {
        if (!nextUser.email) {
            throw new Error('Authenticated user is missing an email address.');
        }

        const { error } = await supabase
            .from('profiles')
            .insert({
                id: nextUser.id,
                email: nextUser.email,
                matricule: getFallbackMatricule(nextUser),
                role: 'voter',
                has_voted: false,
            });

        if (error && error.code !== '23505') {
            throw error;
        }
    };

    const ensureProfile = async (nextUser: User) => {
        const existingProfile = await loadProfile(nextUser.id);
        if (existingProfile) {
            return existingProfile;
        }

        await createFallbackProfile(nextUser);

        for (let attempt = 0; attempt < PROFILE_SYNC_RETRIES; attempt += 1) {
            const syncedProfile = await loadProfile(nextUser.id);
            if (syncedProfile) {
                return syncedProfile;
            }

            await wait(PROFILE_SYNC_DELAY_MS);
        }

        throw new Error(`Unable to load or create profile for user ${nextUser.id}.`);
    };

    useEffect(() => {
        let isActive = true;

        const syncAuthState = async (session: Session | null) => {
            const requestId = requestRef.current + 1;
            requestRef.current = requestId;

            setUser(session?.user ?? null);

            if (!session?.user) {
                if (!isActive || requestRef.current !== requestId) {
                    return;
                }

                setProfile(null);
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const nextProfile = await ensureProfile(session.user);
                if (!isActive || requestRef.current !== requestId) {
                    return;
                }

                setProfile(nextProfile);
            } catch (error) {
                if (!isActive || requestRef.current !== requestId) {
                    return;
                }

                console.error('Error loading profile:', error);
                setProfile(null);
            } finally {
                if (isActive && requestRef.current === requestId) {
                    setLoading(false);
                }
            }
        };

        void supabase.auth.getSession().then(({ data: { session } }) => syncAuthState(session));

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            void syncAuthState(session);
        });

        return () => {
            isActive = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
