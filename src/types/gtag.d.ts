/**
 * Tipagem para Google Analytics gtag.js
 */

export type GtagCommand = 'config' | 'set' | 'event' | 'consent';

export interface GtagConsentParams {
    analytics_storage?: 'granted' | 'denied';
    ad_storage?: 'granted' | 'denied';
    ad_user_data?: 'granted' | 'denied';
    ad_personalization?: 'granted' | 'denied';
}

export interface GtagConfigParams {
    page_path?: string;
    send_page_view?: boolean;
    [key: string]: unknown;
}

export interface GtagEventParams {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: unknown;
}

export type Gtag = {
    (command: 'consent', action: 'default' | 'update', params: GtagConsentParams): void;
    (command: 'config', targetId: string, params?: GtagConfigParams): void;
    (command: 'event', eventName: string, params?: GtagEventParams): void;
    (command: 'set', params: { [key: string]: unknown }): void;
};

declare global {
    interface Window {
        gtag?: Gtag;
        dataLayer?: unknown[];
    }
}

export {};

