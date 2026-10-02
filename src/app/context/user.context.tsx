"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import HttpClient from "@/util/http-client/fetch-client.util";
import { UnauthorizedError } from "@/lib/errors";
import { syncSessionWithUser } from "@/services/cookie-consent.service";
import { ResponseModel } from "@/model/common.model";
import { useQueryClient } from "@tanstack/react-query";
import { logoutClient } from "@/services/logout.service";

async function loadOwnProfile() {
    const response = await HttpClient.fetch<ResponseModel<UserProfile>>("/profiles/me", { cache: "no-store" });
    return response.data;
}

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
    address_country?: string | null;
    address_city?: string | null;
    address_state?: string | null;
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
    logoutUser: () => Promise<void>;
    loading: boolean;
    refreshProfile: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserExtended | null>(null);
    const [loading, setLoading] = useState(true);
    const requestVersion = useRef(0);
    const queryClient = useQueryClient();

    useEffect(() => {
        let active = true;
        async function initializeUser() {
            const version = ++requestVersion.current;
            setLoading(true);
            try {
                // Pega usuário autenticado do backend
                const userData = await HttpClient.fetch<User>("/auth/me", { cache: "no-store" });

                if (userData) {
                    const profileData = await loadOwnProfile();
                    if (!active || version !== requestVersion.current) return;

                    setUser({ ...userData, profile: profileData || undefined });
                    
                    // Sincroniza sessionId com userId (se houver consentimento de cookies)
                    syncSessionWithUser().catch(err => 
                        console.error("Erro ao sincronizar cookies:", err)
                    );
                } else {
                    if (active && version === requestVersion.current) setUser(null);
                }
            } catch (err) {
                if (!active || version !== requestVersion.current) return;
                if (err instanceof UnauthorizedError) {
                    setUser(null);
                } else {
                    console.error("Erro ao inicializar usuário:", err);
                    setUser(null);
                }
            } finally {
                if (active && version === requestVersion.current) setLoading(false);
            }
        }

        initializeUser();
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) void initializeUser();
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => {
            active = false;
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    const loginUser = async (userData: UserExtended) => {
        const version = ++requestVersion.current;
        setUser(userData); // já salva o user do login

        const profileData = await loadOwnProfile();
        if (version !== requestVersion.current) return;

        setUser({ ...userData, profile: profileData }); // atualiza user com profile
        setLoading(false);
        
        // Sincroniza sessionId com userId após login
        syncSessionWithUser().catch(err => 
            console.error("Erro ao sincronizar cookies:", err)
        );
    };

    const logoutUser = async () => {
        await logoutClient();
        ++requestVersion.current;
        setUser(null);
        setLoading(false);
        await queryClient.cancelQueries();
        queryClient.clear();
    };

    const refreshProfile = async () => {
        if (!user) return;
        const version = requestVersion.current;
        const profileData = await loadOwnProfile();
        if (version !== requestVersion.current) return;

        if (profileData) {
            setUser(prev => prev ? { ...prev, profile: profileData } : null);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, loginUser, logoutUser, loading, refreshProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
