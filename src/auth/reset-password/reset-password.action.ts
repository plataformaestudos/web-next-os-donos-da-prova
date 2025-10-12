import HttpClient from "@/util/http-client/fetch-client.util";

export interface ResetPasswordEventDTO {
    eventType: "password_reset";
    metadata?: {
        resetMethod?: "email_link";
        timestamp?: string;
    };
}

export interface DefaultResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export async function registerPasswordResetEventClient(dto: ResetPasswordEventDTO): Promise<{ success: boolean; error: string | null; payload?: DefaultResponse<{ message: string }> }> {
    try {
        const payload = await HttpClient.fetch<DefaultResponse<{ message: string }>>("/auth/password-reset-event", {
            method: "POST",
            body: JSON.stringify(dto),
        });

        return {
            success: true,
            error: null,
            payload,
        };
    } catch (err: unknown) {
        const text = err instanceof Error ? err.message : "Erro inesperado ao registrar evento";
        return {
            success: false,
            error: text,
        };
    }
}
