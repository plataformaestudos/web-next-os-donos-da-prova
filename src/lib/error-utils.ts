type ErrorData = { error?: string; message?: string } | Record<string, unknown>;

type AppError = Error & {
    data?: ErrorData;
    cause?: Error | string | { message?: string; error?: string } | unknown;
    digest?: string;
    errorCode?: string;
    status?: number;
};

/**
 * Extrai a mensagem de erro real de várias formas possíveis.
 * Isso é necessário porque o Next.js em produção oculta mensagens de erro.
 * 
 * @param error - O erro do qual extrair a mensagem
 * @returns A mensagem de erro extraída ou uma mensagem padrão
 */
export function extractErrorMessage(error: AppError): string {
    // 1. Primeiro tenta pegar de errorCode (propriedade do HttpError)
    if (error.errorCode && typeof error.errorCode === 'string') {
        return error.errorCode;
    }

    // 2. Tenta pegar de data.error (formato preferido)
    if (error.data && typeof error.data === 'object' && 'error' in error.data) {
        const errorValue = (error.data as { error?: unknown }).error;
        if (typeof errorValue === 'string') {
            return errorValue;
        }
    }

    // 3. Tenta pegar de data.message
    if (error.data && typeof error.data === 'object' && 'message' in error.data) {
        const messageValue = (error.data as { message?: unknown }).message;
        if (typeof messageValue === 'string') {
            return messageValue;
        }
    }

    // 4. Tenta pegar do error.message direto (pode funcionar em dev)
    if (error.message && !error.message.startsWith("An error occurred in the Server Components render")) {
        return error.message;
    }

    // 5. Tenta pegar do cause (erro original que causou este erro)
    if (error.cause) {
        if (error.cause instanceof Error && error.cause.message) {
            return error.cause.message;
        }
        if (typeof error.cause === 'string') {
            return error.cause;
        }
        // Verifica se é um objeto com propriedades message ou error
        if (typeof error.cause === 'object' && error.cause !== null) {
            const causeObj = error.cause as { message?: unknown; error?: unknown };
            if (causeObj.message && typeof causeObj.message === 'string') {
                return causeObj.message;
            }
            if (causeObj.error && typeof causeObj.error === 'string') {
                return causeObj.error;
            }
        }
    }

    // 6. Tenta pegar do stack trace (pode conter a mensagem original)
    if (error.stack) {
        const stackLines = error.stack.split('\n');
        for (const line of stackLines) {
            // Procura por padrões comuns de mensagens de erro
            const match = line.match(/Error:\s*(.+)/);
            if (match && match[1] && !match[1].includes("An error occurred")) {
                return match[1].trim();
            }
        }
    }

    // 7. Se for o erro genérico do Next.js, tenta usar o digest para debug
    const isNextProdError = error.message?.startsWith("An error occurred in the Server Components render");
    if (isNextProdError && error.digest) {
        // Em produção, o Next.js oculta a mensagem, mas podemos logar o digest para debug
        console.error("Erro do Next.js em produção - digest:", error.digest);
        console.error("Erro completo:", error);
    }

    // 8. Fallback
    return isNextProdError 
        ? "Ops, algo deu errado ao carregar os dados." 
        : (error.message || "Ocorreu um erro inesperado.");
}

