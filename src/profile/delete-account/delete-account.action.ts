import HttpClient from "@/util/http-client/fetch-client.util";

export interface DeleteAccountDTO {
    deletionReason?: string;
}

export interface DefaultResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export async function deleteAccountClient(dto?: DeleteAccountDTO): Promise<{ success: boolean; error: string | null; payload?: DefaultResponse<{ message: string }> }> {
    try {
        const payload = await HttpClient.fetch<DefaultResponse<{ message: string }>>("/user-deletion", {
            method: "POST",
            body: JSON.stringify(dto),
        });

        return {
            success: true,
            error: null,
            payload,
        };
    } catch (err: unknown) {
        const text = err instanceof Error ? err.message : "Erro inesperado ao excluir conta";
        return {
            success: false,
            error: text,
        };
    }
}
