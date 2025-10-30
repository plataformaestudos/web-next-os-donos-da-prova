'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface GoogleAnalyticsProps {
    /** ID de medição do Google Analytics (GA_MEASUREMENT_ID) */
    measurementId?: string;
}

/**
 * Componente para integrar Google Analytics respeitando o consentimento de cookies
 * 
 * @example
 * ```tsx
 * // No layout.tsx principal
 * <GoogleAnalytics measurementId="G-XXXXXXXXXX" />
 * ```
 * 
 * Para configurar:
 * 1. Crie uma conta no Google Analytics
 * 2. Obtenha seu Measurement ID (formato: G-XXXXXXXXXX)
 * 3. Adicione o ID como variável de ambiente: NEXT_PUBLIC_GA_MEASUREMENT_ID
 * 4. Adicione este componente no seu layout principal
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
    const { hasAccepted, hasRejected } = useCookieConsent();
    
    // Usar variável de ambiente se não for fornecido um ID
    const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    useEffect(() => {
        if (!gaId) return;

        // Configurar consentimento padrão (negado até que o usuário aceite)
        if (typeof window !== 'undefined' && window.gtag) {
            if (hasAccepted) {
                window.gtag('consent', 'update', {
                    analytics_storage: 'granted',
                    ad_storage: 'granted',
                });
                
                // Enviar pageview quando o usuário aceitar
                window.gtag('config', gaId, {
                    page_path: window.location.pathname,
                });
                
                console.log('✅ Google Analytics ativado - Usuário aceitou cookies');
            } else if (hasRejected) {
                window.gtag('consent', 'update', {
                    analytics_storage: 'denied',
                    ad_storage: 'denied',
                });
                
                console.log('🚫 Google Analytics desativado - Usuário recusou cookies');
            }
        }
    }, [hasAccepted, hasRejected, gaId]);

    // Não carregar scripts se não houver ID ou se o usuário recusou
    if (!gaId || hasRejected) {
        return null;
    }

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        
                        // Configuração padrão de consentimento (negado)
                        gtag('consent', 'default', {
                            'analytics_storage': 'denied',
                            'ad_storage': 'denied',
                            'wait_for_update': 500
                        });
                        
                        gtag('config', '${gaId}', {
                            page_path: window.location.pathname,
                            // Anonimizar IP para maior privacidade
                            anonymize_ip: true
                        });
                    `,
                }}
            />
        </>
    );
}

/**
 * Função auxiliar para rastrear eventos customizados
 * Só registra eventos se o usuário aceitou cookies
 * 
 * @example
 * ```tsx
 * import { trackEvent } from '@/components/Analytics/GoogleAnalytics';
 * 
 * function MyButton() {
 *   const handleClick = () => {
 *     trackEvent({
 *       action: 'click',
 *       category: 'Button',
 *       label: 'Subscribe Button',
 *       value: 1
 *     });
 *   };
 *   
 *   return <button onClick={handleClick}>Subscribe</button>;
 * }
 * ```
 */
export function trackEvent({
    action,
    category,
    label,
    value,
}: {
    action: string;
    category: string;
    label?: string;
    value?: number;
}) {
    if (typeof window === 'undefined' || !window.gtag) {
        console.warn('Google Analytics não está disponível');
        return;
    }

    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
}

/**
 * Função auxiliar para rastrear pageviews
 * 
 * @example
 * ```tsx
 * import { trackPageview } from '@/components/Analytics/GoogleAnalytics';
 * 
 * useEffect(() => {
 *   trackPageview('/custom-page');
 * }, []);
 * ```
 */
export function trackPageview(url: string) {
    if (typeof window === 'undefined' || !window.gtag) {
        console.warn('Google Analytics não está disponível');
        return;
    }

    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
        window.gtag('config', measurementId, {
            page_path: url,
        });
    }
}

