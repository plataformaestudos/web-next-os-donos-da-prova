'use client';

import { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import Link from 'next/link';
import './styles.css';
import { saveConsent, syncConsentWithBackend } from '@/services/cookie-consent.service';

const COOKIE_CONSENT_KEY = 'cookie-consent';

export function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Verifica se o usuário já fez uma escolha localmente
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Tenta sincronizar com backend (pode ter aceitado em outro dispositivo)
            syncConsentWithBackend().then(() => {
                const syncedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
                if (!syncedConsent) {
                    setShowBanner(true);
                    // Adiciona delay para animação
                    setTimeout(() => setIsVisible(true), 100);
                }
            });
        }
    }, []);

    const handleAccept = async () => {
        setLoading(true);
        
        try {
            // Salva localmente (imediato) e no backend (auditoria)
            await saveConsent('accepted');
            
            setIsVisible(false);
            setTimeout(() => setShowBanner(false), 300);
            
            // Inicializar cookies analytics/tracking
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('consent', 'update', { 
                    analytics_storage: 'granted',
                    ad_storage: 'granted'
                });
            }
            
            message.success('Preferências de cookies salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar consentimento:', error);
            message.error('Erro ao salvar preferências. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        
        try {
            // Salva localmente (imediato) e no backend (auditoria)
            await saveConsent('rejected');
            
            setIsVisible(false);
            setTimeout(() => setShowBanner(false), 300);
            
            // Garante que cookies não essenciais não sejam utilizados
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('consent', 'update', { 
                    analytics_storage: 'denied',
                    ad_storage: 'denied'
                });
            }
            
            message.info('Suas preferências foram registradas.');
        } catch (error) {
            console.error('Erro ao salvar consentimento:', error);
            message.error('Erro ao salvar preferências. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div className={`cookie-banner ${isVisible ? 'cookie-banner-visible' : ''}`}>
            <div className="cookie-banner-content">
                <div className="cookie-banner-icon">
                    {/* <FaCookie style={{ fontSize: '24px' }} /> */}
                </div>
                
                <div className="cookie-banner-text">
                    <h3 className="cookie-banner-title">
                        Utilizamos cookies
                    </h3>
                    <p className="cookie-banner-description">
                        Este site utiliza cookies para melhorar sua experiência de navegação, 
                        personalizar conteúdo e analisar nosso tráfego. Ao clicar em &quot;Aceitar&quot;, 
                        você concorda com o uso de cookies conforme descrito em nossa{' '}
                        <Link href="/politica-privacidade" className="cookie-banner-link">
                            Política de Privacidade
                        </Link>
                        . Você pode escolher recusar o uso de cookies não essenciais clicando 
                        em &quot;Recusar&quot;. Para gerenciar suas preferências, acesse as{' '}
                        <Link href="/configuracoes-cookies" className="cookie-banner-link">
                            Configurações de Cookies
                        </Link>
                    </p>
                </div>

                <div className="cookie-banner-actions">
                    <Button 
                        type="default" 
                        onClick={handleReject}
                        className="cookie-banner-button-reject"
                        loading={loading}
                        disabled={loading}
                    >
                        Recusar
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handleAccept}
                        className="cookie-banner-button-accept"
                        loading={loading}
                        disabled={loading}
                    >
                        Aceitar
                    </Button>
                </div>
            </div>
        </div>
    );
}

