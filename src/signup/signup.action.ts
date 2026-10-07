import { SignupDTO } from "./signup.dto";

export interface SignupData {
  emailConfirmationRequired?: boolean;
}

export interface DefaultResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  error: string | null;
  total?: number;
  page?: number | null;
  itemsPerPage?: number | null;
}

export async function signUpClient(dto: SignupDTO): Promise<{ success: boolean; error: string | null; payload?: DefaultResponse<SignupData> }> {
  try {
    const response = await fetch('/api/affiliate-checkout/new-user', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    const payload = await response.json() as DefaultResponse<SignupData>;
    if (!response.ok) {
      const message = typeof payload.error === "string" && payload.error.trim()
        ? payload.error
        : payload.message;
      throw new Error(message || "Não foi possível concluir o cadastro.");
    }

    return { success: true, error: null, payload };
  } catch (error: unknown) {
    console.error("Erro no cadastro:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido no cadastro" 
    };
  }
}
