type AppError = Error & {
    data?: { error?: string; message?: string } | any;
    cause?: Error | any;
    digest?: string;
};

/**
 * Extrai a mensagem de erro real de várias formas possíveis.
 * Isso é necessário porque o Next.js em produção oculta mensagens de erro.
 * 
 * @param error - O erro do qual extrair a mensagem
 * @returns A mensagem de erro extraída ou uma mensagem padrão
 */
export function extractErrorMessage(error: AppError): string {
    // 1. Primeiro tenta pegar de data.error (formato preferido)
    if (error.data?.error && typeof error.data.error === 'string') {
        return error.data.error;
    }

    // 2. Tenta pegar de data.message
    if (error.data?.message && typeof error.data.message === 'string') {
        return error.data.message;
    }

    // 3. Tenta pegar do error.message direto (pode funcionar em dev)
    if (error.message && !error.message.startsWith("An error occurred in the Server Components render")) {
        return error.message;
    }

    // 4. Tenta pegar do cause (erro original que causou este erro)
    if (error.cause) {
        if (error.cause instanceof Error && error.cause.message) {
            return error.cause.message;
        }
        if (typeof error.cause === 'string') {
            return error.cause;
        }
        if (error.cause?.message && typeof error.cause.message === 'string') {
            return error.cause.message;
        }
        if (error.cause?.error && typeof error.cause.error === 'string') {
            return error.cause.error;
        }
    }

    // 5. Tenta pegar do stack trace (pode conter a mensagem original)
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

    // 6. Se for o erro genérico do Next.js, tenta usar o digest para debug
    const isNextProdError = error.message?.startsWith("An error occurred in the Server Components render");
    if (isNextProdError && error.digest) {
        // Em produção, o Next.js oculta a mensagem, mas podemos logar o digest para debug
        console.error("Erro do Next.js em produção - digest:", error.digest);
        console.error("Erro completo:", error);
    }

    // 7. Fallback
    return isNextProdError 
        ? "Ops, algo deu errado ao carregar os dados." 
        : (error.message || "Ocorreu um erro inesperado.");
}

