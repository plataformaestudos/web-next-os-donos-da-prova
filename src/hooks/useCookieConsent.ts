'use client';

import { useState, useEffect } from 'react';
import { 
    getCookieConsent, 
    hasAcceptedCookies, 
    hasRejectedCookies,
    isPendingCookieConsent,
    type CookieConsent
} from '@/utils/cookie-consent';

/**
 * Hook personalizado para gerenciar o consentimento de cookies
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { consent, hasAccepted, hasRejected, isPending } = useCookieConsent();
 *   
 *   useEffect(() => {
 *     if (hasAccepted) {
 *       // Inicializar analytics
 *       initializeGoogleAnalytics();
 *     }
 *   }, [hasAccepted]);
 *   
 *   return <div>Consent: {consent}</div>;
 * }
 * ```
 */
export function useCookieConsent() {
    const [consent, setConsent] = useState<CookieConsent>(null);
    const [hasAccepted, setHasAccepted] = useState(false);
    const [hasRejected, setHasRejected] = useState(false);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        // Atualiza o estado inicial
        const currentConsent = getCookieConsent();
        setConsent(currentConsent);
        setHasAccepted(hasAcceptedCookies());
        setHasRejected(hasRejectedCookies());
        setIsPending(isPendingCookieConsent());

        // Listener para mudanças no localStorage
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'cookie-consent') {
                const newConsent = getCookieConsent();
                setConsent(newConsent);
                setHasAccepted(hasAcceptedCookies());
                setHasRejected(hasRejectedCookies());
                setIsPending(isPendingCookieConsent());
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return {
        /** Status atual do consentimento: 'accepted', 'rejected' ou null */
        consent,
        /** True se o usuário aceitou os cookies */
        hasAccepted,
        /** True se o usuário recusou os cookies */
        hasRejected,
        /** True se o usuário ainda não tomou uma decisão */
        isPending,
        /** True se existe algum consentimento registrado (accepted ou rejected) */
        hasConsent: consent !== null,
    };
}

