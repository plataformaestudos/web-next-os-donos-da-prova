/**
 * Serviço para comunicação com backend sobre consentimento de cookies
 * Implementa abordagem híbrida: localStorage + backend
 */

import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'cookie-session-id';
const POLICY_VERSION = '1.0';

export type ConsentType = 'accepted' | 'rejected';

interface SaveConsentRequest {
    consent_type: ConsentType;
    policy_version?: string;
    session_id?: string;
}

interface ConsentResponse {
    success: boolean;
    data?: {
        id: number;
        user_id?: number;
        consent_type: ConsentType;
        created_at: string;
        updated_at: string;
        policy_version: string;
    };
    error?: string;
    message?: string;
}

/**
 * Gera ou recupera o session_id do usuário
 * Este ID é usado para identificar usuários não autenticados
 */
export function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
        return '';
    }

    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    return sessionId;
}

/**
 * Salva o consentimento no backend
 * @param consentType - 'accepted' ou 'rejected'
 * @returns Promise com resposta do backend
 */
export async function saveConsentToBackend(consentType: ConsentType): Promise<ConsentResponse> {
    try {
        const sessionId = getOrCreateSessionId();

        const payload: SaveConsentRequest = {
            consent_type: consentType,
            policy_version: POLICY_VERSION,
            session_id: sessionId,
        };

        const response = await fetch('/api/cookie-consent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Inclui cookies de autenticação se existirem
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erro ao salvar consentimento no backend:', data);
            return {
                success: false,
                error: data.error || 'Erro ao salvar consentimento',
                message: data.message,
            };
        }

        console.log('✅ Consentimento salvo no backend:', data);
        return data;

    } catch (error) {
        console.error('Erro de rede ao salvar consentimento:', error);
        return {
            success: false,
            error: 'Erro de rede',
            message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
    }
}

/**
 * Busca o consentimento atual do usuário no backend
 * @returns Promise com dados do consentimento ou null
 */
export async function getConsentFromBackend(): Promise<ConsentType | null> {
    try {
        const sessionId = getOrCreateSessionId();

        const response = await fetch(`/api/cookie-consent?session_id=${sessionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data: ConsentResponse = await response.json();

        if (!response.ok || !data.success) {
            console.warn('Não foi possível buscar consentimento do backend:', data);
            return null;
        }

        return data.data?.consent_type || null;

    } catch (error) {
        console.error('Erro ao buscar consentimento do backend:', error);
        return null;
    }
}

/**
 * Remove o consentimento do backend
 * @returns Promise com resultado da operação
 */
export async function deleteConsentFromBackend(): Promise<boolean> {
    try {
        const sessionId = getOrCreateSessionId();

        const response = await fetch(`/api/cookie-consent?session_id=${sessionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error('Erro ao deletar consentimento do backend:', data);
            return false;
        }

        console.log('✅ Consentimento removido do backend');
        return true;

    } catch (error) {
        console.error('Erro ao deletar consentimento do backend:', error);
        return false;
    }
}

/**
 * Sincroniza o consentimento entre localStorage e backend
 * Útil para garantir consistência após login/logout
 */
export async function syncConsentWithBackend(): Promise<void> {
    try {
        const localConsent = localStorage.getItem('cookie-consent') as ConsentType | null;
        const backendConsent = await getConsentFromBackend();

        // Se há consentimento local mas não no backend, enviar ao backend
        if (localConsent && !backendConsent) {
            await saveConsentToBackend(localConsent);
            return;
        }

        // Se há consentimento no backend mas não local, atualizar local
        if (!localConsent && backendConsent) {
            localStorage.setItem('cookie-consent', backendConsent);
            return;
        }

        // Se ambos existem mas são diferentes, backend tem prioridade
        if (localConsent && backendConsent && localConsent !== backendConsent) {
            localStorage.setItem('cookie-consent', backendConsent);
            console.log('📋 Consentimento sincronizado com backend');
        }

    } catch (error) {
        console.error('Erro ao sincronizar consentimento:', error);
    }
}

/**
 * Salva o consentimento tanto localmente quanto no backend
 * Esta é a função principal que deve ser usada pelos componentes
 * 
 * @param consentType - 'accepted' ou 'rejected'
 * @returns Promise<boolean> - true se salvou com sucesso localmente (backend é best-effort)
 */
export async function saveConsent(consentType: ConsentType): Promise<boolean> {
    try {
        // 1. Salvar localmente primeiro (UX imediato)
        localStorage.setItem('cookie-consent', consentType);
        console.log(`💾 Consentimento salvo localmente: ${consentType}`);

        // 2. Salvar no backend (auditoria e verificação)
        // Não bloqueamos a UI se o backend falhar
        saveConsentToBackend(consentType)
            .then((response) => {
                if (!response.success) {
                    console.warn('⚠️ Backend não salvou o consentimento, mas localStorage está ok');
                }
            })
            .catch((error) => {
                console.error('❌ Erro ao salvar no backend:', error);
            });

        return true;

    } catch (error) {
        console.error('Erro ao salvar consentimento:', error);
        return false;
    }
}

/**
 * Remove o consentimento tanto localmente quanto no backend
 * 
 * @returns Promise<boolean> - true se removeu com sucesso
 */
export async function clearConsent(): Promise<boolean> {
    try {
        // 1. Remover localmente
        localStorage.removeItem('cookie-consent');
        console.log('🗑️ Consentimento removido localmente');

        // 2. Remover do backend
        await deleteConsentFromBackend();

        return true;

    } catch (error) {
        console.error('Erro ao remover consentimento:', error);
        return false;
    }
}

/**
 * Revoga o consentimento do usuário (LGPD Art. 8º, § 5º)
 * Remove o consentimento e desativa analytics
 * 
 * @returns Promise<boolean> - true se revogou com sucesso
 */
export async function revokeConsent(): Promise<boolean> {
    try {
        // 1. Remover localmente
        localStorage.removeItem('cookie-consent');
        console.log('🚫 Consentimento REVOGADO localmente');

        // 2. Desativar analytics imediatamente
        if (typeof window !== 'undefined') {
            if ((window as any).gtag) {
                (window as any).gtag('consent', 'update', {
                    analytics_storage: 'denied',
                    ad_storage: 'denied',
                });
            }
            // Limpar outros serviços de tracking
            console.log('📊 Analytics desativados');
        }

        // 3. Remover do backend (auditoria de revogação)
        const success = await deleteConsentFromBackend();
        
        if (success) {
            console.log('✅ Revogação registrada no backend para auditoria LGPD');
        } else {
            console.warn('⚠️ Revogação local ok, mas backend pode ter falha');
        }

        return true;

    } catch (error) {
        console.error('Erro ao revogar consentimento:', error);
        // Mesmo com erro, mantém revogação local
        return true;
    }
}

