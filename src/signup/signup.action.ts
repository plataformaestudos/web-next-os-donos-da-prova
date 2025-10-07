import { SignupDTO } from "./signup.dto";
import HttpClient from "@/util/http-client/fetch-client.util";

export interface SignupData {
  id: string;
  costumerId?: string;
  value: number;
  creditCard?: {
    creditCardNumber: string;
    creditCardBrand: string;
    creditCardToken: string;
  };
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
    const payload = await HttpClient.fetch<DefaultResponse<SignupData>>('/subscription/new-user', {
      method: "POST",
      body: JSON.stringify(dto),
    });

    await HttpClient.fetch('/auth/login', {
      method: "POST",
      body: JSON.stringify({
        username: dto.userInfo.email,
        password: dto.userInfo.password,
      }),
    });

    return { success: true, error: null, payload };
  } catch (error: unknown) {
    console.error("Erro no cadastro:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido no cadastro" 
    };
  }
}

