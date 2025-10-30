
import { v4 as uuidv4 } from 'uuid';
import HttpClient from '@/util/http-client/fetch-client.util';

const SESSION_ID_KEY = 'cookie-session-id';

export type ConsentType = 'accepted' | 'rejected';

interface SaveConsentRequest {
    consentType: ConsentType;
    sessionId?: string;
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
            consentType: consentType,
            sessionId: sessionId,
        };

        const data = await HttpClient.fetch<ConsentResponse>(
            '/cookie-consent',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            },
            false // não volta automaticamente em caso de erro
        );

        console.log('✅ Consentimento salvo no backend:', data);
        return data;

    } catch (error) {
        console.error('Erro ao salvar consentimento no backend:', error);
        return {
            success: false,
            error: 'Erro de rede',
            message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
    }
}

export async function getConsentFromBackend(): Promise<ConsentType | null> {
    try {
        const sessionId = getOrCreateSessionId();

        const data = await HttpClient.fetch<ConsentResponse>(
            `/cookie-consent?session_id=${sessionId}`,
            {
                method: 'GET',
            },
            false
        );

        if (!data.success) {
            console.warn('Não foi possível buscar consentimento do backend:', data);
            return null;
        }

        return data.data?.consent_type || null;

    } catch (error) {
        console.error('Erro ao buscar consentimento do backend:', error);
        return null;
    }
}

export async function deleteConsentFromBackend(): Promise<boolean> {
    try {
        const sessionId = getOrCreateSessionId();

        const data = await HttpClient.fetch<ConsentResponse>(
            `/cookie-consent?session_id=${sessionId}`,
            {
                method: 'DELETE',
            },
            false
        );

        if (!data.success) {
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

        if (localConsent && !backendConsent) {
            await saveConsentToBackend(localConsent);
            return;
        }

        if (!localConsent && backendConsent) {
            localStorage.setItem('cookie-consent', backendConsent);
            return;
        }

        if (localConsent && backendConsent && localConsent !== backendConsent) {
            localStorage.setItem('cookie-consent', backendConsent);
            console.log('📋 Consentimento sincronizado com backend');
        }

    } catch (error) {
        console.error('Erro ao sincronizar consentimento:', error);
    }
}

/**
 * Sincroniza o sessionId com o userId no backend
 * Deve ser chamado após o usuário fazer login
 * 
 * Vincula o consentimento anônimo (session_id) ao usuário logado (user_id)
 * 
 * @returns Promise<boolean> - true se sincronizou com sucesso
 */
export async function syncSessionWithUser(): Promise<boolean> {
    try {
        const sessionId = getOrCreateSessionId();

        const data = await HttpClient.fetch<ConsentResponse>(
            '/cookie-consent/sync',
            {
                method: 'POST',
                body: JSON.stringify({
                    sessionId: sessionId,
                }),
            },
            false
        );

        if (data.success) {
            console.log('🔄 SessionId sincronizado com userId:', data);
            return true;
        }

        return false;

    } catch (error) {
        console.error('Erro ao sincronizar sessionId com userId:', error);
        return false;
    }
}


export async function saveConsent(consentType: ConsentType): Promise<boolean> {
    try {
        // 1. Salvar localmente primeiro (UX imediato)
        localStorage.setItem('cookie-consent', consentType);
        console.log(`💾 Consentimento salvo localmente: ${consentType}`);

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

export async function revokeConsent(): Promise<boolean> {
    try {
        localStorage.removeItem('cookie-consent');
        console.log('🚫 Consentimento REVOGADO localmente');

        // 2. Desativar analytics imediatamente
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
            });
            // Limpar outros serviços de tracking
            console.log('📊 Analytics desativados');
        }

        const success = await deleteConsentFromBackend();
        
        if (success) {
            console.log('✅ Revogação registrada no backend para auditoria LGPD');
        } else {
            console.warn('⚠️ Revogação local ok, mas backend pode ter falha');
        }

        return true;

    } catch (error) {
        console.error('Erro ao revogar consentimento:', error);
        return true;
    }
}

