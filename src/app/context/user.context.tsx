"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/util/supabase/client";
import { User } from "@supabase/supabase-js";
import HttpClient from "@/util/http-client/fetch-client.util";
import { UnauthorizedError } from "@/lib/errors";

export type UserExtended = User & {
    user?: User
    profile?: UserProfile; // profile do Supabase
};
export interface UserProfile {
    id: string;
    role_id: string;
    doc: string;
    name: string;
    created_at: string;  // ou Date, se você converter
    created_by: string;
    updated_at: string;  // ou Date
    updated_by: string;
    user_id: string;
    email?: string | null;
    cpf_cnpj?: string | null;
    postal_code?: string | null;
    address?: string | null;
    address_neighborhood?: string | null;
    address_number?: string | null;
    address_complement?: string | null;
    avatar_url?: string | null;
    phone?: string | null;
    nickname?: string | null;
}

type UserContextType = {
    user: UserExtended | null;
    setUser: (user: UserExtended | null) => void;
    loginUser: (userData: UserExtended) => Promise<void>;
    loading: boolean;
    refreshProfile: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserExtended | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initializeUser() {
            try {
                // Pega usuário autenticado do backend
                const userData = await HttpClient.fetch<User>("/auth/me");

                if (userData) {
                    const supabase = createClient();

                    // Busca profile do Supabase
                    const { data: profileData, error } = await supabase
                        .from("profiles")
                        .select("*")
                        .match({ user_id: userData.id })
                        .single();

                    if (error) {
                        console.error("Erro ao buscar profile:", error);
                    }

                    setUser({ ...userData, profile: profileData || undefined });
                } else {
                    setUser(null);
                }
            } catch (err) {
                if (err instanceof UnauthorizedError) {
                    setUser(null);
                } else {
                    console.error("Erro ao inicializar usuário:", err);
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        }

        initializeUser();
    }, []);

    const loginUser = async (userData: UserExtended) => {
        setUser(userData); // já salva o user do login

        // Busca profile no Supabase
        const supabase = createClient();
        const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .match({ user_id: userData.id })
            .single();

        if (error) {
            console.error("Erro ao buscar profile:", error);
            return;
        }

        setUser({ ...userData, profile: profileData }); // atualiza user com profile
    };

    const refreshProfile = async () => {
        if (!user) return;
        const supabase = createClient();
        const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .match({ user_id: user.id })
            .single();

        if (!error && profileData) {
            setUser(prev => prev ? { ...prev, profile: profileData } : null);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, loginUser, loading, refreshProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
