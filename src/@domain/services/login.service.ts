import { LoginModel } from "@/model/login.model";
import { Login } from "../entities/login.entity";
import axios from "axios";
import { cookies } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export class LoginService extends Login {
  constructor(service: LoginModel) {
    super(service);
  }

  async login(): Promise<string> {
    try {
      const { username, password } = this;

      const response = await axios.post(
        `${baseUrl}/auth/login`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );

      const rawCookie = response.headers["set-cookie"]?.find((cookie) =>
        cookie.startsWith("jwt=")
      );

      if (rawCookie) {
        const jwt = rawCookie.split(";")[0].split("=")[1];
        const cookieStore = await cookies();

        cookieStore.set({
          name: "access_token",
          value: jwt,
        });

        return jwt;
      }

      throw new Error("Token JWT não encontrado na resposta.");
    } catch (error) {
      throw new Error("Erro ao fazer login. Tente novamente mais tarde.");
    }
  }
}
