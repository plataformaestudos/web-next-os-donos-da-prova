/**
 * Utilitários para gerenciar o consentimento de cookies
 * Conformidade com LGPD
 */

const COOKIE_CONSENT_KEY = 'cookie-consent';

export type CookieConsent = 'accepted' | 'rejected' | null;

/**
 * Verifica o status do consentimento de cookies
 * @returns 'accepted', 'rejected' ou null se ainda não decidiu
 */
export function getCookieConsent(): CookieConsent {
    if (typeof window === 'undefined') {
        return null;
    }
    
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    return consent as CookieConsent;
}

/**
 * Verifica se o usuário aceitou os cookies
 * @returns true se aceitou, false caso contrário
 */
export function hasAcceptedCookies(): boolean {
    return getCookieConsent() === 'accepted';
}

/**
 * Verifica se o usuário recusou os cookies
 * @returns true se recusou, false caso contrário
 */
export function hasRejectedCookies(): boolean {
    return getCookieConsent() === 'rejected';
}

/**
 * Verifica se o usuário ainda não tomou uma decisão sobre cookies
 * @returns true se ainda não decidiu, false caso contrário
 */
export function isPendingCookieConsent(): boolean {
    return getCookieConsent() === null;
}

/**
 * Define o consentimento de cookies
 * @param consent - 'accepted' ou 'rejected'
 */
export function setCookieConsent(consent: 'accepted' | 'rejected'): void {
    if (typeof window === 'undefined') {
        return;
    }
    
    localStorage.setItem(COOKIE_CONSENT_KEY, consent);
}

/**
 * Remove o consentimento de cookies (útil para testes ou redefinição)
 */
export function clearCookieConsent(): void {
    if (typeof window === 'undefined') {
        return;
    }
    
    localStorage.removeItem(COOKIE_CONSENT_KEY);
}

/**
 * Hook para inicializar serviços de analytics apenas se cookies foram aceitos
 * Use esta função para inicializar Google Analytics, Facebook Pixel, etc.
 */
export function initializeAnalytics(): void {
    if (!hasAcceptedCookies()) {
        return;
    }

    // Exemplo: Inicializar Google Analytics
    // if (typeof window.gtag !== 'undefined') {
    //     window.gtag('consent', 'update', {
    //         analytics_storage: 'granted',
    //         ad_storage: 'granted'
    //     });
    // }

    // Exemplo: Inicializar Facebook Pixel
    // if (typeof window.fbq !== 'undefined') {
    //     window.fbq('consent', 'grant');
    // }

    console.log('Analytics initialized - User accepted cookies');
}

/**
 * Desabilita serviços de analytics
 */
export function disableAnalytics(): void {
    // Exemplo: Desabilitar Google Analytics
    // if (typeof window.gtag !== 'undefined') {
    //     window.gtag('consent', 'update', {
    //         analytics_storage: 'denied',
    //         ad_storage: 'denied'
    //     });
    // }

    console.log('Analytics disabled - User rejected cookies');
}

